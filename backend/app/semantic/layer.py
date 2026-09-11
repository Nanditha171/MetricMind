"""
Governed Semantic Layer Engine for MetricMind.

Translates structured JSON semantic query definitions into Cube.dev REST queries,
or compiles validated, parameterized SQL targeting dbt marts (fct_sales) in PostgreSQL.
Enforces single business definitions and prevents SQL injection.
"""

import time
import os
import re
import httpx
from typing import List, Dict, Any, Tuple, Optional
from decimal import Decimal

from backend.app.semantic.metadata import METRICS_DICTIONARY, DIMENSIONS_DICTIONARY
from backend.app.semantic.models import SemanticQueryRequest, SemanticQueryResponse, FilterCondition
from backend.database import execute_raw_sql

MAX_ALLOWED_ROWS = 1000
CUBE_API_URL = os.getenv("CUBE_API_URL", "http://localhost:4000/cubejs-api/v1/load")
CUBE_API_SECRET = os.getenv("CUBE_API_SECRET", "metricmind_secret_cube_token_12345")


def get_quarter_variations(val: Any) -> List[str]:
    """Generates all standard representations for a given quarter string (e.g. 2025-Q4 <-> Q4 2025)."""
    if not isinstance(val, str):
        val = str(val)
    val_clean = val.strip()
    variations = {val_clean, val_clean.lower(), val_clean.upper()}

    # Check for "2025-Q4", "2025_Q4", "2025 Q4", "2025Q4", "2025/Q4"
    m1 = re.match(r"^(\d{4})[-_/\s]*[qQ](\d)$", val_clean)
    if m1:
        year, q = m1.group(1), m1.group(2)
        variations.update([
            f"Q{q} {year}",
            f"q{q} {year}",
            f"{year}-Q{q}",
            f"{year}-q{q}",
            f"{year} Q{q}",
            f"{year} q{q}",
            f"Q{q}-{year}",
            f"Q{q}/{year}",
            f"{year}/Q{q}"
        ])

    # Check for "Q4 2025", "Q4-2025", "Q4/2025", "Q4_2025", "Q42025"
    m2 = re.match(r"^[qQ](\d)[-_/\s]*(\d{4})$", val_clean)
    if m2:
        q, year = m2.group(1), m2.group(2)
        variations.update([
            f"Q{q} {year}",
            f"q{q} {year}",
            f"{year}-Q{q}",
            f"{year}-q{q}",
            f"{year} Q{q}",
            f"{year} q{q}",
            f"Q{q}-{year}",
            f"Q{q}/{year}",
            f"{year}/Q{q}"
        ])

    return list(variations)

class SemanticLayerValidationError(Exception):
    pass

class GovernedSemanticEngine:

    @staticmethod
    def validate_request(request: SemanticQueryRequest) -> None:
        """
        Validates measures, dimensions, and filters against the authoritative dictionary.
        Rejects unknown metrics or dimensions.
        """
        if not request.measures:
            raise SemanticLayerValidationError("At least one valid measure must be specified.")

        for m in request.measures:
            if m not in METRICS_DICTIONARY:
                available = ", ".join(METRICS_DICTIONARY.keys())
                raise SemanticLayerValidationError(
                    f"Unknown metric '{m}'. Governed metrics available: {available}"
                )

        if request.dimensions:
            for d in request.dimensions:
                if d not in DIMENSIONS_DICTIONARY:
                    available = ", ".join(DIMENSIONS_DICTIONARY.keys())
                    raise SemanticLayerValidationError(
                        f"Unknown dimension '{d}'. Governed dimensions available: {available}"
                    )

        if request.filters:
            for f in request.filters:
                if f.dimension not in DIMENSIONS_DICTIONARY:
                    available = ", ".join(DIMENSIONS_DICTIONARY.keys())
                    raise SemanticLayerValidationError(
                        f"Filter dimension '{f.dimension}' is not governed. Governed dimensions: {available}"
                    )

    @staticmethod
    def build_cube_query(request: SemanticQueryRequest) -> Dict[str, Any]:
        """
        Translates a MetricMind SemanticQueryRequest into a Cube.dev load API query format.
        """
        cube_measures = [METRICS_DICTIONARY[m]["cube_measure"] for m in request.measures]
        cube_dimensions = [DIMENSIONS_DICTIONARY[d]["cube_dimension"] for d in (request.dimensions or [])]
        
        cube_filters = []
        if request.filters:
            for f in request.filters:
                val_str = str(f.value).strip()
                if val_str.lower() in ["all", "global", "all regions", "all quarters"]:
                    continue
                cube_dim = DIMENSIONS_DICTIONARY[f.dimension]["cube_dimension"]
                op = str(f.operator).upper().strip()
                cube_op = "equals" if op in ["=", "EQUALS", "EQ"] else ("notEquals" if op in ["!=", "NOT_EQUALS", "NE"] else "contains")
                if f.dimension == "quarter":
                    val = get_quarter_variations(f.value)
                elif isinstance(f.value, list):
                    val = [str(v) for v in f.value]
                else:
                    val = [str(f.value)]
                cube_filters.append({
                    "member": cube_dim,
                    "operator": cube_op,
                    "values": val
                })

        cube_order = {}
        if request.order_by:
            if request.order_by in METRICS_DICTIONARY:
                member_key = METRICS_DICTIONARY[request.order_by]["cube_measure"]
            elif request.order_by in DIMENSIONS_DICTIONARY:
                member_key = DIMENSIONS_DICTIONARY[request.order_by]["cube_dimension"]
            else:
                member_key = None
            if member_key:
                cube_order[member_key] = "desc" if request.order_desc else "asc"
        elif request.measures:
            cube_order[METRICS_DICTIONARY[request.measures[0]]["cube_measure"]] = "desc"

        return {
            "query": {
                "measures": cube_measures,
                "dimensions": cube_dimensions,
                "filters": cube_filters,
                "order": cube_order,
                "limit": min(request.limit or 100, MAX_ALLOWED_ROWS)
            }
        }

    @staticmethod
    def build_sql(request: SemanticQueryRequest) -> Tuple[str, Dict[str, Any]]:
        """
        Compiles a SemanticQueryRequest into a governed, parameterized PostgreSQL query
        targeting the dbt analytical mart table/view `fct_sales`.
        """
        select_clauses = []
        group_clauses = []
        where_clauses = []
        params = {}
        requires_dim_customers = False

        # 1. Dimensions
        if request.dimensions:
            for d_name in request.dimensions:
                sql_col = DIMENSIONS_DICTIONARY[d_name]["sql_column"]
                if "dc." in sql_col:
                    requires_dim_customers = True
                select_clauses.append(f"{sql_col} AS {d_name}")
                group_clauses.append(sql_col)

        # 2. Measures
        for m_name in request.measures:
            formula = METRICS_DICTIONARY[m_name]["sql_formula"]
            select_clauses.append(f"{formula} AS {m_name}")

        # 3. Filters
        if request.filters:
            param_idx = 0
            for f in request.filters:
                val_str = str(f.value).strip()
                if val_str.lower() in ["all", "global", "all regions", "all quarters"]:
                    continue

                sql_col = DIMENSIONS_DICTIONARY[f.dimension]["sql_column"]
                if "dc." in sql_col:
                    requires_dim_customers = True
                param_key = f"p_{param_idx}"
                param_idx += 1
                op = str(f.operator).upper().strip()

                if f.dimension == "quarter" and op in ["=", "EQUALS", "EQ"]:
                    variations = get_quarter_variations(f.value)
                    val_keys = []
                    for v_idx, v in enumerate(variations):
                        vk = f"{param_key}_{v_idx}"
                        val_keys.append(f":{vk}")
                        params[vk] = str(v).lower()
                    in_clause = ", ".join(val_keys)
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) IN ({in_clause})")
                elif op in ["=", "EQUALS", "EQ"]:
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) = LOWER(:{param_key})")
                    params[param_key] = str(f.value)
                elif op in ["!=", "NOT_EQUALS", "NE"]:
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) != LOWER(:{param_key})")
                    params[param_key] = str(f.value)
                elif op == "IN" and isinstance(f.value, list):
                    val_keys = []
                    for v_idx, v in enumerate(f.value):
                        vk = f"{param_key}_{v_idx}"
                        val_keys.append(f":{vk}")
                        params[vk] = str(v).lower()
                    in_clause = ", ".join(val_keys)
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) IN ({in_clause})")
                elif op in [">=", "GTE"]:
                    where_clauses.append(f"{sql_col} >= :{param_key}")
                    params[param_key] = str(f.value)
                elif op in ["<=", "LTE"]:
                    where_clauses.append(f"{sql_col} <= :{param_key}")
                    params[param_key] = str(f.value)
                elif op == "LIKE":
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) LIKE LOWER(:{param_key})")
                    params[param_key] = f"%{str(f.value)}%"
                else:
                    where_clauses.append(f"LOWER(CAST({sql_col} AS TEXT)) = LOWER(:{param_key})")
                    params[param_key] = str(f.value)

        # 4. Construct SQL targeting dbt mart `fct_sales`
        select_str = ",\n    ".join(select_clauses)
        sql = f"SELECT\n    {select_str}\nFROM fct_sales f"
        if requires_dim_customers:
            sql += "\nLEFT JOIN dim_customers dc ON f.customer_id = dc.customer_id"

        if where_clauses:
            where_str = "\n  AND ".join(where_clauses)
            sql += f"\nWHERE {where_str}"

        if group_clauses:
            group_str = ", ".join(group_clauses)
            sql += f"\nGROUP BY {group_str}"

        # 5. Order By
        if request.order_by == "quarter" or (request.dimensions == ["quarter"] and not request.order_by):
            direction = "DESC" if request.order_desc else "ASC"
            chronological_expr = """(CASE 
        WHEN f.quarter LIKE '%2024%' THEN 20240 
        WHEN f.quarter LIKE '%2025%' THEN 20250 
        WHEN f.quarter LIKE '%2026%' THEN 20260 
        ELSE 20270 
    END + CASE 
        WHEN f.quarter LIKE '%Q1%' THEN 1 
        WHEN f.quarter LIKE '%Q2%' THEN 2 
        WHEN f.quarter LIKE '%Q3%' THEN 3 
        WHEN f.quarter LIKE '%Q4%' THEN 4 
        ELSE 0 
    END)"""
            sql += f"\nORDER BY {chronological_expr} {direction}"
        elif request.order_by and (request.order_by in request.measures or request.order_by in request.dimensions):
            direction = "DESC" if request.order_desc else "ASC"
            sql += f"\nORDER BY {request.order_by} {direction}"
        elif request.dimensions:
            if request.measures:
                sql += f"\nORDER BY {request.measures[0]} DESC"
            else:
                sql += f"\nORDER BY {group_clauses[0]} ASC"

        limit = min(request.limit or 100, MAX_ALLOWED_ROWS)
        sql += f"\nLIMIT {limit};"

        return sql, params

    @classmethod
    def execute_query(cls, request: SemanticQueryRequest) -> SemanticQueryResponse:
        """
        Validates the request, attempts Cube.dev REST query execution,
        and falls back to governed parameterized SQL against PostgreSQL dbt marts (fct_sales).
        """
        start_time = time.time()
        try:
            cls.validate_request(request)
            
            # Step 1: Attempt Cube.dev Semantic Layer Query
            cube_query = cls.build_cube_query(request)
            cube_data = None
            cube_headers = {"Authorization": f"Bearer {CUBE_API_SECRET}"}
            try:
                with httpx.Client(timeout=1.0) as client:
                    cube_res = client.post(CUBE_API_URL, json=cube_query, headers=cube_headers)
                    if cube_res.status_code == 200:
                        json_resp = cube_res.json()
                        if "data" in json_resp and isinstance(json_resp["data"], list):
                            sanitized = []
                            for row in json_resp["data"]:
                                clean = {}
                                for k, v in row.items():
                                    clean_k = k.replace("sales.", "")
                                    clean[clean_k] = float(v) if isinstance(v, (Decimal, int, float)) and "." in str(v) else v
                                sanitized.append(clean)
                            cube_data = sanitized
            except Exception:
                # Cube server offline or unreachable; proceed to governed SQL execution on dbt marts
                cube_data = None

            if cube_data is not None:
                elapsed_ms = round((time.time() - start_time) * 1000, 2)
                return SemanticQueryResponse(
                    status="success",
                    measures=request.measures,
                    dimensions=request.dimensions or [],
                    generated_sql="Cube.dev REST API (/cubejs-api/v1/load)",
                    data=cube_data,
                    row_count=len(cube_data),
                    execution_time_ms=elapsed_ms,
                    governance_passed=True,
                    data_source="Cube.dev Semantic Layer (sales_analytics)"
                )

            # Step 2: Governed SQL Execution against PostgreSQL dbt Marts (fct_sales)
            sql, params = cls.build_sql(request)
            raw_rows, columns = execute_raw_sql(sql, params)

            sanitized_rows = []
            for row in raw_rows:
                clean_row = {}
                for k, v in row.items():
                    if isinstance(v, Decimal):
                        clean_row[k] = float(v)
                    elif v is None and k in METRICS_DICTIONARY:
                        clean_row[k] = 0.0
                    else:
                        clean_row[k] = v
                sanitized_rows.append(clean_row)

            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            return SemanticQueryResponse(
                status="success",
                measures=request.measures,
                dimensions=request.dimensions or [],
                generated_sql=sql,
                data=sanitized_rows,
                row_count=len(sanitized_rows),
                execution_time_ms=elapsed_ms,
                governance_passed=True,
                data_source="Governed Semantic Layer (PostgreSQL / fct_sales)"
            )

        except SemanticLayerValidationError as ve:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return SemanticQueryResponse(
                status="error",
                measures=request.measures,
                dimensions=request.dimensions or [],
                generated_sql="",
                data=[],
                row_count=0,
                execution_time_ms=elapsed_ms,
                governance_passed=False,
                data_source="Governed Semantic Layer",
                error_message=str(ve)
            )
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return SemanticQueryResponse(
                status="error",
                measures=request.measures,
                dimensions=request.dimensions or [],
                generated_sql="",
                data=[],
                row_count=0,
                execution_time_ms=elapsed_ms,
                governance_passed=False,
                data_source="Governed Semantic Layer",
                error_message=f"Semantic Layer Execution Error: {str(e)}"
            )
