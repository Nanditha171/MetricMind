'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Check, Clock, Database, Code2 } from 'lucide-react';
import CodeViewer from '../ui/CodeViewer';

export default function AuditTrailView() {
  const auditLogs = [
    {
      id: 'AUD-8921',
      timestamp: '2026-09-09 12:44:12',
      prompt: 'Why did our European margins drop last quarter?',
      user: 'Executive User (admin)',
      action: 'Multi-Step Root Cause Analysis',
      status: 'PASSED_GOVERNANCE',
      rowsScanned: 15,
      latency: '4186.98 ms',
      sql: `SELECT
    f.quarter AS quarter,
    SUM(f.revenue) AS revenue,
    SUM(f.cost) AS cost,
    SUM(f.profit) AS profit,
    CASE WHEN SUM(f.revenue) > 0 THEN ROUND(SUM(f.profit) * 100.0 / SUM(f.revenue), 2) ELSE 0.0 END AS margin_pct
FROM fct_sales f
WHERE LOWER(CAST(f.region AS TEXT)) = LOWER('Europe')
GROUP BY f.quarter
ORDER BY revenue DESC
LIMIT 20;`
    },
    {
      id: 'AUD-8920',
      timestamp: '2026-09-09 12:42:01',
      prompt: 'revenue of asia',
      user: 'Executive User (admin)',
      action: 'Direct Semantic Query (get_revenue)',
      status: 'PASSED_GOVERNANCE',
      rowsScanned: 1,
      latency: '2134.74 ms',
      sql: `SELECT
    SUM(f.revenue) AS revenue
FROM fct_sales f
WHERE LOWER(CAST(f.region AS TEXT)) = LOWER('Asia');`
    },
    {
      id: 'AUD-8919',
      timestamp: '2026-09-09 12:35:10',
      prompt: 'DROP TABLE fct_sales;',
      user: 'System Stress Test',
      action: 'Anti-Injection Guardrail Inspection',
      status: 'BLOCKED_BY_GUARDRAIL',
      rowsScanned: 0,
      latency: '4.20 ms',
      sql: '/* Query execution blocked by MetricMind Governance Guardrail */'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Query Governance Audit Trail</h1>
            <p className="text-xs text-slate-500">
              Immutable logging of natural language requests, AST guardrail inspections, and compiled SQL
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                  {log.id}
                </span>
                <span className="text-xs text-slate-500 font-mono">{log.timestamp}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{log.user}</span>
              </div>

              <div>
                {log.status === 'PASSED_GOVERNANCE' ? (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 mr-1" /> Governance Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Blocked by Guardrail
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-700">
              <span className="font-semibold text-slate-500">Query Prompt: </span>
              <span className="font-bold text-slate-900 italic">"{log.prompt}"</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-500 font-mono">{log.rowsScanned} rows scanned</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-500 font-mono">{log.latency}</span>
            </div>

            <CodeViewer code={log.sql} language="sql" title="Compiled Governed SQL" maxHeight="160px" />
          </div>
        ))}
      </div>
    </div>
  );
}
