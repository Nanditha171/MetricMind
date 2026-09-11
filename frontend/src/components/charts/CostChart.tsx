'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { PieChart, DollarSign, Layers } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { formatMetricValue } from '../../lib/api';

interface CostChartProps {
  categoryData?: Array<{ category: string; cost: number; revenue: number; material_cost?: number; shipping_cost?: number }>;
  materialCost?: number;
  shippingCost?: number;
  totalCost?: number;
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Data Platform': '#4F46E5', // Indigo
  'Analytics': '#0EA5E9',     // Sky
  'CRM': '#10B981',           // Emerald
  'Cloud': '#F59E0B',         // Amber
  'Security': '#EC4899',      // Pink
  'AI': '#8B5CF6',            // Purple
  'Support': '#64748B',       // Slate
};

export default function CostChart({
  categoryData = [],
  materialCost = 0,
  shippingCost = 0,
  totalCost = 0,
  loading = false
}: CostChartProps) {
  const [viewMode, setViewMode] = useState<'category' | 'component'>('category');

  if (loading) {
    return <LoadingSkeleton variant="chart" className="h-[380px]" />;
  }

  const computedTotal = totalCost || (materialCost + shippingCost);

  // Prepare chart series data based on active view mode
  let chartData: Array<{ name: string; value: number; itemStyle: { color: string } }> = [];

  if (viewMode === 'category' && categoryData && categoryData.length > 0) {
    chartData = categoryData.map((d, idx) => {
      const catName = d.category || 'Other';
      const color = CATEGORY_COLORS[catName] || [
        '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'
      ][idx % 7];
      return {
        name: catName,
        value: Math.round(d.cost || 0),
        itemStyle: { color }
      };
    });
  } else {
    chartData = [
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
    ];
  }

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
      bottom: '2%',
      left: 'center',
      textStyle: { color: '#64748B', fontSize: 10, fontWeight: 500 },
      itemWidth: 8,
      itemHeight: 8
    },
    series: [
      {
        name: viewMode === 'category' ? 'Category Cost' : 'Cost Breakdown',
        type: 'pie',
        radius: ['48%', '74%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#0F172A'
          }
        },
        data: chartData
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
            <p className="text-[11px] text-slate-500">
              {viewMode === 'category' ? 'Cost by Product Category' : 'Material vs Shipping'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            onClick={() => setViewMode('category')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'category'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setViewMode('component')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'component'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Components
          </button>
        </div>
      </div>

      {/* Donut Chart with Centered Total Overlay */}
      <div className="flex-1 w-full relative">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Total Cost</span>
          <span className="text-sm font-extrabold text-slate-800 font-sans">
            {formatMetricValue(computedTotal, 'currency')}
          </span>
        </div>
      </div>
    </div>
  );
}

