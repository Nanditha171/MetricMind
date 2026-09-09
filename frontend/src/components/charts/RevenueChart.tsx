'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3, TrendingUp } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface RevenueChartProps {
  trendData: Array<{ quarter: string; revenue: number; cost?: number }>;
  loading?: boolean;
}

export default function RevenueChart({ trendData, loading = false }: RevenueChartProps) {
  const [periodType, setPeriodType] = useState<'quarterly' | 'monthly'>('quarterly');

  if (loading || !trendData || trendData.length === 0) {
    return <LoadingSkeleton variant="chart" className="h-[380px]" />;
  }

  const categories = trendData.map((d) => d.quarter);
  const revenueValues = trendData.map((d) => Math.round(d.revenue || 0));

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
        return `
          <div class="font-sans">
            <div class="text-slate-400 text-[11px] font-semibold mb-1">${item.name}</div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span>
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
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontSize: 11, fontWeight: 500 },
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
        barWidth: '40%',
        data: revenueValues,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#4F46E5' }, // brand indigo
              { offset: 1, color: '#818CF8' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#4338CA'
          }
        }
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
            <p className="text-[11px] text-slate-500">Quarterly gross sales revenue across periods</p>
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
        />
      </div>
    </div>
  );
}
