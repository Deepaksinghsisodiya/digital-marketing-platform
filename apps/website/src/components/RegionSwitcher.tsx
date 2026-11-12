"use client";

import React, { useTransition } from "react";
import {
  REGION_CONFIG,
  resolveRegion,
  type RegionDefinition,
} from "../config/region";
import { Globe } from "lucide-react";

interface RegionSwitcherProps {
  currentRegion?: RegionDefinition;
  currentRegionCode?: string;
}

export function RegionSwitcher({
  currentRegion,
  currentRegionCode,
}: RegionSwitcherProps) {
  const [, startTransition] = useTransition();

  const activeRegion = currentRegion || resolveRegion(currentRegionCode);

  const handleRegionChange = (newRegionCode: string) => {
    startTransition(() => {
      document.cookie = `${REGION_CONFIG.cookieName}=${newRegionCode}; path=/; max-age=31536000; SameSite=Lax`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-xl transition shadow-sm">
      <Globe className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
      <select
        value={activeRegion.code}
        onChange={(e) => handleRegionChange(e.target.value)}
        className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
        aria-label="Select Target Region"
      >
        {Object.values(REGION_CONFIG.supportedRegions).map((reg) => (
          <option
            key={reg.code}
            value={reg.code}
            className="bg-white text-slate-900 py-1"
          >
            {reg.flag} {reg.name} ({reg.currency})
          </option>
        ))}
      </select>
    </div>
  );
}
