import React, { useState } from "react";
import { useGetAuditLogsQuery } from "../../store/api/adminApi";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Audit Trail & Security Log
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Append-only tamper-proof security log protected by database triggers
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action (e.g. auth.login.success)..."
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Outcomes</option>
          <option value="Success">Success</option>
          <option value="Failure">Failure</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">IP / User Agent</th>
                <th className="px-6 py-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                data.items.map((log) => {
                  const isSuccess = log.outcome === "Success";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                        {log.action}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isSuccess
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          {log.outcome}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {log.actorEmail || "Unauthenticated"}
                        </div>
                        {log.actorUserId && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {log.actorUserId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        <span className="font-mono text-slate-700 dark:text-slate-300">{log.ipAddress || "127.0.0.1"}</span>
                        {log.userAgent && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={log.userAgent}>
                            {log.userAgent}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          {new Date(log.timestampUtc).toISOString().replace("T", " ").substring(0, 19)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
            <span>
              Page {data.page} of {data.totalPages} ({data.totalCount} events)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
