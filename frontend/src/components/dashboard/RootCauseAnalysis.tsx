'use client';

import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  ShieldCheck,
  Truck,
  Boxes,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import RootCauseWaterfallChart from '../charts/RootCauseWaterfallChart';

interface RootCauseAnalysisProps {
  region?: string;
  prevQuarter?: string;
  currentQuarter?: string;
  prevMargin?: number;
  currentMargin?: number;
  materialCostChangePct?: number;
  shippingCostChangePct?: number;
  dominantContributor?: string;
  isDynamic?: boolean;
  loading?: boolean;
}

export default function RootCauseAnalysis({
  region = 'Europe',
  prevQuarter = 'Q3 2025',
  currentQuarter = 'Q4 2025',
  prevMargin = 48.12,
  currentMargin = 26.49,
  materialCostChangePct = 13.09,
  shippingCostChangePct = 399.01,
  dominantContributor = 'Shipping Cost',
  isDynamic = true,
  loading = false
}: RootCauseAnalysisProps) {
  if (loading) {
    return (
      <div className="bg-white border border-surface-border rounded-2xl p-5 md:p-6 shadow-card animate-pulse space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200"></div>
            <div className="space-y-1">
              <div className="h-4 bg-slate-200 rounded w-48"></div>
              <div className="h-3 bg-slate-100 rounded w-64"></div>
            </div>
          </div>
          <div className="h-6 w-32 bg-slate-100 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-32 bg-slate-50 rounded-xl"></div>
        <div className="h-56 bg-slate-50 rounded-xl"></div>
      </div>
    );
  }

  const marginDeltaPp = currentMargin - prevMargin;
  const isContraction = marginDeltaPp < -0.01;
  const isExpansion = marginDeltaPp > 0.01;

  const headerBadgeColor = isContraction
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isExpansion
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-slate-50 text-slate-700 border-slate-200';

  const deltaCardBg = isContraction
    ? 'bg-rose-50/80 border-rose-200 text-rose-700'
    : isExpansion
    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
    : 'bg-slate-50 border-slate-200 text-slate-700';

  const DeltaIcon = isContraction ? ArrowDownRight : isExpansion ? ArrowUpRight : Minus;

  const isShippingPrimary = Math.abs(shippingCostChangePct) >= Math.abs(materialCostChangePct);

  return (
    <div className="bg-white border border-rose-200/80 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-rose-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isContraction ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-brand-50 text-brand-600 border-brand-200'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900">
                Root-Cause Causal Analysis: {region} {isContraction ? 'Margin Decline' : isExpansion ? 'Margin Expansion' : 'Margin Trajectory'}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${headerBadgeColor}`}>
                Multi-Step Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated multi-step factor decomposition comparing {prevQuarter} vs. {currentQuarter}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Governed Factor Attribution</span>
        </div>
      </div>

      {/* Main Metric Transition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Step 1: Base Period */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {prevQuarter} Margin
          </span>
          <div className="text-2xl font-black text-slate-800 font-sans my-1">
            {prevMargin.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Historical Baseline</span>
        </div>

        {/* Step 2: Transition / Delta */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${deltaCardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Margin Change
            </span>
            <DeltaIcon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-sans my-1">
            {marginDeltaPp >= 0 ? `+${marginDeltaPp.toFixed(2)} pp` : `${marginDeltaPp.toFixed(2)} pp`}
          </div>
          <span className="text-[10px] font-medium opacity-90">
            {isContraction ? 'Operating margin contraction' : isExpansion ? 'Operating margin expansion' : 'Stable margin baseline'}
          </span>
        </div>

        {/* Step 3: Current Period */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {currentQuarter} Margin
          </span>
          <div className="text-2xl font-black text-slate-800 font-sans my-1">
            {currentMargin.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Current Operating Margin</span>
        </div>
      </div>

      {/* Primary Cost Drivers Analysis */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50/50 via-amber-50/30 to-slate-50 border border-rose-100 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Factor Decomposition & Cost Drivers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Material Cost Driver */}
          <div className={`bg-white p-3.5 rounded-xl border shadow-sm flex items-center justify-between ${!isShippingPrimary ? 'border-brand-300 ring-1 ring-brand-300/40' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Material Cost</span>
                  {!isShippingPrimary && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold uppercase">
                      Primary Driver
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Direct component expenses</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-black ${materialCostChangePct > 0 ? 'text-slate-800' : 'text-emerald-700'}`}>
                {materialCostChangePct >= 0 ? `+${materialCostChangePct.toFixed(2)}%` : `${materialCostChangePct.toFixed(2)}%`}
              </span>
              <span className="text-[10px] text-slate-400 block">vs {prevQuarter}</span>
            </div>
          </div>

          {/* Shipping Cost Driver */}
          <div className={`bg-white p-3.5 rounded-xl border shadow-sm flex items-center justify-between ${isShippingPrimary ? 'border-rose-200 ring-1 ring-rose-300/40' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-900 flex items-center gap-1">
                  <span>Shipping Cost</span>
                  {isShippingPrimary && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold uppercase">
                      Primary Driver
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-rose-600">Freight & logistics expenses</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-black ${shippingCostChangePct > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {shippingCostChangePct >= 0 ? `+${shippingCostChangePct.toFixed(2)}%` : `${shippingCostChangePct.toFixed(2)}%`}
              </span>
              <span className="text-[10px] text-rose-400 block">vs {prevQuarter}</span>
            </div>
          </div>
        </div>

        {/* Dominant Contributor Conclusion Banner */}
        <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start space-x-2.5">
          <div className="p-1 rounded-md bg-amber-100 text-amber-800 mt-0.5 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-700">
            <strong className="text-slate-900 font-bold">Root-Cause Conclusion: </strong>
            <span className="font-semibold text-rose-700">{dominantContributor}</span> is the dominant factor in {region}'s operating profile for {currentQuarter} ({shippingCostChangePct >= 0 ? `+${shippingCostChangePct.toFixed(1)}%` : `${shippingCostChangePct.toFixed(1)}%`} shipping cost shift vs {materialCostChangePct >= 0 ? `+${materialCostChangePct.toFixed(1)}%` : `${materialCostChangePct.toFixed(1)}%`} material cost shift).
          </div>
        </div>
      </div>

      {/* Waterfall Visualization */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Visual Impact Waterfall (Percentage Points & Driver Attribution)
        </h4>
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3">
          <RootCauseWaterfallChart
            prevMargin={prevMargin}
            currentMargin={currentMargin}
            materialCostChangePct={materialCostChangePct}
            shippingCostChangePct={shippingCostChangePct}
          />
        </div>
      </div>
    </div>
  );
}
