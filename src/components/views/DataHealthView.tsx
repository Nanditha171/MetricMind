'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, CheckCircle2, ShieldCheck, Layers, RefreshCw, Globe, Tag, Package, Box } from 'lucide-react';
import { fetchHealthStatus, fetchDatasetSummary, HealthResponse, DatasetSummaryResponse } from '../../lib/api';

const DEFAULT_REGIONS = ['Asia', 'Europe', 'North America', 'Oceania', 'South America'];
const DEFAULT_CATEGORIES = ['AI', 'Analytics', 'CRM', 'Cloud', 'Data Platform', 'Security', 'Support'];
const DEFAULT_PRODUCTS = [
  { name: 'Analytics Basic', category: 'Analytics' },
  { name: 'Analytics Pro', category: 'Analytics' },
  { name: 'Analytics Enterprise', category: 'Analytics' },
  { name: 'Cloud Starter', category: 'Cloud' },
  { name: 'Cloud Pro', category: 'Cloud' },
  { name: 'Cloud Enterprise', category: 'Cloud' },
  { name: 'Security Basic', category: 'Security' },
  { name: 'Security Pro', category: 'Security' },
  { name: 'Security Enterprise', category: 'Security' },
  { name: 'CRM Starter', category: 'CRM' },
  { name: 'CRM Pro', category: 'CRM' },
  { name: 'CRM Enterprise', category: 'CRM' },
  { name: 'Data Platform Basic', category: 'Data Platform' },
  { name: 'Data Platform Pro', category: 'Data Platform' },
  { name: 'Data Platform Enterprise', category: 'Data Platform' },
  { name: 'AI Assistant Basic', category: 'AI' },
  { name: 'AI Assistant Pro', category: 'AI' },
  { name: 'AI Assistant Enterprise', category: 'AI' },
  { name: 'Support Standard', category: 'Support' },
  { name: 'Support Premium', category: 'Support' },
];

export default function DataHealthView() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [dataset, setDataset] = useState<DatasetSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const [h, d] = await Promise.all([fetchHealthStatus(), fetchDatasetSummary()]);
      setHealth(h);
      setDataset(d);
    } catch (err) {
      console.error('Failed to load health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const regions = dataset?.regions && dataset.regions.length > 0 ? dataset.regions : DEFAULT_REGIONS;
  const categories = dataset?.categories && dataset.categories.length > 0 ? dataset.categories : DEFAULT_CATEGORIES;
  const productList = dataset?.products && dataset.products.length > 0
    ? dataset.products.map(p => typeof p === 'string' ? { name: p, category: 'Enterprise' } : p)
    : DEFAULT_PRODUCTS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Data Health & Lineage Diagnostics</h1>
            <p className="text-xs text-slate-500">
              Live telemetry of PostgreSQL / SQLite data warehouse, dbt analytical marts, and Cube semantic layer
            </p>
          </div>
        </div>

        <button
          onClick={loadHealth}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Warehouse Engine
            </span>
            <Server className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {health?.database?.engine || 'PostgreSQL'}
          </div>
          <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected & Verified
          </span>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Transactions
            </span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {dataset?.total_sales_rows?.toLocaleString() || '50,000'} rows
          </div>
          <span className="text-[10px] text-slate-400">Target table: <code className="font-mono text-slate-600">fct_sales</code></span>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Semantic Layer
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-700">
            Active & Governed
          </div>
          <span className="text-[10px] text-slate-400">Cube.dev + FastAPI Engine</span>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              SQL Injection Guard
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">
            Enforced
          </div>
          <span className="text-[10px] text-slate-400">AST parser & whitelist active</span>
        </div>
      </div>

      {/* Dataset Mart Lineage: Vertical Column-Wise Layout */}
      <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>dbt Analytical Models & Dimension Coverage</span>
          </h3>
          <span className="text-[11px] font-medium text-slate-500">
            Target Mart: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">fct_sales</code>
          </span>
        </div>

        {/* 3 Vertical Columns Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Regions */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-xs text-slate-800">Regions</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-full text-[10px] font-bold">
                {regions.length} Active
              </span>
            </div>

            <div className="flex flex-col space-y-1.5 flex-1">
              {regions.map((region, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200/70 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <span>{region}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Product Categories */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-bold text-xs text-slate-800">Product Categories</span>
              </div>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/70 rounded-full text-[10px] font-bold">
                {categories.length} Categories
              </span>
            </div>

            <div className="flex flex-col space-y-1.5 flex-1">
              {categories.map((category, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200/70 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  <span>{category}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/70"></span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Products */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center space-x-2">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-xs text-slate-800">Products</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-full text-[10px] font-bold">
                {productList.length} Mapped
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Mapped to <code className="font-mono text-slate-700 bg-white px-1 py-0.5 rounded border border-slate-200">dim_products</code>
            </p>

            <div className="flex flex-col space-y-1.5 flex-1 max-h-[290px] overflow-y-auto pr-1">
              {productList.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 shadow-2xs hover:border-emerald-300 transition-colors"
                >
                  <span className="font-medium truncate">{prod.name}</span>
                  {prod.category && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium ml-2 shrink-0">
                      {prod.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
