'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Percent, TrendingUp } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface MarginChartProps {
  trendData: Array<{ quarter: string; margin_pct: number }>;
  selectedQuarter?: string;
  loading?: boolean;
}

export default function MarginChart({
  trendData,
  selectedQuarter,
  loading = false
}: MarginChartProps) {
  if (loading || !trendData || trendData.length === 0) {
    return <LoadingSkeleton variant="chart" className="h-[380px]" />;
  }

  // Normalize selectedQuarter for matching (e.g. 2025-Q4 -> Q4 2025)
  const normSelectedQuarter = selectedQuarter
    ? (selectedQuarter.includes('-Q')
        ? `Q${selectedQuarter.split('-Q')[1]} ${selectedQuarter.split('-Q')[0]}`
        : selectedQuarter)
    : '';

  const categories = trendData.map((d) => d.quarter);
  const marginValues = trendData.map((d) => Number((d.margin_pct || 0).toFixed(2)));

  // Find index of selected quarter for markPoint
  const selectedIndex = categories.findIndex(
    (q) => normSelectedQuarter && q.toLowerCase() === normSelectedQuarter.toLowerCase()
  );

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
        const isCurrent = normSelectedQuarter && item.name.toLowerCase() === normSelectedQuarter.toLowerCase();
        return `
          <div class="font-sans">
            <div class="text-slate-400 text-[11px] font-semibold mb-1 flex items-center gap-1.5">
              ${item.name}
              ${isCurrent ? '<span class="text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 bg-emerald-950/60 rounded">Selected</span>' : ''}
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span class="text-white font-bold">${item.seriesName}: ${val.toFixed(2)}%</span>
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
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
    },
    series: [
      {
        name: 'Margin %',
        type: 'line',
        smooth: true,
        symbolSize: (value: any, params: any) => {
          return params.dataIndex === selectedIndex ? 12 : 6;
        },
        data: marginValues,
        itemStyle: {
          color: (params: any) => {
            return params.dataIndex === selectedIndex ? '#059669' : '#10B981';
          }
        },
        lineStyle: {
          width: 3,
          color: '#10B981'
        },
        markPoint: selectedIndex >= 0 ? {
          data: [
            {
              coord: [selectedIndex, marginValues[selectedIndex]],
              symbol: 'pin',
              symbolSize: 45,
              label: {
                show: true,
                formatter: `${marginValues[selectedIndex]}%`,
                fontSize: 10,
                fontWeight: 'bold',
                color: '#FFFFFF'
              },
              itemStyle: {
                color: '#059669'
              }
            }
          ]
        } : undefined,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ]
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
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Margin % Trend</h3>
            <p className="text-[11px] text-slate-500">Operating margin percentage over time</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Governed Formula</span>
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

