import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "../../utils/toast";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Save,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  X,
  Search,
  Megaphone,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import type { UpdateSiteSettingsRequest } from "../../types";

export interface AnnouncementItem {
  id: string;
  badge: string;
  text: string;
  linkText: string;
  linkUrl: string;
  enabled: boolean;
}

export interface AnnouncementBarPayload {
  enabled: boolean;
  autoplay: boolean;
  interval: number;
  items: AnnouncementItem[];
}

// Yup Validation Schema
export const announcementSchema = yup.object().shape({
  text: yup
    .string()
    .trim()
    .required("Announcement message is required.")
    .min(5, "Message must be at least 5 characters.")
    .max(200, "Message cannot exceed 200 characters."),
  badge: yup
    .string()
    .trim()
    .max(30, "Badge cannot exceed 30 characters.")
    .optional(),
  linkText: yup
    .string()
    .trim()
    .max(30, "Button text cannot exceed 30 characters.")
    .optional(),
  linkUrl: yup
    .string()
    .trim()
    .test(
      "valid-link",
      "Link must start with /, http://, https://, or #",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("#"),
    )
    .optional(),
  enabled: yup.boolean().required(),
});

export const AnnouncementBarPage: React.FC = () => {
  const { data: settings, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  // Local State (Hero Banner style)
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState<boolean>(true);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [interval, setInterval] = useState<number>(4000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Modal Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBadge, setFormBadge] = useState<string>("");
  const [formText, setFormText] = useState<string>("");
  const [formLinkText, setFormLinkText] = useState<string>("");
  const [formLinkUrl, setFormLinkUrl] = useState<string>("");
  const [formEnabled, setFormEnabled] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Parse announcementBarJson from settings on initial load
  useEffect(() => {
    if (!settings) return;

    if (settings.announcementBarJson) {
      try {
        const parsed = JSON.parse(settings.announcementBarJson);
        setGlobalEnabled(parsed.enabled !== false);
        setAutoplay(parsed.autoplay !== false);
        setInterval(typeof parsed.interval === "number" ? parsed.interval : 4000);

        if (Array.isArray(parsed.items)) {
          setItems(
            parsed.items.map((it: Partial<AnnouncementItem>, idx: number) => ({
              id: it.id || `ann-${Date.now()}-${idx + 1}`,
              badge: it.badge || "",
              text: it.text || "",
              linkText: it.linkText || "Explore →",
              linkUrl: it.linkUrl || "/services",
              enabled: it.enabled !== false,
            })),
          );
        } else if (parsed.text) {
          // Legacy single item fallback
          setItems([
            {
              id: "ann-1",
              badge: parsed.badge || "ANNOUNCEMENT",
              text: parsed.text,
              linkText: "Explore →",
              linkUrl: parsed.link || "/services",
              enabled: true,
            },
          ]);
        }
      } catch {
        // Fallback default
        setItems([
          {
            id: "ann-1",
            badge: "GROWTH ENGINE",
            text: "Enterprise Engine 2.0 Global B2B Performance Marketing is now live",
            linkText: "Explore →",
            linkUrl: "/services",
            enabled: true,
          },
        ]);
      }
    } else {
      setItems([
        {
          id: "ann-1",
          badge: "GROWTH ENGINE",
          text: "Enterprise Engine 2.0 Global B2B Performance Marketing is now live",
          linkText: "Explore →",
          linkUrl: "/services",
          enabled: true,
        },
      ]);
    }
    setHasUnsavedChanges(false);
  }, [settings]);

  // Persist all changes to API and Database
  const persistAnnouncementToApi = async (
    targetItems: AnnouncementItem[],
    targetGlobalEnabled: boolean,
    targetAutoplay: boolean,
    targetInterval: number,
    successMessage?: string,
  ) => {
    if (!settings) return;

    const payload: AnnouncementBarPayload = {
      enabled: targetGlobalEnabled,
      autoplay: targetAutoplay,
      interval: targetInterval,
      items: targetItems,
    };

    const updateRequest: UpdateSiteSettingsRequest = {
      companyName: settings.companyName,
      legalName: settings.legalName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      address: settings.address,
      defaultRegion: settings.defaultRegion,
      supportedRegions: settings.supportedRegions || ["IN", "US"],
      timeZoneId: settings.timeZoneId,
      logoMediaId: settings.logoMediaId,
      logoUrl: settings.logoUrl,
      faviconMediaId: settings.faviconMediaId,
      faviconUrl: settings.faviconUrl,
      versionToken: settings.versionToken,
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUseSsl: settings.smtpUseSsl,
      smtpUserName: settings.smtpUserName,
      smtpPassword: settings.smtpPassword,
      smtpFromEmail: settings.smtpFromEmail,
      smtpFromName: settings.smtpFromName,
      sectionVisibilityJson: settings.sectionVisibilityJson,
      themeTokensJson: settings.themeTokensJson,
      socialLinksJson: settings.socialLinksJson,
      trackingCodesJson: settings.trackingCodesJson,
      bookingUrl: settings.bookingUrl,
      announcementBarJson: JSON.stringify(payload),
    };

    try {
      await updateSettings(updateRequest).unwrap();
      await refetch();
      setHasUnsavedChanges(false);
      toast.success(
        successMessage ||
          "Announcement Bar changes saved and published live to website via API!",
      );
    } catch (err: unknown) {
      console.error("Failed to update announcement settings:", err);
      const errObj = err as { data?: { error?: string } };
      toast.error(
        errObj?.data?.error ||
          "Failed to save announcement bar changes. Please check permissions.",
      );
    }
  };

  const handleSaveToApi = async () => {
    await persistAnnouncementToApi(
      items,
      globalEnabled,
      autoplay,
      interval,
      "Announcement Bar changes saved and published live to website via API!",
    );
  };

  // Toggle Master Global Announcement Bar Switch (Persists to API)
  const handleToggleGlobal = async () => {
    const next = !globalEnabled;
    setGlobalEnabled(next);
    await persistAnnouncementToApi(
      items,
      next,
      autoplay,
      interval,
      next ? "Announcement Bar activated live!" : "Announcement Bar deactivated live!",
    );
  };

  // Change Rotation Interval (Persists to API)
  const handleIntervalChange = async (val: number) => {
    setInterval(val);
    await persistAnnouncementToApi(
      items,
      globalEnabled,
      autoplay,
      val,
      `Rotation interval set to ${val / 1000}s and saved!`,
    );
  };

  // Open Modal for "Add Announcement"
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormBadge("");
    setFormText("");
    setFormLinkText("Explore →");
    setFormLinkUrl("/services");
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Modal for "Edit Announcement"
  const handleOpenEditModal = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setFormBadge(item.badge);
    setFormText(item.text);
    setFormLinkText(item.linkText || "Explore →");
    setFormLinkUrl(item.linkUrl || "");
    setFormEnabled(item.enabled);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Submit Modal Form (Yup validation + local state update, NO auto-save)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const values = {
      badge: formBadge,
      text: formText,
      linkText: formLinkText,
      linkUrl: formLinkUrl,
      enabled: formEnabled,
    };

    try {
      await announcementSchema.validate(values, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((v) => {
          if (v.path && !errors[v.path]) {
            errors[v.path] = v.message;
          }
        });
        setFormErrors(errors);
        toast.error("Please resolve validation errors in the form.");
        return;
      }
    }

    let updated: AnnouncementItem[];
    if (editingId) {
      updated = items.map((it) =>
        it.id === editingId
          ? {
              ...it,
              badge: formBadge,
              text: formText,
              linkText: formLinkText,
              linkUrl: formLinkUrl,
              enabled: formEnabled,
            }
          : it,
      );
    } else {
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        badge: formBadge,
        text: formText,
        linkText: formLinkText,
        linkUrl: formLinkUrl,
        enabled: formEnabled,
      };
      updated = [...items, newItem];
    }

    setItems(updated);
    setIsFormOpen(false);

    // Persist immediately to API so refresh never reverts data
    await persistAnnouncementToApi(
      updated,
      globalEnabled,
      autoplay,
      interval,
      editingId
        ? "Announcement updated and saved directly to database!"
        : "New announcement added and saved directly to database!",
    );
  };

  // Delete Announcement (No auto-save)
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const updated = items.filter((it) => it.id !== itemToDelete);
    setItems(updated);
    setItemToDelete(null);

    await persistAnnouncementToApi(
      updated,
      globalEnabled,
      autoplay,
      interval,
      "Announcement removed and saved to database!",
    );
  };

  // Toggle Individual Status (Persists directly to backend)
  const handleToggleItemStatus = async (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, enabled: !it.enabled } : it,
    );
    setItems(updated);
    const target = updated.find((it) => it.id === id);

    await persistAnnouncementToApi(
      updated,
      globalEnabled,
      autoplay,
      interval,
      target?.enabled
        ? "Announcement activated and published live!"
        : "Announcement deactivated and published live!",
    );
  };

  // Reorder Item Up / Down (Persists directly to backend)
  const handleReorder = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const item = copy[idx]!;
    copy.splice(idx, 1);
    copy.splice(targetIdx, 0, item);
    setItems(copy);

    await persistAnnouncementToApi(
      copy,
      globalEnabled,
      autoplay,
      interval,
      "Announcement order updated and saved live!",
    );
  };

  const filteredItems = items.filter(
    (it) =>
      it.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.badge.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full space-y-6 pb-16 px-2 sm:px-4 lg:px-6">
      {/* 1. Header Toolbar (Full Width) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Announcement Bar Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control website top announcement messages, live rotation, and action links.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Master Global Switch */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              Announcement Bar
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={globalEnabled}
              onClick={handleToggleGlobal}
              disabled={isSaving}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                globalEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
              title={
                globalEnabled
                  ? "Bar Active on Live Site (Click to deactivate)"
                  : "Bar Hidden from Live Site (Click to activate)"
              }
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                  globalEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-semibold min-w-16 ${
                globalEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {globalEnabled ? "Active" : "Deactivated"}
            </span>
          </div>

          {/* Rotate Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span className="text-slate-500">Rotate:</span>
            <select
              value={interval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={isSaving}
              className="bg-transparent text-slate-900 dark:text-white font-bold outline-hidden cursor-pointer"
            >
              <option value={3000}>3 sec</option>
              <option value={4000}>4 sec</option>
              <option value={5000}>5 sec</option>
              <option value={7000}>7 sec</option>
            </select>
          </div>

          {/* Add New Announcement Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Announcement</span>
          </button>

          {/* SAVE CHANGES BUTTON */}
          <button
            type="button"
            onClick={handleSaveToApi}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/35 ring-2 ring-emerald-500/50 hover:scale-[1.03] active:scale-[0.98]"
                : "bg-emerald-600/90 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving
                ? "Saving Changes..."
                : hasUnsavedChanges
                  ? "Save Changes *"
                  : "Save Changes"}
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Full-Width Data Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden w-full">
        {/* Table Top Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcement message or badge..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total: <strong>{items.length}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Active: {items.filter((it) => it.enabled !== false).length}
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Hidden: {items.filter((it) => it.enabled === false).length}
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-7 h-7 animate-spin text-primary mx-auto mb-2" />
            <span className="text-xs text-slate-500 font-semibold">
              Fetching announcement bar configuration from API...
            </span>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchQuery ? "No matching announcements" : "No Announcements Configured"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              {searchQuery
                ? `No announcements matched "${searchQuery}". Clear search or add a new announcement.`
                : "Add your first top-bar announcement with custom badge, text, and action CTA."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Announcement</span>
            </button>
          </div>
        ) : (
          /* Full Width Clean Table */
          <div className="overflow-x-auto w-full max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 w-20 text-center"># Order</th>
                  <th className="py-3.5 px-4 w-44">Badge / Pill</th>
                  <th className="py-3.5 px-4">Announcement Message</th>
                  <th className="py-3.5 px-4 w-52">CTA Action</th>
                  <th className="py-3.5 px-4 w-36 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Order & Reorder Arrows */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono font-bold text-slate-400 text-xs w-6">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleReorder(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(idx, "down")}
                            disabled={idx === items.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Badge / Pill */}
                    <td className="px-4 py-4">
                      {item.badge ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 text-[10px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span>{item.badge}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Message */}
                    <td className="px-4 py-4">
                      <p className="text-slate-900 dark:text-white font-semibold line-clamp-2">
                        {item.text}
                      </p>
                    </td>

                    {/* CTA Button */}
                    <td className="px-4 py-4">
                      {item.linkUrl ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <span>{item.linkText || "Explore"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono text-slate-400">
                            ({item.linkUrl})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No link</span>
                      )}
                    </td>

                    {/* Status Sliding Toggle */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.enabled}
                          onClick={() => handleToggleItemStatus(item.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            item.enabled
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                          title={
                            item.enabled
                              ? "Active (Click to hide)"
                              : "Hidden (Click to activate)"
                          }
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                              item.enabled ? "translate-x-4.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-semibold min-w-12 text-left ${
                            item.enabled
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400"
                          }`}
                        >
                          {item.enabled ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition cursor-pointer"
                          title="Edit announcement"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Modal Form (Positioned strictly below header top-14 with zero blur over navbar) */}
      {isFormOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {editingId ? (
                    <Edit3 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingId ? "Edit Announcement" : "Create New Announcement"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveModal}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Badge Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. ENTERPRISE 2.0, LIMITED OFFER, NEW"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary uppercase tracking-wider font-semibold"
                  />
                  {formErrors.badge && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      {formErrors.badge}
                    </p>
                  )}
                </div>

                {/* Announcement Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formText}
                    onChange={(e) => {
                      setFormText(e.target.value);
                      if (formErrors.text)
                        setFormErrors((prev) => ({ ...prev, text: "" }));
                    }}
                    placeholder="e.g. Connect your enterprise with AI campaign automation and real-time attribution."
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 leading-relaxed ${
                      formErrors.text
                        ? "border-rose-500 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                    }`}
                  />
                  {formErrors.text && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.text}</span>
                    </p>
                  )}
                </div>

                {/* CTA Button Text & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={formLinkText}
                      onChange={(e) => setFormLinkText(e.target.value)}
                      placeholder="e.g. Explore →"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formLinkUrl}
                      onChange={(e) => {
                        setFormLinkUrl(e.target.value);
                        if (formErrors.linkUrl)
                          setFormErrors((prev) => ({ ...prev, linkUrl: "" }));
                      }}
                      placeholder="e.g. /services or /contact"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 font-mono ${
                        formErrors.linkUrl
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                      }`}
                    />
                    {formErrors.linkUrl && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {formErrors.linkUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Toggle in Modal */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active on Website:
                  </span>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setFormEnabled(!formEnabled)}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formEnabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormEnabled(!formEnabled);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        formEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                          formEnabled ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                      {formEnabled ? "Active" : "Deactivated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? "Save Changes" : "Create Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Announcement Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Delete Announcement"
        description="Are you sure you want to remove this announcement from the ticker bar? You must click 'Save Changes' to push the update live."
        confirmText="Remove Announcement"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteItem}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
