"use client";

import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { SectionHeading } from "../ui/SectionHeading";
import { AnimatedBeam } from "../motion/AnimatedBeam";
import {
  Search,
  Share2,
  TrendingUp,
  BarChart3,
  Mail,
  Code2,
  Sparkles,
  Zap,
} from "lucide-react";

interface ChannelItem {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CHANNELS: ChannelItem[] = [
  { id: "seo", name: "Organic Search & SEO", category: "Discovery", icon: TrendingUp },
  { id: "ppc", name: "Google & Meta Paid Media", category: "Paid Acquisition", icon: Search },
  { id: "web", name: "High-Speed Web Platforms", category: "Architecture", icon: Code2 },
  { id: "cro", name: "Conversion Optimization", category: "Funnels", icon: BarChart3 },
  { id: "lifecycle", name: "Retention & Lifecycle", category: "CRM & Email", icon: Mail },
  { id: "social", name: "Brand & Social Resonance", category: "Awareness", icon: Share2 },
];

export const ChannelsGrowthDiagram: React.FC<{ block?: CmsBlock }> = ({ block }) => {
  const content = block?.content;
  const title = (content?.title as string) || "Connected Growth Engine";
  const eyebrow = (content?.eyebrow as string) || "Full-Funnel Synergy";
  const description =
    (content?.description as string) ||
    "Every customer touchpoint synchronised into a unified, high-converting revenue platform.";

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-50 text-slate-900 border-y border-slate-200/80">
      {/* Background ambient mesh */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          highlight="Growth Engine"
          description={description}
          tone="light"
        />

        {/* Diagram Canvas */}
        <div className="relative mt-8 sm:mt-12 max-w-4xl mx-auto min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
          {/* Central Growth Hub */}
          <div className="relative z-20 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-primary/50 shadow-2xl shadow-primary/20 p-4 text-center">
            <div className="absolute -inset-2 rounded-full border border-primary/25 animate-pulse-ring" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-2 text-primary">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-heading font-extrabold text-sm sm:text-base text-white tracking-tight">
              Nexora
            </span>
            <span className="text-[10px] sm:text-xs text-primary font-semibold tracking-wider uppercase mt-0.5">
              Growth Engine
            </span>
          </div>

          {/* Surrounding Channels (6 Nodes arranged in responsive layout) */}
          <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-y-28 sm:gap-y-36 place-content-between pointer-events-none">
            {CHANNELS.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.id}
                  className={`pointer-events-auto flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-lg transition-transform hover:scale-105 ${
                    idx % 2 === 0 ? "justify-self-start" : "justify-self-end"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 pr-1 text-left">
                    <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                      {ch.name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {ch.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supporting Trust Disclaimer */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-slate-400 bg-slate-900/80 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Telemetry & Attribution via Google Analytics 4, Server-Side CAPI & Looker</span>
          </div>
        </div>
      </div>
    </section>
  );
};
