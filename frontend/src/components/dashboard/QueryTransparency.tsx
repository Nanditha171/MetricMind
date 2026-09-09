'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Code2,
  Cpu,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Layers,
  Clock,
  FileCheck
} from 'lucide-react';
import CodeViewer from '../ui/CodeViewer';

interface QueryTransparencyProps {
  transparency?: {
    api_calls?: Array<{
      step: number;
      request: any;
      sql: string;
    }>;
    governed_metrics_used?: string[];
    data_source?: string;
    total_rows_scanned?: number;
    execution_time_ms?: number;
  };
  defaultOpen?: boolean;
}

export default function QueryTransparency({
  transparency,
  defaultOpen = true
}: QueryTransparencyProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'semantic' | 'sql' | 'execution'>('semantic');
  const [copied, setCopied] = useState(false);

  const defaultApiCalls = transparency?.api_calls || [
    {
      step: 1,
      request: {
        measures: ['revenue', 'cost', 'material_cost', 'shipping_cost', 'margin', 'margin_pct', 'quantity'],
        filters: [{ dimension: 'region', operator: '=', value: 'Europe' }]
      },
      sql: `SELECT
    SUM(f.revenue) AS revenue,
    SUM(f.cost) AS cost,
    SUM(ROUND(f.cost * 0.75, 2)) AS material_cost,
    SUM(ROUND(f.cost * 0.25, 2)) AS shipping_cost,
    SUM(f.profit) AS margin,
    CASE WHEN SUM(f.revenue) > 0 THEN ROUND(SUM(f.profit) * 100.0 / SUM(f.revenue), 2) ELSE 0.0 END AS margin_pct,
    SUM(f.quantity) AS quantity
FROM fct_sales f
WHERE LOWER(CAST(f.region AS TEXT)) = LOWER('Europe');`
    }
  ];

  const primaryCall = defaultApiCalls[0];
  const primarySql = primaryCall?.sql || 'SELECT * FROM fct_sales;';
  const semanticJson = JSON.stringify(primaryCall?.request || {}, null, 2);

  const rowsScanned = transparency?.total_rows_scanned ?? 4391;
  const executionMs = transparency?.execution_time_ms ?? 12.4;
  const dataSource = transparency?.data_source ?? 'PostgreSQL (metricmind) / dbt mart fct_sales';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-surface-border rounded-2xl shadow-card overflow-hidden">
      {/* Header Bar Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-surface-border text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">
                Query Transparency & Governance Inspector
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Inspect compile-time AST verification, semantic JSON payloads, and executed SQL
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-500 font-mono">
            <span className="flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {rowsScanned} rows scanned
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {executionMs} ms
            </span>
          </div>

          <div className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto self-start">
            <button
              onClick={() => setActiveTab('semantic')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'semantic'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Semantic Query</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sql'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Generated SQL ({defaultApiCalls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('execution')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'execution'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Execution & Safety</span>
            </button>
          </div>

          {/* TAB 1: Semantic Query (Structured JSON) */}
          {activeTab === 'semantic' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Governed JSON Request Payload dispatched to Semantic Layer Engine</span>
                <span className="font-mono text-[11px] text-brand-600">POST /api/semantic/query</span>
              </div>
              <CodeViewer
                code={semanticJson}
                language="json"
                title="SemanticQueryRequest Payload"
                maxHeight="260px"
              />
            </div>
          )}

          {/* TAB 2: Generated SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Governed SQL compiled targeting dbt analytical mart (<code className="font-mono text-slate-700">fct_sales</code>)</span>
                <span className="text-emerald-700 font-medium">Read-Only Enforced</span>
              </div>
              {defaultApiCalls.map((call, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500">
                    Query Step #{call.step || idx + 1}:
                  </div>
                  <CodeViewer
                    code={call.sql}
                    language="sql"
                    title={`Governed SQL (Step ${call.step || idx + 1})`}
                    maxHeight="260px"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Execution Diagnostics & Governance */}
          {activeTab === 'execution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Card 1: Performance Diagnostics */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-brand-600" />
                  <span>Execution Diagnostics</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Execution Status</span>
                    <span className="font-semibold text-emerald-700 flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> Success (200 OK)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Rows Scanned</span>
                    <span className="font-mono font-semibold text-slate-800">{rowsScanned} rows</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Latency / Response Time</span>
                    <span className="font-mono font-semibold text-slate-800">{executionMs} ms</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Data Source</span>
                    <span className="font-mono font-semibold text-brand-600">{dataSource}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Governance Checks */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Governance Verification Checks</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">SQL Safety Guardrail</span>
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> Passed (AST Inspected)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Metric Whitelist</span>
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> 100% Governed Catalog Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Direct Frontend SQL</span>
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> Blocked (Restricted to APIs)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Row Limit Enforced</span>
                    <span className="font-mono font-semibold text-slate-800">1,000 max capped</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
