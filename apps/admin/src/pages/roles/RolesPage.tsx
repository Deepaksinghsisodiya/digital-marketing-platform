import React, { useState } from "react";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
} from "../../store/api/adminApi";
import type { RoleDto } from "../../types";
import {
  ShieldCheck,
  Check,
  Minus,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

const PERMISSION_METADATA: Record<
  string,
  { label: string; description: string; category: string }
> = {
  "users.view": {
    label: "View Users",
    description:
      "Inspect team member accounts, login activity, and active roles",
    category: "Users & Access",
  },
  "users.manage": {
    label: "Manage Users",
    description:
      "Invite new operators, suspend accounts, and update role bindings",
    category: "Users & Access",
  },
  "roles.view": {
    label: "View RBAC Matrix",
    description:
      "Inspect security policy matrix and evaluated role permissions",
    category: "Security & Roles",
  },
  "audit.view": {
    label: "View Security Audit Log",
    description:
      "Access immutable forensic audit trail and request correlation telemetry",
    category: "Security & Roles",
  },
  "settings.view": {
    label: "View Platform Settings",
    description:
      "Read enterprise identity, regional presets, and multi-country configurations",
    category: "System Settings",
  },
  "settings.manage": {
    label: "Modify Platform Settings",
    description:
      "Update company branding, custom SMTP mail gateway, and global visibility",
    category: "System Settings",
  },
  "pages.view": {
    label: "View CMS Pages",
    description:
      "Browse CMS block schemas, draft versions, and sitemap entries",
    category: "Website CMS & Content",
  },
  "pages.edit": {
    label: "Edit CMS Pages",
    description:
      "Create draft versions, arrange block trees, and configure schema properties",
    category: "Website CMS & Content",
  },
  "pages.publish": {
    label: "Publish CMS Pages",
    description:
      "Promote draft pages live to the public website CDN and SSR engine",
    category: "Website CMS & Content",
  },
  "leads.view": {
    label: "View Inbound Leads",
    description:
      "Review captured marketing inquiries, UTM attribution, and consent logs",
    category: "Inbound Marketing",
  },
  "leads.manage": {
    label: "Manage Lead Funnel",
    description:
      "Update pipeline statuses, append audit notes, and assign handlers",
    category: "Inbound Marketing",
  },
  "leads.export": {
    label: "Export Lead Data",
    description:
      "Download bulk customer inquiries and compliance verification data",
    category: "Inbound Marketing",
  },
  "clients.view": {
    label: "View Agency Clients",
    description:
      "Browse CRM client directory, primary contacts, and interaction history",
    category: "Agency CRM",
  },
  "clients.manage": {
    label: "Manage Agency Clients",
    description:
      "Convert leads to client accounts, modify contracts, and assign contacts",
    category: "Agency CRM",
  },
  "tasks.view": {
    label: "View Tasks & Actions",
    description:
      "Track follow-ups, account action items, and milestone deadlines",
    category: "Task Operations",
  },
  "tasks.manage": {
    label: "Manage Tasks & Deadlines",
    description:
      "Create action items, assign users, prioritize urgencies, and resolve tasks",
    category: "Task Operations",
  },
};

export const RolesPage: React.FC = () => {
  const {
    data: roles,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRolesQuery();
  const {
    data: permissions,
    isLoading: permsLoading,
    refetch: refetchPerms,
  } = useGetPermissionsQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRolePermissions, { isLoading: isUpdating }] =
    useUpdateRolePermissionsMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (rolesLoading || permsLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Role-Based Access Control matrix...</span>
      </div>
    );
  }

  const roleList = roles || [];
  const permList = permissions || [];

  // Group permissions by Category
  const groupedPerms = permList.reduce(
    (acc, permKey) => {
      const meta = PERMISSION_METADATA[permKey] || {
        label: permKey,
        description: permKey,
        category: "Additional Capabilities",
      };
      if (!acc[meta.category]) {
        acc[meta.category] = [];
      }
      acc[meta.category]!.push({ key: permKey, ...meta });
      return acc;
    },
    {} as Record<
      string,
      { key: string; label: string; description: string; category: string }[]
    >,
  );

  const openCreateModal = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRolePermissions([]);
    setCreateModalOpen(true);
  };

  const openEditModal = (role: RoleDto) => {
    setEditingRole(role);
    setSelectedPermissions(
      role.name === "Owner" ? [...permList] : [...role.permissions],
    );
    setEditRoleModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await createRole({
        roleName: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        permissions: newRolePermissions,
      }).unwrap();

      setCreateModalOpen(false);
      refetchRoles();
      setFeedback({
        type: "success",
        message: `Custom role '${newRoleName}' created with ${newRolePermissions.length} permissions!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      alert(errorObj?.data?.error || "Failed to create role.");
    }
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setFeedback(null);

    try {
      await updateRolePermissions({
        roleName: editingRole.name,
        permissions: selectedPermissions,
      }).unwrap();

      setEditRoleModalOpen(false);
      refetchRoles();
      setFeedback({
        type: "success",
        message: `Permissions updated for role '${editingRole.name}'! Changes applied immediately.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      alert(errorObj?.data?.error || "Failed to update role permissions.");
    }
  };

  const handleDelete = async (roleName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete role '${roleName}'? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteRole(roleName).unwrap();
      refetchRoles();
      setFeedback({
        type: "success",
        message: `Role '${roleName}' has been deleted successfully.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      alert(errorObj?.data?.error || "Failed to delete role.");
    }
  };

  const isSystemRole = (name: string) =>
    ["Owner", "Admin", "Editor", "Sales"].includes(name);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Roles & Permissions Matrix (RBAC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              {roleList.length} Roles Defined
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Granular access controls enforced server-side via ASP.NET Core
            dynamic claim policies and security stamps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetchRoles();
              refetchPerms();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleList.map((r) => {
          const isSys = isSystemRole(r.name);
          const permCount =
            r.name === "Owner" ? permList.length : r.permissions.length;
          return (
            <div
              key={r.name}
              className="p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {r.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSys
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40"
                    }`}
                  >
                    {isSys ? "System" : "Custom"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {r.description || "Platform operational role"}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {permCount}
                  </strong>{" "}
                  of {permList.length} perms
                </span>

                <div className="flex items-center gap-1.5">
                  {r.name !== "Owner" && (
                    <button
                      type="button"
                      onClick={() => openEditModal(r)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Configure Permissions"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isSys && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.name)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Granular Permissions Matrix */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Complete Granular Authorization Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click edit on any custom role card above to adjust individual
            permissions.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5 w-1/3">Capability & Description</th>
                {roleList.map((r) => (
                  <th key={r.name} className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Object.entries(groupedPerms).map(([category, items]) => (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                    <td
                      colSpan={roleList.length + 1}
                      className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
                    >
                      {category}
                    </td>
                  </tr>

                  {items.map((perm) => (
                    <tr
                      key={perm.key}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {perm.label}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {perm.key}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </td>

                      {roleList.map((r) => {
                        const hasPerm =
                          r.name === "Owner" ||
                          r.permissions.includes(perm.key);
                        return (
                          <td key={r.name} className="px-4 py-3 text-center">
                            {hasPerm ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600">
                                <Minus className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create New Custom Role
                </h3>
                <p className="text-xs text-slate-500">
                  Assign tailored granular permissions to suit your agency
                  organizational chart.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="space-y-4 overflow-y-auto pr-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Marketing Manager, Content Auditor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Description
                  </label>
                  <input
                    type="text"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="e.g. Can draft content and inspect leads"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Granted Permissions ({newRolePermissions.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewRolePermissions(
                        newRolePermissions.length === permList.length
                          ? []
                          : [...permList],
                      )
                    }
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {newRolePermissions.length === permList.length
                      ? "Deselect All"
                      : "Select All Capabilities"}
                  </button>
                </div>

                <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                  {Object.entries(groupedPerms).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((perm) => {
                          const checked = newRolePermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition ${
                                checked
                                  ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRolePermissions([
                                      ...newRolePermissions,
                                      perm.key,
                                    ]);
                                  } else {
                                    setNewRolePermissions(
                                      newRolePermissions.filter(
                                        (k) => k !== perm.key,
                                      ),
                                    );
                                  }
                                }}
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white block">
                                  {perm.label}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {perm.key}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Save Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Permissions Modal */}
      {editRoleModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Configure Permissions: {editingRole.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Update permissions for this role. Active users with this role
                  will immediately inherit these capabilities.
                </p>
              </div>
              <button
                onClick={() => setEditRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSavePermissions}
              className="space-y-4 overflow-y-auto pr-1"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Capabilities ({selectedPermissions.length} /{" "}
                  {permList.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPermissions(
                      selectedPermissions.length === permList.length
                        ? []
                        : [...permList],
                    )
                  }
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {selectedPermissions.length === permList.length
                    ? "Deselect All"
                    : "Select All Capabilities"}
                </button>
              </div>

              <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                {Object.entries(groupedPerms).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((perm) => {
                        const checked = selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition ${
                              checked
                                ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                                : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([
                                    ...selectedPermissions,
                                    perm.key,
                                  ]);
                                } else {
                                  setSelectedPermissions(
                                    selectedPermissions.filter(
                                      (k) => k !== perm.key,
                                    ),
                                  );
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {perm.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {perm.key}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Save Role Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
