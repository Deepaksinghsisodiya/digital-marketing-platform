"use client";

import React, { useEffect, useState } from "react";

export function SystemStatusIndicator() {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
    fetch(`${apiUrl}/health/ready`, { cache: "no-store" })
      .then((res) => {
        setIsHealthy(res.ok);
      })
      .catch(() => {
        setIsHealthy(false);
      });
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isHealthy ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
        }`}
      />
      <span>
        {isHealthy ? "All Systems Operational" : "Maintenance Mode"}
      </span>
    </div>
  );
}
