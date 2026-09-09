import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'chart' | 'kpi';
}

export default function LoadingSkeleton({ className = '', variant = 'text' }: LoadingSkeletonProps) {
  if (variant === 'kpi') {
    return (
      <div className={`bg-white border border-surface-border rounded-xl p-5 shadow-card animate-pulse space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-32"></div>
        <div className="flex items-center space-x-2 pt-1">
          <div className="h-4 bg-slate-100 rounded w-16"></div>
          <div className="h-4 bg-slate-100 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white border border-surface-border rounded-xl p-5 shadow-card animate-pulse space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-36"></div>
          <div className="h-6 bg-slate-100 rounded w-20"></div>
        </div>
        <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-between p-4 space-x-2">
          {[40, 65, 30, 80, 55, 90, 70, 85].map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-slate-200 rounded-t"></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-surface-border rounded-xl p-5 shadow-card animate-pulse space-y-3 ${className}`}>
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`h-4 bg-slate-200 rounded animate-pulse ${className}`} />
  );
}
