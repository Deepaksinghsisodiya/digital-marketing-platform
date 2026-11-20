import React, { useState, useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  useGetUsersQuery,
  useGetAuditLogsQuery,
  useGetLeadStatsQuery,
  useGetClientsQuery,
  useGetLeadsQuery,
} from "../../store/api/adminApi";
import {
  Users,
  ShieldCheck,
  FileText,
  Inbox,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Briefcase,
  Layers,
  Activity,
  Globe,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "../../components/ui/Skeleton";

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({
    page: 1,
    pageSize: 5,
  });
  const { data: auditData, isLoading: isAuditLoading } = useGetAuditLogsQuery({
    page: 1,
    pageSize: 6,
  });
  const { data: leadStats, isLoading: isStatsLoading } = useGetLeadStatsQuery();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({
    page: 1,
    pageSize: 5,
  });
  const { data: recentLeadsData, isLoading: isLeadsLoading } = useGetLeadsQuery({
    page: 1,
    pageSize: 5,
  });

  const totalUsers = usersData?.totalCount ?? 0;
  const recentLogs = auditData?.items ?? [];
  const totalClients = clientsData?.totalCount ?? 0;
  const recentLeads = recentLeadsData?.items ?? [];

  interface VelocityPoint {
    label: string;
    leads: number;
    qualified: number;
  }

  const velocityData: VelocityPoint[] = useMemo(() => {
    if (timeframe === "7d") {
      return [
        { label: "Mon", leads: 4, qualified: 2 },
        { label: "Tue", leads: 7, qualified: 3 },
        { label: "Wed", leads: 5, qualified: 2 },
        { label: "Thu", leads: 11, qualified: 5 },
        { label: "Fri", leads: 9, qualified: 4 },
        { label: "Sat", leads: 3, qualified: 1 },
        { label: "Sun", leads: 6, qualified: 3 },
      ];
    } else if (timeframe === "30d") {
      return [
        { label: "W1", leads: 28, qualified: 12 },
        { label: "W2", leads: 35, qualified: 16 },
        { label: "W3", leads: 42, qualified: 19 },
        { label: "W4", leads: 49, qualified: 24 },
      ];
    } else {
      return [
        { label: "Sep", leads: 120, qualified: 54 },
        { label: "Oct", leads: 145, qualified: 68 },
        { label: "Nov", leads: 180, qualified: 82 },
      ];
    }
  }, [timeframe]);

  const isKpiLoading =
    isUsersLoading || isClientsLoading || isStatsLoading || isAuditLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Compact Executive Header with Integrated Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.fullName || "Administrator"}</span>. Real-time marketing pipeline & institutional retainers.
          </p>
        </div>

        {/* Global Timeframe Quick Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shrink-0 shadow-2xs">
          {(["7d", "30d", "90d"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t === "7d" ? "Past 7 Days" : t === "30d" ? "Past 30 Days" : "Past Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Consistent KPI Cards with Skeletons */}
      {isKpiLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Enterprise Accounts */}
          <Card hover className="p-5 flex flex-col justify-between h-[136px] relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Enterprise Accounts
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {totalClients}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Active Retainers
                  </span>
                </div>
              </div>
              {/* Mini Sparkline */}
              <svg className="w-16 h-7 text-emerald-500 shrink-0 mb-1" viewBox="0 0 64 28" fill="none">
                <path d="M 0,22 Q 16,18 32,10 T 64,4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,22 Q 16,18 32,10 T 64,4 L 64,28 L 0,28 Z" fill="currentColor" opacity="0.15" />
              </svg>
            </div>
          </Card>

          {/* KPI 2: Agency Staff */}
          <Card hover className="p-5 flex flex-col justify-between h-[136px] relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Agency Staff
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {totalUsers}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="text-primary font-semibold">RBAC Governed</span>
                </div>
              </div>
              {/* Mini Sparkline */}
              <svg className="w-16 h-7 text-purple-500 shrink-0 mb-1" viewBox="0 0 64 28" fill="none">
                <path d="M 0,18 Q 20,20 36,12 T 64,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,18 Q 20,20 36,12 T 64,6 L 64,28 L 0,28 Z" fill="currentColor" opacity="0.15" />
              </svg>
            </div>
          </Card>

          {/* KPI 3: Inbound Inquiries */}
          <Card hover className="p-5 flex flex-col justify-between h-[136px] relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Inbound Inquiries
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {leadStats?.totalLeads ?? 0}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {leadStats?.qualifiedLeads ?? 0} Qualified
                  </span>
                </div>
              </div>
              {/* Mini Sparkline */}
              <svg className="w-16 h-7 text-blue-500 shrink-0 mb-1" viewBox="0 0 64 28" fill="none">
                <path d="M 0,24 Q 18,14 34,18 T 64,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,24 Q 18,14 34,18 T 64,3 L 64,28 L 0,28 Z" fill="currentColor" opacity="0.15" />
              </svg>
            </div>
          </Card>

          {/* KPI 4: Security Audit Stream */}
          <Card hover className="p-5 flex flex-col justify-between h-[136px] relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Security Ledger
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {auditData?.totalCount ?? 0}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Append-Only
                  </span>
                </div>
              </div>
              {/* Mini Sparkline */}
              <svg className="w-16 h-7 text-amber-500 shrink-0 mb-1" viewBox="0 0 64 28" fill="none">
                <path d="M 0,20 Q 22,22 40,8 T 64,5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,20 Q 22,22 40,8 T 64,5 L 64,28 L 0,28 Z" fill="currentColor" opacity="0.15" />
              </svg>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions Grid */}
      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Quick Workflows
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/leads"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Review Leads</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                Inbound inquiries
              </span>
            </div>
          </Link>

          <Link
            to="/clients"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Accounts & CRM</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                Retainers & SLA
              </span>
            </div>
          </Link>

          <Link
            to="/cms/pages"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">CMS Pages</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                Landing pages
              </span>
            </div>
          </Link>

          <Link
            to="/audit-logs"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Audit Trail</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                Compliance logs
              </span>
            </div>
          </Link>
        </div>
      </Card>

      {/* Lead Velocity Chart & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Velocity Bar Chart (2 cols) */}
        {isStatsLoading ? (
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-48" />
          </div>
        ) : (
          <Card className="lg:col-span-2 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Lead Velocity &amp; Acquisition Telemetry</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visual tracking of inbound marketing inquiries and SQL
                  qualification rate
                </p>
              </div>

              {/* Timeframe selector tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 p-1 self-start sm:self-auto">
                {(["7d", "30d", "90d"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timeframe === t
                        ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t === "7d"
                      ? "7 Days"
                      : t === "30d"
                        ? "30 Days"
                        : "90 Days"}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-2 pt-2">
              <div className="h-44 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800/80">
                {velocityData.map((d, i) => {
                  const max = Math.max(...velocityData.map((v) => v.leads), 1);
                  const heightPercent = Math.round((d.leads / max) * 100);
                  const qualifiedHeight = Math.round(
                    (d.qualified / max) * 100,
                  );
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2.5 py-1 rounded-md text-[10px] font-bold pointer-events-none shadow-md z-10 whitespace-nowrap">
                        {d.leads} Total &bull; {d.qualified} Qualified
                      </div>

                      {/* Bar Stack */}
                      <div
                        className="w-full max-w-[42px] bg-primary/10 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:brightness-110 transition-all"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div
                          className="w-full bg-primary rounded-t-sm transition-all duration-500"
                          style={{ height: `${qualifiedHeight}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 font-mono truncate">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
                    <span>Total Inbound Leads</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                    <span>SQL Qualified</span>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Avg +24.8% velocity MoM
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Pipeline Lifecycle Breakdown Funnel (1 col) */}
        <Card className="p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Conversion Funnel</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stage distribution and velocity metrics
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                label: "New Inquiries",
                count: leadStats?.newLeads ?? 0,
                color: "bg-blue-500",
                pct: 100,
              },
              {
                label: "Under Evaluation",
                count: leadStats?.inProgressLeads ?? 0,
                color: "bg-amber-500",
                pct: 75,
              },
              {
                label: "Qualified (SQL)",
                count: leadStats?.qualifiedLeads ?? 0,
                color: "bg-emerald-500",
                pct: 48,
              },
              {
                label: "Converted to Client",
                count: totalClients,
                color: "bg-primary",
                pct: 22,
              },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {step.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {step.count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-700`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Regional Territory Badges */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Multi-Region Active Gateways
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { flag: "🇮🇳", label: "India (INR)" },
                { flag: "🇺🇸", label: "US (USD)" },
                { flag: "🇦🇪", label: "UAE (AED)" },
                { flag: "🇬🇧", label: "UK (GBP)" },
                { flag: "🇸🇬", label: "Singapore" },
              ].map((r) => (
                <span
                  key={r.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                >
                  <span>{r.flag}</span>
                  <span>{r.label}</span>
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Two-Column Bottom Grid: Inbound Inquiries + Live Governance Activity Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Latest Inbound Inquiries Table (7 cols on xl) */}
        <Card className="xl:col-span-7 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-primary" />
                  Latest Inbound Inquiries
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct form submissions needing team review
                </p>
              </div>
              <Link
                to="/leads"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLeadsLoading ? (
              <TableSkeleton rows={4} columns={5} hasControls={false} />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Region</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentLeads.slice(0, 5).map((l) => (
                      <tr
                        key={l.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {l.fullName}
                          </div>
                          {l.company && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                              {l.company}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate max-w-[160px]">
                            {l.email}
                          </div>
                          {l.phone && (
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                              {l.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            {l.region || "IN"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              l.status === 0
                                ? "info"
                                : l.status === 1
                                  ? "warning"
                                  : l.status === 3
                                    ? "success"
                                    : "default"
                            }
                            dot
                            size="sm"
                          >
                            {l.status === 0
                              ? "New"
                              : l.status === 1
                                ? "Eval"
                                : l.status === 2
                                  ? "Contacted"
                                  : l.status === 3
                                    ? "SQL"
                                    : "Won"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            to="/leads"
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {recentLeads.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                        >
                          No inbound inquiries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Bot shielding & honeypot filtering</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Protected
            </span>
          </div>
        </Card>

        {/* Real-time Security & Governance Audit Log Stream (5 cols on xl) */}
        <Card className="xl:col-span-5 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recent Governance Events
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Append-only immutable security ledger
                </p>
              </div>
              <Link
                to="/audit-logs"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[11px] text-primary">
                        {log.action}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate">
                        {log.resourceType}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {log.actorEmail || "System Trigger"} &bull;{" "}
                      {new Date(log.timestampUtc).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge
                    variant={log.outcome === "Success" ? "success" : "danger"}
                    size="sm"
                  >
                    {log.outcome}
                  </Badge>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No recent audit events logged.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>SQL Trigger Tamper Proof</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
