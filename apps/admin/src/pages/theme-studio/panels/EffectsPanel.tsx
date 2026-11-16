import React from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { PanelSection, SelectField, TextField, ToggleField } from "../TokenControls";
import { setByPath, titleize, type ConfigMutator } from "../themeStudioUtils";

export const EffectsPanel: React.FC<{
  config: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
}> = ({ config, mutate }) => {
  const update = (path: string, value: unknown) =>
    mutate((current) => setByPath(current, path, value));

  return (
    <div className="space-y-5">
      <PanelSection
        title="Shadows & Glow"
        description="Elevation and glow values consumed by cards and buttons."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "shadowSm",
              "shadowMd",
              "shadowLg",
              "glow",
              "glassBlur",
            ] as (keyof ThemeConfig["shadows"])[]
          ).map((key) => (
            <TextField
              key={key}
              label={titleize(key)}
              value={config.shadows[key]}
              onChange={(value) => update(`shadows.${key}`, value)}
            />
          ))}
        </div>
      </PanelSection>

      <PanelSection
        title="Motion"
        description="Global animation control. Respects prefers-reduced-motion at runtime."
      >
        <ToggleField
          label="Enable motion"
          description="Turn off for a static, reduced-motion interface."
          checked={config.motion.enabled}
          onChange={(checked) => update("motion.enabled", checked)}
        />
        <SelectField
          label="Motion speed"
          value={config.motion.speed}
          options={[
            { label: "Fast", value: "fast" },
            { label: "Normal", value: "normal" },
            { label: "Slow", value: "slow" },
          ]}
          onChange={(value) => update("motion.speed", value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Fast duration"
            value={config.motion.durationFast}
            onChange={(value) => update("motion.durationFast", value)}
          />
          <TextField
            label="Normal duration"
            value={config.motion.durationNormal}
            onChange={(value) => update("motion.durationNormal", value)}
          />
          <TextField
            label="Slow duration"
            value={config.motion.durationSlow}
            onChange={(value) => update("motion.durationSlow", value)}
          />
        </div>
      </PanelSection>
    </div>
  );
};
