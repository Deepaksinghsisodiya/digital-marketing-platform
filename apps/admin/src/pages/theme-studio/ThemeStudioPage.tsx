import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  Code2,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Layout,
  Maximize2,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  Sparkles,
  Type,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import {
  CYBER_EMERALD_PRESET,
  SYSTEM_THEME_PRESETS,
  resolveTheme,
  validateTheme,
  type ThemeConfig,
} from "@nexora/design-tokens";
import {
  useActivateThemeMutation,
  useCreateThemeMutation,
  useDeleteThemeMutation,
  useDuplicateThemeMutation,
  useGetThemeByIdQuery,
  useGetThemeSettingsQuery,
  useGetThemesQuery,
  useGetThemeVersionsQuery,
  useImportThemeMutation,
  usePublishThemeMutation,
  useRollbackThemeMutation,
  useSaveThemeDraftMutation,
  useUpdateThemeSettingsMutation,
} from "../../store/api/adminApi";
import { API_BASE_URL } from "../../store/api/baseApi";
import type {
  ThemeActivationTarget,
  ThemeSettingsDto,
  UpdateThemeSettingsRequest,
} from "../../types";
import { ThemePreview, type PreviewMode, type PreviewViewport } from "./ThemePreview";
import { OverviewPanel } from "./panels/OverviewPanel";
import { PresetsPanel } from "./panels/PresetsPanel";
import { MyThemesPanel } from "./panels/MyThemesPanel";
import { ColorsPanel } from "./panels/ColorsPanel";
import { TypographyPanel } from "./panels/TypographyPanel";
import { ComponentsPanel } from "./panels/ComponentsPanel";
import { LayoutPanel } from "./panels/LayoutPanel";
import { EffectsPanel } from "./panels/EffectsPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { AdvancedPanel } from "./panels/AdvancedPanel";
import { Button } from "./TokenControls";
import { useTheme } from "../../context/ThemeContext";
import {
  deepClone,
  parseThemeJson,
  type ConfigMutator,
} from "./themeStudioUtils";

type SectionId =
  | "overview"
  | "presets"
  | "themes"
  | "colors"
  | "typography"
  | "components"
  | "layout"
  | "effects"
  | "history"
  | "advanced";

const SECTIONS: {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "presets", label: "Presets", icon: Sparkles },
  { id: "themes", label: "My Themes", icon: Layers },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "components", label: "Components", icon: Settings2 },
  { id: "layout", label: "Layout", icon: Layout },
  { id: "effects", label: "Effects", icon: Wand2 },
  { id: "history", label: "History", icon: Clock },
  { id: "advanced", label: "Advanced", icon: Code2 },
];

function extractError(err: unknown): string {
  const e = err as {
    data?: { error?: string; title?: string } | string;
    error?: string;
    message?: string;
  };
  if (typeof e?.data === "string") return e.data;
  if (e?.data && typeof e.data === "object") {
    const data = e.data as { error?: string; title?: string };
    if (data.error) return data.error;
    if (data.title) return data.title;
  }
  return e?.error || e?.message || "Request failed. Please retry.";
}

export const ThemeStudioPage: React.FC = () => {
  const [section, setSection] = useState<SectionId>("overview");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [working, setWorking] = useState<ThemeConfig | null>(null);
  const [baseline, setBaseline] = useState<ThemeConfig | null>(null);
  const [published, setPublished] = useState<ThemeConfig | null>(null);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [headerApplyOpen, setHeaderApplyOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishNote, setPublishNote] = useState("");
  const [publishCustomName, setPublishCustomName] = useState("");
  const [publishTarget, setPublishTarget] = useState<"both" | "website" | "admin" | "none">("both");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"custom" | "preset">("custom");
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeBasePreset, setNewThemeBasePreset] = useState("cyber-emerald");
  const [customPrimary, setCustomPrimary] = useState("#6366f1");
  const [customAccent, setCustomAccent] = useState("#ec4899");
  const [saveAsCustomOpen, setSaveAsCustomOpen] = useState(false);
  const [saveAsCustomName, setSaveAsCustomName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
  const { refreshServerTheme, applyThemeBySlug } = useTheme();

  const selectTheme = useCallback((themeId: string | null) => {
    setWorking(null);
    setBaseline(null);
    setPublished(null);
    setSelectedThemeId(themeId);
    setThemeDropdownOpen(false);
  }, []);

  const {
    data: themes = [],
    isLoading: themesLoading,
    isError: themesError,
    refetch: refetchThemes,
  } = useGetThemesQuery({ includeDeleted: false });
  const { data: settings } = useGetThemeSettingsQuery();
  const {
    data: themeDetail,
    isFetching: themeDetailLoading,
  } = useGetThemeByIdQuery(selectedThemeId ?? "", {
    skip: !selectedThemeId,
  });
  const { data: versions = [], isFetching: versionsLoading } =
    useGetThemeVersionsQuery(selectedThemeId ?? "", { skip: !selectedThemeId });

  const [updateSettings] = useUpdateThemeSettingsMutation();
  const [activateTheme] = useActivateThemeMutation();
  const [createTheme] = useCreateThemeMutation();
  const [saveDraft] = useSaveThemeDraftMutation();
  const [deleteTheme] = useDeleteThemeMutation();
  const [duplicateTheme] = useDuplicateThemeMutation();
  const [publishTheme] = usePublishThemeMutation();
  const [rollbackTheme] = useRollbackThemeMutation();
  const [importTheme] = useImportThemeMutation();

  useEffect(() => {
    if (selectedThemeId || themes.length === 0) return;
    const preferredSlug = settings?.websiteThemeId || settings?.adminThemeId;
    const match =
      themes.find((theme) => theme.slug === preferredSlug) ||
      themes.find((theme) => theme.isDefault) ||
      themes[0];
    if (match) {
      selectTheme(match.id);
    }
  }, [themes, settings, selectedThemeId, selectTheme]);

  useEffect(() => {
    if (!themeDetail) return;
    const publishedConfig = resolveTheme(parseThemeJson(themeDetail.configJson));
    const base = resolveTheme(
      parseThemeJson(themeDetail.draftConfigJson) ??
        parseThemeJson(themeDetail.configJson),
    );
    setPublished(publishedConfig);
    setBaseline(base);
    setWorking(base);
    setRevision((value) => value + 1);
  }, [themeDetail]);

  const unsaved = useMemo(() => {
    if (!working || !baseline) return false;
    return JSON.stringify(working) !== JSON.stringify(baseline);
  }, [working, baseline]);

  useEffect(() => {
    if (!unsaved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsaved]);

  useEffect(() => {
    if (!fullscreenPreview && !publishOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenPreview(false);
        setPublishOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreenPreview, publishOpen]);

  const defaults = useMemo(
    () =>
      resolveTheme(
        working
          ? ({ id: working.id, slug: working.slug } as Partial<ThemeConfig>)
          : null,
      ),
    [working],
  );

  const mutate = useCallback((mutator: ConfigMutator) => {
    setWorking((current) => (current ? mutator(current) : current));
  }, []);

  const clearNotice = () => {
    setMessage(null);
    setError(null);
  };

  const handleSaveDraft = async () => {
    if (!working || !themeDetail) return;
    clearNotice();

    if (isSystemTheme) {
      setSaveAsCustomName(`${themeDetail.name} (Custom)`);
      setSaveAsCustomOpen(true);
      return;
    }

    const validation = validateTheme(working);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }
    setBusy("save");
    try {
      const updated = await saveDraft({
        id: themeDetail.id,
        request: {
          configJson: JSON.stringify(working),
          baseVersionToken: themeDetail.versionToken,
        },
      }).unwrap();
      const base = resolveTheme(
        parseThemeJson(updated.draftConfigJson) ??
          parseThemeJson(updated.configJson),
      );
      setBaseline(base);
      setWorking(base);
      setPublished(resolveTheme(parseThemeJson(updated.configJson)));
      setMessage("Draft saved successfully.");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleConfirmSaveAsCustom = async () => {
    if (!working || !saveAsCustomName.trim()) return;
    clearNotice();
    setBusy("saveAsCustom");
    try {
      const config = deepClone(working);
      config.name = saveAsCustomName.trim();
      config.slug = "";
      const created = await createTheme({
        name: saveAsCustomName.trim(),
        configJson: JSON.stringify(config),
      }).unwrap();
      setSaveAsCustomOpen(false);
      selectTheme(created.id);
      setMessage(`Saved as custom theme "${created.name}".`);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleDiscard = () => {
    if (!baseline) return;
    setWorking(deepClone(baseline));
    clearNotice();
    setMessage("Changes discarded.");
  };

  const handleRestorePublished = () => {
    if (!published) return;
    setWorking(deepClone(published));
    clearNotice();
    setMessage("Draft reset to the published configuration.");
  };

  const openPublishDialog = () => {
    if (!themeDetail || !working) return;
    if (isSystemTheme) {
      setPublishCustomName(`${themeDetail.name} Custom`);
    }
    setPublishNote("");
    setPublishOpen(true);
  };

  const handlePublish = async () => {
    if (!themeDetail || !working) return;
    clearNotice();
    const validation = validateTheme(working);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }
    setBusy("publish");
    try {
      let targetId = themeDetail.id;

      if (isSystemTheme) {
        const customName = publishCustomName.trim() || `${themeDetail.name} Custom`;
        const config = deepClone(working);
        config.name = customName;
        config.slug = "";
        const created = await createTheme({
          name: customName,
          configJson: JSON.stringify(config),
        }).unwrap();
        targetId = created.id;
      } else {
        await saveDraft({
          id: themeDetail.id,
          request: {
            configJson: JSON.stringify(working),
            baseVersionToken: themeDetail.versionToken,
          },
        }).unwrap();
      }

      const version = await publishTheme({
        id: targetId,
        request: { changeDescription: publishNote.trim() || null },
      }).unwrap();

      if (publishTarget !== "none") {
        await activateTheme({
          id: targetId,
          request: { target: publishTarget },
        }).unwrap();
      }

      setPublishOpen(false);
      setPublishNote("");

      if (isSystemTheme) {
        selectTheme(targetId);
      } else {
        setPublished(resolveTheme(parseThemeJson(version.configJson)));
        setBaseline(resolveTheme(parseThemeJson(version.configJson)));
      }

      setMessage(
        publishTarget !== "none"
          ? `Theme published (v${version.versionNumber}) and applied to ${publishTarget === "both" ? "Website & Admin" : publishTarget}!`
          : `Published version ${version.versionNumber}.`
      );
      setRevision((value) => value + 1);
      void refreshServerTheme();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleToggleSettings = async (
    patch: Partial<UpdateThemeSettingsRequest>,
  ) => {
    if (!settings) return;
    clearNotice();
    setBusy("settings");
    try {
      await updateSettings({
        ...patch,
        versionToken: settings.versionToken,
      }).unwrap();
      setMessage("Theme engine settings updated.");
      void refreshServerTheme();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleAssignTheme = async (
    themeId: string,
    target: ThemeActivationTarget,
  ) => {
    clearNotice();
    setBusy("activate");
    try {
      const themeObj = themes.find((t) => t.id === themeId);
      const themeSlug = themeObj?.slug || themeId;
      const themeName = themeObj?.name || "Theme";

      // Instantly apply locally so Admin UI reflects theme immediately without waiting
      if (target === "admin" || target === "both") {
        applyThemeBySlug(
          themeSlug,
          themeDetail?.id === themeId ? themeDetail : undefined,
        );
      }

      await activateTheme({ id: themeId, request: { target } }).unwrap();

      setMessage(
        target === "both"
          ? `"${themeName}" applied to Website & Admin.`
          : `"${themeName}" applied to ${target}.`,
      );
      void refreshServerTheme();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleAssignCurrent = async (target: ThemeActivationTarget) => {
    if (!selectedThemeId) return;
    await handleAssignTheme(selectedThemeId, target);
  };

  const handleCreate = async (
    name: string,
    options?:
      | string
      | {
          mode?: "custom" | "preset";
          basePresetSlug?: string;
          primary?: string;
          accent?: string;
        },
  ) => {
    clearNotice();
    setBusy("create");
    try {
      let config: ThemeConfig;

      if (typeof options === "string") {
        const selectedPreset =
          SYSTEM_THEME_PRESETS.find((p) => p.slug === options) ||
          CYBER_EMERALD_PRESET;
        config = deepClone(selectedPreset);
      } else if (options?.mode === "preset") {
        const selectedPreset =
          SYSTEM_THEME_PRESETS.find((p) => p.slug === options.basePresetSlug) ||
          CYBER_EMERALD_PRESET;
        config = deepClone(selectedPreset);
      } else {
        const p =
          (typeof options === "object" ? options.primary : undefined) ||
          customPrimary;
        const a =
          (typeof options === "object" ? options.accent : undefined) ||
          customAccent;
        const base = deepClone(CYBER_EMERALD_PRESET);
        config = resolveTheme({
          ...base,
          id: "",
          slug: "",
          name: name.trim(),
          tagline: "Custom bespoke theme",
          colors: {
            light: {
              ...base.colors.light,
              primary: p,
              accent: a,
              ring: p,
              link: p,
            },
            dark: {
              ...base.colors.dark,
              primary: p,
              accent: a,
              ring: p,
              link: p,
            },
          },
        });
      }

      config.name = name.trim();
      config.slug = "";

      const created = await createTheme({
        name: name.trim(),
        configJson: JSON.stringify(config),
      }).unwrap();
      setCreateModalOpen(false);
      setNewThemeName("");
      selectTheme(created.id);
      setSection("colors");
      setMessage(
        `Theme "${created.name}" created with unique tokens. You can now customize every color.`,
      );
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleDuplicate = async (themeId: string) => {
    clearNotice();
    setBusy("duplicate");
    try {
      const source = themes.find((theme) => theme.id === themeId);
      const created = await duplicateTheme({
        id: themeId,
        request: { newName: `${source?.name ?? "Theme"} Copy` },
      }).unwrap();
      selectTheme(created.id);
      setSection("themes");
      setMessage(`Created "${created.name}".`);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = (themeId: string) => {
    setThemeToDelete(themeId);
  };

  const confirmDeleteThemeAction = async () => {
    if (!themeToDelete) return;
    clearNotice();
    setBusy("delete");
    try {
      await deleteTheme(themeToDelete).unwrap();
      if (selectedThemeId === themeToDelete) {
        selectTheme(null);
      }
      setMessage("Theme deleted.");
      setThemeToDelete(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (name: string, configJson: string) => {
    clearNotice();
    let parsed: unknown;
    try {
      parsed = JSON.parse(configJson);
    } catch {
      setError("Invalid JSON. Please paste a valid theme configuration.");
      return;
    }
    const validation = validateTheme(parsed);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }
    setBusy("import");
    try {
      const created = await importTheme({ name, configJson }).unwrap();
      selectTheme(created.id);
      setSection("themes");
      setMessage(`Imported "${created.name}".`);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async (themeId: string) => {
    clearNotice();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/themes/${themeId}/export`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`Export failed (HTTP ${res.status}).`);
      const text = await res.text();
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `nexora-theme-${themeId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Theme exported.");
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleRollback = (versionNumber: number) => {
    if (!themeDetail) return;
    setVersionToRestore(versionNumber);
  };

  const confirmRollbackAction = async () => {
    if (!themeDetail || versionToRestore === null) return;
    clearNotice();
    setBusy("rollback");
    try {
      const updated = await rollbackTheme({
        id: themeDetail.id,
        request: { versionNumber: versionToRestore },
      }).unwrap();
      const restored = resolveTheme(parseThemeJson(updated.configJson));
      setPublished(restored);
      setBaseline(restored);
      setWorking(restored);
      setRevision((value) => value + 1);
      setMessage(`Restored version ${versionToRestore}.`);
      setVersionToRestore(null);
      void refreshServerTheme();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleApplyJson = (json: string): string | null => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return "Invalid JSON syntax.";
    }
    const validation = validateTheme(parsed);
    if (!validation.valid) {
      return validation.errors.join(" ");
    }
    mutate(() => resolveTheme(parsed as Partial<ThemeConfig>));
    return null;
  };

  const selectedSummary = themes.find((theme) => theme.id === selectedThemeId);
  const isSystemTheme = Boolean(themeDetail?.isSystem);
  const isSelectedWebsiteActive = settings?.websiteThemeId === selectedSummary?.slug;
  const isSelectedAdminActive = settings?.adminThemeId === selectedSummary?.slug;

  const statusLabel = isSystemTheme
    ? "System preset"
    : unsaved
      ? "Unsaved changes"
      : themeDetail?.draftConfigJson
        ? "Draft"
        : "Published";

  if (themesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
        Loading Theme Studio…
      </div>
    );
  }

  if (themesError) {
    return (
      <div className="mx-auto mt-10 max-w-lg space-y-3 rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
        <p className="text-sm font-semibold text-danger">Could not load themes.</p>
        <p className="text-xs text-muted">
          Check that the API is running and that your account has the themes.view permission.
        </p>
        <Button variant="primary" onClick={() => void refetchThemes()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!working) {
    if (selectedThemeId || themeDetailLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
          Loading theme…
        </div>
      );
    }

    return (
      <div className="mx-auto mt-10 max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Palette className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">No themes yet</h2>
          <p className="mt-1 text-xs text-muted">
            Create your first custom theme, or duplicate a system preset to get started.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSection("themes");
            setWorking(deepClone(CYBER_EMERALD_PRESET));
            setBaseline(deepClone(CYBER_EMERALD_PRESET));
          }}
        >
          Open Theme Manager
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Link & Theme Selector Dropdown */}
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              title="Return to Site Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-elevated hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">
                  Theme Studio
                </h1>
              </div>
            </div>

            {/* Quick Theme Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 transition hover:bg-surface-elevated hover:border-border/80"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Palette className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                      {selectedSummary?.name || "Select Theme"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted" />
                  </div>
                </div>
              </button>

              {themeDropdownOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setThemeDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-1.5 w-72 max-h-96 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                      Switch Active Theme
                    </p>
                    {themes.map((theme) => {
                      const isSel = theme.id === selectedThemeId;
                      const isWeb = settings?.websiteThemeId === theme.slug;
                      const isAdm = settings?.adminThemeId === theme.slug;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => selectTheme(theme.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                            isSel
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-surface"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate">{theme.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted">
                              <span>{theme.slug}</span>
                              {isWeb ? (
                                <span className="text-emerald-500 font-semibold">
                                  · Web
                                </span>
                              ) : null}
                              {isAdm ? (
                                <span className="text-blue-500 font-semibold">
                                  · Admin
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {isSel ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            {/* + New Theme Button */}
            <Button
              variant="primary"
              onClick={() => {
                setNewThemeName("");
                setNewThemeBasePreset(selectedSummary?.slug || "cyber-emerald");
                setCreateModalOpen(true);
              }}
              className="gap-1.5 font-bold shadow-sm"
              title="Create a new custom theme"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Theme</span>
            </Button>

            {/* Status Badges */}
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                unsaved
                  ? "bg-warning/15 text-warning"
                  : statusLabel === "Draft"
                    ? "bg-info/15 text-info"
                    : "bg-success/15 text-success"
              }`}
            >
              {statusLabel}
            </span>

            {isSelectedWebsiteActive ? (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Globe className="h-3 w-3" /> Website Active
              </span>
            ) : null}

            {isSelectedAdminActive ? (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <Shield className="h-3 w-3" /> Admin Active
              </span>
            ) : null}
          </div>

          {/* Right: Actions & Primary Apply Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Apply Dropdown */}
            <div className="relative">
              <Button
                variant={
                  isSelectedWebsiteActive && isSelectedAdminActive
                    ? "secondary"
                    : "primary"
                }
                disabled={busy === "activate" || !selectedThemeId}
                onClick={() => setHeaderApplyOpen(!headerApplyOpen)}
                className="gap-1.5 font-bold shadow-md shadow-primary/20"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>
                  {isSelectedWebsiteActive && isSelectedAdminActive
                    ? "Active on Both"
                    : "Apply Theme"}
                </span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>

              {headerApplyOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setHeaderApplyOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                      Activate "{selectedSummary?.name}"
                    </p>
                    <button
                      type="button"
                      disabled={isSelectedWebsiteActive || busy === "activate"}
                      onClick={() => {
                        setHeaderApplyOpen(false);
                        void handleAssignCurrent("website");
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-500" />
                        Apply to Website
                      </span>
                      {isSelectedWebsiteActive ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      disabled={isSelectedAdminActive || busy === "activate"}
                      onClick={() => {
                        setHeaderApplyOpen(false);
                        void handleAssignCurrent("admin");
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Apply to Admin
                      </span>
                      {isSelectedAdminActive ? (
                        <Check className="h-3.5 w-3.5 text-blue-500" />
                      ) : null}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      disabled={
                        (isSelectedWebsiteActive && isSelectedAdminActive) ||
                        busy === "activate"
                      }
                      onClick={() => {
                        setHeaderApplyOpen(false);
                        void handleAssignCurrent("both");
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Apply to Both (Website & Admin)
                      </span>
                      {isSelectedWebsiteActive && isSelectedAdminActive ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : null}
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant={showPreview ? "secondary" : "ghost"}
              title={showPreview ? "Hide Preview Pane" : "Show Preview Pane"}
              className="gap-1.5"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Hide Preview</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Show Preview</span>
                </>
              )}
            </Button>

            <Button onClick={() => setFullscreenPreview(true)} title="Open Fullscreen Preview">
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Fullscreen</span>
            </Button>

            <Button onClick={handleDiscard} disabled={!unsaved || busy !== null}>
              <RotateCcw className="h-3.5 w-3.5" /> Discard
            </Button>

            <Button
              variant={unsaved ? "primary" : "secondary"}
              onClick={handleSaveDraft}
              disabled={!selectedThemeId || !unsaved || busy !== null}
              title={
                isSystemTheme
                  ? "Save modifications as a custom theme"
                  : unsaved
                    ? "Save draft modifications"
                    : "No unsaved modifications"
              }
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
              {unsaved ? (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              ) : null}
            </Button>

            <Button
              variant="primary"
              onClick={openPublishDialog}
              disabled={!selectedThemeId || busy !== null}
              title={
                isSystemTheme
                  ? "Publish this preset as a custom theme"
                  : "Publish an immutable release version"
              }
            >
              <Upload className="h-3.5 w-3.5" /> Publish
            </Button>
          </div>
        </div>

        {/* Banners & Alerts */}
        {message ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        ) : null}
        {isSystemTheme ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-info/30 bg-info/10 px-3 py-2 text-xs text-info">
            <span>
              This is a system preset and is read-only. Duplicate it to customize and publish changes.
            </span>
            <Button
              variant="primary"
              disabled={busy !== null || !themeDetail}
              onClick={() => themeDetail && void handleDuplicate(themeDetail.id)}
            >
              Duplicate &amp; edit
            </Button>
          </div>
        ) : null}
      </header>

      {/* 2. Sleek Horizontal Navigation Tab Strip (Eliminates vertical 224px sidebar squeeze!) */}
      <nav className="sticky top-[57px] z-20 border-b border-border bg-card/90 px-4 py-1.5 backdrop-blur">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Workspace: Editor Panel + Optional Right Live Preview */}
      <div className="flex flex-1 flex-col lg:flex-row min-w-0">
        {/* Editor Area */}
        <div className="min-w-0 flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl 2xl:max-w-6xl space-y-6">
            {section === "overview" ? (
              <OverviewPanel
                config={working}
                mutate={mutate}
                settings={settings}
                themes={themes}
                selectedThemeId={selectedThemeId}
                onToggleSettings={handleToggleSettings}
                onAssign={handleAssignCurrent}
                settingsBusy={busy === "settings"}
                activationBusy={busy === "activate"}
              />
            ) : null}
            {section === "presets" ? (
              <PresetsPanel
                themes={themes}
                settings={settings}
                onPreviewPreset={(preset) => {
                  const next = deepClone(preset);
                  if (working) {
                    next.id = working.id;
                    next.slug = working.slug;
                    next.name = working.name;
                  }
                  setWorking(next);
                  setRevision((value) => value + 1);
                  setMessage(`Previewing "${preset.name}" tokens live.`);
                }}
                onOpenTheme={(themeId) => {
                  selectTheme(themeId);
                  setSection("overview");
                }}
                onDuplicateTheme={handleDuplicate}
                onAssign={handleAssignTheme}
                duplicateBusy={busy === "duplicate"}
                activationBusy={busy === "activate"}
              />
            ) : null}
            {section === "themes" ? (
              <MyThemesPanel
                themes={themes}
                settings={settings}
                selectedThemeId={selectedThemeId}
                onSelect={selectTheme}
                onOpenTheme={(themeId) => {
                  selectTheme(themeId);
                  setSection("overview");
                }}
                onAssign={handleAssignTheme}
                onCreate={handleCreate}
                onOpenCreateModal={() => {
                  setNewThemeName("");
                  setNewThemeBasePreset(selectedSummary?.slug || "cyber-emerald");
                  setCreateModalOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onImport={handleImport}
                onExport={handleExport}
                createBusy={busy === "create"}
                importBusy={busy === "import"}
                activationBusy={busy === "activate"}
              />
            ) : null}
            {section === "colors" ? (
              <ColorsPanel config={working} defaults={defaults} mutate={mutate} />
            ) : null}
            {section === "typography" ? (
              <TypographyPanel config={working} mutate={mutate} />
            ) : null}
            {section === "components" ? (
              <ComponentsPanel config={working} mutate={mutate} />
            ) : null}
            {section === "layout" ? (
              <LayoutPanel config={working} mutate={mutate} />
            ) : null}
            {section === "effects" ? (
              <EffectsPanel config={working} mutate={mutate} />
            ) : null}
            {section === "history" ? (
              <HistoryPanel
                versions={versions}
                loading={versionsLoading}
                onRollback={handleRollback}
                rollbackBusy={busy === "rollback"}
              />
            ) : null}
            {section === "advanced" ? (
              <AdvancedPanel
                config={working}
                onApplyJson={handleApplyJson}
                versionToken={themeDetail?.versionToken}
                publishedVersion={themeDetail?.currentVersion}
              />
            ) : null}
          </div>
        </div>

        {/* Right Aside: Real-Time Live Preview & Instant Switcher */}
        {showPreview ? (
          <aside className="w-full shrink-0 border-t border-border bg-card p-4 lg:w-[480px] xl:w-[540px] 2xl:w-[600px] lg:border-t-0 lg:border-l">
            {/* Live Interactive Preview Canvas */}
            <div className="h-[640px] lg:h-[calc(100vh-140px)] min-h-[560px]">
              <ThemePreview
                theme={working}
                viewport={viewport}
                mode={previewMode}
                revision={revision}
                onViewportChange={setViewport}
                onModeChange={setPreviewMode}
                onFullscreen={() => setFullscreenPreview(true)}
              />
            </div>
          </aside>
        ) : null}
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenPreview ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 p-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Live preview · {working.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {(["desktop", "tablet", "mobile"] as PreviewViewport[]).map((option) => (
                <Button
                  key={option}
                  variant={viewport === option ? "primary" : "secondary"}
                  onClick={() => setViewport(option)}
                >
                  {option}
                </Button>
              ))}
              {(["light", "dark"] as PreviewMode[]).map((option) => (
                <Button
                  key={option}
                  variant={previewMode === option ? "primary" : "secondary"}
                  onClick={() => setPreviewMode(option)}
                >
                  {option}
                </Button>
              ))}
              <Button onClick={() => setFullscreenPreview(false)}>Close</Button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <ThemePreview
              theme={working}
              viewport={viewport}
              mode={previewMode}
              revision={revision}
            />
          </div>
        </div>
      ) : null}

      {/* 1. Create New Theme Modal */}
      {createModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create new theme"
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Create New Theme</h2>
                <p className="text-xs text-muted">
                  Build a completely unique custom palette or start from a preset.
                </p>
              </div>
            </div>

            {/* Creation Mode Tabs */}
            <div className="flex rounded-xl bg-surface p-1 border border-border">
              <button
                type="button"
                onClick={() => setCreateMode("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  createMode === "custom"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>Unique Custom Colors</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("preset")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  createMode === "preset"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Start from Preset</span>
              </button>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Theme Name *
              </span>
              <input
                autoFocus
                value={newThemeName}
                onChange={(event) => setNewThemeName(event.target.value)}
                placeholder={
                  createMode === "custom"
                    ? "e.g. Crimson Phoenix, Royal Velvet, Cyber Neon"
                    : "e.g. Executive Midnight, Aurora Gold"
                }
                className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            {createMode === "custom" ? (
              <div className="space-y-3.5">
                {/* Color Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-border p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-2 py-1 text-xs font-mono font-bold text-foreground outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-3">
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Accent Focus Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-border p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-2 py-1 text-xs font-mono font-bold text-foreground outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Inspirations */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                    Quick Color Ideas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Crimson & Amber", primary: "#e11d48", accent: "#f59e0b" },
                      { name: "Indigo & Fuchsia", primary: "#6366f1", accent: "#d946ef" },
                      { name: "Sky & Coral", primary: "#0ea5e9", accent: "#f97316" },
                      { name: "Violet & Mint", primary: "#8b5cf6", accent: "#10b981" },
                      { name: "Luxury Gold", primary: "#d97706", accent: "#14b8a6" },
                      { name: "Cyber Neon", primary: "#06b6d4", accent: "#ec4899" },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setCustomPrimary(p.primary);
                          setCustomAccent(p.accent);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card text-[11px] font-semibold text-muted hover:text-foreground hover:bg-surface transition"
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.primary }} />
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Swatch Preview */}
                <div
                  className="rounded-xl p-3 border border-border flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${customPrimary}15 0%, ${customAccent}15 100%)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                      style={{ background: customPrimary }}
                    >
                      Primary Action
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                      style={{ background: customAccent }}
                    >
                      Accent Badge
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted font-mono">
                    Instant Preview
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <span className="mb-2 block text-xs font-semibold text-foreground">
                  Choose Base Preset
                </span>
                <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {SYSTEM_THEME_PRESETS.map((preset) => {
                    const isSel = newThemeBasePreset === preset.slug;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setNewThemeBasePreset(preset.slug)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                          isSel
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                            : "border-border bg-surface hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/20"
                              style={{ background: preset.colors.light.primary }}
                            />
                            <span
                              className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/20"
                              style={{ background: preset.colors.light.accent }}
                            />
                          </div>
                          {isSel ? (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-xs font-bold text-foreground truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-muted truncate mt-0.5">
                          {preset.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border">
              <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!newThemeName.trim() || busy === "create"}
                onClick={() =>
                  void handleCreate(newThemeName, {
                    mode: createMode,
                    basePresetSlug: newThemeBasePreset,
                    primary: customPrimary,
                    accent: customAccent,
                  })
                }
                className="gap-1.5 font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Create &amp; Customize</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Save As Custom Theme Modal (when customizing system presets) */}
      {saveAsCustomOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSaveAsCustomOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Save as custom theme"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Save className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Save as Custom Theme</h2>
                <p className="text-xs text-muted">
                  System presets are built-in templates. Save your customizations as a new theme to persist your changes.
                </p>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Custom Theme Name *
              </span>
              <input
                autoFocus
                value={saveAsCustomName}
                onChange={(event) => setSaveAsCustomName(event.target.value)}
                placeholder="e.g. Champagne Gold (Custom)"
                className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border">
              <Button onClick={() => setSaveAsCustomOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!saveAsCustomName.trim() || busy === "saveAsCustom"}
                onClick={() => void handleConfirmSaveAsCustom()}
                className="gap-1.5 font-bold"
              >
                <Save className="h-4 w-4" />
                <span>Save Theme</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Publish Theme Modal */}
      {publishOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPublishOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Publish theme"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {isSystemTheme ? "Publish as Custom Theme" : "Publish Theme"}
                </h2>
                <p className="text-xs text-muted">
                  {isSystemTheme
                    ? "System presets cannot be overwritten directly. Publishing creates a new custom theme and activates it."
                    : "Publishing creates an immutable version and applies it to your active target."}
                </p>
              </div>
            </div>

            {isSystemTheme ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-foreground">
                  Theme Name *
                </span>
                <input
                  autoFocus
                  value={publishCustomName}
                  onChange={(event) => setPublishCustomName(event.target.value)}
                  placeholder="e.g. Champagne Gold Custom"
                  className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground">
                Release note / Change description (optional)
              </span>
              <input
                value={publishNote}
                onChange={(event) => setPublishNote(event.target.value)}
                placeholder="e.g. Refined emerald palette"
                className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Apply Activation Target
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "both", label: "Website & Admin", icon: Sparkles },
                  { id: "website", label: "Website Only", icon: Globe },
                  { id: "admin", label: "Admin Only", icon: Shield },
                  { id: "none", label: "Publish Only", icon: Clock },
                ].map((tgt) => {
                  const Icon = tgt.icon;
                  const isSel = publishTarget === tgt.id;
                  return (
                    <button
                      key={tgt.id}
                      type="button"
                      onClick={() => setPublishTarget(tgt.id as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                        isSel
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{tgt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border">
              <Button onClick={() => setPublishOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={
                  busy === "publish" ||
                  (isSystemTheme && !publishCustomName.trim())
                }
                className="gap-1.5 font-bold"
              >
                <Upload className="h-4 w-4" />
                <span>Confirm Publish</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Theme Dialog */}
      <ConfirmDialog
        isOpen={Boolean(themeToDelete)}
        title="Delete Theme"
        description="Are you sure you want to permanently delete this theme? This action cannot be undone."
        confirmText="Delete Theme"
        cancelText="Cancel"
        variant="danger"
        isLoading={busy === "delete"}
        onConfirm={confirmDeleteThemeAction}
        onClose={() => setThemeToDelete(null)}
      />

      {/* Rollback Version Dialog */}
      <ConfirmDialog
        isOpen={versionToRestore !== null}
        title="Restore Theme Version"
        description={
          versionToRestore !== null
            ? `Are you sure you want to restore Version ${versionToRestore}? Your current working theme draft will be replaced with this version.`
            : ""
        }
        confirmText="Restore Version"
        cancelText="Cancel"
        variant="primary"
        isLoading={busy === "rollback"}
        onConfirm={confirmRollbackAction}
        onClose={() => setVersionToRestore(null)}
      />
    </div>
  );
};
