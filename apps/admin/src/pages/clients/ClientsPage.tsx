import React, { useState } from "react";
import {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientStatusMutation,
  useAddClientContactMutation,
  useAddClientActivityMutation,
  useCreateTaskMutation,
  useGetPipelineStagesQuery,
  useGetCountryRegionsQuery,
} from "../../store/api/adminApi";
import type { ClientSummary, ClientStatus } from "../../types";
import {
  Briefcase,
  Building2,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  X,
  UserCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  1: {
    label: "Active Account",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  2: {
    label: "Prospect",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  3: {
    label: "Inactive",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
  },
  4: {
    label: "Churned",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
};

const REGION_FLAGS: Record<string, { flag: string; name: string }> = {
  in: { flag: "🇮🇳", name: "India" },
  us: { flag: "🇺🇸", name: "United States" },
  ae: { flag: "🇦🇪", name: "UAE" },
  gb: { flag: "🇬🇧", name: "UK" },
  sg: { flag: "🇸🇬", name: "Singapore" },
};

export const ClientsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: dynamicStages } = useGetPipelineStagesQuery({ category: "Client" });
  const { data: dynamicRegions } = useGetCountryRegionsQuery();

  // Queries & Mutations
  const { data: clientsData, isLoading } = useGetClientsQuery({
    page,
    pageSize: 15,
    search: search || undefined,
    region: selectedRegion || undefined,
    status: selectedStatus,
  });

  const [createClient, { isLoading: creatingClient }] = useCreateClientMutation();
  const [updateClientStatus] = useUpdateClientStatusMutation();
  const [addContact] = useAddClientContactMutation();
  const [addActivity] = useAddClientActivityMutation();
  const [createTask] = useCreateTaskMutation();

  // Selected client for detail slide-over
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { data: clientDetail, isLoading: loadingDetail } = useGetClientByIdQuery(
    selectedClientId!,
    { skip: !selectedClientId }
  );

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const [newClientRegion, setNewClientRegion] = useState("in");
  const [createError, setCreateError] = useState<string | null>(null);

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("");

  // Activity note state
  const [newActivityNote, setNewActivityNote] = useState("");

  // New task state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await createClient({
        name: newClientName,
        primaryContactEmail: newClientEmail,
        primaryContactPhone: newClientPhone || undefined,
        industry: newClientIndustry || undefined,
        region: newClientRegion,
      }).unwrap();

      setCreateModalOpen(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientIndustry("");
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setCreateError(error?.data?.error ?? "Failed to create client.");
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    try {
      await addContact({
        clientId: selectedClientId,
        fullName: newContactName,
        email: newContactEmail,
        phone: newContactPhone || undefined,
        title: newContactTitle || undefined,
      }).unwrap();
      setContactModalOpen(false);
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setNewContactTitle("");
    } catch {
      alert("Failed to add contact.");
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newActivityNote.trim()) return;
    try {
      await addActivity({
        clientId: selectedClientId,
        activityType: "Note",
        description: newActivityNote.trim(),
      }).unwrap();
      setNewActivityNote("");
    } catch {
      alert("Failed to record activity.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newTaskTitle.trim()) return;
    try {
      await createTask({
        clientId: selectedClientId,
        title: newTaskTitle.trim(),
        dueDateUtc: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
      }).unwrap();
      setTaskModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDueDate("");
    } catch {
      alert("Failed to create task.");
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

  const totalClients = clientsData?.totalCount ?? 0;
  const activeCount = clientsData?.items.filter((c) => c.status === 1).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Enterprise Accounts & CRM
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {totalClients} Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage institutional client portfolios, account stakeholders, SLA follow-up tasks, and interaction telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* MNC Executive KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Portfolio</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalClients}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Active enterprise accounts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeCount > 0 ? `${activeCount} Retainers` : "Enterprise"}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Under verified SLA</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Global Reach</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">India & US</div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Multi-currency & tax ready</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Security & Audit</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">SOC-2 Type II</div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Immutable audit trail</div>
        </div>
      </div>

      {/* Advanced Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0c1222] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search accounts by company, contact, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
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
            value={selectedStatus ?? ""}
            onChange={(e) =>
              setSelectedStatus(e.target.value ? (Number(e.target.value) as ClientStatus) : undefined)
            }
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">⚡ All Lifecycle Stages</option>
            {dynamicStages?.map((s) => (
              <option key={s.id} value={s.value}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MNC Data Table */}
      <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading enterprise client portfolio...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5 text-left">Company & Brand</th>
                  <th className="px-4 py-3.5 text-left">Primary Stakeholder</th>
                  <th className="px-4 py-3.5 text-left">Industry Sector</th>
                  <th className="px-4 py-3.5 text-left">Jurisdiction</th>
                  <th className="px-4 py-3.5 text-left">Status</th>
                  <th className="px-4 py-3.5 text-left">Active Tasks</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {clientsData?.items.map((c: ClientSummary) => {
                  const dynStage = dynamicStages?.find((s) => s.value === c.status);
                  const statusConf = STATUS_CONFIG[c.status] || STATUS_CONFIG[1];
                  const dynRegion = dynamicRegions?.find((r) => r.code.toLowerCase() === c.region.toLowerCase());
                  const reg = dynRegion
                    ? { flag: dynRegion.flagEmoji, name: dynRegion.name }
                    : (REGION_FLAGS[c.region.toLowerCase()] || {
                        flag: "🌐",
                        name: c.region.toUpperCase(),
                      });
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Company Name & Monogram Avatar */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-extrabold text-[11px] tracking-tight flex-shrink-0 group-hover:scale-105 transition-transform">
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {c.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-normal">
                              ID: {c.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {c.primaryContactEmail}
                        </div>
                        {c.primaryContactPhone && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{c.primaryContactPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {c.industry ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px]">
                            {c.industry}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Region */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                          <span>{reg.flag}</span>
                          <span className="font-mono uppercase">{c.region}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.badgeClass}`}
                          style={dynStage ? { borderColor: `${dynStage.colorHex}40`, backgroundColor: `${dynStage.colorHex}15`, color: dynStage.colorHex } : undefined}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} style={dynStage ? { backgroundColor: dynStage.colorHex } : undefined} />
                          <span>{dynStage?.displayName || statusConf.label}</span>
                        </span>
                      </td>

                      {/* Active Tasks */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.activeTasksCount}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientId(c.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/50 dark:border-indigo-800/50 transition-all ml-auto"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {clientsData?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No client accounts matching current search query or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {clientsData && clientsData.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
            <div>
              Showing {clientsData.items.length} of {clientsData.totalCount} accounts
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 text-xs font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page >= clientsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client Detail Slide-Over Drawer */}
      {selectedClientId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-[#0c1222] text-slate-900 dark:text-slate-100 w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto border-l border-slate-200/80 dark:border-slate-800/80">
            {loadingDetail || !clientDetail ? (
              <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading account dossier...</span>
              </div>
            ) : (
              <div className="p-6 md:p-8 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30">
                      {getInitials(clientDetail.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          {clientDetail.name}
                        </h2>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {clientDetail.region}
                        </span>
                      </div>
                      {clientDetail.industry && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {clientDetail.industry}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClientId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Switcher Bar */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Account Status:
                  </span>
                  <select
                    value={clientDetail.status}
                    onChange={async (e) => {
                      const newStatus = Number(e.target.value) as ClientStatus;
                      await updateClientStatus({ id: clientDetail.id, status: newStatus });
                    }}
                    className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">Active Account</option>
                    <option value="2">Prospect Opportunity</option>
                    <option value="3">Inactive</option>
                    <option value="4">Churned</option>
                  </select>
                </div>

                {/* Overview Dossier Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Primary Contact</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {clientDetail.primaryContactEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Direct Phone</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {clientDetail.primaryContactPhone ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Website</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {clientDetail.website ? (
                        <a
                          href={clientDetail.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          {clientDetail.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Tax ID / GSTIN</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {clientDetail.taxId ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Contacts Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Stakeholders & Contacts ({clientDetail.contacts.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Contact
                    </button>
                  </div>
                  <div className="space-y-2">
                    {clientDetail.contacts.map((con) => (
                      <div
                        key={con.id}
                        className="p-3 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/40"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{con.fullName}</span>
                            {con.isPrimary && (
                              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            {con.email} {con.phone && `• ${con.phone}`}
                          </div>
                        </div>
                        {con.title && (
                          <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                            {con.title}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Follow-up Tasks ({clientDetail.tasks.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setTaskModalOpen(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Task
                    </button>
                  </div>
                  <div className="space-y-2">
                    {clientDetail.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/40"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{task.title}</div>
                          {task.dueDateUtc && (
                            <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(task.dueDateUtc).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 3
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {task.status === 3 ? "Completed" : "In Progress"}
                        </span>
                      </div>
                    ))}
                    {clientDetail.tasks.length === 0 && (
                      <p className="text-xs text-slate-400">No scheduled tasks for this account.</p>
                    )}
                  </div>
                </div>

                {/* Activities / Timeline Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Activity Stream & Notes
                  </h3>

                  {/* Add note input */}
                  <form onSubmit={handleAddActivity} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Log meeting summary, executive note, or CRM update..."
                      value={newActivityNote}
                      onChange={(e) => setNewActivityNote(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-sm"
                    >
                      Post Note
                    </button>
                  </form>

                  <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 max-h-60 overflow-y-auto">
                    {clientDetail.activities.map((act) => (
                      <div
                        key={act.id}
                        className="text-xs border-b border-slate-200/60 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {act.activityType}
                          </span>
                          <span>{new Date(act.createdAtUtc).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 mt-1">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Register Institutional Account
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl border border-red-500/20 font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Apex Cloud Solutions"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="enterprise@company.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={newClientIndustry}
                  onChange={(e) => setNewClientIndustry(e.target.value)}
                  placeholder="e.g. Enterprise SaaS, FinTech, Logistics"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Operating Region
                </label>
                <select
                  value={newClientRegion}
                  onChange={(e) => setNewClientRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="in">🇮🇳 India (INR ₹)</option>
                  <option value="us">🇺🇸 United States (USD $)</option>
                  <option value="ae">🇦🇪 UAE (AED)</option>
                  <option value="gb">🇬🇧 United Kingdom (GBP)</option>
                  <option value="sg">🇸🇬 Singapore (SGD)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30"
                >
                  {creatingClient ? "Registering..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {contactModalOpen && selectedClientId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Add Key Stakeholder
            </h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Title
                </label>
                <input
                  type="text"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  placeholder="e.g. Chief Marketing Officer"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-sm"
                >
                  Save Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {taskModalOpen && selectedClientId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Schedule SLA Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Deliver Q1 Campaign Attribution Audit"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
