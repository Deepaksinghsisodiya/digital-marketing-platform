import React, { useState } from "react";
import type { ThemeVersionDto } from "../../../types";
import { Button, PanelSection } from "../TokenControls";

export const HistoryPanel: React.FC<{
  versions: ThemeVersionDto[];
  loading?: boolean;
  onRollback: (versionNumber: number) => void;
  rollbackBusy?: boolean;
}> = ({ versions, loading, onRollback, rollbackBusy }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PanelSection
        title="Version History"
        description="Immutable published snapshots. Restoring overwrites the current published configuration."
      >
        {loading ? (
          <p className="text-xs text-muted">Loading versions…</p>
        ) : versions.length === 0 ? (
          <p className="text-xs text-muted">No published versions yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      v{version.versionNumber}
                      {index === 0 ? (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          CURRENT
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {version.changeDescription || "No description"} ·{" "}
                      {new Date(version.changedAtUtc).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setExpanded((prev) =>
                          prev === version.id ? null : version.id,
                        )
                      }
                    >
                      {expanded === version.id ? "Hide" : "View"}
                    </Button>
                    <Button
                      variant="primary"
                      disabled={rollbackBusy || index === 0}
                      onClick={() => onRollback(version.versionNumber)}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
                {expanded === version.id ? (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-background p-3 text-[11px] text-muted">
                    {version.configJson}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </PanelSection>
    </div>
  );
};
