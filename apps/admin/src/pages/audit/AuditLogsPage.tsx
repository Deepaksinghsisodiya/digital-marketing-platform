import React, { useState } from "react";
import { useGetAuditLogsQuery } from "../../store/api/adminApi";
import { Clock, AlertCircle, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");

  const { data, isLoading } = useGetAuditLogsQuery({
    page,
    pageSize: 15,
    action: actionFilter || undefined,
    outcome: outcomeFilter || undefined,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security Audit Trail
          </h1>
          <Badge variant="primary">Immutable Ledger</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Append-only tamper-proof security governance log protected by database
          triggers
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:flex-1">
            <SearchInput
              value={actionFilter}
              onChange={(val) => {
                setActionFilter(val);
                setPage(1);
              }}
              placeholder="Filter by action (e.g. auth.login.success, cms.page.publish)..."
            />
          </div>

          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Outcomes</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={5} hasControls={false} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title="No Audit Records Found"
              description="No security events or administrative actions match your active filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider shadow-2xs">
                <tr>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Outcome</th>
                  <th className="px-5 py-3.5">Actor Identity</th>
                  <th className="px-5 py-3.5">IP / User Agent</th>
                  <th className="px-5 py-3.5">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.items.map((log) => {
                  const isSuccess = log.outcome === "Success";
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                        {log.action}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={isSuccess ? "success" : "danger"}
                          size="sm"
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-0.5" />
                          )}
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {log.actorEmail || "Unauthenticated"}
                        </div>
                        {log.actorUserId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {log.actorUserId}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {log.ipAddress || "127.0.0.1"}
                        </span>
                        {log.userAgent && (
                          <div
                            className="text-[10px] text-slate-400 truncate"
                            title={log.userAgent}
                          >
                            {log.userAgent}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.timestampUtc)
                            .toISOString()
                            .replace("T", " ")
                            .substring(0, 19)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
            <span>
              Page {data.page} of {data.totalPages} ({data.totalCount} recorded
              events)
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
