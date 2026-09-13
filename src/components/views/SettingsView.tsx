'use client';

import React from 'react';
import { Settings, ShieldCheck, Database, Lock, Server, Check } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform Governance & Engine Settings</h1>
            <p className="text-xs text-slate-500">
              Authoritative parameters for MetricMind Semantic Layer and LLM safety enforcement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Governance Guardrails */}
        <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Governance Guardrail Policies</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Direct SQL Prevention</div>
                <div className="text-[11px] text-slate-500">Frontend and LLM cannot directly execute raw SQL</div>
              </div>
              <span className="text-emerald-700 font-bold flex items-center text-xs">
                <Check className="w-4 h-4 mr-1" /> Enforced
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Metric Whitelist Verification</div>
                <div className="text-[11px] text-slate-500">All requested measures must exist in authoritative catalog</div>
              </div>
              <span className="text-emerald-700 font-bold flex items-center text-xs">
                <Check className="w-4 h-4 mr-1" /> Active
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Max Row Limit per Query</div>
                <div className="text-[11px] text-slate-500">Maximum scan limit enforced per analytical query</div>
              </div>
              <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                1,000 rows
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Agent Reasoning Step Bound</div>
                <div className="text-[11px] text-slate-500">Maximum tool invocation steps for conversational agent</div>
              </div>
              <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                5 steps max
              </span>
            </div>
          </div>
        </div>

        {/* Data Warehouse & Engine Configuration */}
        <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <Database className="w-5 h-5 text-brand-600" />
            <span>Warehouse Connection & Semantic Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Target Warehouse Database</span>
              <span className="font-mono font-bold text-slate-800">PostgreSQL (metricmind)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Analytical Mart</span>
              <span className="font-mono font-bold text-slate-800">dbt mart: fct_sales</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Semantic Layer Protocol</span>
              <span className="font-mono font-bold text-slate-800">Cube.dev REST + Governed SQL</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">LLM Reasoning Model</span>
              <span className="font-mono font-bold text-brand-600">Gemini 2.5 Flash + LangChain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
