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
    (content.headline as string) || "Data-Driven Marketing at Enterprise Scale";
  const subheadline =
    (content.subheadline as string) ||
    "Connect your enterprise to high-intent audiences with AI campaign automation, precision audience modeling, and verifiable multi-touch attribution.";
  const primaryCtaText =
    (content.primaryCtaText as string) || "Schedule Free Growth Diagnostic";
  const primaryCtaLink = (content.primaryCtaLink as string) || "/contact";
  const secondaryCtaText =
    (content.secondaryCtaText as string) || "Explore Insights & Strategy";
  const secondaryCtaLink = (content.secondaryCtaLink as string) || "/blog";

  return (
    <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 text-center space-y-8">
        {/* Announcement Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-inner shadow-indigo-500/20 hover:border-indigo-400 transition cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold">Nexora Engine 2.0</span>
          <span className="text-indigo-400">&bull;</span>
          <span>Enterprise B2B Performance & Attribution</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black tracking-tight leading-[1.1] max-w-5xl 2xl:max-w-6xl mx-auto text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
          {headline}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl 2xl:text-2xl text-slate-300 max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed font-normal">
          {subheadline}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href={primaryCtaLink}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/35 hover:bg-indigo-500 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={secondaryCtaLink}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/80 backdrop-blur-md px-7 py-4 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            <span>{secondaryCtaText}</span>
            <span className="text-indigo-400 font-normal">&rarr;</span>
          </Link>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOC-2 & DPDP
            Compliant
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Worldwide
            Enterprise Delivery
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100%
            Attribution Precision
          </span>
        </div>

        {/* Interactive Platform Mockup Card */}
        <div className="pt-8 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-indigo-950/60 ring-1 ring-white/10 text-left">
            {/* Window Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  nexora-engine://attribution.live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Influenced Pipeline</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  $2,480,000
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                  <TrendingUp className="w-3 h-3" /> +34.2% vs baseline
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Verified B2B Leads</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  1,492 Accounts
                </div>
                <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold mt-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Consent Audited
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Attribution Accuracy</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">99.8%</div>
                <div className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold mt-1">
                  Multi-Touch Server-Side
                </div>
              </div>
            </div>

            {/* Live conversion ticker item */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300 font-medium">
                  Sample Inbound Simulation:{" "}
                  <strong className="text-white">Apex Cloud Solutions</strong>{" "}
                  ($180,000 ARR Opportunity) captured & routed.
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                Sample
              </span>
            </div>
          </div>
        </div>

        {/* Fortune 500 Enterprise Logo Proof Strip */}
        <div className="pt-12 border-t border-slate-800/60 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center justify-center gap-2">
            <span>Enterprise Growth Ecosystem</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
              Sample Partners
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center justify-center opacity-70">
            <div className="font-black tracking-tighter text-lg text-slate-300 hover:text-white transition">
              APEX<span className="text-indigo-400">CLOUD</span>
            </div>
            <div className="font-black tracking-widest text-base text-slate-300 hover:text-white transition">
              ZENITH.AI
            </div>
            <div className="font-bold tracking-tight text-lg text-slate-300 hover:text-white transition">
              VERTEX<span className="font-normal text-slate-500">CORP</span>
            </div>
            <div className="font-black tracking-wider text-base text-slate-300 hover:text-white transition">
              NOVA<span className="text-purple-400">SCALE</span>
            </div>
            <div className="font-bold text-base text-slate-300 hover:text-white transition">
              HORIZON<span className="text-pink-400">B2B</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
