'use client';

import React from 'react';
import ExecutiveOverview from '../dashboard/ExecutiveOverview';
import KpiCardGrid from '../dashboard/KpiCardGrid';
import AnalyticsSection from '../dashboard/AnalyticsSection';
import AIAnalyticsAssistant from '../dashboard/AIAnalyticsAssistant';
import QueryTransparency from '../dashboard/QueryTransparency';
import GovernanceStatus from '../dashboard/GovernanceStatus';
import DimensionCoverage from '../dashboard/DimensionCoverage';
import { HealthResponse, DatasetSummaryResponse } from '../../lib/api';

interface DashboardViewProps {
  selectedRegion: string;
  selectedQuarter: string;
  prevQuarter: string;
  currentKpis: Record<string, number>;
  previousKpis: Record<string, number>;
  trendData: any[];
  monthlyTrendData?: any[];
  categoryData?: any[];
  healthData: HealthResponse | null;
  datasetSummary: DatasetSummaryResponse | null;
  latestTransparency: any;
  loadingKpis: boolean;
  loadingTrends: boolean;
  externalPrompt?: string;
  onClearPrompt?: () => void;
  onUpdateTransparency?: (t: any) => void;
}

export default function DashboardView({
  selectedRegion,
  selectedQuarter,
  prevQuarter,
  currentKpis,
  previousKpis,
  trendData,
  monthlyTrendData = [],
  categoryData = [],
  healthData,
  datasetSummary,
  latestTransparency,
  loadingKpis,
  loadingTrends,
  externalPrompt,
  onClearPrompt,
  onUpdateTransparency
}: DashboardViewProps) {
  const previousPeriodLabel = `vs ${prevQuarter}`;

  return (
    <div className="space-y-8">
      {/* 1. EXECUTIVE OVERVIEW HEADER */}
      <ExecutiveOverview
        region={selectedRegion}
        quarter={selectedQuarter}
        totalTransactions={datasetSummary?.total_sales_rows || 50000}
        dataSource={healthData?.database?.engine || 'PostgreSQL (fct_sales)'}
      />

      {/* 2. KPI CARDS GRID (7 Governed Metrics) */}
      <section aria-label="Key Performance Indicators">
        <KpiCardGrid
          currentMetrics={currentKpis}
          previousMetrics={previousKpis}
          previousPeriodLabel={previousPeriodLabel}
          loading={loadingKpis}
        />
      </section>

      {/* 3. AI ANALYTICS ASSISTANT & ROOT-CAUSE ANALYSIS */}
      <section aria-label="AI Analytics Assistant">
        <AIAnalyticsAssistant
          externalPrompt={externalPrompt}
          onClearPrompt={onClearPrompt}
          onUpdateTransparency={onUpdateTransparency}
        />
      </section>

      {/* 4. ANALYTICS CHARTS (Revenue Trend | Margin % Trend | Cost Breakdown) */}
      <section aria-label="Analytics & Trends">
        <AnalyticsSection
          trendData={trendData}
          monthlyTrendData={monthlyTrendData}
          categoryData={categoryData}
          selectedQuarter={selectedQuarter}
          selectedRegion={selectedRegion}
          currentMetrics={currentKpis}
          loading={loadingTrends}
        />
      </section>

      {/* 5. DBT ANALYTICAL MODELS & DIMENSION COVERAGE */}
      <section aria-label="DBT Analytical Models & Dimension Coverage">
        <DimensionCoverage datasetSummary={datasetSummary} />
      </section>

      {/* 6. QUERY TRANSPARENCY INSPECTOR */}
      <section aria-label="Query Transparency">
        <QueryTransparency transparency={latestTransparency} />
      </section>

      {/* 7. SYSTEM & GOVERNANCE HEALTH */}
      <section aria-label="Governance & System Health" className="pb-8">
        <GovernanceStatus
          healthData={healthData}
          totalRows={datasetSummary?.total_sales_rows || 50000}
        />
      </section>
    </div>
  );
}
