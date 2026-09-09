/**
 * MetricMind API Client for FastAPI backend.
 * Provides typed methods to interact with Conversational BI, Governed Semantic Layer,
 * Metric Catalog, Health Diagnostics, and Dataset Marts.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface FilterCondition {
  dimension: string;
  operator?: string;
  value: string | number | string[];
}

export interface SemanticQueryRequest {
  measures: string[];
  dimensions?: string[];
  filters?: FilterCondition[];
  limit?: number;
  order_by?: string;
  order_desc?: boolean;
}

export interface SemanticQueryResponse {
  status: 'success' | 'error';
  measures: string[];
  dimensions: string[];
  generated_sql: string;
  data: Array<Record<string, any>>;
  row_count: number;
  execution_time_ms: number;
  governance_passed: boolean;
  data_source: string;
  error_message?: string;
}

export interface ChatResponse {
  query: string;
  status: string;
  answer?: string;
  metric?: string;
  explanation: string;
  chart_config?: any;
  reasoning_steps: Array<{
    step: number;
    action: string;
    thought?: string;
    query_measures?: string[];
    query_dimensions?: string[];
    generated_sql?: string;
    row_count?: number;
    observation?: string;
  }>;
  transparency: {
    api_calls: Array<{
      step: number;
      request: any;
      sql: string;
    }>;
    governed_metrics_used: string[];
    data_source: string;
    total_rows_scanned: number;
    execution_time_ms: number;
  };
}

export interface MetricDefinition {
  name: string;
  label: string;
  description: string;
  sql_formula: string;
  unit: string;
  format: string;
  cube_measure?: string;
}

export interface DimensionDefinition {
  name: string;
  label: string;
  sql_column: string;
  type: string;
  cube_dimension?: string;
}

export interface MetricsCatalogResponse {
  measures: Record<string, MetricDefinition>;
  dimensions: Record<string, DimensionDefinition>;
  metrics?: Array<{
    id: string;
    name: string;
    formula: string;
    unit: string;
    description: string;
  }>;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  semantic_layer: string;
  database: {
    status: string;
    engine: string;
    database?: string;
    host?: string;
    port?: string;
    user?: string;
    dbt_models?: string;
    error?: string;
  };
}

export interface DatasetSummaryResponse {
  database: string;
  dbt_mart?: string;
  total_sales_rows?: number;
  regions?: string[];
  products?: string[];
  categories?: string[];
  metrics?: string[];
  dimensions?: string[];
  error?: string;
}

export interface KpiCardData {
  id: string;
  name: string;
  label: string;
  value: number;
  formattedValue: string;
  prevValue?: number;
  formattedPrevValue?: string;
  changePct?: number;
  changePp?: number;
  isPositiveGood: boolean;
  unit: string;
  format: 'currency' | 'percentage' | 'number';
}

// -------------------------------------------------------------
// Core API Calls
// -------------------------------------------------------------

export async function sendChatMessage(prompt: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to process query with agent.');
  }

  return response.json();
}

export async function fetchSemanticQuery(request: SemanticQueryRequest): Promise<SemanticQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/semantic/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Semantic query execution failed.');
  }

  return response.json();
}

export async function fetchMetricsCatalog(): Promise<MetricsCatalogResponse> {
  const response = await fetch(`${API_BASE_URL}/semantic/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics catalog.');
  }
  return response.json();
}

export async function fetchHealthStatus(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Failed to fetch system health status.');
  }
  return response.json();
}

export async function fetchDatasetSummary(): Promise<DatasetSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/dataset`);
  if (!response.ok) {
    throw new Error('Failed to fetch dataset summary.');
  }
  return response.json();
}

// -------------------------------------------------------------
// Formatters & Presentation Helpers
// -------------------------------------------------------------

export function formatMetricValue(val: number, format: 'currency' | 'percentage' | 'number', unit = ''): string {
  if (val === undefined || val === null || isNaN(val)) return '—';

  if (format === 'currency') {
    if (Math.abs(val) >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(val) >= 1_000) {
      return `$${(val / 1_000).toFixed(2)}K`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (format === 'percentage') {
    return `${val.toFixed(2)}%`;
  }

  // format === 'number'
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toLocaleString('en-US');
}

// -------------------------------------------------------------
// High-Level Dashboard Analytical Queries
// -------------------------------------------------------------

export async function fetchExecutiveKpis(
  region = 'Europe',
  quarter = '2025-Q4',
  prevQuarter = '2025-Q3'
): Promise<{ current: Record<string, number>; previous: Record<string, number>; sql: string }> {
  const measures = [
    'revenue',
    'cost',
    'material_cost',
    'shipping_cost',
    'margin',
    'margin_pct',
    'quantity'
  ];

  const currentFilters: FilterCondition[] = [];
  const prevFilters: FilterCondition[] = [];

  if (region && region !== 'All' && region !== 'Global') {
    currentFilters.push({ dimension: 'region', operator: '=', value: region });
    prevFilters.push({ dimension: 'region', operator: '=', value: region });
  }

  if (quarter && quarter !== 'All') {
    currentFilters.push({ dimension: 'quarter', operator: '=', value: quarter });
  }

  if (prevQuarter && prevQuarter !== 'All') {
    prevFilters.push({ dimension: 'quarter', operator: '=', value: prevQuarter });
  }

  // Execute both queries via governed semantic layer in parallel
  const [currRes, prevRes] = await Promise.all([
    fetchSemanticQuery({ measures, filters: currentFilters }),
    fetchSemanticQuery({ measures, filters: prevFilters })
  ]);

  const current = currRes.data[0] || {};
  const previous = prevRes.data[0] || {};

  return {
    current,
    previous,
    sql: currRes.generated_sql
  };
}

export async function fetchQuarterlyTrendData(
  region = 'Europe'
): Promise<Array<{ quarter: string; revenue: number; cost: number; profit: number; margin_pct: number; material_cost: number; shipping_cost: number }>> {
  const filters: FilterCondition[] = [];
  if (region && region !== 'All' && region !== 'Global') {
    filters.push({ dimension: 'region', operator: '=', value: region });
  }

  const res = await fetchSemanticQuery({
    measures: ['revenue', 'cost', 'profit', 'margin_pct', 'material_cost', 'shipping_cost'],
    dimensions: ['quarter'],
    filters,
    order_by: 'quarter',
    order_desc: false,
    limit: 12
  });

  return (res.data || []) as any;
}
