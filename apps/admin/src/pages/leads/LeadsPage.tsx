import React, { useState, useMemo } from "react";
import { toast } from "../../utils/toast";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { SearchInput } from "../../components/ui/SearchInput";
import {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useGetLeadStatsQuery,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useConvertLeadToClientMutation,
  useGetPipelineStagesQuery,
  useGetCountryRegionsQuery,
  useGetUsersQuery,
  useGetEmailTemplatesQuery,
  useAssignLeadMutation,
  useSendLeadEmailMutation,
  useAnonymizeLeadMutation,
  useDeleteLeadMutation,
} from "../../store/api/adminApi";
import { useAuth } from "../../hooks/useAuth";
import type { LeadStatus } from "../../types";
import {
  Search,
  Download,
  ArrowUpRight,
  Phone,
  Mail,
  ShieldCheck,
  X,
  UserPlus,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  ExternalLink,
  UserCheck,
  Send,
  UserX,
  Trash2,
} from "lucide-react";

interface StatusBadge {
  label: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIG: Record<number, StatusBadge> = {
  0: {
    label: "New Inquiry",
    badgeClass:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  1: {
    label: "Under Evaluation",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  2: {
    label: "Contacted",
    badgeClass:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  3: {
    label: "Qualified (SQL)",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  4: {
    label: "Converted / Closed",
    badgeClass:
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
  },
  5: {
    label: "Spam Filtered",
    badgeClass:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
};

const REGION_FLAGS: Record<string, { flag: string; label: string }> = {
  in: { flag: "🇮🇳", label: "India (INR ₹)" },
  us: { flag: "🇺🇸", label: "US (USD $)" },
  ae: { flag: "🇦🇪", label: "UAE (AED)" },
  gb: { flag: "🇬🇧", label: "UK (GBP)" },
  sg: { flag: "🇸🇬", label: "Singapore (SGD)" },
};

const KANBAN_STAGES = [
  {
    status: 0,
    label: "New Inquiries",
    color: "blue",
    nextAction: "Start Review",
  },
  {
    status: 1,
    label: "Under Evaluation",
    color: "amber",
    nextAction: "Mark Contacted",
  },
  {
    status: 2,
    label: "Contacted",
    color: "purple",
    nextAction: "Qualify Lead",
  },
  {
    status: 3,
    label: "Qualified (SQL)",
    color: "emerald",
    nextAction: "Promote to Client",
  },
  { status: 4, label: "Converted Client", color: "slate", nextAction: null },
];

export const LeadsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined,
  );
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [formKeyFilter, setFormKeyFilter] = useState<string>("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [isAnonymizeConfirmOpen, setIsAnonymizeConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] =
    useState("lead-auto-reply");
  const [customEmailMessage, setCustomEmailMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: dynamicStages } = useGetPipelineStagesQuery({
    category: "Lead",
  });
  const { data: dynamicRegions } = useGetCountryRegionsQuery();
  const { data: usersData } = useGetUsersQuery({ pageSize: 100 });
  const { data: emailTemplates } = useGetEmailTemplatesQuery();

  const {
    data: leadsData,
    isLoading,
    refetch,
  } = useGetLeadsQuery({
    page: viewMode === "kanban" ? 1 : page,
    pageSize: viewMode === "kanban" ? 100 : 12,
    search: search || undefined,
    status: statusFilter,
    region: regionFilter || undefined,
    formKey: formKeyFilter || undefined,
  });

  const { data: statsData } = useGetLeadStatsQuery();
  const { data: selectedLead, refetch: refetchLead } = useGetLeadByIdQuery(
    selectedLeadId || "",
    { skip: !selectedLeadId },
  );

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateLeadStatusMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddLeadNoteMutation();
  const [assignLead, { isLoading: isAssigningLead }] = useAssignLeadMutation();
  const [sendLeadEmail, { isLoading: isSendingEmailAction }] =
    useSendLeadEmailMutation();
  const [anonymizeLead, { isLoading: isAnonymizing }] =
    useAnonymizeLeadMutation();
  const [deleteLead, { isLoading: isDeletingLead }] = useDeleteLeadMutation();
  const [convertLead, { isLoading: isConverting }] =
    useConvertLeadToClientMutation();

  const handleAnonymizeLead = async () => {
    if (!selectedLead) return;
    try {
      const res = await anonymizeLead(selectedLead.id).unwrap();
      toast.success(res.message || "Lead personal data anonymized.");
      setIsAnonymizeConfirmOpen(false);
      refetchLead();
      refetch();
    } catch {
      toast.error("Failed to anonymize lead.");
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    try {
      const res = await deleteLead(selectedLead.id).unwrap();
      toast.success(res.message || "Lead permanently deleted.");
      setIsDeleteConfirmOpen(false);
      setSelectedLeadId(null);
      refetch();
    } catch {
      toast.error("Failed to delete lead.");
    }
  };

  const handleAssignChange = async (
    leadId: string,
    assignedUserId: string | null,
  ) => {
    try {
      await assignLead({
        id: leadId,
        assignedToUserId: assignedUserId,
      }).unwrap();
      refetchLead();
      refetch();
      const assignedUser = usersData?.items.find((u) => u.id === assignedUserId);
      toast.success(
        assignedUserId
          ? `Lead assigned to ${assignedUser?.fullName || "specialist"}.`
          : "Lead unassigned.",
      );
    } catch {
      toast.error("Failed to update lead assignment.");
    }
  };

  const handleSendLeadEmail = async () => {
    if (!selectedLead) return;
    try {
      const res = await sendLeadEmail({
        id: selectedLead.id,
        templateKey: selectedTemplateKey,
        variables: customEmailMessage.trim()
          ? { CustomNote: customEmailMessage.trim() }
          : undefined,
      }).unwrap();
      toast.success(res.message || "Outbound email queued successfully.");
      setIsEmailModalOpen(false);
      setCustomEmailMessage("");
      refetchLead();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      toast.error(error?.data?.error ?? "Failed to send outreach email.");
    }
  };

  const handleConfirmConvert = async () => {
    if (!selectedLead) return;
    try {
      const res = await convertLead({
        leadId: selectedLead.id,
        clientName: selectedLead.company || selectedLead.fullName,
        initialTaskTitle: "Send introductory service agreement & kickoff",
      }).unwrap();
      toast.success(`Client Account created! ID: ${res.clientId}`);
      setIsConvertConfirmOpen(false);
      refetchLead();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      toast.error(error?.data?.error ?? "Lead conversion failed.");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateStatus({ id: leadId, status: newStatus }).unwrap();
      refetchLead();
      refetch();
      toast.success(
        `Lead pipeline stage updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`,
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newNote.trim()) return;

    try {
      await addNote({ id: selectedLeadId, note: newNote.trim() }).unwrap();
      setNewNote("");
      refetchLead();
      toast.success("Internal qualification note recorded.");
    } catch {
      toast.error("Failed to add note.");
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5201";
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== undefined)
        params.set("status", String(statusFilter));
      if (regionFilter) params.set("region", regionFilter);
      if (formKeyFilter) params.set("formKey", formKeyFilter);

      const res = await fetch(
        `${apiUrl}/api/v1/admin/leads/export?${params.toString()}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Verified leads CSV exported successfully.");
    } catch {
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Group leads for Kanban board
  const kanbanColumns = useMemo(() => {
    const items = leadsData?.items || [];
    return KANBAN_STAGES.map((col) => ({
      ...col,
      leads: items.filter((l) => l.status === col.status),
    }));
  }, [leadsData]);

  return (
    <div className="space-y-6">
      {/* Page Header with View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Leads & Inbound Funnel
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              {leadsData?.totalCount ?? 0} Inquiries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture, verify, and route high-intent website prospects.
            Interactive pipeline Kanban with DPDP Act / GDPR consent trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Directory</span>
            </button>
          </div>

          {hasPermission("leads.export") && (
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition disabled:opacity-50"
            >
              <Download
                className={`w-3.5 h-3.5 text-indigo-500 ${isExporting ? "animate-bounce" : ""}`}
              />
              <span>
                {isExporting ? "Exporting..." : "Export Verified CSV"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Funnel Strip */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Capture
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {statsData.totalLeads}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              New Inquiries
            </div>
            <div className="mt-1 text-2xl font-black text-blue-800 dark:text-blue-300">
              {statsData.newLeads}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              In Progress
            </div>
            <div className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-300">
              {statsData.inProgressLeads}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Qualified Leads
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300">
              {statsData.qualifiedLeads}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Retainer Closed
            </div>
            <div className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-200">
              {statsData.closedLeads}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex-1">
          <SearchInput
            placeholder="Search leads by name, email, company, or message..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">🌐 All Regions</option>
            {dynamicRegions?.map((r) => (
              <option key={r.id} value={r.code.toLowerCase()}>
                {r.flagEmoji} {r.name} ({r.code})
              </option>
            ))}
          </select>

          <select
            aria-label="Filter leads by source form"
            value={formKeyFilter}
            onChange={(e) => {
              setFormKeyFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">📂 All Lead Sources</option>
            <option value="contact">Contact Inquiry</option>
            <option value="booking">Strategy Booking</option>
            <option value="newsletter">Newsletter Subscriber</option>
          </select>

          {viewMode === "table" && (
            <select
              value={statusFilter !== undefined ? statusFilter : ""}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value === "" ? undefined : Number(e.target.value),
                );
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">⚡ All Funnel Stages</option>
              {dynamicStages?.map((s) => (
                <option key={s.id} value={s.value}>
                  {s.displayName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content: Kanban Pipeline vs Table */}
      {viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW (Horizontal Scrollable Strip, never squashed or stacked) */
        <div className="flex gap-4 items-start overflow-x-auto pb-6 w-full">
          {kanbanColumns.map((col) => (
            <div
              key={col.status}
              className="w-72 sm:w-80 shrink-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-3 min-h-[520px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      col.color === "blue"
                        ? "bg-blue-500"
                        : col.color === "amber"
                          ? "bg-amber-500"
                          : col.color === "purple"
                            ? "bg-purple-500"
                            : col.color === "emerald"
                              ? "bg-emerald-500"
                              : "bg-slate-500"
                    }`}
                  />
                  <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                    {col.label}
                  </h3>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {col.leads.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {col.leads.map((lead) => {
                  const reg = REGION_FLAGS[lead.region.toLowerCase()] || {
                    flag: "🌐",
                    label: lead.region,
                  };
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {lead.company || lead.fullName}
                          </h4>
                          {lead.company && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {lead.fullName}
                            </p>
                          )}
                        </div>
                        <span className="text-xs" title={reg.label}>
                          {reg.flag}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>
                            {new Date(lead.createdAtUtc).toLocaleDateString()}
                          </span>
                          {lead.assignedToUserId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>
                                {usersData?.items.find((u) => u.id === lead.assignedToUserId)?.fullName.split(" ")[0] || "Assigned"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </div>

                        {col.nextAction && hasPermission("leads.manage") && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                lead.id,
                                (lead.status + 1) as LeadStatus,
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold transition"
                            title={`Advance to next stage`}
                          >
                            <span>{col.nextAction}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {col.leads.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE DIRECTORY VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={7} hasControls={false} />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
                  <tr>
                    <th className="px-3 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          Boolean(
                            leadsData?.items &&
                              leadsData.items.length > 0 &&
                              leadsData.items.every((l) =>
                                selectedLeadIds.includes(l.id),
                              ),
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds(
                              leadsData?.items?.map((l) => l.id) || [],
                            );
                          } else {
                            setSelectedLeadIds([]);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary cursor-pointer w-3.5 h-3.5"
                        aria-label="Select all leads on current page"
                      />
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      Prospect / Contact
                    </th>
                    <th className="px-4 py-3.5 text-left">Organization</th>
                    <th className="px-4 py-3.5 text-left">Territory</th>
                    <th className="px-4 py-3.5 text-left">Lifecycle Stage</th>
                    <th className="px-4 py-3.5 text-left">Assignee</th>
                    <th className="px-4 py-3.5 text-left">Capture Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {leadsData?.items?.map((lead) => {
                    const dynStage = dynamicStages?.find(
                      (s) => s.value === lead.status,
                    );
                    const conf =
                      STATUS_CONFIG[lead.status] || STATUS_CONFIG[0]!;
                    const dynRegion = dynamicRegions?.find(
                      (r) => r.code.toLowerCase() === lead.region.toLowerCase(),
                    );
                    const reg = dynRegion
                      ? {
                          flag: dynRegion.flagEmoji,
                          label: `${dynRegion.name} (${dynRegion.code})`,
                        }
                      : REGION_FLAGS[lead.region.toLowerCase()] || {
                          flag: "🌐",
                          label: lead.region.toUpperCase(),
                        };
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group ${
                          isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                      >
                        <td
                          className="px-3 py-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id)
                                  ? prev.filter((id) => id !== lead.id)
                                  : [...prev, lead.id],
                              );
                            }}
                            className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary cursor-pointer w-3.5 h-3.5"
                            aria-label={`Select ${lead.fullName}`}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-[11px] flex-shrink-0 group-hover:scale-105 transition-transform">
                              {getInitials(lead.fullName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {lead.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {lead.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                          {lead.company || "—"}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                            <span>{reg.flag}</span>
                            <span className="font-mono uppercase">
                              {lead.region}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.badgeClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`}
                            />
                            <span>{dynStage?.displayName || conf.label}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {lead.assignedToUserId ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>
                                {usersData?.items.find(
                                  (u) => u.id === lead.assignedToUserId,
                                )?.fullName || "Assigned"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(lead.createdAtUtc).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadId(lead.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {leadsData?.items?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <EmptyState
                          title="No leads matched"
                          description="No inquiries or leads matched your current search filters."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          {leadsData && leadsData.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
              <span className="text-slate-400">
                Page {leadsData.page} of {leadsData.totalPages} (
                {leadsData.totalCount} leads)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={page >= leadsData.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Detailed Lead Dossier Drawer */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200/80 dark:border-slate-800/80 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Prospect Executive Dossier
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedLeadId}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLead && (
              <div className="space-y-5">
                {/* Status Switcher & Convert Action */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pipeline Stage:
                    </span>
                    {hasPermission("leads.manage") ? (
                      <select
                        value={selectedLead.status}
                        disabled={isUpdatingStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedLead.id,
                            Number(e.target.value) as LeadStatus,
                          )
                        }
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="0">New Inquiry</option>
                        <option value="1">Under Evaluation</option>
                        <option value="2">Contacted</option>
                        <option value="3">Qualified (SQL)</option>
                        <option value="4">Converted / Closed</option>
                        <option value="5">Spam Filtered</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold">
                        {STATUS_CONFIG[selectedLead.status]?.label}
                      </span>
                    )}
                  </div>

                  {hasPermission("leads.manage") && (
                    <button
                      type="button"
                      disabled={isConverting}
                      onClick={() => setIsConvertConfirmOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {isConverting
                          ? "Promoting Account..."
                          : "Promote to Client Account"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Staff Assignment & Direct Outreach */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Assigned Specialist:</span>
                    </span>
                    {hasPermission("leads.manage") ? (
                      <select
                        value={selectedLead.assignedToUserId || ""}
                        disabled={isAssigningLead}
                        onChange={(e) =>
                          handleAssignChange(
                            selectedLead.id,
                            e.target.value ? e.target.value : null,
                          )
                        }
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Unassigned --</option>
                        {usersData?.items
                          .filter((u) => u.status !== 2)
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName} ({u.role})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {usersData?.items.find(
                          (u) => u.id === selectedLead.assignedToUserId,
                        )?.fullName || "Unassigned"}
                      </span>
                    )}
                  </div>

                  {hasPermission("leads.manage") && (
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition"
                    >
                      <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Send Direct Outbound Email</span>
                    </button>
                  )}
                </div>

                {/* Contact Dossier */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Contact Coordinates
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Email
                      </span>
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>{selectedLead.email}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Phone
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedLead.phone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Organization
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedLead.company || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        Jurisdiction
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedLead.state ? `${selectedLead.state}, ` : ""}
                        {selectedLead.region.toUpperCase()}{" "}
                        {selectedLead.postalCode || ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy & Compliance Evidence */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>DPDP Act & GDPR Compliance Proof</span>
                  </h3>
                  <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Explicit Consent:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedLead.consentGiven ? "Verified (Yes)" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Policy Version:</span>
                      <span className="font-mono">
                        {selectedLead.consentWordingVersion || "v1.2"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Recorded IP Address:
                      </span>
                      <span className="font-mono text-slate-400">
                        {selectedLead.ipAddress || "—"}
                      </span>
                    </div>

                    {hasPermission("leads.manage") && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAnonymizeConfirmOpen(true)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Anonymize PII</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleteConfirmOpen(true)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-semibold text-[11px] hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge Record</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow-up Note Form */}
                {hasPermission("leads.manage") && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Record Internal Call / Outreach Note
                    </label>
                    <textarea
                      rows={2}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add qualification notes, client budget, or action items..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isAddingNote || !newNote.trim()}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-sm"
                      >
                        {isAddingNote ? "Recording..." : "Post Note"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Activity Trail */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Outreach Timeline
                  </h3>
                  <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 ml-2">
                    {selectedLead.activities?.map((act) => (
                      <div key={act.id} className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {act.description}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(act.createdAtUtc).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Convert Lead Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConvertConfirmOpen}
        title="Promote Lead to Client Account"
        description={
          selectedLead
            ? `Promote "${selectedLead.company || selectedLead.fullName}" to an active enterprise Client account? A dedicated client workspace and onboarding kickoff task will be generated.`
            : ""
        }
        confirmText="Promote to Client"
        cancelText="Cancel"
        variant="primary"
        isLoading={isConverting}
        onConfirm={handleConfirmConvert}
        onClose={() => setIsConvertConfirmOpen(false)}
      />

      {/* Anonymize Lead Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isAnonymizeConfirmOpen}
        title="Anonymize Lead Record (DPDP / GDPR)"
        description={
          selectedLead
            ? `Are you sure you want to anonymize all personally identifiable information (PII) for "${selectedLead.fullName}"? This action will redact contact info and mark consent as withdrawn.`
            : ""
        }
        confirmText="Anonymize PII"
        cancelText="Cancel"
        variant="danger"
        isLoading={isAnonymizing}
        onConfirm={handleAnonymizeLead}
        onClose={() => setIsAnonymizeConfirmOpen(false)}
      />

      {/* Delete Lead Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Permanently Purge Lead Record"
        description={
          selectedLead
            ? `Permanently delete the record for "${selectedLead.fullName}" (${selectedLead.email})? This action cannot be undone.`
            : ""
        }
        confirmText="Purge Permanently"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingLead}
        onConfirm={handleDeleteLead}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      {/* Send Direct Outbound Email Modal */}
      {isEmailModalOpen && selectedLead && (
        <div className="fixed inset-0 z-60 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Send Direct Email to Lead</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dispatches via Nexora transactional SMTP outbox
                </p>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Recipient
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  {selectedLead.fullName} &lt;{selectedLead.email}&gt;
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Template
                </label>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {emailTemplates && emailTemplates.length > 0 ? (
                    emailTemplates.map((tpl) => (
                      <option key={tpl.key} value={tpl.key}>
                        {tpl.name} ({tpl.key})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="lead-auto-reply">
                        Inquiry Auto-Reply (lead-auto-reply)
                      </option>
                      <option value="client-welcome">
                        Client Welcome &amp; Onboarding (client-welcome)
                      </option>
                      <option value="lead-assigned-notification">
                        Staff Alert (lead-assigned-notification)
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Custom Message / Note Variable (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  placeholder="Add custom greeting or message for the template variable..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingEmailAction}
                onClick={handleSendLeadEmail}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSendingEmailAction ? "Dispatching..." : "Send Email"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Batch Actions Bar (Linear Style) */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-150 border border-slate-700/60 dark:border-slate-300/60">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {selectedLeadIds.length} {selectedLeadIds.length === 1 ? "lead" : "leads"} selected
          </span>
          <div className="h-4 w-px bg-slate-700 dark:bg-slate-300" />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-200 dark:hover:bg-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedLeadIds([])}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 text-xs transition cursor-pointer ml-1"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};
