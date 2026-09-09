import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck, Activity } from 'lucide-react';

interface StatusBadgeProps {
  status: 'healthy' | 'active' | 'enforced' | 'warning' | 'degraded' | 'error' | 'info';
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true
}: StatusBadgeProps) {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  const getStyles = () => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'enforced':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: ShieldCheck
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'degraded':
      case 'error':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: AlertCircle
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: Info
        };
    }
  };

  const { bg, dot, icon: IconComponent } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${bg}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />}
      <span>{displayLabel}</span>
    </span>
  );
}
