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
    window.dispatchEvent(new Event("nexora_cookie_consent_updated"));
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
    window.dispatchEvent(new Event("nexora_cookie_consent_updated"));
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
    window.dispatchEvent(new Event("nexora_cookie_consent_updated"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 shadow-2xl text-slate-800 animate-in fade-in-0 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Cookie Preferences & Privacy Notice
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            We respect your privacy rights (DPDP, GDPR, CCPA). We use essential
            cookies for platform security and optional cookies for deterministic
            multi-touch attribution modeling.
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-bold text-slate-900 block">Essential</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <Check className="w-3 h-3" /> Always Active
          </span>
        </div>

        <label className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Analytics</span>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Traffic & heatmaps
          </span>
        </label>

        <label className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Marketing</span>
            <input
              type="checkbox"
              checked={marketingEnabled}
              onChange={(e) => setMarketingEnabled(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Attribution & ads
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <Link
          href="/cookies"
          className="text-[11px] text-slate-600 hover:text-indigo-600 underline underline-offset-2 font-medium"
        >
          Read Policy &rarr;
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleSaveCustom}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
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
