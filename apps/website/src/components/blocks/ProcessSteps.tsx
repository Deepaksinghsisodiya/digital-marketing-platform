import React from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Layers,
  Rocket,
  TrendingUp,
} from "lucide-react";

interface StepItem {
  number: string;
  title: string;
  timeline: string;
  description: string;
  deliverables: string[];
}

interface ProcessStepsContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  steps?: StepItem[];
  ctaText?: string;
  ctaLink?: string;
}

export const ProcessSteps: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const content = (block.content || {}) as ProcessStepsContent;

  const title =
    content.sectionTitle || "The 4-Phase Growth Framework That Multiplies Your Revenue";
  const subtitle =
    content.sectionSubtitle ||
    "A systematic, battle-tested execution process designed to turn unpredictable marketing spend into a predictable customer acquisition machine.";

  const defaultSteps: StepItem[] = [
    {
      number: "01",
      title: "Deep-Funnel Audit & Leakage Teardown",
      timeline: "Days 1 — 7",
      description:
        "We audit your historical ad accounts, landing page drop-offs, tracking blindspots, and competitor positioning to stop immediate budget waste.",
      deliverables: [
        "Full ad spend leakage teardown",
        "Competitor creative intelligence brief",
        "High-intent keyword opportunities list",
      ],
    },
    {
      number: "02",
      title: "High-Converting Creatives & Landing Pages",
      timeline: "Days 8 — 14",
      description:
        "Our creative and development teams craft scroll-stopping video/image ad variants, write psychological sales copy, and deploy sub-second landing pages.",
      deliverables: [
        "Multi-variant landing page deployment",
        "Scroll-stopping Meta/Google ad creatives",
        "Instant WhatsApp & email lead routing",
      ],
    },
    {
      number: "03",
      title: "Omnichannel Media Launch & Scaling",
      timeline: "Days 15 — 45",
      description:
        "We deploy targeted paid media across Google, Meta, and LinkedIn with continuous algorithmic budget rebalancing toward winning high-ROAS ads.",
      deliverables: [
        "Targeted multi-channel ad campaign rollout",
        "Live transparent revenue reporting dashboard",
        "Weekly performance sprint reviews",
      ],
    },
    {
      number: "04",
      title: "Continuous CRO & Market Dominance",
      timeline: "Ongoing",
      description:
        "Double down on verified high-ROI audiences, launch automated retention drips, and institutionalize conversion rate optimizations that compound monthly.",
      deliverables: [
        "Continuous multivariate A/B testing",
        "LTV & repeat buyer email automation",
        "Quarterly executive growth strategy roadmap",
      ],
    },
  ];

  const steps = content.steps || defaultSteps;

  const stepIcons: React.ComponentType<{ className?: string }>[] = [
    Compass,
    Layers,
    Rocket,
    TrendingUp,
  ];

  return (
    <section className="py-24 lg:py-32 bg-slate-50/70 px-6 sm:px-10 lg:px-12 xl:px-16 border-t border-slate-200/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-100/40 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-widest shadow-2xs">
            <Rocket className="w-3.5 h-3.5 text-indigo-600" />
            <span>Proven Execution Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Grid with connecting horizontal pipeline track on desktop */}
        <div className="relative">
          {/* Connecting track line on lg+ */}
          <div className="hidden lg:block absolute top-16 left-12 right-12 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = stepIcons[idx % stepIcons.length] ?? Compass;
              return (
                <div
                  key={step.number || idx}
                  className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Big faint watermark number in background */}
                  <span className="absolute -bottom-4 -right-2 text-7xl lg:text-8xl font-black text-slate-100/70 select-none pointer-events-none font-mono group-hover:text-indigo-50/80 transition-colors">
                    {step.number}
                  </span>

                  <div>
                    {/* Step Top Accents */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-2xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-mono shadow-2xs">
                        Phase {step.number}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      {step.timeline}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal mb-8">
                      {step.description}
                    </p>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="pt-6 border-t border-slate-100 space-y-3 relative z-10">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Core Deliverables
                    </span>
                    {step.deliverables.map((deliv, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <Link
            href={content.ctaLink || "/contact"}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>{content.ctaText || "Initiate Discovery Sprint"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
