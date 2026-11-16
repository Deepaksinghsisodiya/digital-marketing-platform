import React, { useEffect, useState } from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { Button, PanelSection } from "../TokenControls";

export const AdvancedPanel: React.FC<{
  config: ThemeConfig;
  onApplyJson: (json: string) => string | null;
  versionToken?: string;
  publishedVersion?: number;
}> = ({ config, onApplyJson, versionToken, publishedVersion }) => {
  const [json, setJson] = useState(() => JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJson(JSON.stringify(config, null, 2));
  }, [config]);

  const apply = () => {
    const result = onApplyJson(json);
    setError(result);
  };

  return (
    <div className="space-y-5">
      <PanelSection
        title="Raw Configuration"
        description="Advanced editing of the validated theme JSON. Invalid values are rejected."
      >
        <div className="grid gap-3 text-xs text-muted sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            Published version:{" "}
            <span className="font-semibold text-foreground">
              v{publishedVersion ?? 0}
            </span>
          </div>
          <div className="truncate rounded-lg border border-border bg-surface px-3 py-2">
            Token: <span className="font-mono text-foreground">{versionToken || "—"}</span>
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground">
            Theme JSON
          </span>
          <textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full rounded-lg border border-input bg-surface px-3 py-2 font-mono text-[11px] text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button variant="primary" onClick={apply}>
            Validate & Apply
          </Button>
          <Button onClick={() => setJson(JSON.stringify(config, null, 2))}>
            Reset Editor
          </Button>
        </div>
      </PanelSection>
    </div>
  );
};
