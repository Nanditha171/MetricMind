'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Layers,
  DollarSign,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  fetchExecutiveKpis,
  fetchQuarterlyTrendData,
  formatMetricValue
} from '../../lib/api';
import RootCauseAnalysis from '../dashboard/RootCauseAnalysis';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import DynamicChart from '../DynamicChart';

interface ReportsViewProps {
  selectedRegion?: string;
  selectedQuarter?: string;
  prevQuarter?: string;
  currentKpis?: Record<string, number>;
  previousKpis?: Record<string, number>;
  loadingKpis?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function formatQuarterDisplay(q?: string): string {
  if (!q || q === 'All') return 'All Quarters';
  if (q.includes('-Q')) {
    const [year, quarter] = q.split('-');
    return `${quarter} ${year}`;
  }
  return q;
}

export default function ReportsView({
  selectedRegion = 'Europe',
  selectedQuarter = '2025-Q4',
  prevQuarter = '2025-Q3',
  currentKpis: parentCurrentKpis,
  previousKpis: parentPreviousKpis,
  loadingKpis: parentLoadingKpis,
  isRefreshing = false,
  onRefresh
}: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<'margin_analysis' | 'quarterly_perf'>('margin_analysis');

  // Local state if props are not supplied by parent
  const [localKpis, setLocalKpis] = useState<{ current: Record<string, number>; previous: Record<string, number> } | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-quarter trend data for the Quarterly Performance tab
  const [quarterlyTrends, setQuarterlyTrends] = useState<any[]>([]);
  const [loadingQuarterlyTrends, setLoadingQuarterlyTrends] = useState(false);

  // Fetch quarterly trend data when in quarterly performance tab or on region change
  useEffect(() => {
    let isMounted = true;
    setLoadingQuarterlyTrends(true);
    fetchQuarterlyTrendData(selectedRegion)
      .then((data) => {
        if (isMounted) {
          setQuarterlyTrends(data || []);
          setLoadingQuarterlyTrends(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load quarterly trends for reports:', err);
          setLoadingQuarterlyTrends(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedRegion]);

  // Fetch local KPI data if parent props are omitted
  const fetchLocalKpis = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      const res = await fetchExecutiveKpis(selectedRegion, selectedQuarter, prevQuarter);
      setLocalKpis(res);
    } catch (err: any) {
      console.error('Failed to load report executive KPIs:', err);
      setError(err.message || 'Failed to fetch governed KPI metrics from backend.');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!parentCurrentKpis || Object.keys(parentCurrentKpis).length === 0) {
      fetchLocalKpis();
    }
  }, [selectedRegion, selectedQuarter, prevQuarter, parentCurrentKpis]);

  // Determine effective KPIs and loading state
  const currentKpis = parentCurrentKpis && Object.keys(parentCurrentKpis).length > 0
    ? parentCurrentKpis
    : localKpis?.current;

  const previousKpis = parentPreviousKpis && Object.keys(parentPreviousKpis).length > 0
    ? parentPreviousKpis
    : localKpis?.previous;

  const isLoading = parentLoadingKpis !== undefined ? parentLoadingKpis : localLoading;

  const hasData = currentKpis && (
    currentKpis.revenue !== undefined ||
    currentKpis.cost !== undefined ||
    currentKpis.margin !== undefined ||
    currentKpis.margin_pct !== undefined
  );

  // Formatted labels
  const currentQuarterLabel = formatQuarterDisplay(selectedQuarter);
  const prevQuarterLabel = formatQuarterDisplay(prevQuarter);
  const regionLabel = selectedRegion === 'Global' || selectedRegion === 'All' ? 'Global' : selectedRegion;

  // Compute Root Cause Metrics Dynamically
  const currentMargin = Number(currentKpis?.margin_pct ?? 0);
  const prevMargin = Number(previousKpis?.margin_pct ?? 0);
  const marginDeltaPp = currentMargin - prevMargin;

  const prevMatCost = Number(previousKpis?.material_cost ?? 0);
  const currMatCost = Number(currentKpis?.material_cost ?? 0);
  const materialCostChangePct = prevMatCost > 0
    ? ((currMatCost - prevMatCost) / prevMatCost) * 100
    : 0;

  const prevShipCost = Number(previousKpis?.shipping_cost ?? 0);
  const currShipCost = Number(currentKpis?.shipping_cost ?? 0);
  const shippingCostChangePct = prevShipCost > 0
    ? ((currShipCost - prevShipCost) / prevShipCost) * 100
    : 0;

  // Determine dominant contributor
  const dominantContributor = useMemo(() => {
    if (Math.abs(shippingCostChangePct) > Math.abs(materialCostChangePct)) {
      return 'Shipping Cost';
    }
    if (Math.abs(materialCostChangePct) > Math.abs(shippingCostChangePct)) {
      return 'Material Cost';
    }
    return 'Operating Cost Structure';
  }, [shippingCostChangePct, materialCostChangePct]);

  // Format quarter trends chart option for Quarterly Performance Tab
  const quarterlyChartOption = useMemo(() => {
    if (!quarterlyTrends || quarterlyTrends.length === 0) return null;
    const quarters = quarterlyTrends.map((q) => q.quarter || 'Unknown');
    const revenues = quarterlyTrends.map((q) => Math.round(Number(q.revenue) || 0));
    const costs = quarterlyTrends.map((q) => Math.round(Number(q.cost) || 0));
    const margins = quarterlyTrends.map((q) => Number(Number(q.margin_pct || 0).toFixed(2)));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 12 }
      },
      legend: {
        data: ['Revenue ($)', 'Total Cost ($)', 'Margin %'],
        textStyle: { color: '#64748B', fontSize: 11 },
        top: 0
      },
      grid: { left: '3%', right: '4%', top: '14%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: quarters,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue / Cost ($)',
          nameTextStyle: { color: '#94A3B8', fontSize: 10 },
          axisLabel: {
            color: '#64748B',
            fontSize: 10,
            formatter: (v: number) => `$${(v / 1000000).toFixed(1)}M`
          },
          splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'Margin %',
          nameTextStyle: { color: '#94A3B8', fontSize: 10 },
          position: 'right',
          axisLabel: { color: '#64748B', fontSize: 10, formatter: '{value}%' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Revenue ($)',
          type: 'bar',
          data: revenues,
          itemStyle: { color: '#4F46E5', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'Total Cost ($)',
          type: 'bar',
          data: costs,
          itemStyle: { color: '#94A3B8', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'Margin %',
          type: 'line',
          yAxisIndex: 1,
          data: margins,
          symbolSize: 7,
          itemStyle: { color: '#10B981' },
          lineStyle: { width: 3, color: '#10B981' }
        }
      ]
    };
  }, [quarterlyTrends]);

  const handleManualRetry = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchLocalKpis();
    }
  };

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

        {/* Report Selector Tabs */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedReport('margin_analysis')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedReport === 'margin_analysis'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {regionLabel} Margin Analysis
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

          <button
            onClick={handleManualRetry}
            title="Refresh Report Data"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Backend/API Failure Alert State */}
      {error && !isLoading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-rose-900">Backend / Semantic API Query Failure</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Report Content */}
      {selectedReport === 'margin_analysis' && (
        <div className="space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
            {/* Header: Document Title & Governance Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 font-bold">
                  Executive Briefing Report #{selectedQuarter}-{regionLabel.slice(0, 2).toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {regionLabel} Operating Margin Performance & Root Cause Audit
                </h2>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Governed & Verified</span>
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              This executive report presents an authoritative evaluation of <strong>{regionLabel}</strong> gross margin performance
              between <strong>{prevQuarterLabel}</strong> and <strong>{currentQuarterLabel}</strong>. Data is sourced strictly from governed dbt marts (<code className="font-mono text-slate-700">fct_sales</code>)
              via the MetricMind Semantic Layer.
            </p>

            {/* 1. DATA LOADING STATE */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 animate-pulse space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                    <div className="h-6 bg-slate-200 rounded w-28"></div>
                    <div className="h-2.5 bg-slate-100 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              /* 2. NO DATA AVAILABLE STATE */
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  No transaction data available for {regionLabel} in {currentQuarterLabel}.
                </p>
                <p className="text-[11px] text-slate-400">
                  Try adjusting the quarter or region filters in the top bar.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[`${regionLabel} Revenue`, 'Total Cost', 'Operating Margin', 'Margin %'].map((title, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">{title}</span>
                      <div className="text-lg font-bold text-slate-400 font-sans mt-0.5">—</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 3. REAL GOVERNED DATA PRESENTATION */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* 1. Revenue Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      {regionLabel} Revenue
                    </span>
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">
                    {formatMetricValue(currentKpis.revenue, 'currency')}
                  </div>
                  {previousKpis?.revenue !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>vs {prevQuarterLabel}:</span>
                      <span className={currentKpis.revenue >= previousKpis.revenue ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {formatMetricValue(currentKpis.revenue - previousKpis.revenue, 'currency')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Total Cost Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Total Cost</span>
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">
                    {formatMetricValue(currentKpis.cost, 'currency')}
                  </div>
                  {previousKpis?.cost !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>vs {prevQuarterLabel}:</span>
                      <span className={currentKpis.cost <= previousKpis.cost ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {formatMetricValue(currentKpis.cost - previousKpis.cost, 'currency')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Operating Margin Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Operating Margin</span>
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">
                    {formatMetricValue(currentKpis.margin ?? currentKpis.profit, 'currency')}
                  </div>
                  {previousKpis?.margin !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>vs {prevQuarterLabel}:</span>
                      <span className={(currentKpis.margin ?? currentKpis.profit ?? 0) >= (previousKpis.margin ?? previousKpis.profit ?? 0) ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {formatMetricValue((currentKpis.margin ?? currentKpis.profit ?? 0) - (previousKpis.margin ?? previousKpis.profit ?? 0), 'currency')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Margin % Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Margin %</span>
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-lg font-bold text-emerald-700 font-sans mt-0.5">
                    {currentKpis.margin_pct !== undefined ? `${Number(currentKpis.margin_pct).toFixed(2)}%` : '—'}
                  </div>
                  {previousKpis?.margin_pct !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>vs {prevQuarterLabel}:</span>
                      <span className={marginDeltaPp >= 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {marginDeltaPp >= 0 ? `+${marginDeltaPp.toFixed(2)} pp` : `${marginDeltaPp.toFixed(2)} pp`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Embedded Root Cause Decomposition (Consistent with governed KPI metrics above) */}
          <RootCauseAnalysis
            region={regionLabel}
            prevQuarter={prevQuarterLabel}
            currentQuarter={currentQuarterLabel}
            prevMargin={prevMargin}
            currentMargin={currentMargin}
            materialCostChangePct={materialCostChangePct}
            shippingCostChangePct={shippingCostChangePct}
            dominantContributor={dominantContributor}
            loading={isLoading}
          />
        </div>
      )}

      {/* Quarterly Performance Multi-Quarter Synthesis */}
      {selectedReport === 'quarterly_perf' && (
        <div className="space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {regionLabel} Quarterly Financial Performance Synthesis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated financial trajectory compiled directly from the MetricMind Semantic Layer
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                Governed Trends
              </span>
            </div>

            {loadingQuarterlyTrends ? (
              <LoadingSkeleton variant="chart" className="h-[340px]" />
            ) : quarterlyChartOption ? (
              <div className="h-[340px] w-full">
                <DynamicChart option={quarterlyChartOption} height="340px" />
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No quarterly performance records found for {regionLabel}.
              </div>
            )}

            {/* Structured Table */}
            {quarterlyTrends.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Quarter</th>
                      <th className="py-2.5 px-3 text-right">Revenue ($)</th>
                      <th className="py-2.5 px-3 text-right">Total Cost ($)</th>
                      <th className="py-2.5 px-3 text-right">Operating Profit ($)</th>
                      <th className="py-2.5 px-3 text-right">Margin %</th>
                      <th className="py-2.5 px-3 text-right">Material Cost ($)</th>
                      <th className="py-2.5 px-3 text-right">Shipping Cost ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {quarterlyTrends.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{q.quarter}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatMetricValue(q.revenue, 'currency')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatMetricValue(q.cost, 'currency')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatMetricValue(q.profit, 'currency')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {q.margin_pct !== undefined ? `${Number(q.margin_pct).toFixed(2)}%` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                          {formatMetricValue(q.material_cost, 'currency')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                          {formatMetricValue(q.shipping_cost, 'currency')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
