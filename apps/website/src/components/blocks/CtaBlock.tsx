import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const CtaBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const headline =
    (content.headline as string) ||
    "Ready to Accelerate Your Enterprise Pipeline?";
  const buttonText =
    (content.buttonText as string) || "Schedule Executive Diagnostic";
  const buttonLink = (content.buttonLink as string) || "/contact";

  return (
    <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto relative overflow-hidden">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 border border-indigo-200/90 p-10 sm:p-16 2xl:p-20 text-center text-slate-900 shadow-xl relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl 2xl:max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Zero-Obligation Growth Assessment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight text-slate-900">
            {headline}
          </h2>

          <p className="text-base sm:text-lg 2xl:text-xl text-slate-600 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed font-normal">
            Book an executive growth diagnostic with our digital marketing
            strategists. We analyze your customer acquisition funnel,
            attribution models, and present a custom ROI roadmap.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
            >
              <span>Read Enterprise Insights</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100%
              Confidential
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Under
              48-Hour Delivery
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Global
              Enterprise Presets
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
