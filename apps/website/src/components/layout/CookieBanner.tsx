"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Cookie, X } from "lucide-react";
import { Button } from "../ui/button";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_NAME = "nexora_cookie_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/** Helper to read stored consent from either document.cookie or localStorage */
function getStoredConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Check real browser cookie first
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (cookieMatch && cookieMatch[1]) {
      return JSON.parse(decodeURIComponent(cookieMatch[1]));
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(COOKIE_NAME);
    if (local) {
      return JSON.parse(local);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/** Helper to persist consent in both real browser cookie and localStorage */
function saveStoredConsent(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;

  const json = JSON.stringify(prefs);

  // 1. Set real browser cookie (Path=/, 1 Year expiry, SameSite=Lax)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

  // 2. Set localStorage for instant synchronous access
  try {
    localStorage.setItem(COOKIE_NAME, json);
  } catch {
    // Storage might be disabled in private mode
  }

  // 3. Dispatch global event so TrackingScripts & Google Analytics / Meta Pixel react immediately
  window.dispatchEvent(new Event("nexora_cookie_consent_updated"));
}

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    const existing = getStoredConsent();

    if (!existing) {
      // First-time visitor: show banner after small delay for smooth page entry
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      // Restore previous choices into state
      setAnalyticsEnabled(Boolean(existing.analytics));
      setMarketingEnabled(Boolean(existing.marketing));
    }

    // Listen for manual trigger (e.g. from footer "Cookie Settings" button)
    const openListener = () => {
      setVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener("nexora_open_cookie_preferences", openListener);
    return () => {
      window.removeEventListener("nexora_open_cookie_preferences", openListener);
    };
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    saveStoredConsent(preferences);
    setAnalyticsEnabled(true);
    setMarketingEnabled(true);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      timestamp: new Date().toISOString(),
    };
    saveStoredConsent(preferences);
    setVisible(false);
  };

  const handleDecline = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    saveStoredConsent(preferences);
    setAnalyticsEnabled(false);
    setMarketingEnabled(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300 ring-1 ring-slate-900/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              We Value Your Privacy
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              We use essential cookies to ensure site security and optional cookies to analyze website traffic and optimize our marketing campaigns. You can adjust your preferences anytime.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDecline}
          aria-label="Close cookie banner"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Granular Toggles */}
      {showPreferences && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] animate-in fade-in duration-200">
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
                className="accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Traffic & Page Views
            </span>
          </label>

          <label className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Marketing</span>
              <input
                type="checkbox"
                checked={marketingEnabled}
                onChange={(e) => setMarketingEnabled(e.target.checked)}
                className="accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Ad Campaign Attribution
            </span>
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <Link
            href="/cookies"
            className="text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-2 font-medium"
          >
            Cookie Policy
          </Link>
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer"
          >
            {showPreferences ? "Hide Options" : "Customize"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showPreferences ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
            >
              Save Choices
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Essential Only
            </button>
          )}

          <Button
            type="button"
            onClick={handleAcceptAll}
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-1.5 cursor-pointer shadow-sm"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
