'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { NavItemKey } from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import SemanticCatalogModal from '../components/dashboard/SemanticCatalogModal';

// Views
import DashboardView from '../components/views/DashboardView';
import AIAnalyticsView from '../components/views/AIAnalyticsView';
import ExploreDataView from '../components/views/ExploreDataView';
import SemanticCatalogView from '../components/views/SemanticCatalogView';
import ReportsView from '../components/views/ReportsView';
import DataHealthView from '../components/views/DataHealthView';
import AuditTrailView from '../components/views/AuditTrailView';
import SettingsView from '../components/views/SettingsView';

import {
  fetchExecutiveKpis,
  fetchQuarterlyTrendData,
  fetchMonthlyTrendData,
  fetchCategoryBreakdown,
  fetchHealthStatus,
  fetchDatasetSummary,
  HealthResponse,
  DatasetSummaryResponse
} from '../lib/api';

export default function MetricMindDashboardPage() {
  // Navigation & Modal State
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filters State
  const [selectedRegion, setSelectedRegion] = useState('Europe');
  const [selectedQuarter, setSelectedQuarter] = useState('2025-Q4');
  const [prevQuarter, setPrevQuarter] = useState('2025-Q3');

  // External query prompt passed to AI Assistant
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>(undefined);

  // Dashboard Data States
  const [currentKpis, setCurrentKpis] = useState<Record<string, number>>({});
  const [previousKpis, setPreviousKpis] = useState<Record<string, number>>({});
  const [trendData, setTrendData] = useState<any[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummaryResponse | null>(null);
  const [latestSql, setLatestSql] = useState<string>('');
  const [latestTransparency, setLatestTransparency] = useState<any>(null);

  // Loading States
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine previous quarter based on current quarter
  useEffect(() => {
    if (selectedQuarter === '2025-Q4') setPrevQuarter('2025-Q3');
    else if (selectedQuarter === '2025-Q3') setPrevQuarter('2025-Q2');
    else if (selectedQuarter === '2025-Q2') setPrevQuarter('2025-Q1');
    else if (selectedQuarter === '2025-Q1') setPrevQuarter('2024-Q4');
    else if (selectedQuarter === '2024-Q4') setPrevQuarter('2024-Q3');
    else setPrevQuarter('2025-Q3');
  }, [selectedQuarter]);

  // Load Executive KPIs, Trends, Monthly data, and Category breakdown dynamically from backend
  const loadDashboardData = useCallback(async () => {
    setLoadingKpis(true);
    setLoadingTrends(true);

    try {
      // 1. Fetch Executive KPIs
      const kpiRes = await fetchExecutiveKpis(selectedRegion, selectedQuarter, prevQuarter);
      setCurrentKpis(kpiRes.current || {});
      setPreviousKpis(kpiRes.previous || {});
      setLatestSql(kpiRes.sql || '');

      // Initialize transparency if not set
      if (!latestTransparency) {
        setLatestTransparency({
          api_calls: [
            {
              step: 1,
              request: {
                measures: ['revenue', 'cost', 'material_cost', 'shipping_cost', 'margin', 'margin_pct', 'quantity'],
                filters: [
                  { dimension: 'region', operator: '=', value: selectedRegion },
                  { dimension: 'quarter', operator: '=', value: selectedQuarter }
                ]
              },
              sql: kpiRes.sql
            }
          ],
          governed_metrics_used: ['revenue', 'cost', 'material_cost', 'shipping_cost', 'margin', 'margin_pct', 'quantity'],
          data_source: 'PostgreSQL / dbt mart fct_sales',
          total_rows_scanned: 4391,
          execution_time_ms: 14.8
        });
      }
    } catch (err) {
      console.error('Failed to load executive KPIs:', err);
    } finally {
      setLoadingKpis(false);
    }

    try {
      // 2. Fetch Quarterly Trends, Monthly Trends, and Category Breakdown in Parallel
      const [trends, monthly, categories] = await Promise.all([
        fetchQuarterlyTrendData(selectedRegion),
        fetchMonthlyTrendData(selectedRegion, selectedQuarter === 'All' ? undefined : selectedQuarter),
        fetchCategoryBreakdown(selectedRegion, selectedQuarter)
      ]);
      setTrendData(trends || []);
      setMonthlyTrendData(monthly || []);
      setCategoryData(categories || []);
    } catch (err) {
      console.error('Failed to load chart analytics data:', err);
    } finally {
      setLoadingTrends(false);
    }
  }, [selectedRegion, selectedQuarter, prevQuarter]);

  // Load initial health & dataset metadata
  useEffect(() => {
    fetchHealthStatus()
      .then(setHealthData)
      .catch((e) => console.error('Failed to fetch health status:', e));

    fetchDatasetSummary()
      .then(setDatasetSummary)
      .catch((e) => console.error('Failed to fetch dataset summary:', e));
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleSearchSubmit = (query: string) => {
    setExternalPrompt(query);
    setActiveNav('ai_analytics');
  };

  return (
    <div className="flex h-screen w-screen bg-surface-canvas overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(key) => {
          setActiveNav(key);
        }}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP APP BAR */}
        <TopBar
          onSearchSubmit={handleSearchSubmit}
          selectedQuarter={selectedQuarter}
          onChangeQuarter={setSelectedQuarter}
          selectedRegion={selectedRegion}
          onChangeRegion={setSelectedRegion}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />

        {/* SCROLLABLE VIEW WORKSPACE */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {/* VIEW 1: Main Executive Dashboard */}
          {activeNav === 'dashboard' && (
            <DashboardView
              selectedRegion={selectedRegion}
              selectedQuarter={selectedQuarter}
              prevQuarter={prevQuarter}
              currentKpis={currentKpis}
              previousKpis={previousKpis}
              trendData={trendData}
              monthlyTrendData={monthlyTrendData}
              categoryData={categoryData}
              healthData={healthData}
              datasetSummary={datasetSummary}
              latestTransparency={latestTransparency}
              loadingKpis={loadingKpis}
              loadingTrends={loadingTrends}
              externalPrompt={externalPrompt}
              onClearPrompt={() => setExternalPrompt(undefined)}
              onUpdateTransparency={(trans) => setLatestTransparency(trans)}
            />
          )}

          {/* VIEW 2: AI Analytics */}
          {activeNav === 'ai_analytics' && (
            <AIAnalyticsView
              externalPrompt={externalPrompt}
              onClearPrompt={() => setExternalPrompt(undefined)}
              latestTransparency={latestTransparency}
              onUpdateTransparency={(trans) => setLatestTransparency(trans)}
            />
          )}

          {/* VIEW 3: Explore Data */}
          {activeNav === 'explore_data' && <ExploreDataView />}

          {/* VIEW 4: Semantic Catalog */}
          {activeNav === 'semantic_catalog' && (
            <SemanticCatalogView
              onSelectPrompt={(prompt) => {
                setExternalPrompt(prompt);
                setActiveNav('ai_analytics');
              }}
            />
          )}

          {/* VIEW 5: Reports */}
          {activeNav === 'reports' && (
            <ReportsView
              selectedRegion={selectedRegion}
              selectedQuarter={selectedQuarter}
              prevQuarter={prevQuarter}
              currentKpis={currentKpis}
              previousKpis={previousKpis}
              loadingKpis={loadingKpis}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          )}

          {/* VIEW 6: Data Health */}
          {activeNav === 'data_health' && <DataHealthView />}

          {/* VIEW 7: Audit Trail */}
          {activeNav === 'audit_trail' && <AuditTrailView />}

          {/* VIEW 8: Settings */}
          {activeNav === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* OPTIONAL MODAL POPUP */}
      <SemanticCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
}
