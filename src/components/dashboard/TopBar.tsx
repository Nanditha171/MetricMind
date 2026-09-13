'use client';

import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Globe2,
  Database,
  Sparkles,
  Menu,
  ChevronDown,
  RefreshCw,
  User,
  ShieldCheck
} from 'lucide-react';

interface TopBarProps {
  onSearchSubmit: (query: string) => void;
  selectedQuarter: string;
  onChangeQuarter: (quarter: string) => void;
  selectedRegion: string;
  onChangeRegion: (region: string) => void;
  onToggleMobileMenu: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function TopBar({
  onSearchSubmit,
  selectedQuarter,
  onChangeQuarter,
  selectedRegion,
  onChangeRegion,
  onToggleMobileMenu,
  isRefreshing = false,
  onRefresh
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const quarters = [
    { value: '2025-Q4', label: 'Q4 2025' },
    { value: '2025-Q3', label: 'Q3 2025' },
    { value: '2025-Q2', label: 'Q2 2025' },
    { value: '2025-Q1', label: 'Q1 2025' },
    { value: '2024-Q4', label: 'Q4 2024' },
    { value: 'All', label: 'All Quarters' },
  ];

  const regions = [
    { value: 'Europe', label: 'Europe' },
    { value: 'North America', label: 'North America' },
    { value: 'Asia', label: 'Asia' },
    { value: 'South America', label: 'South America' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Global', label: 'Global / All Regions' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 bg-white border-b border-surface-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global AI Question / Search Bar */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask a question about your business (e.g. 'Why did European margins drop?')..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs md:text-sm text-slate-800 placeholder-slate-400 pl-10 pr-24 py-2 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-[11px] font-medium px-3 py-1 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Right: Dropdowns, Freshness Badge, User Avatar */}
      <div className="flex items-center space-x-2 md:space-x-3 ml-4">
        {/* Quarter Dropdown */}
        <div className="relative inline-block">
          <div className="flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5 hidden sm:inline" />
            <select
              value={selectedQuarter}
              onChange={(e) => onChangeQuarter(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {quarters.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Region Dropdown */}
        <div className="relative inline-block">
          <div className="flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700">
            <Globe2 className="w-3.5 h-3.5 text-slate-500 mr-1.5 hidden sm:inline" />
            <select
              value={selectedRegion}
              onChange={(e) => onChangeRegion(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Freshness Indicator */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live • fct_sales (50k rows)</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh dashboard metrics"
            disabled={isRefreshing}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        )}

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            EM
          </div>
          <div className="hidden 2xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Executive User</div>
            <div className="text-[10px] text-slate-500">Enterprise BI Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
