# MetricMind — System Architecture

MetricMind is an enterprise Agentic Semantic BI Engine that enforces strict metric governance between natural language user requests and data warehouses.

## Core Flow Architecture

```
User (Natural Language Prompt)
   │
   ▼
[ Next.js 14 Web Workspace ] ── (ECharts Rendering + Transparency Inspector)
   │
   ▼ REST API (POST /api/chat)
[ FastAPI Backend Application ]
   │
   ▼
[ LangChain Multi-Step Agent ]
   ├── 1. Intent Parsing & Prompt Safety Inspection
   ├── 2. Catalog Lookup (Measures & Dimensions Validation)
   └── 3. Multi-Step Reasoning Planner (Root-Cause Investigation)
   │
   ▼ Structured JSON Query ({ measures: [...], dimensions: [...], filters: [...] })
[ Governed Semantic Layer API ]
   ├── Validates measures against METRICS_DICTIONARY
   ├── Validates dimensions against DIMENSIONS_DICTIONARY
   └── Compiles Parameterized Governed SQL
   │
   ▼ Parameterized SQL Execution
[ Data Mart (fct_sales in DuckDB / SQLite / Snowflake) ]
   │
   ▼ Structured JSON Results
[ LangChain Agent Synthesis ]
   ├── Executive Summary Markdown Response
   └── Apache ECharts Dynamic Visualization Metadata
```

## Anti-Pattern Prevention
MetricMind explicitly prevents the dangerous direct SQL generation loop:
`User -> LLM -> Arbitrary SQL -> Data Warehouse (VIOLATION)`

Instead, it enforces:
`User -> LangChain Agent -> Semantic Layer -> Governed Metric Query -> Data Warehouse (APPROVED)`
