"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Check } from "lucide-react";
import { Button } from "../ui/button";

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("nexora_cookie_consent");
    if (!consent) {
      setVisible(true);
    }

    const openListener = () => setVisible(true);
    window.addEventListener("nexora_open_cookie_preferences", openListener);
    return () =>
      window.removeEventListener(
        "nexora_open_cookie_preferences",
        openListener,
      );
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("nexora_cookie_consent", JSON.stringify(preferences));
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const preferences = {
      necessary: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("nexora_cookie_consent", JSON.stringify(preferences));
    setVisible(false);
  };

  const handleDecline = () => {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("nexora_cookie_consent", JSON.stringify(preferences));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl text-slate-200 animate-in fade-in-0 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Cookie Preferences & Privacy Notice
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            We respect your privacy rights (DPDP, GDPR, CCPA). We use essential
            cookies for platform security and optional cookies for deterministic
            multi-touch attribution modeling.
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="font-bold text-white block">Essential</span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <Check className="w-3 h-3" /> Always Active
          </span>
        </div>

        <label className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Analytics</span>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Traffic & heatmaps
          </span>
        </label>

        <label className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Marketing</span>
            <input
              type="checkbox"
              checked={marketingEnabled}
              onChange={(e) => setMarketingEnabled(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Attribution & ads
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <Link
          href="/cookies"
          className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
        >
          Read Policy &rarr;
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleSaveCustom}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            Save Choices
          </button>
          <Button
            type="button"
            onClick={handleAcceptAll}
            variant="default"
            size="sm"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
