import React from "react";
import { useAppSelector } from "../../store/hooks";
import {
  useGetUsersQuery,
  useGetAuditLogsQuery,
  useGetLeadStatsQuery,
  useGetClientsQuery,
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
} from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: usersData } = useGetUsersQuery({ page: 1, pageSize: 5 });
  const { data: auditData } = useGetAuditLogsQuery({ page: 1, pageSize: 6 });
  const { data: leadStats } = useGetLeadStatsQuery();
  const { data: clientsData } = useGetClientsQuery({ page: 1, pageSize: 5 });

  const totalUsers = usersData?.totalCount ?? 0;
  const recentLogs = auditData?.items ?? [];
  const totalClients = clientsData?.totalCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Nexora Enterprise Platform &bull; v2.4 Live</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Executive Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Logged in as <span className="text-white font-bold">{user?.fullName}</span> ({user?.roles?.[0] || "Owner"}). All multi-region gateways, transactional outboxes, and RBAC governance filters are operational.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Core API :5201</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Preview Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Enterprise Accounts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Enterprise Accounts</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalClients}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% MoM
            </span>
            <span className="text-slate-400 font-medium">Under Retainer</span>
          </div>
        </div>

        {/* KPI 2: Staff & Access */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Agency Staff</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">RBAC Governed</span>
            <span className="text-slate-400 font-medium">Fine-grained</span>
          </div>
        </div>

        {/* KPI 3: Inbound Lead Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inbound Inquiries</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {leadStats?.totalLeads ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {leadStats?.qualifiedLeads ?? 0} Qualified
            </span>
            <span className="text-slate-400 font-medium">Multi-country</span>
          </div>
        </div>

        {/* KPI 4: Security & Audit Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Security Stream</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {auditData?.totalCount ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-600 dark:text-amber-400 font-bold">Zero Violations</span>
            <span className="text-slate-400 font-medium">Immutable</span>
          </div>
        </div>
      </div>

      {/* Quick Command Launcher Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Executive Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/leads"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <div>Review Inbound Leads</div>
              <span className="text-[10px] text-slate-400 font-normal">Process new inquiries</span>
            </div>
          </Link>

          <Link
            to="/clients"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div>Manage Accounts</div>
              <span className="text-[10px] text-slate-400 font-normal">SLA & Tasks</span>
            </div>
          </Link>

          <Link
            to="/cms/pages"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div>Website CMS Blocks</div>
              <span className="text-[10px] text-slate-400 font-normal">Publish landing pages</span>
            </div>
          </Link>

          <Link
            to="/audit-logs"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div>Audit Trail Log</div>
              <span className="text-[10px] text-slate-400 font-normal">Security compliance</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Inbound Funnel + Live Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound Funnel Breakdown */}
        {leadStats && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Demand Funnel Telemetry
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conversion progression across pipeline stages
                  </p>
                </div>
                <Link
                  to="/leads"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Pipeline</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      New Inquiries
                    </span>
                    <span className="font-bold text-blue-600">{leadStats.newLeads}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (leadStats.newLeads / Math.max(1, leadStats.totalLeads)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Under Evaluation (In Progress)
                    </span>
                    <span className="font-bold text-amber-600">{leadStats.inProgressLeads}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (leadStats.inProgressLeads / Math.max(1, leadStats.totalLeads)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Sales Qualified Leads (SQL)
                    </span>
                    <span className="font-bold text-emerald-600">{leadStats.qualifiedLeads}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (leadStats.qualifiedLeads / Math.max(1, leadStats.totalLeads)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Retainer Closed / Won
                    </span>
                    <span className="font-bold text-indigo-600">{leadStats.closedLeads}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (leadStats.closedLeads / Math.max(1, leadStats.totalLeads)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Honeypot & Time-trap bot shielding</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Protected</span>
            </div>
          </div>
        )}

        {/* Real-time Security & Audit Log Stream */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recent Governance Events
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Append-only immutable security ledger entries
                </p>
              </div>
              <Link
                to="/audit-logs"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {log.action}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 dark:text-slate-400">{log.resourceType}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {log.actorEmail || "System Trigger"} &bull; {new Date(log.timestampUtc).toLocaleTimeString()}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.outcome === "Success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {log.outcome}
                  </span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent audit events logged.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>SQL Trigger Tamper Proof</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
