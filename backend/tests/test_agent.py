"""
Unit Tests for MetricMind Agent & Deterministic Intent Router (Phase 13).
Tests all 6 governed intent parsing cases, invalid/ambiguous prompt clarification handling,
and preserves Section 8 multi-step root-cause scenario.
"""

import pytest
from backend.app.agent.agent import MetricMindAgent

@pytest.fixture
def agent():
    return MetricMindAgent()

def test_q4_revenue_intent(agent):
    res = agent.process_query("What was our Q4 revenue?")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["revenue"]
    assert any(f["dimension"] == "quarter" and f["value"] == "Q4 2025" for f in req["filters"])
    assert "SELECT" in api_call["sql"] and "WHERE quarter = ?" in api_call["sql"]

def test_european_sales_intent(agent):
    res = agent.process_query("Show European sales.")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["revenue"]
    assert any(f["dimension"] == "region" and f["value"] == "Europe" for f in req["filters"])
    assert "WHERE region = ?" in api_call["sql"]

def test_compare_european_revenue_q3_q4_intent(agent):
    res = agent.process_query("Compare European revenue between Q3 and Q4.")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["revenue"]
    assert "quarter" in req["dimensions"]
    assert any(f["dimension"] == "region" and f["value"] == "Europe" for f in req["filters"])
    assert any(f["dimension"] == "quarter" and f["operator"] == "IN" and "Q3 2025" in f["value"] and "Q4 2025" in f["value"] for f in req["filters"])

def test_shipping_cost_europe_intent(agent):
    res = agent.process_query("What was the shipping cost in Europe?")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["shipping_cost"]
    assert any(f["dimension"] == "region" and f["value"] == "Europe" for f in req["filters"])

def test_material_cost_europe_intent(agent):
    res = agent.process_query("Show material cost for Europe.")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["material_cost"]
    assert any(f["dimension"] == "region" and f["value"] == "Europe" for f in req["filters"])

def test_margin_q4_intent(agent):
    res = agent.process_query("What was the margin in Q4?")
    assert res["status"] == "success"
    api_call = res["transparency"]["api_calls"][0]
    req = api_call["request"]
    assert req["measures"] == ["margin"]
    assert any(f["dimension"] == "quarter" and f["value"] == "Q4 2025" for f in req["filters"])

def test_ambiguous_prompt_clarification(agent):
    res = agent.process_query("Show me the profits")
    assert res["status"] == "clarification_needed"
    assert "Clarification Required" in res["explanation"]
    assert "revenue" in res["explanation"]
    assert len(res["transparency"]["api_calls"]) == 0  # Zero database queries executed for invalid prompt!

def test_random_invalid_prompt_clarification(agent):
    res = agent.process_query("XYZ random non-business phrase")
    assert res["status"] == "clarification_needed"
    assert "Clarification Required" in res["explanation"]

def test_preserved_root_cause_scenario(agent):
    res = agent.process_query("Why did our European margins drop last quarter?")
    assert res["status"] == "success"
    assert len(res["reasoning_steps"]) >= 4
    assert "Shipping" in res["explanation"] or "Logistics" in res["explanation"]
    assert len(res["transparency"]["api_calls"]) == 2
