import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useGetAuditLogsQuery, useGetLeadsQuery } from "../store/api/adminApi";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<"activity" | "leads">("activity");

  const { data: auditData, isLoading: isLoadingAudit } = useGetAuditLogsQuery(
    { page: 1, pageSize: 12 },
    { skip: !isOpen },
  );

  const { data: leadsData, isLoading: isLoadingLeads } = useGetLeadsQuery(
    { page: 1, pageSize: 6 },
    { skip: !isOpen },
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Notifications & Telemetry
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live operational audit feed & inbound alerts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTab("activity")}
              className={`flex-1 py-3 px-4 text-center border-b-2 flex items-center justify-center gap-2 transition ${
                tab === "activity"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>System Activity</span>
              {auditData?.totalCount ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {auditData.totalCount}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setTab("leads")}
              className={`flex-1 py-3 px-4 text-center border-b-2 flex items-center justify-center gap-2 transition ${
                tab === "leads"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inbound Leads</span>
              {leadsData?.totalCount ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold">
                  {leadsData.totalCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tab === "activity" && (
              <>
                {isLoadingAudit ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Loading telemetry audit stream...
                  </div>
                ) : !auditData || auditData.items.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No recent system events recorded.
                  </div>
                ) : (
                  auditData.items.map((log) => {
                    const isSuccess = log.outcome === "Success";
                    return (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {isSuccess ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">
                              {log.action}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.timestampUtc).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Resource:{" "}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {log.resourceType}
                            </strong>
                          </span>
                          <span className="truncate max-w-[150px]">
                            {log.actorEmail || "System Automation"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {tab === "leads" && (
              <>
                {isLoadingLeads ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Loading inbound leads...
                  </div>
                ) : !leadsData || leadsData.items.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No inbound lead submissions yet.
                  </div>
                ) : (
                  leadsData.items.map((lead) => {
                    const statusLabel =
                      lead.status === 1
                        ? "New"
                        : lead.status === 2
                          ? "Contacted"
                          : lead.status === 3
                            ? "Qualified"
                            : lead.status === 4
                              ? "Lost"
                              : "Spam";
                    return (
                      <div
                        key={lead.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-1 hover:border-primary/40 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {lead.fullName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>{lead.email}</span>
                          <span className="font-mono text-[10px] uppercase">
                            {lead.region}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <Link
              to={tab === "activity" ? "/audit-logs" : "/leads"}
              onClick={onClose}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
            >
              <span>
                {tab === "activity"
                  ? "Open Complete Audit Trail"
                  : "View All Inbound Leads"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
