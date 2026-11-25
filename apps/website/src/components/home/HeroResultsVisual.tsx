"use client";

import React from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap, Sparkles, BarChart2 } from "lucide-react";

export function HeroResultsVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative background glow with Teal & Coral */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -left-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Glass Card with Deep Navy background */}
      <div className="relative rounded-3xl bg-navy border border-white/10 p-6 sm:p-8 shadow-2xl text-white space-y-6 overflow-hidden">
        {/* Top Header of the Card */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Performance Architecture</span>
              <span className="text-[11px] text-slate-400">Auditable Campaign Growth</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span>Active Attribution</span>
          </div>
        </div>

        {/* Big Highlight: ROAS & Pipeline */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Average Portfolio ROAS
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              4.85x
            </span>
            <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-lg border border-primary/30">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +42% vs Industry
            </span>
          </div>
        </div>

        {/* Mini SVG Conversion Graph */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Month 1</span>
            <span>Month 2</span>
            <span>Month 3 (Scaled)</span>
          </div>
          <div className="h-20 w-full relative">
            <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: "var(--nexora-primary)" }} stopOpacity="0.4" />
                  <stop offset="100%" style={{ stopColor: "var(--nexora-primary)" }} stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" style={{ stopColor: "var(--nexora-primary)" }} />
                  <stop offset="60%" style={{ stopColor: "var(--nexora-accent)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--nexora-accent)" }} />
                </linearGradient>
              </defs>
              <path
                d="M 0 65 Q 100 50, 180 35 T 320 20 T 400 5"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 65 Q 100 50, 180 35 T 320 20 T 400 5 L 400 80 L 0 80 Z"
                fill="url(#chartGradient)"
              />
              {/* Highlight Pulse Dots */}
              <circle cx="180" cy="35" r="4" style={{ fill: "var(--nexora-primary)" }} />
              <circle cx="400" cy="5" r="5" style={{ fill: "var(--nexora-accent)" }} />
            </svg>
          </div>
        </div>

        {/* 2-Column Outcome Pills */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Cost Per Lead (CPA)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white font-mono">-36.4%</span>
              <ArrowDownRight className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] text-slate-400 block">via negative keyword lists</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Conversion Rate</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white font-mono">18.2%</span>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] text-slate-400 block">dedicated landing pages</span>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Audited Campaign Metrics</span>
          </div>
          <span className="text-slate-400 font-mono">100% Client Owned</span>
        </div>
      </div>
    </div>
  );
}
