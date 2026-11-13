"use client";

import React, { useState, useId } from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";

interface RoiContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  defaultSpend?: number;
  defaultConversionRate?: number;
  defaultDealSize?: number;
  ctaText?: string;
  ctaLink?: string;
}

export const RoiCalculator: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const content = (block.content || {}) as RoiContent;

  const spendInputId = useId();
  const convInputId = useId();
  const dealInputId = useId();

  const [monthlySpend, setMonthlySpend] = useState<number>(
    content.defaultSpend || 8000,
  );
  const [conversionRate, setConversionRate] = useState<number>(
    content.defaultConversionRate || 2.0,
  );
  const [dealSize, setDealSize] = useState<number>(
    content.defaultDealSize || 1500,
  );

  // Projections:
  // Baseline:
  // Est. clicks at $2.50 avg CPC = monthlySpend / 2.5
  const estimatedClicks = monthlySpend / 2.5;
  const baselineLeads = Math.round(estimatedClicks * (conversionRate / 100));
  const baselineCustomers = Math.round(baselineLeads * 0.15); // 15% close rate
  const baselineRevenue = baselineCustomers * dealSize;

  // Nexora Platform Lift:
  // Nexora AI targeting + attribution typically generates 48% more qualified leads and improves close velocity by 25%
  const nexoraLeads = Math.round(baselineLeads * 1.48);
  const nexoraCustomers = Math.round(nexoraLeads * 0.19);
  const nexoraRevenue = nexoraCustomers * dealSize;
  const netLift = Math.max(0, nexoraRevenue - baselineRevenue);
  const roiMultiplier =
    monthlySpend > 0 ? (nexoraRevenue / monthlySpend).toFixed(1) : "0.0";

  return (
    <section className="py-24 bg-white text-slate-900 px-6 sm:px-10 lg:px-12 xl:px-16 relative overflow-hidden border-t border-slate-200">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Growth Modeling</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800">
              Sample Calculator
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {content.sectionTitle || "Calculate Your Projected Growth ROI"}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {content.sectionSubtitle ||
              "Simulate how Nexora's automated audience modeling and deterministic attribution amplify your monthly revenue."}
          </p>
        </div>

        {/* Interactive Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Panel */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
            {/* Slider 1: Monthly Ad Spend */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor={spendInputId}
                  className="text-sm font-bold text-slate-700 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Monthly Digital Ad Budget
                </label>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  ${monthlySpend.toLocaleString()}
                </span>
              </div>
              <input
                id={spendInputId}
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>$1,000/mo</span>
                <span>$25,000/mo</span>
                <span>$50,000/mo</span>
              </div>
            </div>

            {/* Slider 2: Conversion Rate */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor={convInputId}
                  className="text-sm font-bold text-slate-700 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Current Landing Page Conversion Rate
                </label>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
              <input
                id={convInputId}
                type="range"
                min={0.5}
                max={6.0}
                step={0.1}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>0.5% (Low)</span>
                <span>2.5% (Avg)</span>
                <span>6.0% (High)</span>
              </div>
            </div>

            {/* Slider 3: Deal Size */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor={dealInputId}
                  className="text-sm font-bold text-slate-700 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  Average Customer / Deal Value
                </label>
                <span className="text-lg font-black text-purple-600 font-mono">
                  ${dealSize.toLocaleString()}
                </span>
              </div>
              <input
                id={dealInputId}
                type="range"
                min={100}
                max={10000}
                step={100}
                value={dealSize}
                onChange={(e) => setDealSize(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>$100</span>
                <span>$5,000</span>
                <span>$10,000+</span>
              </div>
            </div>
          </div>

          {/* Results Projection Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-200 rounded-3xl p-8 sm:p-10 shadow-xl relative flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                Projected Monthly Lift
              </span>

              <div className="mt-6 mb-8">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                  Estimated New Monthly Pipeline
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1 font-mono">
                  +${netLift.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>
                    {roiMultiplier}x Projected Return on Ad Spend (ROAS)
                  </span>
                </p>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">
                    Qualified Inbound Leads
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                    {nexoraLeads}
                    <span className="text-xs font-bold text-emerald-600 ml-1.5">
                      (+48%)
                    </span>
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">
                    Acquired Customers
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                    {nexoraCustomers}
                    <span className="text-xs font-bold text-emerald-600 ml-1.5">
                      (+58%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6">
              <Link
                href={content.ctaLink || "/contact"}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-center flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition duration-300"
              >
                <span>{content.ctaText || "Claim Your Growth Forecast"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-slate-500 text-center mt-3">
                Projections are algorithmic estimates based on industry
                benchmarks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
