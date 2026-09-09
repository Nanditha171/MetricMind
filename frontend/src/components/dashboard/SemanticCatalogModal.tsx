'use client';

import React, { useEffect, useState } from 'react';
import { Database, Calculator, X, Search, ShieldCheck, Tag } from 'lucide-react';
import { fetchMetricsCatalog, MetricsCatalogResponse } from '../../lib/api';

interface SemanticCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMetric?: (metricName: string) => void;
}

export default function SemanticCatalogModal({
  isOpen,
  onClose,
  onSelectMetric
}: SemanticCatalogModalProps) {
  const [catalog, setCatalog] = useState<MetricsCatalogResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'measures' | 'dimensions'>('measures');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !catalog) {
      setLoading(true);
      fetchMetricsCatalog()
        .then((res) => {
          setCatalog(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load semantic catalog:', err);
          setLoading(false);
        });
    }
  }, [isOpen, catalog]);

  if (!isOpen) return null;

  const measures = catalog ? Object.entries(catalog.measures) : [];
  const dimensions = catalog ? Object.entries(catalog.dimensions) : [];

  const filteredMeasures = measures.filter(([k, v]) =>
    k.toLowerCase().includes(filterQuery.toLowerCase()) ||
    v.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredDimensions = dimensions.filter(([k, v]) =>
    k.toLowerCase().includes(filterQuery.toLowerCase()) ||
    v.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
    v.sql_column.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <span>Governed Semantic Catalog</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-normal">
                  Single Source of Truth
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Authoritative measures & dimensions mapped to dbt mart (<code className="font-mono text-slate-600">fct_sales</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Tab Switcher */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
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

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-slate-50 text-xs text-slate-800 pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Catalog Items Scroll List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading authoritative semantic catalog...
            </div>
          )}

          {activeTab === 'measures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMeasures.map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-brand-300 shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {item.unit} • {item.format}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-2">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-[10px] text-amber-700 font-mono bg-amber-50/60 px-2.5 py-1.5 rounded-lg">
                    <Calculator className="w-3 h-3 mr-1.5 text-amber-600 shrink-0" />
                    <span className="truncate">{item.sql_formula}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dimensions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDimensions.map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase">
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-2">{item.label}</h4>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Column: <span className="text-slate-700 font-medium">{item.sql_column}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL & Cube.dev Governed Definitions</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
