import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { TrendingUp, ShieldCheck, DollarSign, Clock, ArrowUpRight } from "lucide-react";

interface MetricItem {
  value: string;
  label: string;
  change?: string;
}

const STAT_ICONS = [TrendingUp, DollarSign, ShieldCheck, Clock];

export const StatsBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const metrics = (content.metrics as MetricItem[]) || [
    { value: "340%", label: "Avg Pipeline Velocity", change: "+42% QoQ" },
    { value: "$120M+", label: "Enterprise Revenue Influenced", change: "Verified" },
    { value: "99.8%", label: "Deterministic Attribution", change: "Audit-grade" },
    { value: "14 Days", label: "Time to Deploy & Convert", change: "Guaranteed SLA" },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200/80 text-slate-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((m, idx) => {
            const Icon = STAT_ICONS[idx % STAT_ICONS.length] ?? STAT_ICONS[0]!;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 space-y-4 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Ambient hover glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50/80 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-100/80 transition-colors" />

                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {m.change || "Audited Metric"}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {m.value}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">
                    {m.label}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
