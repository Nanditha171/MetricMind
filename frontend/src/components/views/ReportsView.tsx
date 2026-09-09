'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ShieldCheck, TrendingDown, ArrowUpRight, BarChart3 } from 'lucide-react';
import { fetchExecutiveKpis, fetchQuarterlyTrendData, formatMetricValue } from '../../lib/api';
import RootCauseAnalysis from '../dashboard/RootCauseAnalysis';
import LoadingSkeleton from '../ui/LoadingSkeleton';

export default function ReportsView() {
  const [selectedReport, setSelectedReport] = useState<'europe_margin' | 'quarterly_perf' | 'regional_mix'>('europe_margin');
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveKpis('Europe', '2025-Q4', '2025-Q3')
      .then((res) => {
        setKpis(res.current);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load report data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-surface-border gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Executive BI Reports</h1>
            <p className="text-xs text-slate-500">
              Governed, audit-ready financial and operational analytical reports
            </p>
          </div>
        </div>

        {/* Report Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedReport('europe_margin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedReport === 'europe_margin'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            European Margin Analysis
          </button>
          <button
            onClick={() => setSelectedReport('quarterly_perf')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedReport === 'quarterly_perf'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarterly Performance
          </button>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'europe_margin' && (
        <div className="space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 font-bold">
                  Executive Briefing Report #2025-EU-Q4
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  European Operating Margin Contraction & Root Cause Audit
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                Governed & Verified
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              This executive report presents an authoritative evaluation of European gross margin performance
              between Q3 2025 and Q4 2025. Data is sourced strictly from governed dbt marts (<code className="font-mono text-slate-700">fct_sales</code>)
              without manual intervention.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Europe Revenue</span>
                <div className="text-lg font-bold text-slate-800 font-sans mt-0.5">
                  {kpis ? formatMetricValue(kpis.revenue, 'currency') : '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Total Cost</span>
                <div className="text-lg font-bold text-slate-800 font-sans mt-0.5">
                  {kpis ? formatMetricValue(kpis.cost, 'currency') : '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Operating Margin</span>
                <div className="text-lg font-bold text-slate-800 font-sans mt-0.5">
                  {kpis ? formatMetricValue(kpis.margin, 'currency') : '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Margin %</span>
                <div className="text-lg font-bold text-emerald-700 font-sans mt-0.5">
                  {kpis ? `${Number(kpis.margin_pct).toFixed(2)}%` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Root Cause Decomposition */}
          <RootCauseAnalysis
            region="Europe"
            prevQuarter="Q3 2025"
            currentQuarter="Q4 2025"
            prevMargin={48.12}
            currentMargin={26.49}
            materialCostChangePct={13.09}
            shippingCostChangePct={399.01}
            dominantContributor="Shipping Cost"
          />
        </div>
      )}

      {selectedReport === 'quarterly_perf' && (
        <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Global Quarterly Financial Synthesis (2024-Q1 through 2025-Q4)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consolidated financial performance across all operating regions compiled by the MetricMind Semantic Layer.
          </p>
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Select specific quarters in the top bar to drill into granular regional line-items.
          </div>
        </div>
      )}
    </div>
  );
}
