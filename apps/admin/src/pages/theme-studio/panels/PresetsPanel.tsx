import React, { useState } from "react";
import { SYSTEM_THEME_PRESETS } from "@nexora/design-tokens";
import type { ThemeConfig } from "@nexora/design-tokens";
import { Check, ChevronDown, Globe, Shield, Sparkles, Zap } from "lucide-react";
import type {
  ThemeActivationTarget,
  ThemeSettingsDto,
  ThemeSummaryDto,
} from "../../../types";
import { Button, PanelSection } from "../TokenControls";

export const PresetsPanel: React.FC<{
  themes: ThemeSummaryDto[];
  settings?: ThemeSettingsDto;
  onPreviewPreset: (theme: ThemeConfig) => void;
  onOpenTheme: (themeId: string) => void;
  onDuplicateTheme: (themeId: string) => void;
  onAssign?: (themeId: string, target: ThemeActivationTarget) => void;
  duplicateBusy?: boolean;
  activationBusy?: boolean;
}> = ({
  themes,
  settings,
  onPreviewPreset,
  onOpenTheme,
  onDuplicateTheme,
  onAssign,
  duplicateBusy,
  activationBusy,
}) => {
  const [applyMenuOpen, setApplyMenuOpen] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PanelSection
        title="Curated Presets"
        description="Select any preset to preview instantly, activate directly on Website/Admin, or duplicate to customize."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {SYSTEM_THEME_PRESETS.map((preset) => {
            const record = themes.find((theme) => theme.slug === preset.slug);
            const isWebsiteActive = settings?.websiteThemeId === preset.slug;
            const isAdminActive = settings?.adminThemeId === preset.slug;
            const isMenuOpen = applyMenuOpen === preset.id;

            return (
              <article
                key={preset.id}
                className={`relative rounded-2xl border transition-all ${
                  isMenuOpen ? "z-30 shadow-lg" : "z-10"
                } ${
                  isWebsiteActive || isAdminActive
                    ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-surface"
                }`}
              >
                <div
                  className="h-20 relative flex items-end p-3 rounded-t-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.light.primary} 0%, ${preset.colors.light.accent} 100%)`,
                  }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {preset.slug === "cyber-emerald" ? (
                      <span className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        DEFAULT
                      </span>
                    ) : null}
                    {isWebsiteActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                        <Globe className="h-2.5 w-2.5 text-emerald-400" /> Website
                      </span>
                    ) : null}
                    {isAdminActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                        <Shield className="h-2.5 w-2.5 text-blue-400" /> Admin
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {preset.name}
                    </h4>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {preset.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Apply Preset Dropdown */}
                    {record && onAssign ? (
                      <div className="relative">
                        <Button
                          variant={
                            isWebsiteActive && isAdminActive
                              ? "secondary"
                              : "primary"
                          }
                          disabled={activationBusy}
                          onClick={() =>
                            setApplyMenuOpen(isMenuOpen ? null : preset.id)
                          }
                          className="gap-1"
                        >
                          <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span>
                            {isWebsiteActive && isAdminActive
                              ? "Active"
                              : "Apply"}
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </Button>

                        {isMenuOpen ? (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setApplyMenuOpen(null)}
                            />
                            <div className="absolute left-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-border bg-card p-1.5 shadow-2xl">
                              <button
                                type="button"
                                disabled={isWebsiteActive || activationBusy}
                                onClick={() => {
                                  setApplyMenuOpen(null);
                                  onAssign(record.id, "website");
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
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
                                  onAssign(record.id, "admin");
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
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
                                  onAssign(record.id, "both");
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
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

                    <Button onClick={() => onPreviewPreset(preset)}>
                      Preview
                    </Button>
                    <Button
                      disabled={!record}
                      onClick={() => record && onOpenTheme(record.id)}
                    >
                      Open
                    </Button>
                    <Button
                      disabled={!record || duplicateBusy}
                      onClick={() => record && onDuplicateTheme(record.id)}
                    >
                      Duplicate
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
};
