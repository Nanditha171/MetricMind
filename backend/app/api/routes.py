"""
FastAPI REST API Routes for MetricMind.
Section 7 & 10: Conversational BI API, Direct Semantic Layer Query, Catalog & Transparency Endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from backend.app.semantic.models import SemanticQueryRequest, SemanticQueryResponse
from backend.app.semantic.layer import GovernedSemanticEngine
from backend.app.semantic.metadata import METRICS_DICTIONARY, DIMENSIONS_DICTIONARY
from backend.app.agent.agent import MetricMindAgent
from backend.app.core.governance import PromptInjectionError

router = APIRouter(prefix="/api")
agent_instance = MetricMindAgent()

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="Natural language business query")

@router.post("/chat")
def chat_endpoint(request: ChatRequest) -> Dict[str, Any]:
    """
    Primary Conversational BI Endpoint.
    Accepts natural language business questions and returns governed analytical answers,
    multi-step reasoning traces, ECharts configs, and query transparency details.
    """
    try:
        response = agent_instance.process_query(request.prompt)
        return response
    except PromptInjectionError as pie:
        raise HTTPException(status_code=400, detail=str(pie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")

@router.post("/semantic/query", response_model=SemanticQueryResponse)
def semantic_query_endpoint(request: SemanticQueryRequest):
    """
    Direct Semantic Layer API Endpoint.
    Validates measures/dimensions against dictionary and returns governed SQL + results.
    """
    response = GovernedSemanticEngine.execute_query(request)
    return response

@router.get("/semantic/metrics")
def get_metrics_catalog():
    """
    Returns authoritative catalog of governed metrics and dimensions.
    """
    return {
        "measures": METRICS_DICTIONARY,
        "dimensions": DIMENSIONS_DICTIONARY
    }

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MetricMind Governed BI Engine",
        "semantic_layer": "active"
    }
