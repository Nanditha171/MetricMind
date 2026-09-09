'use client';

import React, { useEffect, useState } from 'react';
import { Database, Calculator, Search, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { fetchMetricsCatalog, MetricsCatalogResponse } from '../../lib/api';

interface SemanticCatalogViewProps {
  onSelectPrompt?: (prompt: string) => void;
}

export default function SemanticCatalogView({ onSelectPrompt }: SemanticCatalogViewProps) {
  const [catalog, setCatalog] = useState<MetricsCatalogResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'measures' | 'dimensions'>('measures');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricsCatalog()
      .then((res) => {
        setCatalog(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load metrics catalog:', err);
        setLoading(false);
      });
  }, []);

  const measures = catalog ? Object.entries(catalog.measures) : [];
  const dimensions = catalog ? Object.entries(catalog.dimensions) : [];

  const filteredMeasures = measures.filter(([k, v]) =>
    k.toLowerCase().includes(search.toLowerCase()) ||
    v.label.toLowerCase().includes(search.toLowerCase()) ||
    v.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDimensions = dimensions.filter(([k, v]) =>
    k.toLowerCase().includes(search.toLowerCase()) ||
    v.label.toLowerCase().includes(search.toLowerCase()) ||
    v.sql_column.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-surface-border gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Governed Semantic Catalog</h1>
            <p className="text-xs text-slate-500">
              Authoritative business metric definitions mapped to dbt analytical mart (<code className="font-mono text-slate-600">fct_sales</code>)
            </p>
          </div>
        </div>

        {/* Tab & Search */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('measures')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'measures'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Measures ({measures.length})
            </button>
            <button
              onClick={() => setActiveTab('dimensions')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dimensions'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dimensions ({dimensions.length})
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter catalog..."
              className="w-full bg-white text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid of Catalog Cards */}
      {activeTab === 'measures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeasures.map(([key, item]) => (
            <div
              key={key}
              className="bg-white border border-surface-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                    {item.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {item.unit}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-2">{item.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-mono text-amber-800 bg-amber-50 p-2 rounded-lg flex items-center">
                  <Calculator className="w-3 h-3 mr-1.5 text-amber-600 shrink-0" />
                  <span className="truncate">{item.sql_formula}</span>
                </div>

                {onSelectPrompt && (
                  <button
                    onClick={() => onSelectPrompt(`Show ${item.name} by region`)}
                    className="w-full text-center text-[11px] text-brand-600 hover:text-brand-800 font-medium py-1 rounded hover:bg-brand-50 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Query "{item.label}" via AI</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dimensions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDimensions.map(([key, item]) => (
            <div
              key={key}
              className="bg-white border border-surface-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {item.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase">
                  {item.type}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-2">{item.label}</h3>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 font-mono">
                Source Column: <span className="text-slate-800 font-medium">{item.sql_column}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
