"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

interface AnnouncementConfig {
  enabled?: boolean;
  text?: string;
  link?: string;
  badge?: string;
  startDate?: string;
  endDate?: string;
}

interface AnnouncementBarProps {
  announcementBarJson?: string | null;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  announcementBarJson,
}) => {
  const [dismissed, setDismissed] = useState(true);
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);

  useEffect(() => {
    if (!announcementBarJson) return;
    try {
      const parsed: AnnouncementConfig = JSON.parse(announcementBarJson);
      if (parsed.enabled !== false && parsed.text) {
        // Check schedule if dates provided
        const now = new Date().getTime();
        if (parsed.startDate && new Date(parsed.startDate).getTime() > now)
          return;
        if (parsed.endDate && new Date(parsed.endDate).getTime() < now) return;

        // Check dismissal cookie/storage
        const isDismissed =
          sessionStorage.getItem("nexora_announcement_dismissed") === "true";
        if (!isDismissed) {
          setConfig(parsed);
          setDismissed(false);
        }
      }
    } catch {
      // Safe fallback
    }
  }, [announcementBarJson]);

  if (dismissed || !config || !config.text) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("nexora_announcement_dismissed", "true");
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 text-slate-800 text-[11px] py-2 px-4 border-b border-indigo-100 select-none">
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto flex items-center justify-center gap-2 font-medium pr-8">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 text-[10px]">
          <Sparkles className="w-3 h-3 text-amber-500" />{" "}
          {config.badge || "Announcement"}
        </span>
        <span className="text-slate-700 truncate">{config.text}</span>
        {config.link && (
          <Link
            href={config.link}
            className="hidden sm:inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition ml-2 underline underline-offset-2 shrink-0"
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 rounded-md transition hover:bg-slate-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
