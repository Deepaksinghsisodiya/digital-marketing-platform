import React from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import type {
  ThemeActivationTarget,
  ThemeSettingsDto,
  ThemeSummaryDto,
  UpdateThemeSettingsRequest,
} from "../../../types";
import { Button, PanelSection, SelectField, TextField, ToggleField } from "../TokenControls";
import { setByPath, type ConfigMutator } from "../themeStudioUtils";

export const OverviewPanel: React.FC<{
  config: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
  settings?: ThemeSettingsDto;
  themes: ThemeSummaryDto[];
  selectedThemeId: string | null;
  onToggleSettings: (patch: Partial<UpdateThemeSettingsRequest>) => void;
  onAssign: (target: ThemeActivationTarget) => void;
  settingsBusy?: boolean;
  activationBusy?: boolean;
}> = ({
  config,
  mutate,
  settings,
  themes,
  selectedThemeId,
  onToggleSettings,
  onAssign,
  settingsBusy,
  activationBusy,
}) => {
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);
  const selectedSlug = selectedTheme?.slug;
  const nameFor = (slug?: string) =>
    themes.find((theme) => theme.slug === slug)?.name || slug || "—";
  const themeOptions = themes.map((theme) => ({
    label: `${theme.name}${theme.isSystem ? " (system)" : ""}`,
    value: theme.slug,
  }));

  const update = (path: string, value: string) =>
    mutate((current) => setByPath(current, path, value));

  return (
    <div className="space-y-5">
      <PanelSection
        title="Theme Identity"
        description="Display metadata stored with this theme configuration."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Theme name"
            value={config.name}
            onChange={(value) => update("name", value)}
          />
          <TextField
            label="Tagline"
            value={config.tagline}
            onChange={(value) => update("tagline", value)}
          />
          <TextField
            label="Badge"
            value={config.badge || ""}
            onChange={(value) => update("badge", value)}
          />
          <TextField
            label="Slug"
            hint="read-only"
            value={config.slug}
            onChange={() => undefined}
          />
        </div>
      </PanelSection>

      <PanelSection
        title="Theme Engine"
        description="Global and per-application enablement. Changes apply instantly."
      >
        <ToggleField
          label="Global theme engine"
          description="Master switch for all dynamic theming."
          checked={settings?.globalEngineEnabled ?? true}
          disabled={settingsBusy}
          onChange={(checked) => onToggleSettings({ globalEngineEnabled: checked })}
        />
        <ToggleField
          label="Website theme"
          description={`Assigned: ${nameFor(settings?.websiteThemeId)}`}
          checked={settings?.websiteThemeEnabled ?? true}
          disabled={settingsBusy}
          onChange={(checked) => onToggleSettings({ websiteThemeEnabled: checked })}
        />
        <ToggleField
          label="Admin theme"
          description={`Assigned: ${nameFor(settings?.adminThemeId)}`}
          checked={settings?.adminThemeEnabled ?? true}
          disabled={settingsBusy}
          onChange={(checked) => onToggleSettings({ adminThemeEnabled: checked })}
        />
        <SelectField
          label="Fallback theme"
          hint="used when an assignment is off"
          value={settings?.fallbackThemeId ?? ""}
          options={themeOptions}
          onChange={(value) => onToggleSettings({ fallbackThemeId: value })}
        />
      </PanelSection>

      <PanelSection
        title="Assignment"
        description="Assign the selected theme independently to each application."
      >
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
          Selected:{" "}
          <span className="font-semibold text-foreground">
            {selectedTheme?.name || "none"}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={settings?.websiteThemeId === selectedSlug ? "secondary" : "primary"}
            disabled={!selectedThemeId || activationBusy || settings?.websiteThemeId === selectedSlug}
            onClick={() => onAssign("website")}
          >
            {settings?.websiteThemeId === selectedSlug ? "Assigned to Website" : "Assign to Website"}
          </Button>
          <Button
            variant={settings?.adminThemeId === selectedSlug ? "secondary" : "primary"}
            disabled={!selectedThemeId || activationBusy || settings?.adminThemeId === selectedSlug}
            onClick={() => onAssign("admin")}
          >
            {settings?.adminThemeId === selectedSlug ? "Assigned to Admin" : "Assign to Admin"}
          </Button>
          <Button
            variant="primary"
            disabled={
              !selectedThemeId ||
              activationBusy ||
              (settings?.websiteThemeId === selectedSlug && settings?.adminThemeId === selectedSlug)
            }
            onClick={() => onAssign("both")}
          >
            {settings?.websiteThemeId === selectedSlug && settings?.adminThemeId === selectedSlug
              ? "Assigned to Both"
              : "Assign to Both"}
          </Button>
        </div>
      </PanelSection>
    </div>
  );
};
