'use client';

import React from 'react';
import { Sparkles, Activity, ShieldCheck, Database, Calendar } from 'lucide-react';

interface ExecutiveOverviewProps {
  region: string;
  quarter: string;
  totalTransactions?: number;
  dataSource?: string;
}

export default function ExecutiveOverview({
  region,
  quarter,
  totalTransactions = 50000,
  dataSource = 'PostgreSQL (metricmind)'
}: ExecutiveOverviewProps) {
  const displayRegion = region === 'All' || region === 'Global' ? 'Global Operations' : region;
  const displayQuarter = quarter === 'All' ? 'All Quarters' : quarter;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-surface-border">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl md:text-2xl font-bold text-surface-textMain tracking-tight">
            Executive Overview
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            Authoritative
          </span>
        </div>
        <p className="text-xs md:text-sm text-surface-textMuted mt-1 flex items-center gap-1.5 font-normal">
          Key business metrics for <span className="font-semibold text-slate-800">{displayRegion}</span>
          <span>•</span>
          <span className="font-semibold text-slate-800">{displayQuarter}</span>
        </p>
      </div>

      {/* Freshness & System Health Status Badges */}
      <div className="flex items-center space-x-2.5 text-xs">
        <div className="flex items-center space-x-1.5 bg-white border border-surface-border px-3 py-1.5 rounded-xl shadow-card">
          <Database className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-slate-600 font-medium">Data Warehouse:</span>
          <span className="font-mono text-slate-800 font-semibold">{dataSource}</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">Governance Verified</span>
        </div>
      </div>
    </div>
  );
}
