# MetricMind — Agentic Semantic BI Engine

**MetricMind** is an enterprise-grade **Agentic Semantic BI Engine** that enables business users to ask complex analytical questions in natural language and receive governed, consistent, and transparent answers backed by dynamic Apache ECharts visualizations—without exposing raw database tables or allowing arbitrary SQL execution by LLMs.

---

## Key Features

1. **Governed Business Metrics**: Measures (`revenue`, `cost`, `margin`, `margin_pct`, `quantity`, `shipping_cost`, `material_cost`) have a single authoritative mathematical formula enforced at the semantic layer.
2. **Strict Architecture Enforcement**:
   $$\text{User} \rightarrow \text{LangChain Agent} \rightarrow \text{Semantic Layer API} \rightarrow \text{Governed Metric Query} \rightarrow \text{Data Warehouse}$$
3. **Multi-Step Agentic Reasoning**: Built-in root-cause analytical workflows. Answers complex questions like *"Why did our European margins drop last quarter?"* by automatically running comparative queries and identifying cost spikes (e.g. shipping logistics vs raw material costs).
4. **Query Transparency Inspector**: Interactive UI drawer displaying the exact JSON API payload, compiled governed SQL statement, metric dictionary definitions, and security status.
5. **Dynamic ECharts Visualizations**: Dynamic rendering of line charts, bar charts, and financial breakdowns powered by Apache ECharts.
6. **Enterprise Governance & Security**: Safeguards against prompt injection, arbitrary SQL execution, unknown metrics, and expensive queries (capped at 1,000 max rows & 5 max agent steps).
7. **Production Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, FastAPI, LangChain, dbt, Cube.dev semantic model exports, DuckDB / SQLite / Snowflake Data Warehouse.

---

## Directory Structure

```
MetricMind/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # FastAPI REST API (/api/chat, /api/semantic/query, /api/semantic/metrics)
│   │   ├── agent/agent.py         # Multi-step reasoning agent orchestrator
│   │   ├── agent/tools.py         # LangChain tools for semantic layer interaction
│   │   ├── core/governance.py     # Prompt injection scanner & row/step limiters
│   │   ├── semantic/layer.py      # Core Governed Semantic Engine (compiles JSON -> Parameterized SQL)
│   │   ├── semantic/metadata.py   # Authoritative metric & dimension definitions
│   │   ├── semantic/models.py     # Pydantic request/response schemas
│   │   ├── visualization/builder.py# Apache ECharts configuration builder
│   │   ├── database/db.py         # SQLite / DuckDB connector & Snowflake DDL exporter
│   │   └── database/seed.py       # Realistic corporate sales & shipping data generator
│   ├── tests/                     # Comprehensive Pytest test suite
│   ├── main.py                    # FastAPI server entrypoint
│   └── requirements.txt
├── dbt_project/                   # Complete dbt transformation project
│   ├── dbt_project.yml
│   └── models/
│       ├── staging/stg_orders.sql
│       └── marts/fct_sales.sql
├── cube/                          # Cube.dev semantic layer model definition
│   └── model/Sales.yml
├── frontend/                      # Next.js 14 Conversational BI UI
│   ├── src/
│   │   ├── app/page.tsx           # Main BI Workspace Page
│   │   ├── components/            # ChatInterface, TransparencyPanel, DynamicChart, MetricsCatalog
│   │   └── lib/api.ts             # API client for FastAPI backend
├── docs/                          # Comprehensive System Documentation
│   ├── ARCHITECTURE.md
│   ├── METRIC_DEFINITIONS.md
│   ├── GOVERNANCE.md
│   ├── DATA_DICTIONARY.md
│   ├── API.md
│   ├── SETUP.md
│   ├── TESTING.md
│   └── DEMO_QUESTIONS.md
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Seed & Launch Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Seed sample dataset
python backend/app/database/seed.py

# Launch FastAPI backend
python -m uvicorn backend.main:app --reload --port 8000
```

### 2. Launch Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with MetricMind.

---

## Automated Verification Tests
Run the complete backend test suite:
```bash
python -m pytest backend/tests/ -v
```

---

## Primary Demonstration Query

Ask: **"Why did our European margins drop last quarter?"**

MetricMind will:
1. Query European margin percentage for Q3 vs Q4 2025 (detecting the drop from 46.7% to 28.3%).
2. Execute a secondary governed query breaking down Material Cost vs Shipping Cost.
3. Identify that Shipping & Freight Logistics costs spiked by **+278%** ($1.18M vs $312K).
4. Synthesize an executive summary with a supporting Apache ECharts financial graph.
5. Provide complete query transparency in the UI inspector drawer.
