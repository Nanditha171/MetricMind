'use client';

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  BookOpen,
  FileText,
  Activity,
  ShieldAlert,
  Settings,
  BrainCircuit,
  Lock,
  ExternalLink,
  Layers
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'ai_analytics'
  | 'explore_data'
  | 'semantic_catalog'
  | 'reports'
  | 'data_health'
  | 'audit_trail'
  | 'settings';

interface SidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  onOpenCatalog: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeNav,
  onSelectNav,
  onOpenCatalog,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { key: 'ai_analytics' as NavItemKey, label: 'AI Analytics', icon: Sparkles, badge: 'Gemini' },
    { key: 'explore_data' as NavItemKey, label: 'Explore Data', icon: Compass },
    { key: 'semantic_catalog' as NavItemKey, label: 'Semantic Catalog', icon: BookOpen, action: onOpenCatalog },
    { key: 'reports' as NavItemKey, label: 'Reports', icon: FileText },
    { key: 'data_health' as NavItemKey, label: 'Data Health', icon: Activity, dot: 'bg-emerald-400' },
    { key: 'audit_trail' as NavItemKey, label: 'Audit Trail', icon: ShieldAlert },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-border bg-sidebar-bg/95">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base text-sidebar-textBright tracking-tight font-sans">
                    MetricMind
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-mono font-medium border border-brand-500/30">
                    AI BI
                  </span>
                </div>
                <p className="text-[11px] text-sidebar-text tracking-wide font-medium">
                  Governed Semantic Layer
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Platform Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      onSelectNav(item.key);
                    }
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                      : 'text-sidebar-text hover:text-sidebar-textBright hover:bg-sidebar-hover'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-brand-300 border border-brand-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.dot && !item.badge && (
                    <span className={`w-2 h-2 rounded-full ${item.dot} animate-pulse`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promotional / Trust Card */}
        <div className="p-3">
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-left shadow-lg">
            <div className="flex items-center space-x-2 text-brand-400 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 font-sans">
                Enterprise Trust
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white leading-tight">
              "From Questions to Insights"
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Trusted. Governed. Explainable. Zero hallucinated SQL.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>dbt • Cube • PostgreSQL</span>
              <span className="text-emerald-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
