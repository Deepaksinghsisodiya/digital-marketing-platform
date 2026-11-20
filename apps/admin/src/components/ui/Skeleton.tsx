import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base shimmer skeleton element.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse animate-shimmer rounded-lg bg-slate-200/70 dark:bg-slate-800/60",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Dashboard KPI Card Skeleton.
 * Accurately matches standard metric card dimensions to prevent Cumulative Layout Shift (CLS).
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between h-[136px]"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton with header, realistic cell variations, and pagination bar.
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  hasControls?: boolean;
}> = ({ rows = 6, columns = 5, hasControls = true }) => {
  return (
    <div className="w-full space-y-3">
      {hasControls && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
          <Skeleton className="h-9 w-full sm:w-72 rounded-xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="flex items-center border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i === 0 ? "min-w-[140px]" : "min-w-[100px]"}`}
            >
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="flex items-center px-4 py-3.5 gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
            >
              {Array.from({ length: columns }).map((_, c) => (
                <div
                  key={c}
                  className={`flex-1 ${c === 0 ? "min-w-[140px]" : "min-w-[100px]"}`}
                >
                  {c === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ) : c === columns - 1 ? (
                    <div className="flex justify-end gap-1.5">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                  ) : (
                    <Skeleton
                      className={`h-3 ${c % 2 === 0 ? "w-24" : "w-16"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/30">
          <Skeleton className="h-3.5 w-32" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Chart Skeleton for visual telemetry & telemetry graphs.
 */
export const ChartSkeleton: React.FC<{ height?: string }> = ({
  height = "h-72",
}) => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-12 rounded-lg" />
          <Skeleton className="h-7 w-12 rounded-lg" />
          <Skeleton className="h-7 w-12 rounded-lg" />
        </div>
      </div>

      {/* Chart Bars/Lines visualization */}
      <div className={cn("w-full flex items-end gap-3 pt-6 pb-2", height)}>
        {[45, 75, 35, 90, 60, 40, 80, 65, 95, 55, 70, 85].map((val, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${val}%` }}
            />
            <Skeleton className="h-2.5 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Form Skeleton with field labels, inputs, and action buttons.
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
      <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3.5 w-72" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * List Skeleton for feed, items, or directory entries.
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-xs">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Page Header Skeleton with breadcrumb, title, and actions.
 */
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Sidebar Navigation Skeleton.
 */
export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="h-screen w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-5">
          {[1, 2, 3].map((g) => (
            <div key={g} className="space-y-2">
              <Skeleton className="h-2.5 w-20 px-2 mb-2" />
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3.5 flex-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 flex items-center gap-3 px-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    </div>
  );
};

/**
 * Topbar Skeleton.
 */
export const TopbarSkeleton: React.FC = () => {
  return (
    <div className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-48 rounded-xl hidden md:block" />
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};
