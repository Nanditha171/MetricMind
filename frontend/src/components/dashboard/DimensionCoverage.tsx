'use client';

import React from 'react';
import { Layers, Globe, Tag, Package } from 'lucide-react';
import { DatasetSummaryResponse } from '../../lib/api';

interface DimensionCoverageProps {
  datasetSummary?: DatasetSummaryResponse | null;
}

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

export default function DimensionCoverage({ datasetSummary }: DimensionCoverageProps) {
  const regions = datasetSummary?.regions && datasetSummary.regions.length > 0
    ? datasetSummary.regions
    : DEFAULT_REGIONS;

  const categories = datasetSummary?.categories && datasetSummary.categories.length > 0
    ? datasetSummary.categories
    : DEFAULT_CATEGORIES;

  const productList = datasetSummary?.products && datasetSummary.products.length > 0
    ? datasetSummary.products.map(p => typeof p === 'string' ? { name: p, category: 'Enterprise' } : p)
    : DEFAULT_PRODUCTS;

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            DBT Analytical Models & Dimension Coverage
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Target Mart: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">fct_sales</code>
        </span>
      </div>

      {/* 3-Column Vertical Dimension Grid */}
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
  );
}
