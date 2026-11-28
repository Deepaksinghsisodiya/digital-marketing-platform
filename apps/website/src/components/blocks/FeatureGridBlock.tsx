import React from "react";
import type { CmsBlock } from "../../lib/cms";
import {
  Search,
  Target,
  BarChart3,
  TrendingUp,
  MailCheck,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "../motion/Stagger";
import { SectionHeading } from "../ui/SectionHeading";

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
    badge: "DPDP / GDPR Compliance",
    color: "from-rose-600 to-pink-500",
  },
];

export const FeatureGridBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle =
    (content.sectionTitle as string) || "Full-Stack Performance Marketing Engines";
  const sectionSubtitle =
    (content.subheadline as string) ||
    (content.sectionSubtitle as string) ||
    "Everything your brand needs to generate qualified customer inquiries, maximize ad spend efficiency, and scale predictable revenue.";

  const defaultFeatures: FeatureItem[] = [
    {
      title: "High-Intent Commercial SEO",
      description:
        "Rank on page #1 of Google for high-value commercial keywords. Bespoke landing architectures, programmatic schema, and authority content that drives paying customers.",
    },
    {
      title: "Paid Search & Google Ads PMax",
      description:
        "Capture buyers at the exact second they are searching. Continuous negative matching and smart bidding eliminating 30-40% ad waste while maintaining 4.5x+ ROAS.",
    },
    {
      title: "Paid Social (Meta, Instagram & LinkedIn)",
      description:
        "Scroll-stopping video ad creatives, laser-focused audience segmentation, and high-converting retargeting funnels tailored for B2B and DTC buyers.",
    },
    {
      title: "Scientific Landing Page CRO",
      description:
        "Double your sales conversion rate without spending more on media. Multivariate split testing, psychological copy hooks, and sub-second mobile page loads.",
    },
    {
      title: "Automated WhatsApp & Email Lead Nurturing",
      description:
        "Instant sub-60-second lead qualification via automated WhatsApp routing and behavioral email drip sequences that book meetings straight into your calendar.",
    },
    {
      title: "Closed-Loop Revenue Attribution",
      description:
        "Eliminate vanity metrics. Direct server-side tracking that maps ad clicks to actual closed deals in your CRM, giving you true ROI transparency.",
    },
  ];

  const incomingList =
    Array.isArray(content?.services) && content.services.length > 0
      ? (content.services as Array<FeatureItem & { link?: string; enabled?: boolean }>)
      : Array.isArray(content?.features) && content.features.length > 0
        ? (content.features as Array<FeatureItem & { link?: string; enabled?: boolean }>)
        : [];

  const features = incomingList.filter(
    (f) => (f as { enabled?: boolean }).enabled !== false && f.title,
  );

  if (features.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <SectionHeading
        eyebrow="Comprehensive Growth Pillars"
        title={sectionTitle}
        description={sectionSubtitle}
      />

      {/* Editorial Asymmetric Split: Featured Pillar Spotlight + Structured Capability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {features.slice(0, 1).map((featured, idx) => {
          const meta = FEATURE_METADATA[0]!;
          const Icon = meta.icon;
          const targetLink = (featured as { link?: string }).link || "/services";

          return (
            <div key={idx} className="lg:col-span-5 lg:sticky lg:top-28">
              <Link
                href={targetLink}
                className="block rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70">
                    {meta.badge}
                  </span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
                  {meta.tag}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-teal-700 transition-colors">
                  {featured.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  {featured.description}
                </p>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-teal-700">
                  <span>Explore flagship capability</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
            </div>
          );
        })}

        <Stagger className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 items-stretch w-full">
          {features.slice(1).map((feature, rawIdx) => {
            const idx = rawIdx + 1;
            const meta =
              FEATURE_METADATA[idx % FEATURE_METADATA.length] ??
              FEATURE_METADATA[0]!;
            const Icon = meta.icon;
            const targetLink = (feature as { link?: string }).link || "/services";

            return (
              <StaggerItem key={idx} index={idx} className="h-full">
                <Link
                  href={targetLink}
                  className="w-full h-full rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 hover:border-teal-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                        {meta.badge}
                      </span>
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-600 transition-colors mb-1">
                      {meta.tag}
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-teal-700 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-teal-700">
                    <span>Explore capability</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>

      {/* Clean Architectural 3-Stage Execution Strip */}
      <div className="mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="px-5 py-5 sm:px-8 sm:py-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-teal-700">
              Automated Execution Pipeline
            </span>
            <h3 className="text-base sm:text-xl font-extrabold mt-0.5 text-slate-900 leading-snug">
              How Nexora Transforms Digital Inquiries into Enterprise Revenue
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            End-to-End SLA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 w-full">
          {/* Stage 1: Capture */}
          <div className="p-5 sm:p-7 flex flex-col justify-between group hover:bg-slate-50/50 transition-colors">
            <div>
              <div className="flex items-center justify-between text-teal-700 font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  01. CAPTURE
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-semibold">Stage 1</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Commercial Intent Discovery
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Real-time tracking of high-intent search terms, LinkedIn buying
                committee activity, and account intent.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Real-Time Intent Tracking</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Stage 2: Attribute */}
          <div className="p-5 sm:p-7 flex flex-col justify-between group hover:bg-slate-50/50 transition-colors">
            <div>
              <div className="flex items-center justify-between text-slate-800 font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                  02. ATTRIBUTE
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-semibold">Stage 2</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Multi-Touch Verification
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Deterministic first-touch, multi-touch, and last-touch attribution
                with zero cookie deprecation loss.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Zero Cookie Loss</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Stage 3: Convert */}
          <div className="p-5 sm:p-7 flex flex-col justify-between group hover:bg-slate-50/50 transition-colors">
            <div>
              <div className="flex items-center justify-between text-rose-600 font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  03. CONVERT
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-semibold">Stage 3</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Instant Lead Routing & SLA
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Under-3-minute transactional notifications, automated CRM account
                creation, and follow-up task dispatch.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>&lt; 3-Minute Response SLA</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
