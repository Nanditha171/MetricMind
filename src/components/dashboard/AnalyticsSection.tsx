'use client';

import React from 'react';
import RevenueChart from '../charts/RevenueChart';
import MarginChart from '../charts/MarginChart';
import CostChart from '../charts/CostChart';

interface AnalyticsSectionProps {
  trendData: Array<{
    quarter: string;
    revenue: number;
    cost: number;
    profit: number;
    margin_pct: number;
    material_cost: number;
    shipping_cost: number;
  }>;
  monthlyTrendData?: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    margin_pct: number;
  }>;
  categoryData?: Array<{
    category: string;
    cost: number;
    revenue: number;
    material_cost?: number;
    shipping_cost?: number;
  }>;
  selectedQuarter?: string;
  selectedRegion?: string;
  currentMetrics: Record<string, number>;
  loading?: boolean;
}

export default function AnalyticsSection({
  trendData,
  monthlyTrendData = [],
  categoryData = [],
  selectedQuarter,
  selectedRegion,
  currentMetrics,
  loading = false
}: AnalyticsSectionProps) {
  const materialCost = currentMetrics.material_cost ?? (currentMetrics.cost ? currentMetrics.cost * 0.75 : 0);
  const shippingCost = currentMetrics.shipping_cost ?? (currentMetrics.cost ? currentMetrics.cost * 0.25 : 0);
  const totalCost = currentMetrics.cost ?? (materialCost + shippingCost);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Governed Analytics & Trends
          </h2>
          <p className="text-xs text-slate-500">
            Interactive multi-dimensional performance views calculated dynamically by semantic engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Revenue Trend */}
        <RevenueChart
          trendData={trendData}
          monthlyData={monthlyTrendData}
          selectedQuarter={selectedQuarter}
          loading={loading}
        />

        {/* Chart 2: Margin % Trend */}
        <MarginChart
          trendData={trendData}
          selectedQuarter={selectedQuarter}
          loading={loading}
        />

        {/* Chart 3: Cost Breakdown */}
        <CostChart
          categoryData={categoryData}
          materialCost={materialCost}
          shippingCost={shippingCost}
          totalCost={totalCost}
          loading={loading}
        />
      </div>
    </div>
  );
}

