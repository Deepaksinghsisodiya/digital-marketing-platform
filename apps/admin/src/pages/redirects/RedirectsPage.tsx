import React, { useState, useMemo } from "react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import type { RedirectRule } from "../../types";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { toast } from "../../utils/toast";
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Link2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

export const RedirectsPage: React.FC = () => {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] =
    useUpdateSettingsMutation();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RedirectRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<RedirectRule | null>(null);

  // Form State
  const [sourcePath, setSourcePath] = useState("");
  const [destinationPath, setDestinationPath] = useState("");
  const [statusCode, setStatusCode] = useState<number>(301);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Parse existing redirect rules
  const redirectRules: RedirectRule[] = useMemo(() => {
    if (!settings?.redirectRulesJson) return [];
    try {
      const parsed = JSON.parse(settings.redirectRulesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [settings?.redirectRulesJson]);

  const filteredRules = useMemo(() => {
    if (!search.trim()) return redirectRules;
    const q = search.toLowerCase();
    return redirectRules.filter(
      (r) =>
        r.sourcePath.toLowerCase().includes(q) ||
        r.destinationPath.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [redirectRules, search]);

  const openCreateModal = () => {
    setEditingRule(null);
    setSourcePath("");
    setDestinationPath("");
    setStatusCode(301);
    setDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RedirectRule) => {
    setEditingRule(rule);
    setSourcePath(rule.sourcePath);
    setDestinationPath(rule.destinationPath);
    setStatusCode(rule.statusCode);
    setDescription(rule.description || "");
    setIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const saveRulesToSettings = async (updatedRules: RedirectRule[]) => {
    if (!settings) return;
    try {
      await updateSettings({
        ...settings,
        redirectRulesJson: JSON.stringify(updatedRules),
        versionToken: settings.versionToken,
      }).unwrap();
      toast.success("Redirect rules successfully updated!");
    } catch {
      toast.error("Failed to update redirect rules.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanSource = sourcePath.trim();
    if (!cleanSource.startsWith("/") && !cleanSource.startsWith("http")) {
      cleanSource = `/${cleanSource}`;
    }
    let cleanDest = destinationPath.trim();
    if (!cleanDest.startsWith("/") && !cleanDest.startsWith("http")) {
      cleanDest = `/${cleanDest}`;
    }

    if (cleanSource === cleanDest) {
      toast.error(
        "Source and destination paths cannot be identical (circular redirect loop).",
      );
      return;
    }

    let updated: RedirectRule[];
    if (editingRule) {
      updated = redirectRules.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              sourcePath: cleanSource,
              destinationPath: cleanDest,
              statusCode,
              description: description.trim() || undefined,
              isActive,
            }
          : r,
      );
    } else {
      const newRule: RedirectRule = {
        id: `redir-${Date.now()}`,
        sourcePath: cleanSource,
        destinationPath: cleanDest,
        statusCode,
        description: description.trim() || undefined,
        isActive,
        createdAtUtc: new Date().toISOString(),
      };
      updated = [newRule, ...redirectRules];
    }

    await saveRulesToSettings(updated);
    setIsModalOpen(false);
  };

  const handleToggleActive = async (ruleId: string) => {
    const updated = redirectRules.map((r) =>
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r,
    );
    await saveRulesToSettings(updated);
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    const updated = redirectRules.filter((r) => r.id !== ruleToDelete.id);
    await saveRulesToSettings(updated);
    setRuleToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              301 &amp; 302 URL Redirects
            </h1>
            <Badge variant="primary">SEO Authority</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map legacy and retired URLs to active landing pages to eliminate 404
            errors and preserve domain authority.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          New Redirect Rule
        </Button>
      </div>

      {/* KPI / Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Rules Configured
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
            {redirectRules.length}
          </div>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Permanent 301 Redirects
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {
              redirectRules.filter((r) => r.statusCode === 301 && r.isActive)
                .length
            }
          </div>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Status
          </div>
          <div className="text-2xl font-bold tracking-tight text-primary tabular-nums mt-1">
            {redirectRules.filter((r) => r.isActive).length} /{" "}
            {redirectRules.length}
          </div>
        </Card>
      </div>

      {/* Search Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search source path, target destination, or note..."
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
            Showing {filteredRules.length} rules
          </span>
        </div>
      </Card>

      {/* Redirect Rules Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={4} columns={6} hasControls={false} />
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Link2}
              title="No Redirect Rules Configured"
              description="Add 301 permanent redirects to safeguard inbound links when altering URL structures or retiring legacy pages."
              action={{
                label: "Create First Redirect",
                onClick: openCreateModal,
                icon: Plus,
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Source URL Path</th>
                  <th className="px-4 py-3.5">Target Destination</th>
                  <th className="px-4 py-3.5">HTTP Status</th>
                  <th className="px-4 py-3.5">Purpose / Notes</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredRules.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                      {r.sourcePath}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-900 dark:text-white">
                      {r.destinationPath}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={r.statusCode === 301 ? "success" : "warning"}
                        size="sm"
                      >
                        {r.statusCode === 301 ? "301 Perm" : "302 Temp"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {r.description || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(r.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                          r.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {r.isActive ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        <span>{r.isActive ? "Enabled" : "Disabled"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRuleToDelete(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingRule ? "Edit Redirect Rule" : "Create Redirect Rule"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define incoming path matching and HTTP status code
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Path (From) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/old-services or /agency/legacy"
                    value={sourcePath}
                    onChange={(e) => setSourcePath(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    The original URL path visitors or search engines request.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Target (To) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/services or https://example.com/target"
                    value={destinationPath}
                    onChange={(e) => setDestinationPath(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Relative internal route or absolute external URL.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      HTTP Response Status
                    </label>
                    <select
                      value={statusCode}
                      onChange={(e) => setStatusCode(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value={301}>301 Permanent (SEO Link Juice)</option>
                      <option value={302}>302 Temporary (Maintenance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rule State
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer h-[38px]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Rule Active
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Documentation Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Migration from old WordPress blog slug structure"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingRule ? "Save Rule Changes" : "Create Redirect"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rule Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(ruleToDelete)}
        title="Delete Redirect Rule?"
        description={`Are you sure you want to remove redirect rule from "${ruleToDelete?.sourcePath}" to "${ruleToDelete?.destinationPath}"? Incoming requests to this path will result in standard 404 responses.`}
        confirmText="Delete Rule"
        variant="danger"
        onConfirm={handleDeleteRule}
        onClose={() => setRuleToDelete(null)}
      />
    </div>
  );
};
