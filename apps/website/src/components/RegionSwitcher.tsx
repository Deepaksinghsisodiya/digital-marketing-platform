"use client";

import { useTransition } from "react";
import { REGION_CONFIG, type RegionDefinition } from "../config/region";

interface RegionSwitcherProps {
  currentRegion: RegionDefinition;
}

export function RegionSwitcher({ currentRegion }: RegionSwitcherProps) {
  const [, startTransition] = useTransition();

  const handleRegionChange = (newRegionCode: string) => {
    startTransition(() => {
      document.cookie = `${REGION_CONFIG.cookieName}=${newRegionCode}; path=/; max-age=31536000; SameSite=Lax`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted bg-paper border border-border px-3 py-1.5 rounded-full">
      <span className="font-semibold text-ink">Region:</span>
      <select
        value={currentRegion.code}
        onChange={(e) => handleRegionChange(e.target.value)}
        className="bg-transparent text-ink font-medium focus:outline-none cursor-pointer"
        aria-label="Select Region"
      >
        {Object.values(REGION_CONFIG.supportedRegions).map((reg) => (
          <option key={reg.code} value={reg.code}>
            {reg.flag} {reg.name} ({reg.currency})
          </option>
        ))}
      </select>
    </div>
  );
}
