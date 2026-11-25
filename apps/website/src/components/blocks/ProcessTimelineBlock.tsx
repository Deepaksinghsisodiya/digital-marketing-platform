"use client";

import React, { useState } from "react";
import type { CmsBlock } from "../../lib/cms";
import { Search, Lightbulb, Rocket, BarChart3, CheckCircle2 } from "lucide-react";

const DEFAULT_STEPS = [
  {
    phase: "01",
    title: "Discovery & Revenue Audit",
    duration: "Sprint 1",
    desc: "Comprehensive diagnostic of your acquisition funnel, ad spend leakage, Core Web Vitals, and competitor keywords.",
    icon: Search,
    deliverables: ["Full-funnel leakage report", "Commercial keyword map", "Server attribution setup"],
  },
  {
    phase: "02",
    title: "Strategic Architecture",
    duration: "Sprint 2",
    desc: "Custom growth blueprint, campaign structure, conversion rate optimization hypotheses, and landing page wireframes.",
    icon: Lightbulb,
    deliverables: ["Target ROAS modeling", "Creative angle matrix", "A/B test pipeline"],
  },
  {
    phase: "03",
    title: "High-Frequency Execution",
    duration: "Sprint 3-4",
    desc: "Launch high-converting landing funnels, algorithmic ad campaigns, and automated WhatsApp CRM intake sequences.",
    icon: Rocket,
    deliverables: ["Sub-second page speeds", "Multi-touch CAPI sync", "Automated lead routing"],
  },
  {
    phase: "04",
    title: "Compound Optimization",
    duration: "Ongoing",
    desc: "Continuous multivariate testing, negative keyword pruning, creative iteration, and account scale.",
    icon: BarChart3,
    deliverables: ["Weekly attribution reports", "Bi-weekly creative sprints", "Executive strategy calls"],
  },
];

export const ProcessTimelineBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const [activeStep, setActiveStep] = useState(0);
  const title = (content?.title as string) || "Predictable Growth Execution Engine";
  const subtitle =
    (content?.subtitle as string) ||
    "How our 4-phase delivery methodology transforms marketing spend into compounding enterprise pipeline.";

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-surface/50 text-foreground w-full relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Rocket className="w-3.5 h-3.5 text-primary" />
            <span>Execution Methodology</span>
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Interactive Desktop Timeline Stepper */}
        <div className="hidden lg:block mb-8">
          <div className="grid grid-cols-4 gap-4 relative">
            {/* Horizontal progress track */}
            <div className="absolute top-7 left-[12%] right-[12%] h-1 bg-slate-200 rounded-full z-0" />
            <div
              className="absolute top-7 left-[12%] h-1 bg-primary rounded-full z-0 transition-all duration-500"
              style={{ width: `${(activeStep / (DEFAULT_STEPS.length - 1)) * 76}%` }}
            />

            {DEFAULT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer relative z-10 focus:outline-hidden"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isActive
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/30 ring-4 ring-primary/20"
                        : isPast
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-white text-slate-400 border border-slate-200 hover:border-primary/40"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mt-3">
                    {step.duration}
                  </span>
                  <span
                    className={`text-sm font-bold mt-1 transition-colors ${
                      isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Highlight Card (Desktop) */}
        <div className="hidden lg:block">
          <div className="rounded-3xl border border-slate-200/90 bg-card p-8 shadow-lg relative overflow-hidden">
            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-7 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Phase {DEFAULT_STEPS[activeStep]?.phase} • {DEFAULT_STEPS[activeStep]?.duration}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {DEFAULT_STEPS[activeStep]?.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {DEFAULT_STEPS[activeStep]?.desc}
                </p>
              </div>

              <div className="col-span-5 bg-surface rounded-2xl p-5 border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Core Deliverables
                </span>
                <ul className="space-y-2">
                  {DEFAULT_STEPS[activeStep]?.deliverables.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Accordion-style Stack */}
        <div className="lg:hidden space-y-3.5">
          {DEFAULT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                      {step.phase} • {step.duration}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {step.deliverables.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      <span>{d}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
