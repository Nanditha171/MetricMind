"""
Governed Semantic Layer Engine for MetricMind.
Translates structured JSON query definitions into validated, executable SQL.
Enforces Rule 3: User -> LangChain Agent -> Semantic Layer -> Governed Metric Query -> Data Warehouse.
"""

import time
import re
from typing import List, Dict, Any, Tuple
from backend.app.semantic.metadata import METRICS_DICTIONARY, DIMENSIONS_DICTIONARY
from backend.app.semantic.models import SemanticQueryRequest, SemanticQueryResponse, FilterCondition
from backend.app.database.db import execute_raw_sql

MAX_ALLOWED_ROWS = 1000

class SemanticLayerValidationError(Exception):
    pass

class GovernedSemanticEngine:

    @staticmethod
    def validate_request(request: SemanticQueryRequest) -> None:
        """
        Validates measures, dimensions, and filter conditions against the authoritative metadata.
        Rejects unknown metrics or dimensions.
        """
        if not request.measures:
            raise SemanticLayerValidationError("At least one valid measure must be specified.")

        # Validate Measures
        for m in request.measures:
            if m not in METRICS_DICTIONARY:
                available = ", ".join(METRICS_DICTIONARY.keys())
                raise SemanticLayerValidationError(
                    f"Unknown metric '{m}'. Governed metrics available: {available}"
                )

        # Validate Dimensions
        if request.dimensions:
            for d in request.dimensions:
                if d not in DIMENSIONS_DICTIONARY:
                    available = ", ".join(DIMENSIONS_DICTIONARY.keys())
                    raise SemanticLayerValidationError(
                        f"Unknown dimension '{d}'. Governed dimensions available: {available}"
                    )

        # Validate Filters
        if request.filters:
            for f in request.filters:
                if f.dimension not in DIMENSIONS_DICTIONARY:
                    available = ", ".join(DIMENSIONS_DICTIONARY.keys())
                    raise SemanticLayerValidationError(
                        f"Filter dimension '{f.dimension}' is not governed. Governed dimensions: {available}"
                    )

    @staticmethod
    def build_sql(request: SemanticQueryRequest) -> Tuple[str, List[Any]]:
        """
        Compiles SemanticQueryRequest into a governed, parameterized SQL string.
        """
        select_clauses = []
        group_clauses = []
        where_clauses = []
        params = []

        # Process Dimensions
        if request.dimensions:
            for d_name in request.dimensions:
                sql_col = DIMENSIONS_DICTIONARY[d_name]["sql_column"]
                select_clauses.append(f"{sql_col} AS {d_name}")
                group_clauses.append(sql_col)

        # Process Measures
        for m_name in request.measures:
            formula = METRICS_DICTIONARY[m_name]["sql_formula"]
            select_clauses.append(f"{formula} AS {m_name}")

        # Process Filters
        if request.filters:
            for f in request.filters:
                sql_col = DIMENSIONS_DICTIONARY[f.dimension]["sql_column"]
                op = f.operator.upper().strip()
                if op in ["=", "EQUALS", "EQ"]:
                    where_clauses.append(f"{sql_col} = ?")
                    params.append(str(f.value))
                elif op in ["!=", "NOT_EQUALS", "NE"]:
                    where_clauses.append(f"{sql_col} != ?")
                    params.append(str(f.value))
                elif op == "IN" and isinstance(f.value, list):
                    placeholders = ", ".join(["?"] * len(f.value))
                    where_clauses.append(f"{sql_col} IN ({placeholders})")
                    params.extend([str(v) for v in f.value])
                elif op == "LIKE":
                    where_clauses.append(f"{sql_col} LIKE ?")
                    params.append(str(f.value))

        # Assemble SQL
        select_str = ",\n    ".join(select_clauses)
        sql = f"SELECT\n    {select_str}\nFROM fct_sales"

        if where_clauses:
            where_str = "\n  AND ".join(where_clauses)
            sql += f"\nWHERE {where_str}"

        if group_clauses:
            group_str = ", ".join(group_clauses)
            sql += f"\nGROUP BY {group_str}"
            sql += f"\nORDER BY {group_str}"

        limit = min(request.limit or 100, MAX_ALLOWED_ROWS)
        sql += f"\nLIMIT {limit};"

        return sql, params

    @classmethod
    def execute_query(cls, request: SemanticQueryRequest) -> SemanticQueryResponse:
        start_time = time.time()
        try:
            cls.validate_request(request)
            sql, params = cls.build_sql(request)

            # Replace ? placeholders with sanitized string params for SQLite raw runner
            # (Note: db.py takes parameterized tuple)
            rows, cols = execute_raw_sql(sql, tuple(params))
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            return SemanticQueryResponse(
                status="success",
                measures=request.measures,
                dimensions=request.dimensions or [],
                generated_sql=sql,
                data=rows,
                row_count=len(rows),
                execution_time_ms=elapsed_ms,
                governance_passed=True
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
                error_message=f"Database execution error: {str(e)}"
            )
