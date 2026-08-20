"""
Unit Tests for MetricMind Governed Semantic Layer.
Tests metric validation, SQL generation, filter handling, and unknown metric rejections.
"""

import pytest
from backend.app.semantic.models import SemanticQueryRequest, FilterCondition
from backend.app.semantic.layer import GovernedSemanticEngine, SemanticLayerValidationError

def test_valid_semantic_query():
    req = SemanticQueryRequest(
        measures=["revenue", "margin_pct"],
        dimensions=["quarter"],
        filters=[FilterCondition(dimension="region", operator="=", value="Europe")]
    )
    res = GovernedSemanticEngine.execute_query(req)
    assert res.status == "success"
    assert res.governance_passed is True
    assert "SUM(revenue)" in res.generated_sql
    assert "WHERE region = ?" in res.generated_sql
    assert res.row_count > 0

def test_unknown_metric_rejection():
    req = SemanticQueryRequest(
        measures=["arbitrary_fake_metric"],
        dimensions=["region"]
    )
    res = GovernedSemanticEngine.execute_query(req)
    assert res.status == "error"
    assert res.governance_passed is False
    assert "Unknown metric 'arbitrary_fake_metric'" in res.error_message

def test_unknown_dimension_rejection():
    req = SemanticQueryRequest(
        measures=["revenue"],
        dimensions=["unsupported_dimension"]
    )
    res = GovernedSemanticEngine.execute_query(req)
    assert res.status == "error"
    assert res.governance_passed is False
    assert "Unknown dimension 'unsupported_dimension'" in res.error_message
