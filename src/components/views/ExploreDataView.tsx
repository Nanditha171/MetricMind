'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Filter, RefreshCw, Table, BarChart2, Layers, Download } from 'lucide-react';
import { fetchSemanticQuery, formatMetricValue } from '../../lib/api';
import DynamicChart from '../DynamicChart';
import LoadingSkeleton from '../ui/LoadingSkeleton';

export default function ExploreDataView() {
  const [selectedDimension, setSelectedDimension] = useState('region');
  const [selectedMeasure, setSelectedMeasure] = useState('revenue');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedSql, setGeneratedSql] = useState('');

  const dimensions = [
    { value: 'region', label: 'Region' },
    { value: 'product', label: 'Product Name' },
    { value: 'category', label: 'Category' },
    { value: 'tier', label: 'Product Tier' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'customer_segment', label: 'Customer Segment' },
    { value: 'acquisition_channel', label: 'Acquisition Channel' },
  ];

  const measures = [
    { value: 'revenue', label: 'Revenue ($)', format: 'currency' },
    { value: 'cost', label: 'Total Cost ($)', format: 'currency' },
    { value: 'profit', label: 'Operating Profit ($)', format: 'currency' },
    { value: 'margin_pct', label: 'Margin %', format: 'percentage' },
    { value: 'quantity', label: 'Quantity Sold', format: 'number' },
    { value: 'material_cost', label: 'Material Cost ($)', format: 'currency' },
    { value: 'shipping_cost', label: 'Shipping Cost ($)', format: 'currency' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSemanticQuery({
        measures: [selectedMeasure, 'revenue', 'cost', 'margin_pct'],
        dimensions: [selectedDimension],
        order_by: selectedMeasure,
        order_desc: true,
        limit: 15
      });
      setData(res.data || []);
      setGeneratedSql(res.generated_sql);
    } catch (err) {
      console.error('Failed to explore data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDimension, selectedMeasure]);

  const categories = data.map((d) => String(d[selectedDimension] || 'Unknown'));
  const values = data.map((d) => Math.round(Number(d[selectedMeasure]) || 0));

  const isPct = selectedMeasure.includes('pct') || selectedMeasure.includes('margin_pct');
  const isCurrency = ['revenue', 'cost', 'profit', 'margin', 'material_cost', 'shipping_cost'].includes(selectedMeasure);

  const formatValueShort = (val: number) => {
    if (isPct) return `${val.toFixed(1)}%`;
    const prefix = isCurrency ? '$' : '';
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return `${prefix}${(val / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${prefix}${(val / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${prefix}${(val / 1_000).toFixed(0)}K`;
    return `${prefix}${val}`;
  };

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any[]) => {
        const item = params[0];
        const val = Number(item.value);
        const formatted = isPct 
          ? `${val.toFixed(2)}%` 
          : (isCurrency ? `$${val.toLocaleString()}` : val.toLocaleString());
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
      left: '2%', 
      right: '3%', 
      top: '10%', 
      bottom: categories.length > 5 ? '16%' : '10%', 
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisTick: { show: false },
      axisLabel: { 
        color: '#64748B', 
        fontSize: 11,
        fontWeight: 500,
        interval: 0,
        rotate: categories.some((c) => c.length > 8) || categories.length > 6 ? 25 : 0 
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitNumber: 5,
      axisLabel: { 
        color: '#64748B', 
        fontSize: 11,
        formatter: (val: number) => formatValueShort(val)
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
    },
    series: [
      {
        name: selectedMeasure.replace('_', ' ').toUpperCase(),
        type: 'bar',
        barMaxWidth: 48,
        data: values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#4F46E5' },
              { offset: 1, color: '#818CF8' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-surface-border gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Explore Business Data</h1>
            <p className="text-xs text-slate-500">
              Interactive multidimensional data slicing powered by Governed Semantic Layer
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Select */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <span className="text-slate-400 mr-2 font-medium">Group By:</span>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {dimensions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Measure Select */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <span className="text-slate-400 mr-2 font-medium">Metric:</span>
            <select
              value={selectedMeasure}
              onChange={(e) => setSelectedMeasure(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {measures.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-brand-600" />
            <span>Visual Distribution ({selectedMeasure.replace('_', ' ')} by {selectedDimension})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{data.length} records returned</span>
        </div>

        {loading ? (
          <LoadingSkeleton variant="chart" className="h-[380px]" />
        ) : (
          <div className="h-[380px] w-full">
            <DynamicChart option={chartOption} height="380px" />
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-surface-border rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-surface-border bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Table className="w-4 h-4 text-brand-600" />
            <span>Structured Data View</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-surface-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{selectedDimension}</th>
                <th className="py-3 px-4 text-right">Revenue ($)</th>
                <th className="py-3 px-4 text-right">Cost ($)</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">{selectedMeasure}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {row[selectedDimension] || '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-mono">
                    {formatMetricValue(row.revenue, 'currency')}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-mono">
                    {formatMetricValue(row.cost, 'currency')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                    {row.margin_pct ? `${Number(row.margin_pct).toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-brand-600 bg-brand-50/40">
                    {formatMetricValue(row[selectedMeasure], 'currency')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
