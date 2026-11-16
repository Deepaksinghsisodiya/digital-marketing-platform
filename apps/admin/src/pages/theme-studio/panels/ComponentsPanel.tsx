import React from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { ColorField, PanelSection, SelectField, TextField } from "../TokenControls";
import { setByPath, titleize, type ConfigMutator } from "../themeStudioUtils";

const SHAPE_KEYS: (keyof ThemeConfig["shape"])[] = [
  "radiusSm",
  "radiusMd",
  "radiusLg",
  "radiusXl",
  "radiusFull",
  "buttonRadius",
  "cardRadius",
  "inputRadius",
];

export const ComponentsPanel: React.FC<{
  config: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
}> = ({ config, mutate }) => {
  const update = (path: string, value: string) =>
    mutate((current) => setByPath(current, path, value));

  return (
    <div className="space-y-5">
      <PanelSection
        title="Component Styles"
        description="Structural choices applied across website and admin components."
      >
        <SelectField
          label="Button style"
          value={config.components.buttonStyle}
          options={[
            { label: "Rounded", value: "rounded" },
            { label: "Sharp", value: "sharp" },
            { label: "Pill", value: "pill" },
          ]}
          onChange={(value) => update("components.buttonStyle", value)}
        />
        <SelectField
          label="Card style"
          value={config.components.cardStyle}
          options={[
            { label: "Flat", value: "flat" },
            { label: "Elevated", value: "elevated" },
            { label: "Glass", value: "glass" },
            { label: "Outlined", value: "outlined" },
            { label: "Gradient", value: "gradient" },
          ]}
          onChange={(value) => update("components.cardStyle", value)}
        />
        <SelectField
          label="Table density"
          value={config.components.tableDensity}
          options={[
            { label: "Compact", value: "compact" },
            { label: "Normal", value: "normal" },
            { label: "Spacious", value: "spacious" },
          ]}
          onChange={(value) => update("components.tableDensity", value)}
        />
      </PanelSection>

      <PanelSection title="Radii" description="Controls buttons, cards, inputs and containers.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SHAPE_KEYS.map((key) => (
            <TextField
              key={key}
              label={titleize(key)}
              value={config.shape[key]}
              onChange={(value) => update(`shape.${key}`, value)}
            />
          ))}
        </div>
      </PanelSection>

      <PanelSection
        title="Admin Surfaces"
        description="Sidebar, navbar and widget surfaces for the admin application."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "sidebarBg",
              "sidebarBorder",
              "sidebarActiveItem",
              "navbarBg",
              "navbarBorder",
              "widgetCardBg",
            ] as (keyof ThemeConfig["admin"])[]
          ).map((key) => (
            <ColorField
              key={key}
              label={titleize(key)}
              value={config.admin[key]}
              onChange={(value) => update(`admin.${key}`, value)}
            />
          ))}
        </div>
      </PanelSection>
    </div>
  );
};
