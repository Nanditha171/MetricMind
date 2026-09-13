'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface DynamicChartProps {
  option: any;
  height?: string;
  className?: string;
}

export default function DynamicChart({ option, height = '360px', className = '' }: DynamicChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sanitizedOption = useMemo(() => {
    if (!option) return null;
    const opt = JSON.parse(JSON.stringify(option));

    // Ensure grid contains label and has adequate breathing room
    if (!opt.grid) {
      opt.grid = { left: '2%', right: '3%', top: '12%', bottom: '12%', containLabel: true };
    } else {
      opt.grid.containLabel = true;
      if (!opt.grid.top) opt.grid.top = '12%';
      if (!opt.grid.bottom) opt.grid.bottom = '12%';
    }

    // Enhance yAxis to format large numeric values compactly so labels never overlap vertically
    const formatYVal = (val: number) => {
      if (typeof val !== 'number' || isNaN(val)) return val;
      const abs = Math.abs(val);
      if (abs >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
      return val.toLocaleString();
    };

    if (opt.yAxis) {
      if (Array.isArray(opt.yAxis)) {
        opt.yAxis = opt.yAxis.map((y: any) => ({
          ...y,
          splitNumber: y.splitNumber || 5,
          axisLabel: {
            fontSize: 11,
            color: y.axisLabel?.color || '#64748B',
            formatter: y.axisLabel?.formatter || formatYVal,
            ...y.axisLabel
          }
        }));
      } else if (typeof opt.yAxis === 'object') {
        opt.yAxis.splitNumber = opt.yAxis.splitNumber || 5;
        if (!opt.yAxis.axisLabel) {
          opt.yAxis.axisLabel = { color: '#64748B', fontSize: 11, formatter: formatYVal };
        } else if (!opt.yAxis.axisLabel.formatter) {
          opt.yAxis.axisLabel.formatter = formatYVal;
          opt.yAxis.axisLabel.fontSize = opt.yAxis.axisLabel.fontSize || 11;
        }
      }
    }

    // Enhance xAxis labels to prevent overlapping
    if (opt.xAxis) {
      const enhanceXAxis = (x: any) => {
        const dataLen = Array.isArray(x.data) ? x.data.length : 0;
        const hasLongLabels = Array.isArray(x.data) && x.data.some((d: any) => String(d).length > 8);
        return {
          ...x,
          axisLabel: {
            fontSize: 11,
            color: x.axisLabel?.color || '#64748B',
            interval: 0,
            rotate: dataLen > 5 || hasLongLabels ? 25 : 0,
            ...x.axisLabel
          }
        };
      };

      if (Array.isArray(opt.xAxis)) {
        opt.xAxis = opt.xAxis.map(enhanceXAxis);
      } else if (typeof opt.xAxis === 'object') {
        opt.xAxis = enhanceXAxis(opt.xAxis);
      }
    }

    // Enhance bar width so bars don't stretch excessively or collide
    if (Array.isArray(opt.series)) {
      opt.series = opt.series.map((s: any) => {
        if (s.type === 'bar' && !s.barMaxWidth) {
          return { ...s, barMaxWidth: 48 };
        }
        return s;
      });
    }

    return opt;
  }, [option]);

  if (!isMounted || !sanitizedOption) {
    return (
      <div 
        style={{ height }} 
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 animate-pulse ${className}`}
      >
        <span className="text-xs">Loading chart visualization...</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[340px] ${className}`}>
      <ReactECharts
        option={sanitizedOption}
        style={{ height: height === '100%' ? '100%' : height, width: '100%', minHeight: '340px' }}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}

