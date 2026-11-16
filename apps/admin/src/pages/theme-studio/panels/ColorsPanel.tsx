import React, { useMemo, useState } from "react";
import type { ColorTokens, ThemeConfig } from "@nexora/design-tokens";
import { evaluateThemeContrast } from "@nexora/design-tokens";
import {
  ColorField,
  PanelSection,
} from "../TokenControls";
import {
  COLOR_CONTRAST_PAIRS,
  getByPath,
  setByPath,
  titleize,
  type ConfigMutator,
} from "../themeStudioUtils";

type ColorMode = "light" | "dark";

const COLOR_GROUPS: { title: string; keys: (keyof ColorTokens)[] }[] = [
  {
    title: "Brand",
    keys: [
      "primary",
      "primaryForeground",
      "primaryHover",
      "primaryActive",
      "secondary",
      "secondaryForeground",
      "accent",
      "accentForeground",
    ],
  },
  {
    title: "Surfaces",
    keys: [
      "background",
      "foreground",
      "surface",
      "surfaceElevated",
      "card",
      "cardForeground",
      "navbar",
      "footer",
      "sidebar",
      "modal",
      "overlay",
    ],
  },
  {
    title: "Text",
    keys: [
      "textPrimary",
      "textSecondary",
      "textMuted",
      "textInverted",
      "link",
      "linkHover",
    ],
  },
  {
    title: "UI Elements",
    keys: [
      "border",
      "borderStrong",
      "divider",
      "input",
      "ring",
      "selection",
      "disabled",
      "placeholder",
    ],
  },
  {
    title: "Status",
    keys: ["success", "warning", "danger", "info"],
  },
  {
    title: "Dark Canvas",
    keys: ["navy", "ink"],
  },
];

export const ColorsPanel: React.FC<{
  config: ThemeConfig;
  defaults: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
}> = ({ config, defaults, mutate }) => {
  const [mode, setMode] = useState<ColorMode>("light");

  const contrastByKey = useMemo(() => {
    const map = new Map<string, { level: "PASS" | "WARNING" | "FAIL"; ratio: number; label: string }>();
    for (const pair of COLOR_CONTRAST_PAIRS) {
      const fg = getByPath(config.colors[mode], pair.foregroundPath.replace("colors.", "")) as string;
      const bg = getByPath(config.colors[mode], pair.backgroundPath.replace("colors.", "")) as string;
      if (!fg || !bg) continue;
      const result = evaluateThemeContrast(fg, bg, pair.label);
      const fgKey = pair.foregroundPath.split(".").pop() as string;
      const bgKey = pair.backgroundPath.split(".").pop() as string;
      map.set(fgKey, { level: result.level, ratio: result.ratio, label: pair.label });
      map.set(bgKey, { level: result.level, ratio: result.ratio, label: pair.label });
    }
    return map;
  }, [config, mode]);

  const updateColor = (key: string, value: string) => {
    mutate((current) => setByPath(current, `colors.${mode}.${key}`, value));
  };

  const resetColor = (key: string) => {
    const fallback =
      (defaults.colors[mode] as unknown as Record<string, string>)[key] ?? "";
    mutate((current) => setByPath(current, `colors.${mode}.${key}`, fallback));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1">
        {(["light", "dark"] as ColorMode[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
              mode === option
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option} palette
          </button>
        ))}
      </div>

      {COLOR_GROUPS.map((group) => (
        <PanelSection key={group.title} title={group.title}>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.keys.map((key) => {
              const value =
                (config.colors[mode] as unknown as Record<string, string>)[key] ?? "";
              const contrast = contrastByKey.get(key);
              return (
                <ColorField
                  key={key}
                  label={titleize(key)}
                  value={value}
                  onChange={(next) => updateColor(key, next)}
                  onReset={() => resetColor(key)}
                  contrastLabel={contrast?.label}
                  contrastLevel={contrast?.level}
                  contrastRatio={contrast?.ratio}
                />
              );
            })}
          </div>
        </PanelSection>
      ))}

      <PanelSection
        title="Gradient Builder"
        description="Edit the compiled gradient CSS values directly."
      >
        {(["gradientBrand", "gradientHero", "gradientAccent"] as const).map((key) => (
          <ColorFieldAsText
            key={key}
            label={titleize(key)}
            value={config.gradients[key]}
            onChange={(value) => mutate((current) => setByPath(current, `gradients.${key}`, value))}
          />
        ))}
      </PanelSection>
    </div>
  );
};

const ColorFieldAsText: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-foreground">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-input bg-surface px-3 py-2 font-mono text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
    />
  </label>
);
