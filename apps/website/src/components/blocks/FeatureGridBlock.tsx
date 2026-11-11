import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Search, Target, BarChart3, TrendingUp, MailCheck, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

const FEATURE_METADATA = [
  {
    icon: Search,
    tag: "Search Architecture",
    badge: "Top 3 Commercial Rank",
    color: "from-blue-600 to-cyan-500",
  },
  {
    icon: Target,
    tag: "Account-Based Marketing",
    badge: "Buying Committee Intent",
    color: "from-purple-600 to-indigo-600",
  },
  {
    icon: BarChart3,
    tag: "Revenue Attribution",
    badge: "100% Deterministic Tracking",
    color: "from-emerald-600 to-teal-500",
  },
  {
    icon: TrendingUp,
    tag: "Conversion Rate CRO",
    badge: "+48% Form Completion",
    color: "from-amber-600 to-orange-500",
  },
  {
    icon: MailCheck,
    tag: "Outbound Lead Ops",
    badge: "< 3m Response SLA",
    color: "from-indigo-600 to-violet-600",
  },
  {
    icon: ShieldCheck,
    tag: "Multi-Country Governance",
    badge: "DPDP / GDPR / SOC2",
    color: "from-rose-600 to-pink-500",
  },
];

export const FeatureGridBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle = (content.sectionTitle as string) || "Engineered for Enterprise Performance";
  const sectionSubtitle =
    (content.subheadline as string) ||
    (content.sectionSubtitle as string) ||
    "Comprehensive digital marketing infrastructure engineered for high-velocity enterprise teams worldwide.";
  const features = (content.features as FeatureItem[]) || [];

  return (
    <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 uppercase tracking-widest">
          Enterprise Growth Engine
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          {sectionTitle}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          {sectionSubtitle}
        </p>
      </div>

      {/* Grid of 6 Enterprise Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => {
          const meta = FEATURE_METADATA[idx % FEATURE_METADATA.length] ?? FEATURE_METADATA[0]!;
          const Icon = meta.icon;

          return (
            <div
              key={idx}
              className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Icon + Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition">
                    {meta.badge}
                  </span>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  {meta.tag}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Explore capability</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive 3-Stage Pipeline Teaser */}
      <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="max-w-3xl mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            Automated Execution Pipeline
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
            How Nexora Transforms Digital Inquiries into Enterprise Revenue
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <div className="text-indigo-400 font-mono text-sm font-bold">01. CAPTURE</div>
            <h4 className="text-base font-bold text-white mt-2">Commercial Intent Discovery</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Real-time tracking of high-intent search terms, LinkedIn buying committee activity, and account intent.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <div className="text-purple-400 font-mono text-sm font-bold">02. ATTRIBUTE</div>
            <h4 className="text-base font-bold text-white mt-2">Multi-Touch Verification</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Deterministic first-touch, multi-touch, and last-touch attribution with zero cookie deprecation loss.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <div className="text-emerald-400 font-mono text-sm font-bold">03. CONVERT</div>
            <h4 className="text-base font-bold text-white mt-2">Instant Lead Routing & SLA</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Under-3-minute transactional notifications, automated CRM account creation, and follow-up task dispatch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

