'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Percent,
  Package,
  Layers,
  Truck,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { formatMetricValue } from '../../lib/api';

export interface KpiCardProps {
  id: string;
  name: string;
  label: string;
  value?: number;
  prevValue?: number;
  unit: string;
  format: 'currency' | 'percentage' | 'number';
  isPositiveGood?: boolean;
  previousPeriodLabel?: string;
  formula?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

export default function KpiCard({
  id,
  name,
  label,
  value = 0,
  prevValue,
  unit,
  format,
  isPositiveGood = true,
  previousPeriodLabel = 'vs Q3 2025',
  formula,
  icon: CustomIcon,
  loading = false
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-surface-border rounded-xl p-4 md:p-5 shadow-card animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 rounded w-20"></div>
          <div className="h-7 w-7 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-7 bg-slate-200 rounded w-28"></div>
        <div className="flex items-center space-x-2 pt-1">
          <div className="h-3 bg-slate-100 rounded w-12"></div>
          <div className="h-3 bg-slate-100 rounded w-16"></div>
        </div>
      </div>
    );
  }

  // Calculate Delta
  let changePct: number | undefined = undefined;
  let changePp: number | undefined = undefined;

  if (prevValue !== undefined && prevValue !== null && !isNaN(prevValue)) {
    if (format === 'percentage') {
      // Percentage points difference
      changePp = value - prevValue;
    } else if (prevValue !== 0) {
      changePct = ((value - prevValue) / Math.abs(prevValue)) * 100;
    }
  }

  const formattedMain = formatMetricValue(value, format, unit);

  // Icon Mapping
  const getDefaultIcon = () => {
    switch (id) {
      case 'revenue':
        return DollarSign;
      case 'cost':
        return Layers;
      case 'material_cost':
        return Boxes;
      case 'shipping_cost':
        return Truck;
      case 'margin':
      case 'profit':
        return DollarSign;
      case 'margin_pct':
        return Percent;
      case 'quantity':
        return Package;
      default:
        return DollarSign;
    }
  };

  const IconComponent = CustomIcon || getDefaultIcon();

  // Color logic for direction
  const isNeutral =
    (format === 'percentage' && (changePp === undefined || Math.abs(changePp) < 0.01)) ||
    (format !== 'percentage' && (changePct === undefined || Math.abs(changePct) < 0.01));

  const isUp =
    format === 'percentage' ? (changePp ?? 0) > 0 : (changePct ?? 0) > 0;

  // Good vs Bad direction
  // For Revenue, Margin, Margin %, Quantity -> Up is good (green), Down is bad (red)
  // For Total Cost, Material Cost, Shipping Cost -> Up is cost increase (often warning/rose), Down is cost savings (green)
  const isFavorable = isPositiveGood ? isUp : !isUp;

  const trendColorClass = isNeutral
    ? 'text-slate-500 bg-slate-100 border-slate-200'
    : isFavorable
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : 'text-rose-700 bg-rose-50 border-rose-200';

  const TrendIcon = isNeutral ? Minus : isUp ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white border border-surface-border hover:border-slate-300 rounded-xl p-4 md:p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group">
      {/* Header: Metric Name + Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 group-hover:bg-brand-50 group-hover:border-brand-200 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-1">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
          {formattedMain}
        </div>
      </div>

      {/* Period Comparison & Trend Pill */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        {prevValue !== undefined && !isNaN(prevValue) ? (
          <>
            <div
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${trendColorClass}`}
            >
              <TrendIcon className="w-3 h-3" />
              <span>
                {format === 'percentage' && changePp !== undefined
                  ? `${changePp > 0 ? '+' : ''}${changePp.toFixed(2)} pp`
                  : changePct !== undefined
                  ? `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`
                  : '0.00%'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate ml-1.5">
              {previousPeriodLabel}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">Governed Authoritative Value</span>
        )}
      </div>
    </div>
  );
}
