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
import { ProgressLine } from "../motion/ProgressLine";
import { Stagger, StaggerItem } from "../motion/Stagger";

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

const PHASE_THEMES = [
  {
    color: "from-blue-600 to-cyan-500",
    border: "border-blue-200/90 hover:border-blue-400",
    bg: "bg-blue-50/80",
    text: "text-blue-700",
    dot: "bg-blue-600",
    glow: "bg-blue-50/60 group-hover:bg-blue-100/60",
    hoverText: "group-hover:text-blue-600",
  },
  {
    color: "from-purple-600 to-indigo-600",
    border: "border-purple-200/90 hover:border-purple-400",
    bg: "bg-purple-50/80",
    text: "text-purple-700",
    dot: "bg-purple-600",
    glow: "bg-purple-50/60 group-hover:bg-purple-100/60",
    hoverText: "group-hover:text-purple-600",
  },
  {
    color: "from-emerald-600 to-teal-500",
    border: "border-emerald-200/90 hover:border-emerald-400",
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    dot: "bg-emerald-600",
    glow: "bg-emerald-50/60 group-hover:bg-emerald-100/60",
    hoverText: "group-hover:text-emerald-600",
  },
  {
    color: "from-amber-600 to-orange-500",
    border: "border-amber-200/90 hover:border-amber-400",
    bg: "bg-amber-50/80",
    text: "text-amber-700",
    dot: "bg-amber-600",
    glow: "bg-amber-50/60 group-hover:bg-amber-100/60",
    hoverText: "group-hover:text-amber-600",
  },
];

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
    <section className="py-8 sm:py-14 lg:py-20 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden w-full">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[450px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Unified max-w-7xl container with exact navbar padding (px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 lg:mb-12 space-y-2 sm:space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-2xs">
            <Rocket className="w-3.5 h-3.5 text-primary" />
            <span>Proven Execution Process</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Grid:
            - Mobile (< 640px): 1 clean vertical column with comfortable padding and clear deliverables
            - Tablet (640px - 1023px): 2 balanced columns (sm:grid-cols-2)
            - Laptop & Desktop (1024px+): 4 columns (lg:grid-cols-4) with connecting track line
        */}
        <div className="relative w-full">
          {/* Scroll-linked progress line on lg+ desktop */}
          <div className="hidden lg:block absolute top-14 left-12 right-12 h-0.5 z-0">
            <ProgressLine orientation="horizontal" className="h-0.5 w-full" />
          </div>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 relative z-10 items-stretch w-full">
            {steps.map((step, idx) => {
              const Icon = stepIcons[idx % stepIcons.length] ?? Compass;
              const theme = PHASE_THEMES[idx % PHASE_THEMES.length] ?? PHASE_THEMES[0]!;

              return (
                <StaggerItem key={step.number || idx} index={idx} className="h-full">
                  <div
                  key={step.number || idx}
                  className={`w-full h-full bg-card border ${theme.border} rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
                >
                  {/* Phase Colored Top Accent Line for crisp visual distinction */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.color}`} />

                  {/* Ambient hover glow */}
                  <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-xl pointer-events-none transition-colors ${theme.glow}`} />

                  {/* Faint watermark number in background */}
                  <span className="absolute -bottom-2.5 -right-1 text-5xl sm:text-6xl lg:text-7xl font-black text-slate-100 select-none pointer-events-none font-mono group-hover:text-indigo-50/70 transition-colors">
                    {step.number}
                  </span>

                  <div>
                    {/* Step Top Accents */}
                    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${theme.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 sm:py-1 rounded-full border ${theme.bg} ${theme.text} ${theme.border} shadow-2xs shrink-0`}
                      >
                        Phase {step.number}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse shrink-0`} />
                      <span>{step.timeline}</span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-1.5 tracking-tight ${theme.hoverText} transition-colors leading-snug`}>
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-3 sm:mb-4">
                      {step.description}
                    </p>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-1.5 sm:space-y-2 relative z-10 mt-auto">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Core Deliverables
                    </span>
                    {step.deliverables.map((deliv, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 font-medium leading-tight"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* CTA Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href={content.ctaLink || "/contact"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>{content.ctaText || "Initiate Discovery Sprint"}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
};
