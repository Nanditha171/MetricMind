# MetricMind — API Documentation

The MetricMind backend provides RESTful API endpoints for conversational BI, direct semantic queries, catalog discovery, and health checking.

## Base URL
`http://localhost:8000/api`

---

### 1. Conversational BI Endpoint
**`POST /api/chat`**

Executes a natural language business query via the LangChain multi-step agent.

#### Request Body
```json
{
  "prompt": "Why did our European margins drop last quarter?"
}
```

#### Response (200 OK)
```json
{
  "query": "Why did our European margins drop last quarter?",
  "status": "success",
  "explanation": "### Analytical Summary: European Margin Decline Analysis...",
  "chart_config": {
    "title": { "text": "European Quarter-over-Quarter Financial Breakdown ($)" },
    "series": [...]
  },
  "reasoning_steps": [
    {
      "step": 1,
      "action": "Intent Recognition & Plan Formulation",
      "thought": "User requested root-cause analysis for European margin decline..."
    }
  ],
  "transparency": {
    "api_calls": [
      {
        "step": 1,
        "request": { "measures": ["revenue", "margin_pct"], "dimensions": ["quarter"] },
        "sql": "SELECT quarter AS quarter, CASE WHEN SUM(revenue) > 0..."
      }
    ],
    "governed_metrics_used": ["revenue", "cost", "material_cost", "shipping_cost", "margin", "margin_pct"],
    "data_source": "fct_sales (dbt Mart / Governed Semantic Layer)",
    "total_rows_scanned": 10,
    "execution_time_ms": 14.5
  }
}
```

---

### 2. Direct Governed Semantic Query Endpoint
**`POST /api/semantic/query`**

Executes a structured semantic query against the Governed Semantic Layer.

#### Request Body
```json
{
  "measures": ["revenue", "margin_pct"],
  "dimensions": ["quarter", "region"],
  "filters": [
    { "dimension": "region", "operator": "=", "value": "Europe" }
  ],
  "limit": 50
}
```

#### Response (200 OK)
```json
{
  "status": "success",
  "measures": ["revenue", "margin_pct"],
  "dimensions": ["quarter", "region"],
  "generated_sql": "SELECT quarter AS quarter, region AS region, SUM(revenue) AS revenue...",
  "data": [...],
  "row_count": 5,
  "execution_time_ms": 6.2,
  "governance_passed": true,
  "error_message": null
}
```

---

### 3. Metric Catalog Endpoint
**`GET /api/semantic/metrics`**

Returns authoritative definitions of all governed measures and dimensions.

---

### 4. Health Check Endpoint
**`GET /api/health`**
```json
{
  "status": "healthy",
  "service": "MetricMind Governed BI Engine",
  "semantic_layer": "active"
}
```
