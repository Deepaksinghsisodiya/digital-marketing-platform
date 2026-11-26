import React, { useState, useEffect, useCallback } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  useGetAdminMenusQuery,
  useSaveAdminMenuMutation,
  useDeleteAdminMenuMutation,
  useGetPagesQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import type {
  NavigationMenuDto,
  NavigationMenuItemDto,
  SaveMenuItemRequest,
  SaveMenuRequest,
} from "../../types";
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  AlertCircle,
  FolderTree,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings2,
} from "lucide-react";
import {
  NavbarStudioPanel,
  LiveNavbarPreview,
  type NavbarPreviewState,
} from "./NavbarStudioPanel";
import { toast } from "../../utils/toast";

export const MenusPage: React.FC = () => {
  const { data: menus = [], isLoading, refetch } = useGetAdminMenusQuery();
  const { data: pagesData } = useGetPagesQuery({ pageSize: 100 });
  const { data: settings, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const [saveMenu, { isLoading: isSaving }] = useSaveAdminMenuMutation();
  const [showMetaSettings, setShowMetaSettings] = useState(false);
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteAdminMenuMutation();

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [activeMenuKey, setActiveMenuKey] = useState("");
  const [activeMenuTitle, setActiveMenuTitle] = useState("");
  const [activeMenuRegion, setActiveMenuRegion] = useState("");
  const [items, setItems] = useState<NavigationMenuItemDto[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Live Navbar Preview state synced from NavbarStudioPanel
  const [navPreview, setNavPreview] = useState<NavbarPreviewState>({
    companyName: "Nexora",
    tagline: "",
    logoPreviewUrl: null,
    showSearch: true,
    showCta: true,
    ctaText: "Book a Call",
    alignment: "center",
    sticky: true,
  });

  // Quick-add bar state
  const [quickLabel, setQuickLabel] = useState("");
  const [quickUrl, setQuickUrl] = useState("");
  const [quickError, setQuickError] = useState<string | null>(null);

  // Inline editing state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineLabel, setInlineLabel] = useState("");
  const [inlineUrl, setInlineUrl] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Collapsible parent rows
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  // Sub-link / Item Modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemParentId, setItemParentId] = useState("");
  const [itemErrors, setItemErrors] = useState<{ label?: string; url?: string }>({});

  // Create / Delete Menu Modal state
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false);
  const [isDeleteMenuConfirmOpen, setIsDeleteMenuConfirmOpen] = useState(false);
  const [newMenuKey, setNewMenuKey] = useState("");
  const [newMenuTitle, setNewMenuTitle] = useState("");
  const [newMenuRegion, setNewMenuRegion] = useState("");

  const availablePages = pagesData?.items || [];

  const hiddenUrlsSet = new Set<string>();
  if (settings?.themeTokensJson) {
    try {
      const parsed = JSON.parse(settings.themeTokensJson) as {
        navbarConfig?: { hiddenMenuUrls?: string[] };
      };
      (parsed.navbarConfig?.hiddenMenuUrls || []).forEach((u) =>
        hiddenUrlsSet.add(u.trim().toLowerCase()),
      );
    } catch {
      // ignore
    }
  }

  const handleToggleItemVisibility = async (url: string, label: string) => {
    if (!settings) return;
    const normalized = url.trim().toLowerCase();
    const nextHidden = new Set(hiddenUrlsSet);
    const willHide = !nextHidden.has(normalized);
    if (willHide) {
      nextHidden.add(normalized);
    } else {
      nextHidden.delete(normalized);
    }
    const hiddenMenuUrls = Array.from(nextHidden);

    let existingTokens: Record<string, unknown> = {};
    if (settings.themeTokensJson) {
      try {
        existingTokens = JSON.parse(settings.themeTokensJson) as Record<string, unknown>;
      } catch {
        existingTokens = {};
      }
    }
    const existingNavCfg = (existingTokens.navbarConfig || {}) as Record<string, unknown>;
    const mergedTokens = {
      ...existingTokens,
      navbarConfig: {
        ...existingNavCfg,
        hiddenMenuUrls,
      },
    };

    setNavPreview((prev) => ({ ...prev, hiddenMenuUrls }));
    try {
      await updateSettings({
        companyName: settings.companyName,
        legalName: settings.legalName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        address: settings.address,
        defaultRegion: settings.defaultRegion,
        supportedRegions: settings.supportedRegions || ["IN", "US"],
        timeZoneId: settings.timeZoneId,
        logoMediaId: settings.logoMediaId,
        faviconMediaId: settings.faviconMediaId,
        versionToken: settings.versionToken,
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUseSsl: settings.smtpUseSsl,
        smtpUserName: settings.smtpUserName,
        smtpPassword: settings.smtpPassword,
        smtpFromEmail: settings.smtpFromEmail,
        smtpFromName: settings.smtpFromName,
        sectionVisibilityJson: settings.sectionVisibilityJson,
        themeTokensJson: JSON.stringify(mergedTokens),
        socialLinksJson: settings.socialLinksJson,
        trackingCodesJson: settings.trackingCodesJson,
        bookingUrl: settings.bookingUrl,
        announcementBarJson: settings.announcementBarJson,
        redirectRulesJson: settings.redirectRulesJson,
        webhookUrl: settings.webhookUrl,
        customDomain: settings.customDomain,
        sslStatus: settings.sslStatus,
      }).unwrap();
      await refetchSettings();
      toast.success(
        willHide
          ? `"${label}" hidden from live website.`
          : `"${label}" activated on live website.`,
      );
    } catch {
      toast.error("Failed to update link visibility.");
    }
  };

  const handlePreviewChange = useCallback((next: NavbarPreviewState) => {
    setNavPreview(next);
  }, []);

  useEffect(() => {
    if (menus.length > 0 && !selectedMenuId) {
      const first = menus[0];
      if (first) {
        setSelectedMenuId(first.id);
        setActiveMenuKey(first.key);
        setActiveMenuTitle(first.title);
        setActiveMenuRegion(first.regionCode || "");
        setItems(first.items || []);
      }
    }
  }, [menus, selectedMenuId]);

  const handleSelectMenu = (m: NavigationMenuDto) => {
    setSelectedMenuId(m.id);
    setActiveMenuKey(m.key);
    setActiveMenuTitle(m.title);
    setActiveMenuRegion(m.regionCode || "");
    setItems(m.items || []);
    setHasUnsavedChanges(false);
    setInlineEditId(null);
    setQuickError(null);
  };

  const validateUrl = (url: string) =>
    url.startsWith("/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("#");

  const persistItemsToApi = async (
    nextItems: NavigationMenuItemDto[],
    successMsg = "Menu updated and published live!",
  ) => {
    setItems(nextItems);
    if (!selectedMenuId || !activeMenuKey.trim() || !activeMenuTitle.trim()) {
      setHasUnsavedChanges(true);
      return;
    }

    const payload: SaveMenuRequest = {
      key: activeMenuKey.trim().toLowerCase(),
      title: activeMenuTitle.trim(),
      regionCode: activeMenuRegion.trim() || null,
      items: buildSavePayloadItems(nextItems),
    };

    try {
      const updated = await saveMenu({ id: selectedMenuId, request: payload }).unwrap();
      setItems(updated.items || []);
      setHasUnsavedChanges(false);
      await refetch();
      toast.success(successMsg);
    } catch (err: unknown) {
      setHasUnsavedChanges(true);
      const errorObj = err as { data?: { error?: string } };
      toast.error(errorObj?.data?.error || "Failed to save menu changes.");
    }
  };

  const handleQuickAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = quickLabel.trim();
    const url = quickUrl.trim();
    if (!label || !url) {
      setQuickError("Enter both link label and URL.");
      return;
    }
    if (!validateUrl(url)) {
      setQuickError("URL must start with /, http://, https://, or #.");
      return;
    }
    setQuickError(null);
    const newItem: NavigationMenuItemDto = {
      id: crypto.randomUUID(),
      label,
      url,
      displayOrder: items.length,
      parentItemId: null,
      children: [],
    };
    const next = [...items, newItem];
    setQuickLabel("");
    setQuickUrl("");
    await persistItemsToApi(next, `"${label}" added and published live!`);
  };

  const handleStartInlineEdit = (item: NavigationMenuItemDto) => {
    setInlineEditId(item.id);
    setInlineLabel(item.label);
    setInlineUrl(item.url);
    setInlineError(null);
  };

  const handleCommitInlineEdit = async (itemId: string) => {
    const label = inlineLabel.trim();
    const url = inlineUrl.trim();
    if (!label || !url) {
      setInlineError("Label and URL cannot be empty.");
      return;
    }
    if (!validateUrl(url)) {
      setInlineError("URL must start with /, http://, https://, or #.");
      return;
    }

    const updateNode = (nodes: NavigationMenuItemDto[]): NavigationMenuItemDto[] =>
      nodes.map((n) => {
        if (n.id === itemId) {
          return { ...n, label, url };
        }
        if (n.children && n.children.length > 0) {
          return { ...n, children: updateNode(n.children) };
        }
        return n;
      });

    const next = updateNode(items);
    setInlineEditId(null);
    setInlineError(null);
    await persistItemsToApi(next, "Link updated and published live!");
  };

  const handleCreateMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuKey.trim() || !newMenuTitle.trim()) return;

    try {
      const req: SaveMenuRequest = {
        key: newMenuKey.trim().toLowerCase(),
        title: newMenuTitle.trim(),
        regionCode: newMenuRegion.trim() || null,
        items: [],
      };
      const created = await saveMenu({ request: req }).unwrap();
      setIsCreateMenuModalOpen(false);
      await refetch();
      handleSelectMenu(created);
      toast.success("Navigation menu created.");
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      toast.error(errorObj?.data?.error || "Failed to create menu.");
    }
  };

  const handleDeleteMenu = () => {
    if (!selectedMenuId) return;
    setIsDeleteMenuConfirmOpen(true);
  };

  const confirmDeleteMenu = async () => {
    if (!selectedMenuId) return;
    try {
      await deleteMenu(selectedMenuId).unwrap();
      setSelectedMenuId(null);
      setIsDeleteMenuConfirmOpen(false);
      await refetch();
      toast.success("Navigation menu deleted.");
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      toast.error(errorObj?.data?.error || "Failed to delete menu.");
    }
  };

  const buildSavePayloadItems = (
    list: NavigationMenuItemDto[],
    parentId: string | null = null,
  ): SaveMenuItemRequest[] => {
    let flat: SaveMenuItemRequest[] = [];
    list.forEach((item, index) => {
      flat.push({
        id: item.id,
        label: item.label,
        url: item.url,
        displayOrder: index,
        parentItemId: parentId,
      });
      if (item.children && item.children.length > 0) {
        flat = flat.concat(buildSavePayloadItems(item.children, item.id));
      }
    });
    return flat;
  };

  const handleSaveMenu = async () => {
    if (!selectedMenuId) return;
    if (!activeMenuKey.trim() || !activeMenuTitle.trim()) {
      toast.error("Menu title and lookup key are required.");
      return;
    }

    const payload: SaveMenuRequest = {
      key: activeMenuKey.trim().toLowerCase(),
      title: activeMenuTitle.trim(),
      regionCode: activeMenuRegion.trim() || null,
      items: buildSavePayloadItems(items),
    };

    try {
      const updated = await saveMenu({ id: selectedMenuId, request: payload }).unwrap();
      handleSelectMenu(updated);
      await refetch();
      setHasUnsavedChanges(false);
      toast.success("Navigation menu saved and published live!");
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      toast.error(errorObj?.data?.error || "Failed to save menu.");
    }
  };

  const handleOpenAddSubItem = (parentId: string) => {
    setEditingItemId(null);
    setItemLabel("");
    setItemUrl("");
    setItemParentId(parentId);
    setItemErrors({});
    setIsItemModalOpen(true);
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { label?: string; url?: string } = {};
    if (!itemLabel.trim()) errs.label = "Link label is required.";
    const urlTrimmed = itemUrl.trim();
    if (!urlTrimmed) {
      errs.url = "Target URL / path is required.";
    } else if (!validateUrl(urlTrimmed)) {
      errs.url = "URL must start with /, http://, https://, or #.";
    }
    if (errs.label || errs.url) {
      setItemErrors(errs);
      return;
    }

    const newItem: NavigationMenuItemDto = {
      id: crypto.randomUUID(),
      label: itemLabel.trim(),
      url: urlTrimmed,
      displayOrder: items.length,
      parentItemId: itemParentId || null,
      children: [],
    };

    let next: NavigationMenuItemDto[];
    if (!itemParentId) {
      next = [...items, newItem];
    } else {
      const addToParent = (nodes: NavigationMenuItemDto[]): NavigationMenuItemDto[] =>
        nodes.map((node) => {
          if (node.id === itemParentId) {
            return { ...node, children: [...(node.children || []), newItem] };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      next = addToParent(items);
      setCollapsedParents((prev) => ({ ...prev, [itemParentId]: false }));
    }

    setIsItemModalOpen(false);
    await persistItemsToApi(next, `"${newItem.label}" added and published live!`);
  };

  const handleDeleteItem = async (itemId: string) => {
    const removeNode = (nodes: NavigationMenuItemDto[]): NavigationMenuItemDto[] =>
      nodes
        .filter((node) => node.id !== itemId)
        .map((node) => ({
          ...node,
          children: node.children ? removeNode(node.children) : [],
        }));
    await persistItemsToApi(removeNode(items), "Link removed and published live!");
  };

  const handleMoveRootItem = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const current = copy[index]!;
    const target = copy[targetIdx]!;
    copy[index] = target;
    copy[targetIdx] = current;
    copy.forEach((it, i) => {
      it.displayOrder = i;
    });
    await persistItemsToApi(copy, "Menu order updated live!");
  };

  const handleMoveSubItem = async (parentId: string, childId: string, direction: "up" | "down") => {
    const next = items.map((node) => {
      if (node.id !== parentId || !node.children) return node;
      const children = [...node.children];
      const idx = children.findIndex((c) => c.id === childId);
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || targetIdx < 0 || targetIdx >= children.length) return node;
      const current = children[idx]!;
      const target = children[targetIdx]!;
      children[idx] = target;
      children[targetIdx] = current;
      children.forEach((c, i) => {
        c.displayOrder = i;
      });
      return { ...node, children };
    });
    await persistItemsToApi(next, "Sub-link order updated live!");
  };

  const isHeaderMenu = activeMenuKey.toLowerCase() === "header";

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Page Title & New Menu Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FolderTree className="w-5 h-5" />
            </span>
            <span>Navigation Menus</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Edit website header links, nested dropdowns, brand logo, and CTA controls with real-time preview.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewMenuKey("");
            setNewMenuTitle("");
            setNewMenuRegion("");
            setIsCreateMenuModalOpen(true);
          }}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-800 dark:text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>New Menu Group</span>
        </button>
      </div>

      {/* Top Collection Tabs + Sticky Save Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {isLoading ? (
            <span className="px-3 py-1.5 text-xs text-slate-400">Loading menus...</span>
          ) : menus.length === 0 ? (
            <span className="px-3 py-1.5 text-xs text-slate-400">No menus created yet.</span>
          ) : (
            menus.map((m) => {
              const isSelected = m.id === selectedMenuId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMenu(m)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span>{m.title}</span>
                  <span className="font-mono text-[10px] opacity-80">({m.key})</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-white dark:bg-slate-900 text-slate-500"
                    }`}
                  >
                    {m.items?.length || 0}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {selectedMenuId && (
          <div className="flex items-center gap-2.5">
            {hasUnsavedChanges && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Unsaved link changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveMenu}
              disabled={isSaving}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Menu Links"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Pinned Live Navbar Preview (for header menu) */}
      {selectedMenuId && isHeaderMenu && (
        <LiveNavbarPreview preview={navPreview} menuItems={items} />
      )}

      {/* Main Studio Grid */}
      {!selectedMenuId ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center text-slate-400 text-sm">
          Select or create a menu to view and configure its links.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Panel: Visual Link Tree Builder */}
          <div
            className={`${
              isHeaderMenu ? "lg:col-span-7" : "lg:col-span-12"
            } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5`}
          >
            {/* Collapsible Menu Settings */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Navigation Links &amp; Dropdowns
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Every add, edit, reorder, or active toggle saves live automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaSettings((v) => !v)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-primary" />
                <span>Menu Settings</span>
              </button>
            </div>

            {showMetaSettings && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Menu Title</label>
                  <input
                    type="text"
                    value={activeMenuTitle}
                    onChange={(e) => {
                      setActiveMenuTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">System Key</label>
                  <input
                    type="text"
                    value={activeMenuKey}
                    onChange={(e) => {
                      setActiveMenuKey(e.target.value.toLowerCase());
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Region (Optional)</label>
                  <input
                    type="text"
                    value={activeMenuRegion}
                    onChange={(e) => {
                      setActiveMenuRegion(e.target.value.toUpperCase());
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Global"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Smart Quick-Add Bar with CMS Page Picker */}
            <div className="space-y-2">
              <form
                onSubmit={handleQuickAddLink}
                className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={quickLabel}
                    onChange={(e) => {
                      setQuickLabel(e.target.value);
                      if (quickError) setQuickError(null);
                    }}
                    placeholder="Label (e.g. Services)"
                    className="sm:col-span-4 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const picked = availablePages.find((p) => `/${p.slug}` === val || (p.slug === "home" && val === "/"));
                      setQuickUrl(val);
                      if (!quickLabel.trim() && picked) {
                        setQuickLabel(picked.title);
                      }
                      if (quickError) setQuickError(null);
                    }}
                    className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Pick CMS Page...</option>
                    <option value="/">Home (/)</option>
                    {availablePages
                      .filter((p) => p.slug !== "home")
                      .map((p) => (
                        <option key={p.id} value={`/${p.slug}`}>
                          {p.title} (/{p.slug})
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    value={quickUrl}
                    onChange={(e) => {
                      setQuickUrl(e.target.value);
                      if (quickError) setQuickError(null);
                    }}
                    placeholder="URL (e.g. /services)"
                    className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                {quickError && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{quickError}</span>
                  </p>
                )}
              </form>
            </div>

            {/* Clean Card Tree Rows with Inline Edit */}
            {items.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No links added yet. Use the Quick Add bar above to build your menu.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const children = item.children || [];
                  const isCollapsed = Boolean(collapsedParents[item.id]);
                  const isEditingThis = inlineEditId === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable={!isEditingThis}
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = Number(e.dataTransfer.getData("text/plain"));
                        if (Number.isNaN(fromIdx) || fromIdx === idx) return;
                        const next = [...items];
                        const [moved] = next.splice(fromIdx, 1);
                        if (!moved) return;
                        next.splice(idx, 0, moved);
                        next.forEach((it, i) => {
                          it.displayOrder = i;
                        });
                        void persistItemsToApi(next, "Menu order updated live!");
                      }}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition hover:border-slate-300"
                    >
                      {/* Parent Row */}
                      <div className="p-3 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />

                          {isEditingThis ? (
                            <div className="flex flex-col sm:flex-row gap-2 flex-1">
                              <input
                                type="text"
                                value={inlineLabel}
                                onChange={(e) => setInlineLabel(e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded-lg border border-primary text-xs font-semibold text-slate-900 focus:outline-none"
                                placeholder="Label"
                              />
                              <input
                                type="text"
                                value={inlineUrl}
                                onChange={(e) => setInlineUrl(e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded-lg border border-primary text-xs font-mono text-slate-900 focus:outline-none"
                                placeholder="/url"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {item.label}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 truncate">
                                {item.url}
                              </span>
                              {children.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCollapsedParents((prev) => ({
                                      ...prev,
                                      [item.id]: !isCollapsed,
                                    }))
                                  }
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold cursor-pointer"
                                >
                                  <span>{children.length} sub-link{children.length > 1 ? "s" : ""}</span>
                                  {isCollapsed ? (
                                    <ChevronRight className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isEditingThis ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCommitInlineEdit(item.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                title="Apply"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineEditId(null);
                                  setInlineError(null);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleItemVisibility(item.url, item.label)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                  hiddenUrlsSet.has((item.url || "").trim().toLowerCase())
                                    ? "bg-slate-100 text-slate-500 border-slate-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                                title="Toggle active/hidden on live website"
                              >
                                {hiddenUrlsSet.has((item.url || "").trim().toLowerCase()) ? "Hidden" : "Active"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAddSubItem(item.id)}
                                className="px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg flex items-center gap-0.5 transition cursor-pointer"
                                title="Add dropdown sub-link"
                              >
                                <Plus className="w-3 h-3" />
                                <span className="hidden sm:inline">Sub-link</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveRootItem(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveRootItem(idx, "down")}
                                disabled={idx === items.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartInlineEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                title="Edit inline"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditingThis && inlineError && (
                        <div className="px-3 pb-2 text-[11px] text-rose-500 font-semibold">
                          {inlineError}
                        </div>
                      )}

                      {/* Sub-links List */}
                      {!isCollapsed && children.length > 0 && (
                        <div className="bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                          {children.map((child, cIdx) => {
                            const isEditingChild = inlineEditId === child.id;
                            return (
                              <div key={child.id} className="pl-9 pr-3 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-slate-300 text-xs">└─</span>
                                  {isEditingChild ? (
                                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                                      <input
                                        type="text"
                                        value={inlineLabel}
                                        onChange={(e) => setInlineLabel(e.target.value)}
                                        className="flex-1 px-2.5 py-1 rounded-lg border border-primary text-xs font-semibold text-slate-900 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={inlineUrl}
                                        onChange={(e) => setInlineUrl(e.target.value)}
                                        className="flex-1 px-2.5 py-1 rounded-lg border border-primary text-xs font-mono text-slate-900 focus:outline-none"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 min-w-0 truncate">
                                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {child.label}
                                      </span>
                                      <span className="text-[11px] font-mono text-slate-400 truncate">
                                        {child.url}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {isEditingChild ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleCommitInlineEdit(child.id)}
                                        className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInlineEditId(null);
                                          setInlineError(null);
                                        }}
                                        className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleItemVisibility(child.url, child.label)}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                          hiddenUrlsSet.has((child.url || "").trim().toLowerCase())
                                            ? "bg-slate-100 text-slate-500 border-slate-200"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}
                                        title="Toggle active/hidden on live website"
                                      >
                                        {hiddenUrlsSet.has((child.url || "").trim().toLowerCase()) ? "Hidden" : "Active"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveSubItem(item.id, child.id, "up")}
                                        disabled={cIdx === 0}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveSubItem(item.id, child.id, "down")}
                                        disabled={cIdx === children.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStartInlineEdit(child)}
                                        className="p-1 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(child.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Danger Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDeleteMenu}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Menu Group"}
              </button>
              <button
                type="button"
                onClick={handleSaveMenu}
                disabled={isSaving}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Menu Links"}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Sticky Brand, Logo & Header Settings (for header menu) */}
          {isHeaderMenu && (
            <div className="lg:col-span-5">
              <NavbarStudioPanel onPreviewChange={handlePreviewChange} />
            </div>
          )}
        </div>
      )}

      {/* Add Sub-Link Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Dropdown Sub-Link
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemLabel}
                  onChange={(e) => {
                    setItemLabel(e.target.value);
                    if (itemErrors.label) setItemErrors((p) => ({ ...p, label: undefined }));
                  }}
                  placeholder="e.g. SEO Services"
                  className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    itemErrors.label ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 dark:border-slate-800 focus:ring-primary"
                  }`}
                />
                {itemErrors.label && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{itemErrors.label}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pick CMS Page (Optional)
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const picked = availablePages.find((p) => `/${p.slug}` === val);
                    setItemUrl(val);
                    if (!itemLabel.trim() && picked) setItemLabel(picked.title);
                    if (itemErrors.url) setItemErrors((p) => ({ ...p, url: undefined }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose an existing page...</option>
                  {availablePages.map((p) => (
                    <option key={p.id} value={p.slug === "home" ? "/" : `/${p.slug}`}>
                      {p.title} ({p.slug === "home" ? "/" : `/${p.slug}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target URL / Path <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemUrl}
                  onChange={(e) => {
                    setItemUrl(e.target.value);
                    if (itemErrors.url) setItemErrors((p) => ({ ...p, url: undefined }));
                  }}
                  placeholder="e.g. /services/seo"
                  className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    itemErrors.url ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 dark:border-slate-800 focus:ring-primary"
                  }`}
                />
                {itemErrors.url && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{itemErrors.url}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-xs transition cursor-pointer"
                >
                  Add Sub-Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {isCreateMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Navigation Menu
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateMenuModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Menu Title
                </label>
                <input
                  type="text"
                  required
                  value={newMenuTitle}
                  onChange={(e) => setNewMenuTitle(e.target.value)}
                  placeholder="e.g. Header Navigation"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lookup Key
                </label>
                <input
                  type="text"
                  required
                  value={newMenuKey}
                  onChange={(e) => setNewMenuKey(e.target.value.toLowerCase())}
                  placeholder="e.g. header or footer"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Region Code (Optional)
                </label>
                <input
                  type="text"
                  value={newMenuRegion}
                  onChange={(e) => setNewMenuRegion(e.target.value.toUpperCase())}
                  placeholder="e.g. IN, US"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateMenuModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Creating..." : "Create Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteMenuConfirmOpen}
        title="Delete Navigation Menu"
        description={`Are you sure you want to delete the "${activeMenuTitle}" menu group?`}
        confirmText="Delete Menu"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteMenu}
        onClose={() => setIsDeleteMenuConfirmOpen(false)}
      />
    </div>
  );
};
