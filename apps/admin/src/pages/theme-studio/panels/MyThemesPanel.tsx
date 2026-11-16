import React, { useState } from "react";
import { Check, ChevronDown, Globe, Plus, Shield, Sparkles, Zap } from "lucide-react";
import type {
  ThemeActivationTarget,
  ThemeSettingsDto,
  ThemeSummaryDto,
} from "../../../types";
import { Button, PanelSection, TextField } from "../TokenControls";

export const MyThemesPanel: React.FC<{
  themes: ThemeSummaryDto[];
  selectedThemeId: string | null;
  settings?: ThemeSettingsDto;
  onSelect: (themeId: string) => void;
  onAssign?: (themeId: string, target: ThemeActivationTarget) => void;
  onOpenTheme?: (themeId: string) => void;
  onCreate: (name: string) => void;
  onOpenCreateModal?: () => void;
  onDuplicate: (themeId: string) => void;
  onDelete: (themeId: string) => void;
  onImport: (name: string, configJson: string) => void;
  onExport: (themeId: string) => void;
  createBusy?: boolean;
  importBusy?: boolean;
  activationBusy?: boolean;
  error?: string | null;
  success?: string | null;
}> = ({
  themes,
  selectedThemeId,
  settings,
  onSelect,
  onAssign,
  onOpenTheme,
  onCreate,
  onOpenCreateModal,
  onDuplicate,
  onDelete,
  onImport,
  onExport,
  createBusy,
  importBusy,
  activationBusy,
  error,
  success,
}) => {
  const [newName, setNewName] = useState("");
  const [importName, setImportName] = useState("");
  const [importJson, setImportJson] = useState("");
  const [applyMenuOpen, setApplyMenuOpen] = useState<string | null>(null);

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    setImportJson(text);
    if (!importName) {
      setImportName(file.name.replace(/\.json$/i, ""));
    }
  };

  return (
    <div className="space-y-5">
      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          {success}
        </p>
      ) : null}

      <PanelSection
        title="My Themes & Active Switcher"
        description="Pick any theme to edit, preview, or instantly activate for Website or Admin."
      >
        <div className="space-y-3">
          {onOpenCreateModal ? (
            <div className="flex justify-end pb-1">
              <Button
                variant="primary"
                onClick={onOpenCreateModal}
                className="gap-1.5 font-bold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Theme</span>
              </Button>
            </div>
          ) : null}
          {themes.length === 0 ? (
            <p className="text-xs text-muted">No themes found.</p>
          ) : null}
          {themes.map((theme) => {
            const isSelected = theme.id === selectedThemeId;
            const isWebsiteActive = settings?.websiteThemeId === theme.slug;
            const isAdminActive = settings?.adminThemeId === theme.slug;
            const isMenuOpen = applyMenuOpen === theme.id;

            return (
              <div
                key={theme.id}
                data-testid={`theme-card-${theme.id}`}
                className={`relative flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  isMenuOpen ? "z-30 shadow-md" : "z-10"
                } ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-surface hover:border-border/80"
                }`}
              >
                <div
                  onClick={() => onSelect(theme.id)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-bold text-foreground">
                      {theme.name}
                    </span>
                    {theme.isDefault ? (
                      <Badge tone="primary">DEFAULT</Badge>
                    ) : null}
                    {theme.isSystem ? <Badge tone="muted">SYSTEM</Badge> : null}
                    {theme.hasDraft ? (
                      <Badge tone="warning">DRAFT</Badge>
                    ) : null}
                    {isWebsiteActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Globe className="h-3 w-3" /> Website Active
                      </span>
                    ) : null}
                    {isAdminActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <Shield className="h-3 w-3" /> Admin Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span className="font-mono">{theme.slug}</span>
                    <span>·</span>
                    <span>Version {theme.currentVersion}</span>
                    {isSelected ? (
                      <span className="font-semibold text-primary">
                        · Currently Selected
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Direct Change / Apply Theme Action Dropdown */}
                  {onAssign ? (
                    <div className="relative">
                      <Button
                        variant={
                          isWebsiteActive && isAdminActive
                            ? "secondary"
                            : "primary"
                        }
                        disabled={activationBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          setApplyMenuOpen(isMenuOpen ? null : theme.id);
                        }}
                        className="gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span>
                          {isWebsiteActive && isAdminActive
                            ? "Active"
                            : "Apply Theme"}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </Button>

                      {isMenuOpen ? (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setApplyMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl">
                            <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                              Activate Theme
                            </p>
                            <button
                              type="button"
                              disabled={isWebsiteActive || activationBusy}
                              onClick={() => {
                                setApplyMenuOpen(null);
                                onAssign(theme.id, "website");
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
                            >
                              <span className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                                Apply to Website
                              </span>
                              {isWebsiteActive ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : null}
                            </button>
                            <button
                              type="button"
                              disabled={isAdminActive || activationBusy}
                              onClick={() => {
                                setApplyMenuOpen(null);
                                onAssign(theme.id, "admin");
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
                            >
                              <span className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                Apply to Admin
                              </span>
                              {isAdminActive ? (
                                <Check className="h-3.5 w-3.5 text-blue-500" />
                              ) : null}
                            </button>
                            <div className="my-1 border-t border-border" />
                            <button
                              type="button"
                              disabled={
                                (isWebsiteActive && isAdminActive) ||
                                activationBusy
                              }
                              onClick={() => {
                                setApplyMenuOpen(null);
                                onAssign(theme.id, "both");
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
                            >
                              <span className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                Apply to Both
                              </span>
                              {isWebsiteActive && isAdminActive ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : null}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {onOpenTheme ? (
                    <Button onClick={() => onOpenTheme(theme.id)}>Edit</Button>
                  ) : (
                    <Button
                      onClick={() => onSelect(theme.id)}
                      variant={isSelected ? "secondary" : "ghost"}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  )}

                  <Button onClick={() => onDuplicate(theme.id)}>Duplicate</Button>
                  <Button onClick={() => onExport(theme.id)}>Export</Button>
                  <Button
                    variant="danger"
                    disabled={theme.isSystem || theme.isDefault}
                    title={
                      theme.isSystem || theme.isDefault
                        ? "System and default themes cannot be deleted"
                        : undefined
                    }
                    onClick={() => onDelete(theme.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection
        title="Create Blank Theme"
        description="Start customizing from baseline tokens."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField
              label="New theme name"
              value={newName}
              placeholder="e.g. Aurora Finance"
              onChange={setNewName}
            />
          </div>
          <Button
            variant="primary"
            disabled={!newName.trim() || createBusy}
            onClick={() => {
              onCreate(newName.trim());
              setNewName("");
            }}
          >
            Create
          </Button>
        </div>
      </PanelSection>

      <PanelSection
        title="Import Theme JSON"
        description="Paste or upload a previously exported theme configuration."
      >
        <TextField
          label="Theme name"
          value={importName}
          onChange={setImportName}
          placeholder="Imported theme name"
        />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground">
            Theme JSON
          </span>
          <textarea
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            rows={6}
            placeholder='{ "id": "...", "colors": { ... } }'
            className="w-full rounded-lg border border-input bg-surface px-3 py-2 font-mono text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImportFile(file);
            }}
            className="text-xs text-muted"
          />
          <Button
            variant="primary"
            disabled={!importName.trim() || !importJson.trim() || importBusy}
            onClick={() => onImport(importName.trim(), importJson)}
          >
            Import Theme
          </Button>
        </div>
      </PanelSection>
    </div>
  );
};

const Badge: React.FC<{
  tone: "primary" | "muted" | "warning" | "danger";
  children: React.ReactNode;
}> = ({ tone, children }) => {
  const tones: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    muted: "bg-muted/15 text-muted",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
