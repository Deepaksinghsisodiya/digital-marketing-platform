/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  BarChart2,
  Sparkles,
} from "lucide-react";

export interface HeroMetricConfig {
  metricTitle?: string;
  metricBadge?: string;
  metricLabel?: string;
  metricValue?: string;
  metricDelta?: string;
  metricSubtitle?: string;
  metricFooterNote?: string;
  stat1Label?: string;
  stat1Value?: string;
  stat1Sub?: string;
  stat2Label?: string;
  stat2Value?: string;
  stat2Sub?: string;
}

interface HeroResultsVisualProps extends HeroMetricConfig {
  imageUrl?: string;
  imageAlt?: string;
  slideIndex?: number;
}

export const HeroResultsVisual: React.FC<HeroResultsVisualProps> = ({
  imageUrl,
  imageAlt,
  slideIndex = 0,
  metricTitle,
  metricBadge,
  metricLabel,
  metricValue,
  metricDelta,
  metricSubtitle,
  metricFooterNote,
  stat1Label,
  stat1Value,
  stat1Sub,
  stat2Label,
  stat2Value,
  stat2Sub,
}) => {
  const [imgError, setImgError] = useState(false);

  const hasValidImage =
    Boolean(imageUrl) && !imageUrl?.startsWith("blob:") && !imgError;
  const hasStats = Boolean(stat1Value?.trim() || stat2Value?.trim());
  const hasMetrics = Boolean(
    metricValue?.trim() || metricTitle?.trim() || hasStats,
  );

  if (!hasValidImage && !hasMetrics) {
    return null;
  }

  const stat1Down = Boolean(stat1Value?.trim().startsWith("-"));

  return (
    <motion.div
      key={`bento-${slideIndex}-${metricValue || "visual"}`}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-lg sm:max-w-xl mx-auto"
    >
      {/* Animated Ambient Teal & Coral Glow */}
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-8 -right-8 w-64 h-64 bg-teal-500/18 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-8 -left-8 w-64 h-64 bg-rose-400/18 rounded-full blur-3xl pointer-events-none"
      />

      {/* High-Contrast Dark Bento Showcase Card (100% Admin/DB Driven) */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25 }}
        className="relative rounded-3xl bg-slate-950 border border-slate-800/90 ring-1 ring-white/10 shadow-[0_32px_80px_-15px_rgba(15,23,42,0.38)] text-white overflow-hidden"
      >
        {/* Top Visual Banner Image + Live Floating Status */}
        <div
          className={`relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950/80 to-slate-900 border-b border-slate-800/80 ${
            hasMetrics ? "h-40 sm:h-48" : "h-64 sm:h-72"
          }`}
        >
          {hasValidImage ? (
            <motion.img
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              src={imageUrl}
              alt={imageAlt || metricTitle || "Hero showcase"}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.28),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.2),transparent_55%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

          {/* Top Bar inside Visual */}
          {(metricTitle || metricBadge) && (
            <div className="absolute top-3.5 inset-x-4 flex items-center justify-between gap-2">
              {metricTitle ? (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200">
                  <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>{metricTitle}</span>
                </div>
              ) : (
                <span />
              )}
              {metricBadge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{metricBadge}</span>
                </div>
              )}
            </div>
          )}

          {/* Primary Metric Overlay */}
          {(metricLabel || metricValue) && (
            <div className="absolute bottom-3.5 inset-x-5 flex items-end justify-between gap-3">
              <div>
                {metricLabel && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    {metricLabel}
                  </span>
                )}
                {metricValue && (
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight"
                    >
                      {metricValue}
                    </motion.span>
                    {metricDelta && (
                      <span className="inline-flex items-center text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-400/25">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {metricDelta}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Sparkles className="w-5 h-5 text-teal-400/80 shrink-0 mb-1 animate-pulse" />
            </div>
          )}
        </div>

        {/* Lower Analytics & Outcome Body */}
        {hasMetrics && (
          <div className="p-5 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
            {/* Animated SVG Conversion Curve */}
            <div className="h-16 w-full relative">
              <svg
                viewBox="0 0 400 60"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="65%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>
                {/* Subtle Dashboard Gridlines */}
                <line x1="0" y1="15" x2="400" y2="15" stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <line x1="0" y1="55" x2="400" y2="55" stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <motion.path
                  d="M 0 50 Q 100 40, 180 28 T 320 15 T 400 5"
                  fill="none"
                  stroke="url(#heroLineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
                <motion.path
                  d="M 0 50 Q 100 40, 180 28 T 320 15 T 400 5 L 400 60 L 0 60 Z"
                  fill="url(#heroAreaGrad)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                />
                <motion.circle
                  cx="180"
                  cy="28"
                  r="3.5"
                  fill="#14b8a6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                />
                <motion.circle
                  cx="400"
                  cy="5"
                  r="4.5"
                  fill="#fb7185"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.35, 1] }}
                  transition={{ delay: 0.9, duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>

            {/* 2-Column Outcome Cards (Only rendered when provided by Admin) */}
            {hasStats && (
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5 sm:gap-3">
                {stat1Value && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5 hover:border-teal-500/40 transition-colors"
                  >
                    {stat1Label && (
                      <span className="text-[10.5px] text-slate-400 block font-medium">
                        {stat1Label}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-white font-mono">
                        {stat1Value}
                      </span>
                      {stat1Down ? (
                        <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    {stat1Sub && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {stat1Sub}
                      </span>
                    )}
                  </motion.div>
                )}

                {stat2Value && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5 hover:border-teal-500/40 transition-colors"
                  >
                    {stat2Label && (
                      <span className="text-[10.5px] text-slate-400 block font-medium">
                        {stat2Label}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-white font-mono">
                        {stat2Value}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-teal-400" />
                    </div>
                    {stat2Sub && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {stat2Sub}
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Bottom Trust Line (Only rendered when provided by Admin) */}
            {(metricSubtitle || metricFooterNote) && (
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                {metricSubtitle ? (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>{metricSubtitle}</span>
                  </div>
                ) : (
                  <span />
                )}
                {metricFooterNote && (
                  <span className="text-slate-400 font-mono text-[10px]">
                    {metricFooterNote}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
