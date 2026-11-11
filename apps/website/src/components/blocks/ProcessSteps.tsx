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
    content.sectionTitle || "Our 4-Phase Growth Engineering Framework";
  const subtitle =
    content.sectionSubtitle ||
    "A systematic, battle-tested methodology designed to transform ambiguous marketing spend into predictable pipeline.";

  const defaultSteps: StepItem[] = [
    {
      number: "01",
      title: "Discovery & Attribution Audit",
      timeline: "Days 1 — 7",
      description:
        "We audit your legacy ad accounts, website conversion funnels, tracking infrastructure, and competitor positioning to identify low-hanging revenue leaks.",
      deliverables: [
        "Full-funnel leakage teardown",
        "Deterministic tracking verification",
        "Competitor ad intelligence brief",
      ],
    },
    {
      number: "02",
      title: "Growth Architecture & Creatives",
      timeline: "Days 8 — 14",
      description:
        "Our engineers build dedicated landing page variants, wire up automated lead scoring, and draft high-converting campaign creative concepts.",
      deliverables: [
        "Multi-variant landing pages",
        "Audience segmentation matrix",
        "High-intent copy & ad assets",
      ],
    },
    {
      number: "03",
      title: "High-Velocity Campaign Sprint",
      timeline: "Days 15 — 45",
      description:
        "We deploy targeted paid media across Google, Meta, and LinkedIn with continuous automated micro-budget rebalancing toward winning variants.",
      deliverables: [
        "Omnichannel campaign rollout",
        "Real-time CRM lead routing",
        "Weekly conversion sprint review",
      ],
    },
    {
      number: "04",
      title: "Systematic Scale & Retention",
      timeline: "Ongoing",
      description:
        "Double down on verified high-ROI segments, unlock cross-border multi-region traffic, and institutionalize automated nurturing sequences.",
      deliverables: [
        "Predictable ROAS optimization",
        "LTV & retention automation",
        "Quarterly executive strategy roadmap",
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
    <section className="py-24 bg-slate-50 dark:bg-slate-900/60 px-6 sm:px-10 lg:px-12 xl:px-16 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4">
            Proven Execution Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = stepIcons[idx % stepIcons.length] ?? Compass;
            return (
              <div
                key={step.number || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Step Top Accents */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-indigo-200 dark:group-hover:text-indigo-900/60 transition-colors font-mono">
                    {step.number}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                    {step.timeline}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Key Deliverables
                  </span>
                  {step.deliverables.map((deliv, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <Link
            href={content.ctaLink || "/contact"}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition duration-300"
          >
            <span>{content.ctaText || "Initiate Discovery Sprint"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
