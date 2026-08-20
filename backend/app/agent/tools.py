"""
LangChain Tools for MetricMind Semantic Layer Interaction.
Rule 7: Agent must call Semantic Layer API and receive structured JSON.
Must NOT execute arbitrary SQL directly.
"""

import json
from typing import List, Dict, Any, Optional
from langchain_core.tools import tool

from backend.app.semantic.metadata import METRICS_DICTIONARY, DIMENSIONS_DICTIONARY
from backend.app.semantic.models import SemanticQueryRequest, FilterCondition
from backend.app.semantic.layer import GovernedSemanticEngine

@tool
def get_semantic_catalog() -> str:
    """
    Returns the list of official, governed measures, formulas, and available dimensions in MetricMind.
    Use this to inspect available metrics before executing a query.
    """
    catalog = {
        "governed_measures": {
            k: {"label": v["label"], "description": v["description"], "unit": v["unit"]}
            for k, v in METRICS_DICTIONARY.items()
        },
        "governed_dimensions": {
            k: {"label": v["label"], "type": v["type"]}
            for k, v in DIMENSIONS_DICTIONARY.items()
        }
    }
    return json.dumps(catalog, indent=2)

@tool
def execute_governed_query(
    measures: List[str],
    dimensions: Optional[List[str]] = None,
    filters: Optional[List[Dict[str, Any]]] = None,
    limit: Optional[int] = 100
) -> str:
    """
    Executes a governed semantic query against the Data Warehouse.
    
    Args:
        measures: List of governed metrics, e.g. ['revenue', 'margin_pct']
        dimensions: List of dimensions to group by, e.g. ['quarter', 'region']
        filters: List of dicts with 'dimension', 'operator', 'value', e.g. [{'dimension': 'region', 'operator': '=', 'value': 'Europe'}]
        limit: Maximum number of rows to return (default 100)
    """
    filter_objs = []
    if filters:
        for f in filters:
            filter_objs.append(FilterCondition(
                dimension=f.get("dimension", ""),
                operator=f.get("operator", "="),
                value=f.get("value", "")
            ))

    req = SemanticQueryRequest(
        measures=measures,
        dimensions=dimensions or [],
        filters=filter_objs,
        limit=limit
    )

    res = GovernedSemanticEngine.execute_query(req)
    return json.dumps(res.model_dump(), indent=2)
