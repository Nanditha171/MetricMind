'use client';

import React from 'react';
import KpiCard from './KpiCard';

interface KpiCardGridProps {
  currentMetrics: Record<string, number>;
  previousMetrics: Record<string, number>;
  previousPeriodLabel?: string;
  loading?: boolean;
}

export default function KpiCardGrid({
  currentMetrics,
  previousMetrics,
  previousPeriodLabel = 'vs Q3 2025',
  loading = false
}: KpiCardGridProps) {
  const kpiDefinitions = [
    {
      id: 'revenue',
      name: 'revenue',
      label: 'Revenue',
      unit: 'USD',
      format: 'currency' as const,
      isPositiveGood: true,
      formula: 'SUM(revenue)'
    },
    {
      id: 'cost',
      name: 'cost',
      label: 'Total Cost',
      unit: 'USD',
      format: 'currency' as const,
      isPositiveGood: false,
      formula: 'SUM(cost)'
    },
    {
      id: 'material_cost',
      name: 'material_cost',
      label: 'Material Cost',
      unit: 'USD',
      format: 'currency' as const,
      isPositiveGood: false,
      formula: 'SUM(ROUND(cost * 0.75, 2))'
    },
    {
      id: 'shipping_cost',
      name: 'shipping_cost',
      label: 'Shipping Cost',
      unit: 'USD',
      format: 'currency' as const,
      isPositiveGood: false,
      formula: 'SUM(ROUND(cost * 0.25, 2))'
    },
    {
      id: 'margin',
      name: 'margin',
      label: 'Operating Margin',
      unit: 'USD',
      format: 'currency' as const,
      isPositiveGood: true,
      formula: 'SUM(profit)'
    },
    {
      id: 'margin_pct',
      name: 'margin_pct',
      label: 'Margin %',
      unit: 'percent',
      format: 'percentage' as const,
      isPositiveGood: true,
      formula: '(SUM(profit) / SUM(revenue)) * 100'
    },
    {
      id: 'quantity',
      name: 'quantity',
      label: 'Quantity',
      unit: 'units',
      format: 'number' as const,
      isPositiveGood: true,
      formula: 'SUM(quantity)'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
      {kpiDefinitions.map((def) => {
        const val = currentMetrics[def.id] ?? currentMetrics[def.name];
        const prevVal = previousMetrics[def.id] ?? previousMetrics[def.name];

        return (
          <KpiCard
            key={def.id}
            id={def.id}
            name={def.name}
            label={def.label}
            value={val}
            prevValue={prevVal}
            unit={def.unit}
            format={def.format}
            isPositiveGood={def.isPositiveGood}
            previousPeriodLabel={previousPeriodLabel}
            formula={def.formula}
            loading={loading}
          />
        );
      })}
    </div>
  );
}
