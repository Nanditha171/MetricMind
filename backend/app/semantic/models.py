"""
Pydantic Schemas for Governed Semantic Query API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class FilterCondition(BaseModel):
    dimension: str = Field(..., description="Target dimension name e.g. 'region'")
    operator: str = Field(..., description="Filter operator e.g. '=', '!=', 'IN', 'equals'")
    value: Any = Field(..., description="Filter value or list of values e.g. 'Europe'")

class SemanticQueryRequest(BaseModel):
    measures: List[str] = Field(..., description="List of metric measures e.g. ['revenue', 'margin_pct']")
    dimensions: Optional[List[str]] = Field(default=[], description="List of dimensions to group by e.g. ['quarter', 'region']")
    filters: Optional[List[FilterCondition]] = Field(default=[], description="List of filter conditions")
    limit: Optional[int] = Field(default=100, description="Max rows to return (capped by governance)")

class SemanticQueryResponse(BaseModel):
    status: str = Field("success", description="Status of query execution: 'success' or 'error'")
    measures: List[str]
    dimensions: List[str]
    generated_sql: str = Field(..., description="Governed SQL compiled by semantic layer")
    data: List[Dict[str, Any]] = Field(..., description="Structured JSON query results")
    row_count: int
    execution_time_ms: float
    governance_passed: bool
    error_message: Optional[str] = None
