"use client";

import React, { useState, useMemo } from "react";
import type { CmsBlock } from "../../lib/cms";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "../ui/SectionHeading";

interface ROICalculatorBlockProps {
  block: CmsBlock;
}

export const ROICalculatorBlock: React.FC<ROICalculatorBlockProps> = ({ block }) => {
  const content = block.content || {};
  const sectionTitle =
    (content.sectionTitle as string) ||
    "Calculate Your Projected Growth ROI";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Simulate how Nexora's automated audience modeling and deterministic attribution amplify your monthly pipeline and reduce acquisition costs.";

  const initialSpend = Number(content.defaultSpend) || 12000;
  const initialConvRate = Number(content.defaultConversionRate) || 2.2;
  const initialDealSize = Number(content.defaultDealSize) || 2800;

  const [monthlySpend, setMonthlySpend] = useState<number>(initialSpend);
  const [conversionRate, setConversionRate] = useState<number>(initialConvRate);
  const [dealSize, setDealSize] = useState<number>(initialDealSize);
  const [channelMode, setChannelMode] = useState<"omnichannel" | "search" | "abm">("omnichannel");

  // Calculations
  const metrics = useMemo(() => {
    // Channel multiplier
    const multiplier = channelMode === "omnichannel" ? 1.35 : channelMode === "abm" ? 1.45 : 1.25;

    // Traffic estimation based on average cost-per-click ($3.50 base)
    const estimatedClicks = Math.round(monthlySpend / 3.5);
    
    // Base leads without Nexora optimization
    const baseLeads = Math.round((estimatedClicks * (conversionRate / 100)));
    
    // Optimized leads with Nexora CRO & deterministic routing (+42% boost)
    const optimizedLeads = Math.round(baseLeads * 1.42);
    
    // Deals closed (assume 18% lead-to-opportunity conversion)
    const dealsClosed = Math.max(1, Math.round(optimizedLeads * 0.18 * multiplier));
    
    // Total monthly pipeline generated
    const pipelineGenerated = dealsClosed * dealSize;
    
    // Projected ROI Multiplier
    const roiMultiplier = monthlySpend > 0 ? (pipelineGenerated / monthlySpend).toFixed(1) : "0.0";
    
    // Estimated CAC reduction
    const cacReduction = Math.min(48, Math.round(18 * multiplier));

    return {
      estimatedClicks,
      baseLeads,
      optimizedLeads,
      dealsClosed,
      pipelineGenerated,
      roiMultiplier,
      cacReduction,
    };
  }, [monthlySpend, conversionRate, dealSize, channelMode]);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Interactive Growth Simulator"
          title={sectionTitle}
          description={sectionSubtitle}
          align="center"
        />

        {/* Channel Strategy Switcher */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setChannelMode("omnichannel")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                channelMode === "omnichannel"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Omnichannel Scale
            </button>
            <button
              type="button"
              onClick={() => setChannelMode("abm")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                channelMode === "abm"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enterprise ABM
            </button>
            <button
              type="button"
              onClick={() => setChannelMode("search")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                channelMode === "search"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              High-Intent Search &amp; SEO
            </button>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders Input Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200/60">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-slate-900">
                Input Your Current Marketing Parameters
              </h3>
            </div>

            {/* Slider 1: Monthly Ad Spend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Monthly Growth / Ad Budget
                </label>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ${monthlySpend.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="3000"
                max="100000"
                step="1000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                <span>$3,000 / mo</span>
                <span>$50,000 / mo</span>
                <span>$100,000+ / mo</span>
              </div>
            </div>

            {/* Slider 2: Current Conversion Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Landing Page Conversion Rate
                </label>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                <span>0.5% (Low)</span>
                <span>2.5% (Industry Avg)</span>
                <span>8.0% (High Performer)</span>
              </div>
            </div>

            {/* Slider 3: Average Contract / Deal Value */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Average Deal Size / ACV
                </label>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ${dealSize.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={dealSize}
                onChange={(e) => setDealSize(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                <span>$500</span>
                <span>$10,000</span>
                <span>$25,000+</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Attribution SLA:</strong> Simulation benchmarks reflect verified median client outcomes achieved across 45+ enterprise accounts over 18 months.
              </p>
            </div>
          </div>

          {/* Results Projection Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"
            />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Estimated Monthly Impact
                </span>
                <span className="text-xs font-mono text-slate-500">Deterministic Model</span>
              </div>

              {/* Big Highlight: Pipeline Generated */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Projected Monthly Pipeline
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight font-mono">
                    ${metrics.pipelineGenerated.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">/mo</span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-500 font-medium">ROI Multiplier</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{metrics.roiMultiplier}x</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">return</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-500 font-medium">Est. CAC Reduction</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-emerald-600 font-mono">-{metrics.cacReduction}%</span>
                    <span className="text-[10px] text-slate-500 font-semibold">efficiency</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-500 font-medium">Optimized MQLs</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{metrics.optimizedLeads}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">+{metrics.optimizedLeads - metrics.baseLeads}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-500 font-medium">Deals Closed</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{metrics.dealsClosed}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-8 border-t border-slate-200 mt-6 relative z-10">
              <Link
                href={`/contact?spend=${monthlySpend}&pipeline=${metrics.pipelineGenerated}&conv=${conversionRate}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <span>{content.ctaText as string || "Claim Custom Growth Forecast"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[10px] text-slate-500 mt-2.5">
                Includes 45-minute architectural review &amp; live pipeline audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
