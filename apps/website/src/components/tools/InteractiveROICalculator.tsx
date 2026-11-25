"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

type Currency = "INR" | "USD";

interface IndustryBenchmark {
  name: string;
  avgCpcINR: number;
  avgCpcUSD: number;
  baseConvRate: number; // e.g. 2.5%
  defaultDealINR: number;
  defaultDealUSD: number;
}

const DEFAULT_BENCHMARK: IndustryBenchmark = {
  name: "E-Commerce & Retail",
  avgCpcINR: 18,
  avgCpcUSD: 0.85,
  baseConvRate: 2.8,
  defaultDealINR: 2200,
  defaultDealUSD: 65,
};

const INDUSTRIES: Record<string, IndustryBenchmark> = {
  ecommerce: DEFAULT_BENCHMARK,
  realestate: {
    name: "Real Estate & Construction",
    avgCpcINR: 52,
    avgCpcUSD: 2.8,
    baseConvRate: 3.5,
    defaultDealINR: 120000,
    defaultDealUSD: 3500,
  },
  b2b_saas: {
    name: "B2B, Tech & SaaS",
    avgCpcINR: 85,
    avgCpcUSD: 4.2,
    baseConvRate: 4.0,
    defaultDealINR: 65000,
    defaultDealUSD: 1800,
  },
  healthcare: {
    name: "Healthcare & Clinics",
    avgCpcINR: 32,
    avgCpcUSD: 1.6,
    baseConvRate: 5.2,
    defaultDealINR: 15000,
    defaultDealUSD: 450,
  },
  education: {
    name: "Education & EdTech",
    avgCpcINR: 28,
    avgCpcUSD: 1.2,
    baseConvRate: 3.8,
    defaultDealINR: 35000,
    defaultDealUSD: 850,
  },
  services: {
    name: "Professional & Local Services",
    avgCpcINR: 35,
    avgCpcUSD: 1.8,
    baseConvRate: 5.5,
    defaultDealINR: 18000,
    defaultDealUSD: 400,
  },
};

export function InteractiveROICalculator() {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ecommerce");

  // Spend states
  const [monthlySpendINR, setMonthlySpendINR] = useState<number>(100000); // ₹1 Lakh
  const [monthlySpendUSD, setMonthlySpendUSD] = useState<number>(2500); // $2,500

  // Deal / Customer value
  const [dealValueINR, setDealValueINR] = useState<number>(2200);
  const [dealValueUSD, setDealValueUSD] = useState<number>(65);

  const industry: IndustryBenchmark = INDUSTRIES[selectedIndustry] || DEFAULT_BENCHMARK;

  const handleIndustryChange = (key: string) => {
    setSelectedIndustry(key);
    const ind = INDUSTRIES[key];
    if (ind) {
      setDealValueINR(ind.defaultDealINR);
      setDealValueUSD(ind.defaultDealUSD);
    }
  };

  const calculations = useMemo(() => {
    const isINR = currency === "INR";
    const spend = isINR ? monthlySpendINR : monthlySpendUSD;
    const cpc = isINR ? industry.avgCpcINR : industry.avgCpcUSD;
    const deal = isINR ? dealValueINR : dealValueUSD;

    const estimatedClicks = Math.max(10, Math.round(spend / cpc));
    const baselineLeads = Math.round(estimatedClicks * (industry.baseConvRate / 100));
    const optimizedConvRate = Number((industry.baseConvRate * 1.38).toFixed(1));
    const optimizedLeads = Math.max(1, Math.round(estimatedClicks * (optimizedConvRate / 100)));
    const costPerLead = Math.round(spend / optimizedLeads);
    const closedSales = Math.max(1, Math.round(optimizedLeads * 0.22));
    const projectedRevenue = closedSales * deal;
    const roas = spend > 0 ? Number((projectedRevenue / spend).toFixed(2)) : 0;

    return {
      spend,
      cpc,
      deal,
      estimatedClicks,
      baselineLeads,
      optimizedLeads,
      optimizedConvRate,
      costPerLead,
      closedSales,
      projectedRevenue,
      roas,
    };
  }, [currency, monthlySpendINR, monthlySpendUSD, dealValueINR, dealValueUSD, industry]);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  const formatMoney = (val: number) => {
    if (currency === "INR") {
      return val >= 100000
        ? `₹${(val / 100000).toFixed(2)} Lakhs`
        : `₹${val.toLocaleString("en-IN")}`;
    }
    return `$${val.toLocaleString("en-US")}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900">
      {/* Top Banner & Currency Switcher */}
      <div className="bg-navy text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Performance Simulator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Estimate Your Marketing ROI & Leads
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Based on real benchmark data across Google Ads, Meta Ads, and high-converting landing pages.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-ink rounded-xl p-1 border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              currency === "INR"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            INR (₹)
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              currency === "USD"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              {Object.entries(INDUSTRIES).map(([key, ind]) => (
                <option key={key} value={key}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Ad Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Monthly Ad Spend
              </label>
              <span className="text-base font-black text-primary font-mono">
                {currency === "INR"
                  ? formatMoney(monthlySpendINR)
                  : formatMoney(monthlySpendUSD)}
              </span>
            </div>
            {currency === "INR" ? (
              <input
                type="range"
                min={30000}
                max={1500000}
                step={10000}
                value={monthlySpendINR}
                onChange={(e) => setMonthlySpendINR(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            ) : (
              <input
                type="range"
                min={500}
                max={25000}
                step={250}
                value={monthlySpendUSD}
                onChange={(e) => setMonthlySpendUSD(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            )}
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{currencySymbol}{currency === "INR" ? "30k" : "500"}</span>
              <span>{currencySymbol}{currency === "INR" ? "7.5 Lakhs" : "12.5k"}</span>
              <span>{currencySymbol}{currency === "INR" ? "15 Lakhs+" : "25k+"}</span>
            </div>
          </div>

          {/* Average Deal / Sale Value Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Average Deal or Order Value
              </label>
              <span className="text-base font-black text-slate-900 font-mono">
                {currency === "INR"
                  ? formatMoney(dealValueINR)
                  : formatMoney(dealValueUSD)}
              </span>
            </div>
            {currency === "INR" ? (
              <input
                type="range"
                min={1000}
                max={300000}
                step={1000}
                value={dealValueINR}
                onChange={(e) => setDealValueINR(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            ) : (
              <input
                type="range"
                min={25}
                max={6000}
                step={25}
                value={dealValueUSD}
                onChange={(e) => setDealValueUSD(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            )}
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{currencySymbol}{currency === "INR" ? "1k" : "25"}</span>
              <span>{currencySymbol}{currency === "INR" ? "1.5 Lakhs" : "3k"}</span>
              <span>{currencySymbol}{currency === "INR" ? "3 Lakhs+" : "6k+"}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Projections include <strong>custom conversion-engineered landing pages</strong> and <strong>negative keyword filtering</strong>, which historically increase lead capture by 25% to 45% over standard websites.
            </span>
          </div>
        </div>

        {/* Right Column: Dynamic Projected Output Cards */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Estimated Monthly Outcomes
            </span>

            {/* Big Highlight Card: Projected Revenue / Pipeline */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-navy via-ink to-primary text-primary-foreground shadow-lg space-y-1">
              <span className="text-xs text-accent font-semibold uppercase tracking-wider">
                Projected Monthly Pipeline / Sales
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatMoney(calculations.projectedRevenue)}
              </div>
              <div className="text-xs text-slate-300 pt-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>Estimated ROAS: <strong className="text-white">{calculations.roas}x</strong> on ad spend</span>
              </div>
            </div>

            {/* Grid of Secondary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                <span className="text-[11px] text-slate-500 font-medium">Estimated Leads / Orders</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {calculations.optimizedLeads}
                </div>
                <span className="text-[10px] text-primary font-bold">
                  +{calculations.optimizedLeads - calculations.baselineLeads} vs unoptimized
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                <span className="text-[11px] text-slate-500 font-medium">Estimated Cost Per Lead</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {currencySymbol}{calculations.costPerLead}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  At ~{calculations.optimizedConvRate}% conv rate
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="space-y-2 pt-2">
            <Link
              href="/free-audit"
              className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-sm flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-primary/20 text-center"
            >
              <span>Get Free Custom ROI Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-slate-500 text-center">
              No obligation. We will audit your current setup and provide exact numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
