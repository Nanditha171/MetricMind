"""
Authoritative Governed Metric & Dimension Definitions for MetricMind.
Rule 6: Metrics must have a single authoritative definition.
Never allow the LLM to invent a new definition for an existing metric.
"""

from typing import Dict, Any

METRICS_DICTIONARY: Dict[str, Dict[str, Any]] = {
    "revenue": {
        "name": "revenue",
        "label": "Revenue",
        "description": "Total gross sales revenue ($)",
        "sql_formula": "SUM(revenue)",
        "unit": "USD",
        "format": "currency"
    },
    "cost": {
        "name": "cost",
        "label": "Total Cost",
        "description": "Sum of material and shipping costs ($)",
        "sql_formula": "SUM(cost)",
        "unit": "USD",
        "format": "currency"
    },
    "margin": {
        "name": "margin",
        "label": "Operating Margin",
        "description": "Net dollar margin: SUM(revenue - cost)",
        "sql_formula": "SUM(revenue - cost)",
        "unit": "USD",
        "format": "currency"
    },
    "margin_pct": {
        "name": "margin_pct",
        "label": "Margin Percentage",
        "description": "Net margin percentage: SUM(revenue - cost) / SUM(revenue) * 100",
        "sql_formula": "CASE WHEN SUM(revenue) > 0 THEN ROUND((SUM(revenue - cost) / SUM(revenue)) * 100.0, 2) ELSE 0.0 END",
        "unit": "percent",
        "format": "percentage"
    },
    "quantity": {
        "name": "quantity",
        "label": "Quantity Sold",
        "description": "Total units sold",
        "sql_formula": "SUM(quantity)",
        "unit": "units",
        "format": "number"
    },
    "shipping_cost": {
        "name": "shipping_cost",
        "label": "Shipping Cost",
        "description": "Freight & logistics shipping costs ($)",
        "sql_formula": "SUM(shipping_cost)",
        "unit": "USD",
        "format": "currency"
    },
    "material_cost": {
        "name": "material_cost",
        "label": "Material Cost",
        "description": "Raw material & component costs ($)",
        "sql_formula": "SUM(material_cost)",
        "unit": "USD",
        "format": "currency"
    }
}

DIMENSIONS_DICTIONARY: Dict[str, Dict[str, Any]] = {
    "quarter": {
        "name": "quarter",
        "label": "Quarter",
        "sql_column": "quarter",
        "type": "string"
    },
    "month": {
        "name": "month",
        "label": "Month",
        "sql_column": "month",
        "type": "string"
    },
    "year": {
        "name": "year",
        "label": "Year",
        "sql_column": "year",
        "type": "integer"
    },
    "region": {
        "name": "region",
        "label": "Region",
        "sql_column": "region",
        "type": "string"
    },
    "country": {
        "name": "country",
        "label": "Country",
        "sql_column": "country",
        "type": "string"
    },
    "product": {
        "name": "product",
        "label": "Product",
        "sql_column": "product",
        "type": "string"
    },
    "category": {
        "name": "category",
        "label": "Product Category",
        "sql_column": "category",
        "type": "string"
    }
}
