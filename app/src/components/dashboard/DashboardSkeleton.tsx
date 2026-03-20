"use client";

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="טוען נתונים" className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg p-6 space-y-3">
            <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-36 bg-slate-200 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Orientation Bar */}
      <div className="h-10 bg-slate-200 animate-pulse rounded" />

      {/* Chart Pairs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg p-6 h-80">
          <div className="h-6 w-40 bg-slate-200 animate-pulse rounded mb-4" />
          <div className="h-60 bg-slate-200 animate-pulse rounded" />
        </div>
        <div className="bg-card rounded-lg p-6 h-80">
          <div className="h-6 w-40 bg-slate-200 animate-pulse rounded mb-4" />
          <div className="h-60 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Table placeholder */}
      <div className="bg-card rounded-lg p-6">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-200 animate-pulse rounded mb-2" />
        ))}
      </div>
    </div>
  );
}
