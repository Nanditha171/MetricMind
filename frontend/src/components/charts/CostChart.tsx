'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { PieChart, DollarSign } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { formatMetricValue } from '../../lib/api';

interface CostChartProps {
  materialCost?: number;
  shippingCost?: number;
  totalCost?: number;
  loading?: boolean;
}

export default function CostChart({
  materialCost = 0,
  shippingCost = 0,
  totalCost = 0,
  loading = false
}: CostChartProps) {
  if (loading) {
    return <LoadingSkeleton variant="chart" className="h-[380px]" />;
  }

  const computedTotal = totalCost || (materialCost + shippingCost);
  const matPct = computedTotal > 0 ? ((materialCost / computedTotal) * 100).toFixed(1) : '75.0';
  const shipPct = computedTotal > 0 ? ((shippingCost / computedTotal) * 100).toFixed(1) : '25.0';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any) => {
        const val = Number(params.value);
        const formatted = val >= 1_000_000 ? `$${(val / 1_000_000).toFixed(2)}M` : `$${(val / 1_000).toFixed(1)}K`;
        return `
          <div class="font-sans">
            <div class="text-slate-400 text-[11px] font-semibold mb-1">${params.name}</div>
            <div class="text-white font-bold text-sm">${formatted} <span class="text-slate-400 font-normal">(${params.percent}%)</span></div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#64748B', fontSize: 11, fontWeight: 500 },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        name: 'Cost Breakdown',
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#FFFFFF',
          borderWidth: 3
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            color: '#0F172A'
          }
        },
        data: [
          {
            value: Math.round(materialCost),
            name: 'Material Cost (75%)',
            itemStyle: { color: '#3B82F6' } // Blue
          },
          {
            value: Math.round(shippingCost),
            name: 'Shipping Cost (25%)',
            itemStyle: { color: '#F59E0B' } // Amber
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white border border-surface-border rounded-xl p-5 shadow-card flex flex-col justify-between h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cost Breakdown</h3>
            <p className="text-[11px] text-slate-500">Material vs. Shipping distribution</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-medium block">Total Cost</span>
          <span className="text-xs font-extrabold text-slate-800 font-sans">
            {formatMetricValue(computedTotal, 'currency')}
          </span>
        </div>
      </div>

      {/* Donut Chart with Centered Total Overlay */}
      <div className="flex-1 w-full relative">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
          <span className="text-base font-extrabold text-slate-800 font-sans">
            {formatMetricValue(computedTotal, 'currency')}
          </span>
        </div>
      </div>
    </div>
  );
}
