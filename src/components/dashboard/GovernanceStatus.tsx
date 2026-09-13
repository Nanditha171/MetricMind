'use client';

import React from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Filter
} from 'lucide-react';
import { HealthResponse } from '../../lib/api';

interface GovernanceStatusProps {
  healthData?: HealthResponse | null;
  totalRows?: number;
}

export default function GovernanceStatus({
  healthData,
  totalRows = 50000
}: GovernanceStatusProps) {
  const isHealthy = healthData?.status === 'healthy' || healthData?.database?.status === 'connected';
  const engineName = healthData?.database?.engine || 'PostgreSQL / SQLite fallback';

  const cards = [
    {
      title: 'Semantic Layer',
      status: 'Healthy',
      subtext: 'Authoritative Cube/dbt definitions',
      icon: Database,
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Query Governance',
      status: 'Enforced',
      subtext: 'No raw frontend SQL allowed',
      icon: ShieldCheck,
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Row Limit',
      status: '1,000',
      subtext: 'Strict safety cap per query',
      icon: Filter,
      statusClass: 'text-brand-700 bg-brand-50 border-brand-200 font-mono'
    },
    {
      title: 'Agent Steps',
      status: '5 max',
      subtext: 'Bounded multi-step reasoning',
      icon: Zap,
      statusClass: 'text-brand-700 bg-brand-50 border-brand-200 font-mono'
    },
    {
      title: 'SQL Safety',
      status: 'Active',
      subtext: 'Anti-injection guardrails active',
      icon: Lock,
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Data Source',
      status: engineName.includes('Postgres') ? 'PostgreSQL' : 'DuckDB / SQLite',
      subtext: `dbt mart fct_sales (${totalRows.toLocaleString()} rows)`,
      icon: Server,
      statusClass: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    }
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
            Governance & System Health
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
          <span>{isHealthy ? 'All Systems Operational' : 'Degraded Mode'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-surface-border rounded-xl p-3.5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="my-0.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${c.statusClass}`}
                >
                  {c.status}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 mt-1.5 leading-tight truncate">
                {c.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
