import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Users,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

export const HeroBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const headline =
    (content.headline as string) ||
    "Stop Burning Money on Ineffective Ads. We Build Growth Engines That Multiply Your Revenue.";
  const subheadline =
    (content.subheadline as string) ||
    "High-intent Google Ads, Meta Paid Social, and revenue-driven SEO engineered to generate qualified sales pipeline, not vanity clicks. 100% transparent live dashboard, zero long-term lock-in.";
  const primaryCtaText =
    (content.primaryCtaText as string) || "Claim Free 30-Min Growth Diagnostic";
  const primaryCtaLink = (content.primaryCtaLink as string) || "/contact";
  const secondaryCtaText =
    (content.secondaryCtaText as string) || "Calculate Projected ROAS & ROI";
  const secondaryCtaLink =
    (content.secondaryCtaLink as string) || "/tools/roi-calculator";

  return (
    <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 text-slate-900 border-b border-slate-200">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/40 to-pink-100/30 blur-[130px] pointer-events-none rounded-full" />

      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 text-center space-y-8">
        {/* Announcement Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 backdrop-blur-md shadow-xs hover:border-indigo-300 transition cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold">Nexora Growth Engine</span>
          <span className="text-indigo-400">&bull;</span>
          <span>Trusted by 150+ Brands | Generated ₹120M+ Revenue</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black tracking-tight leading-[1.08] max-w-5xl 2xl:max-w-6xl mx-auto text-slate-900">
          {headline}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl 2xl:text-2xl text-slate-600 max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed font-normal">
          {subheadline}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href={primaryCtaLink}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={secondaryCtaLink}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white shadow-xs px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200"
          >
            <span>{secondaryCtaText}</span>
            <span className="text-indigo-600 font-normal">&rarr;</span>
          </Link>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ₹0 Upfront Audit Fee
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Month-to-Month (No 12-Month Lock-in)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct Slack Access to Senior Strategists
          </span>
        </div>

        {/* Real Marketing Campaign Performance Card */}
        <div className="pt-8 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 text-left">
            {/* Window Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-slate-500 font-semibold">
                  nexora-campaign-analytics.live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Client Campaigns Active
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Ad Spend vs Verified Revenue</span>
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  4.81x ROAS
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Spend: $14.2k ➔ Revenue: $68.4k
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>High-Intent Sales Leads</span>
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  1,240 Accounts
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cost Per Lead Reduced by -38%
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Organic Search Visibility</span>
                  <div className="p-1 rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  +340% Lift
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-600 font-bold mt-2">
                  <span>#1 Ranking on Buyer-Intent Keywords</span>
                </div>
              </div>
            </div>

            {/* Live conversion ticker item */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="text-slate-700 font-medium">
                  Live Lead Verified:{" "}
                  <strong className="text-slate-900 font-bold">Enterprise SaaS Tier</strong>{" "}
                  (Pipeline Value: ₹18.5 Lakhs / $22,000) routed to sales 2 mins ago.
                </span>
              </div>
              <span className="font-mono text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                Verified Lead
              </span>
            </div>
          </div>
        </div>

        {/* Fortune 500 Enterprise Logo Proof Strip */}
        <div className="pt-12 border-t border-slate-200 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center justify-center gap-2">
            <span>Enterprise Growth Ecosystem</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
              Sample Partners
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center justify-center">
            <div className="font-black tracking-tighter text-lg text-slate-800 hover:text-indigo-600 transition">
              APEX<span className="text-indigo-600">CLOUD</span>
            </div>
            <div className="font-black tracking-widest text-base text-slate-800 hover:text-indigo-600 transition">
              ZENITH.AI
            </div>
            <div className="font-bold tracking-tight text-lg text-slate-800 hover:text-indigo-600 transition">
              VERTEX<span className="font-normal text-slate-500">CORP</span>
            </div>
            <div className="font-black tracking-wider text-base text-slate-800 hover:text-indigo-600 transition">
              NOVA<span className="text-purple-600">SCALE</span>
            </div>
            <div className="font-bold text-base text-slate-800 hover:text-indigo-600 transition">
              HORIZON<span className="text-pink-600">B2B</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
