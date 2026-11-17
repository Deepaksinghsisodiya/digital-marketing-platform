import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { TrendingUp, ShieldCheck, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { CountUp } from "../motion/CountUp";

interface MetricItem {
  value: string;
  label: string;
  change?: string;
}

const STAT_METADATA = [
  {
    icon: TrendingUp,
    accentLine: "from-blue-500 to-cyan-500",
    dot: "bg-blue-500",
    iconBg: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
    hoverBorder: "hover:border-blue-400",
    hoverGlow: "bg-blue-50/70 group-hover:bg-blue-100/70",
    hoverText: "group-hover:text-blue-600",
  },
  {
    icon: DollarSign,
    accentLine: "from-purple-500 to-indigo-500",
    dot: "bg-purple-500",
    iconBg: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
    hoverBorder: "hover:border-purple-400",
    hoverGlow: "bg-purple-50/70 group-hover:bg-purple-100/70",
    hoverText: "group-hover:text-purple-600",
  },
  {
    icon: ShieldCheck,
    accentLine: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    hoverBorder: "hover:border-emerald-400",
    hoverGlow: "bg-emerald-50/70 group-hover:bg-emerald-100/70",
    hoverText: "group-hover:text-emerald-600",
  },
  {
    icon: Clock,
    accentLine: "from-amber-500 to-orange-500",
    dot: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
    hoverBorder: "hover:border-amber-400",
    hoverGlow: "bg-amber-50/70 group-hover:bg-amber-100/70",
    hoverText: "group-hover:text-amber-600",
  },
];

export const StatsBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const metrics = (content.metrics as MetricItem[]) || [
    { value: "340%", label: "Avg Pipeline Velocity", change: "+42% QoQ" },
    { value: "$120M+", label: "Enterprise Revenue Influenced", change: "Verified" },
    { value: "4.8x", label: "Sustained Blended ROAS", change: "Audit-grade" },
    { value: "99.8%", label: "Attribution Accuracy", change: "SOC2" },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-14 lg:py-16 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200/80 text-slate-900 w-full relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[280px] bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Unified max-w-7xl container with exact navbar padding (px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* 100% Pure Responsive CSS Grid:
            - Mobile (< 640px): 1 clean full-width column (grid-cols-1) with comfortable padding and zero collision
            - Tablet (640px - 1023px): 2 balanced columns (sm:grid-cols-2)
            - Laptop / Desktop (1024px+): 4 columns side by side (lg:grid-cols-4)
            All cards have equal height (h-full), distinct accent lines, and proportional padding.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6 items-stretch w-full">
          {metrics.map((m, idx) => {
            const meta = STAT_METADATA[idx % STAT_METADATA.length] ?? STAT_METADATA[0]!;
            const Icon = meta.icon;

            return (
              <div
                key={idx}
                className={`w-full h-full p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl ${meta.hoverBorder} hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Subtle top accent gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.accentLine}`} />

                {/* Ambient hover glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none transition-colors ${meta.hoverGlow}`} />

                <div>
                  {/* Top: Status pill + Icon */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0 shadow-2xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse shrink-0`} />
                      <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                        {m.change || "Audited"}
                      </span>
                    </span>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-2xs shrink-0 ${meta.iconBg}`}>
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                  </div>

                  {/* Value with CountUp Animation */}
                  <div className={`text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 ${meta.hoverText} transition-colors my-1.5 sm:my-2 leading-none`}>
                    <CountUp value={m.value} />
                  </div>
                </div>

                {/* Mini sparkline graphic (stroke-draw, CSS only) */}
                <div className="py-1">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path
                      d="M0 16 Q 25 18, 50 10 T 100 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-slate-200 group-hover:text-primary transition-colors duration-500"
                    />
                  </svg>
                </div>

                {/* Bottom label + arrow */}
                <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-2">
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug line-clamp-2">
                    {m.label}
                  </div>
                  <ArrowUpRight className={`w-3.5 h-3.5 text-slate-400 ${meta.hoverText} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
