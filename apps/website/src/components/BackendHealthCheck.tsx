"use client";

import { useEffect, useState } from "react";
import type { HealthLiveResponse } from "@nexora/contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";

export function BackendHealthCheck() {
  const [health, setHealth] = useState<HealthLiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/health/live`, {
          headers: {
            "X-Correlation-Id": `web-${Date.now()}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: HealthLiveResponse = await res.json();
        if (isMounted) {
          setHealth(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Connection failed");
          setHealth(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="border border-border bg-white p-5 rounded-xl shadow-sm text-left max-w-md w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-ink">Backend Connectivity</h3>
        {loading ? (
          <span className="text-xs text-muted">Checking...</span>
        ) : health?.status === "Healthy" ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-green font-medium bg-green-light px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            Healthy
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-orange font-medium bg-orange-light px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange" />
            Offline / Error
          </span>
        )}
      </div>

      <div className="text-xs text-muted space-y-1">
        <p>
          <span className="font-mono text-[11px] text-ink">Endpoint:</span>{" "}
          <code className="bg-paper px-1.5 py-0.5 rounded text-[11px] font-mono">
            {API_BASE_URL}/health/live
          </code>
        </p>
        {health && (
          <>
            <p>
              <span className="font-mono text-[11px] text-ink">Service:</span>{" "}
              {health.service}
            </p>
            <p>
              <span className="font-mono text-[11px] text-ink">
                Server Time (UTC):
              </span>{" "}
              {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          </>
        )}
        {error && (
          <p className="text-pink text-xs mt-2">
            Notice: {error} (start backend on port 5201)
          </p>
        )}
      </div>
    </div>
  );
}
