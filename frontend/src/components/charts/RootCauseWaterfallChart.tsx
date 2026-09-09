'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface RootCauseWaterfallProps {
  prevMargin?: number;
  currentMargin?: number;
  materialCostChangePct?: number;
  shippingCostChangePct?: number;
}

export default function RootCauseWaterfallChart({
  prevMargin = 48.12,
  currentMargin = 26.49,
  materialCostChangePct = 13.09,
  shippingCostChangePct = 399.01
}: RootCauseWaterfallProps) {
  const marginDelta = currentMargin - prevMargin;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any[]) => {
        const p = params[0];
        return `
          <div class="font-sans">
            <div class="text-slate-400 text-[11px] font-semibold">${p.name}</div>
            <div class="text-white font-bold mt-0.5">${p.value}</div>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '12%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Previous Margin', 'Margin Delta (pp)', 'Current Margin', 'Material Driver', 'Shipping Driver'],
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontSize: 10, interval: 0, rotate: 15 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
    },
    series: [
      {
        name: 'Impact',
        type: 'bar',
        barWidth: '45%',
        data: [
          { value: prevMargin, itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] } },
          { value: marginDelta, itemStyle: { color: marginDelta < 0 ? '#F43F5E' : '#10B981', borderRadius: [4, 4, 0, 0] } },
          { value: currentMargin, itemStyle: { color: '#6366F1', borderRadius: [4, 4, 0, 0] } },
          { value: materialCostChangePct, itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] } },
          { value: shippingCostChangePct, itemStyle: { color: '#E11D48', borderRadius: [4, 4, 0, 0] } }
        ]
      }
    ]
  };

  return (
    <div className="w-full h-56">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
