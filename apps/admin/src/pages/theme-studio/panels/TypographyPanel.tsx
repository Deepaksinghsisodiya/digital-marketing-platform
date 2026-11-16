import React from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { PanelSection, SelectField, TextField } from "../TokenControls";
import { setByPath, type ConfigMutator } from "../themeStudioUtils";

const APPROVED_FONTS = [
  { label: "Inter", value: "Inter" },
  { label: "Geist", value: "Geist" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Sora", value: "Sora" },
  { label: "Manrope", value: "Manrope" },
  { label: "Outfit", value: "Outfit" },
  { label: "Roboto", value: "Roboto" },
  { label: "System UI", value: "system-ui" },
];

const FALLBACK = "ui-sans-serif, system-ui, sans-serif";

function toStack(font: string): string {
  return `${font}, ${FALLBACK}`;
}

function fromStack(stack: string): string {
  return stack.split(",")[0]?.replace(/['"]/g, "").trim() || "Inter";
}

export const TypographyPanel: React.FC<{
  config: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
}> = ({ config, mutate }) => {
  const fontOptions = APPROVED_FONTS.map((font) => ({
    label: font.label,
    value: font.value,
  }));

  const update = (key: string, value: string) =>
    mutate((current) => setByPath(current, `typography.${key}`, value));

  return (
    <div className="space-y-5">
      <PanelSection
        title="Font Families"
        description="Only approved, preloaded font families are allowed."
      >
        {(
          [
            { key: "fontHeading", label: "Heading font" },
            { key: "fontSans", label: "Body font" },
            { key: "fontButton", label: "Button font" },
            { key: "fontNav", label: "Navigation font" },
          ] as { key: keyof ThemeConfig["typography"]; label: string }[]
        ).map(({ key, label }) => (
          <SelectField
            key={key}
            label={label}
            value={fromStack(config.typography[key] as string)}
            options={fontOptions}
            onChange={(value) => update(key, toStack(value))}
          />
        ))}
        <SelectField
          label="Monospace font"
          value={config.typography.fontMono.startsWith("ui-monospace") ? "ui-monospace" : "monospace"}
          options={[
            { label: "UI Monospace", value: "ui-monospace" },
            { label: "Monospace", value: "monospace" },
          ]}
          onChange={(value) =>
            update(
              "fontMono",
              value === "ui-monospace"
                ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                : "monospace",
            )
          }
        />
      </PanelSection>

      <PanelSection title="Scale & Rhythm">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Base font size"
            hint="px or rem"
            value={config.typography.baseFontSize}
            onChange={(value) => update("baseFontSize", value)}
          />
          <SelectField
            label="Heading weight"
            value={config.typography.headingWeight}
            options={["500", "600", "700", "800", "900"].map((weight) => ({
              label: weight,
              value: weight,
            }))}
            onChange={(value) => update("headingWeight", value)}
          />
          <TextField
            label="Heading letter spacing"
            hint="em"
            value={config.typography.letterSpacingHeading}
            onChange={(value) => update("letterSpacingHeading", value)}
          />
        </div>
      </PanelSection>
    </div>
  );
};
