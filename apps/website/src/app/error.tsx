/* eslint-disable no-console */
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging
    console.error("Runtime exception caught by Next.js error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-2xl mb-6 shadow-xl shadow-rose-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <Badge variant="destructive">Platform Runtime Notice</Badge>
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
        Unexpected System Exception
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        Our automated telemetry has captured this event. Our reliability
        engineers have been notified via the Outbox alerting pipeline.
      </p>

      {error.digest && (
        <code className="mt-4 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          Digest: {error.digest}
        </code>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          variant="gradient"
          size="default"
          shape="pill"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Attempt Recovery
        </Button>
        <Button asChild variant="outline" size="default" shape="pill">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
