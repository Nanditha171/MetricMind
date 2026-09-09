'use client';

import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ShieldCheck,
  Truck,
  Boxes,
  HelpCircle,
  Lightbulb
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
  isDynamic = true
}: RootCauseAnalysisProps) {
  const marginDeltaPp = currentMargin - prevMargin;

  return (
    <div className="bg-white border border-rose-200/80 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-rose-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900">
                Root-Cause Causal Analysis: {region} Margin Decline
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold uppercase">
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
        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Margin Change
            </span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-sans my-1">
            {marginDeltaPp.toFixed(2)} pp
          </div>
          <span className="text-[10px] text-rose-600/80 font-medium">
            Significant operating contraction
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
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Material Cost</div>
                <div className="text-[10px] text-slate-400">Direct component expenses</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-800">
                +{materialCostChangePct.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-400 block">vs {prevQuarter}</span>
            </div>
          </div>

          {/* Shipping Cost Driver */}
          <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between ring-1 ring-rose-300/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-900 flex items-center gap-1">
                  <span>Shipping Cost</span>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold uppercase">
                    Primary Driver
                  </span>
                </div>
                <div className="text-[10px] text-rose-600">Freight & logistics spike</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-rose-600">
                +{shippingCostChangePct.toFixed(2)}%
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
            <span className="font-semibold text-rose-700">{dominantContributor}</span> is the dominant
            contributor to the margin drop (+{shippingCostChangePct.toFixed(1)}% escalation), heavily
            outweighing the moderate +{materialCostChangePct.toFixed(1)}% material cost increase.
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
