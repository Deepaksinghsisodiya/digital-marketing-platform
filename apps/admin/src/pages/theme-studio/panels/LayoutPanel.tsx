import React from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { PanelSection, TextField } from "../TokenControls";
import { setByPath, titleize, type ConfigMutator } from "../themeStudioUtils";

export const LayoutPanel: React.FC<{
  config: ThemeConfig;
  mutate: (mutator: ConfigMutator) => void;
}> = ({ config, mutate }) => {
  const update = (path: string, value: string) =>
    mutate((current) => setByPath(current, path, value));

  return (
    <div className="space-y-5">
      <PanelSection
        title="Website Layout"
        description="Spacing and container sizing. These values cannot break content structure."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "containerWidth",
              "sectionSpacing",
              "navbarHeight",
              "sidebarWidth",
            ] as (keyof ThemeConfig["layout"])[]
          ).map((key) => (
            <TextField
              key={key}
              label={titleize(key)}
              value={config.layout[key]}
              onChange={(value) => update(`layout.${key}`, value)}
            />
          ))}
        </div>
      </PanelSection>

      <PanelSection
        title="Admin Layout"
        description="Sidebar and navigation sizing for the admin workspace."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Sidebar width"
            value={config.layout.sidebarWidth}
            onChange={(value) => update("layout.sidebarWidth", value)}
          />
          <TextField
            label="Navbar height"
            value={config.layout.navbarHeight}
            onChange={(value) => update("layout.navbarHeight", value)}
          />
        </div>
      </PanelSection>
    </div>
  );
};
