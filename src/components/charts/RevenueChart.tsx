'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3, TrendingUp } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface RevenueChartProps {
  trendData: Array<{ quarter: string; revenue: number; cost?: number }>;
  monthlyData?: Array<{ month: string; revenue: number; cost?: number }>;
  selectedQuarter?: string;
  loading?: boolean;
}

export default function RevenueChart({
  trendData,
  monthlyData = [],
  selectedQuarter,
  loading = false
}: RevenueChartProps) {
  const [periodType, setPeriodType] = useState<'quarterly' | 'monthly'>('quarterly');

  const activeData = periodType === 'quarterly'
    ? (trendData || [])
    : (monthlyData && monthlyData.length > 0 ? monthlyData : trendData || []);

  if (loading || !activeData || activeData.length === 0) {
    return <LoadingSkeleton variant="chart" className="h-[380px]" />;
  }

  // Normalize selectedQuarter for matching (e.g. 2025-Q4 -> Q4 2025)
  const normSelectedQuarter = selectedQuarter
    ? (selectedQuarter.includes('-Q')
        ? `Q${selectedQuarter.split('-Q')[1]} ${selectedQuarter.split('-Q')[0]}`
        : selectedQuarter)
    : '';

  const categories = activeData.map((d: any) => d.quarter || d.month);
  const revenueValues = activeData.map((d: any) => {
    const rawVal = Math.round(d.revenue || 0);
    const key = String(d.quarter || d.month);
    const isSelected = normSelectedQuarter && key.toLowerCase() === normSelectedQuarter.toLowerCase();

    return {
      value: rawVal,
      itemStyle: {
        color: isSelected
          ? {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#2563EB' }, // High contrast bold blue
                { offset: 1, color: '#1E40AF' }
              ]
            }
          : {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#6366F1' }, // brand indigo
                { offset: 1, color: '#818CF8' }
              ]
            },
        borderRadius: [6, 6, 0, 0],
        shadowColor: isSelected ? 'rgba(37, 99, 235, 0.5)' : 'transparent',
        shadowBlur: isSelected ? 10 : 0
      }
    };
  });

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any[]) => {
        const item = params[0];
        const val = Number(item.value);
        const formatted = val >= 1_000_000 ? `$${(val / 1_000_000).toFixed(2)}M` : `$${(val / 1_000).toFixed(1)}K`;
        const isCurrent = normSelectedQuarter && item.name.toLowerCase() === normSelectedQuarter.toLowerCase();
        return `
          <div class="font-sans">
            <div class="text-slate-400 text-[11px] font-semibold mb-1 flex items-center gap-1.5">
              ${item.name}
              ${isCurrent ? '<span class="text-blue-400 text-[10px] font-bold px-1.5 py-0.2 bg-blue-900/50 rounded">Selected</span>' : ''}
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-blue-400' : 'bg-indigo-400'} inline-block"></span>
              <span class="text-white font-bold">${item.seriesName}: ${formatted}</span>
            </div>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '12%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: {
        color: '#64748B',
        fontSize: periodType === 'monthly' ? 10 : 11,
        fontWeight: 500,
        rotate: periodType === 'monthly' ? 40 : 0
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#64748B',
        fontSize: 11,
        formatter: (val: number) => (val >= 1_000_000 ? `$${(val / 1_000_000).toFixed(1)}M` : `$${(val / 1_000).toFixed(0)}K`)
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
    },
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        barWidth: periodType === 'monthly' ? '45%' : '40%',
        data: revenueValues
      }
    ]
  };

  return (
    <div className="bg-white border border-surface-border rounded-xl p-5 shadow-card flex flex-col justify-between h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Revenue Trend</h3>
            <p className="text-[11px] text-slate-500">
              {periodType === 'quarterly' ? 'Quarterly' : 'Monthly'} gross sales revenue
            </p>
          </div>
        </div>

        {/* Period Selector Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            onClick={() => setPeriodType('quarterly')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              periodType === 'quarterly'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setPeriodType('monthly')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              periodType === 'monthly'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full mt-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </div>
    </div>
  );
}

