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
        : defaultFeatures;

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

      {/* 100% Pure CSS Grid:
          - Mobile (< 640px): 1 column (grid-cols-1) with full width cards
          - Tablet (640px - 1023px): 2 columns (sm:grid-cols-2)
          - Laptop & Large Screen (1024px+): 3 columns (lg:grid-cols-3)
          - All cards expand to fill full cell width (w-full) and equal height (h-full)
      */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch w-full">
        {features.map((feature, idx) => {
          const meta =
            FEATURE_METADATA[idx % FEATURE_METADATA.length] ??
            FEATURE_METADATA[0]!;
          const Icon = meta.icon;
          const targetLink = (feature as { link?: string }).link || "/services";

          return (
            <StaggerItem key={idx} index={idx} className="h-full">
              <Link
                href={targetLink}
                className="w-full h-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 md:p-7 lg:p-8 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Top: Icon + Badge with rotation on hover */}
                  <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300 shrink-0`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary transition shrink-0">
                      {meta.badge}
                    </span>
                  </div>

                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                    {meta.tag}
                  </div>

                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2 tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-hover">
                  <span>Explore capability</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Interactive 3-Stage Pipeline Teaser (Responsive Grid for Mobile, Tablet & Desktop) */}
      <div className="mt-10 sm:mt-14 md:mt-18 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 text-slate-900 shadow-xl border border-indigo-100 w-full">
        <div className="max-w-3xl mb-4 sm:mb-6 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50/80 border border-indigo-200/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full inline-block">
            Automated Execution Pipeline
          </span>
          <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold mt-1.5 text-slate-900 leading-snug">
            How Nexora Transforms Digital Inquiries into Enterprise Revenue
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 items-stretch w-full">
          {/* Stage 1: Capture */}
          <div className="p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
            <div>
              <div className="flex items-center justify-between text-indigo-600 font-mono text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                  01. CAPTURE
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-medium">Stage 1</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                Commercial Intent Discovery
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Real-time tracking of high-intent search terms, LinkedIn buying
                committee activity, and account intent.
              </p>
            </div>
            <div className="pt-2.5 sm:pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
              <span>Real-Time Intent Tracking</span>
              <ArrowUpRight className="w-3 h-3 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Stage 2: Attribute */}
          <div className="p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-400 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            <div>
              <div className="flex items-center justify-between text-purple-600 font-mono text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                  02. ATTRIBUTE
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-medium">Stage 2</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                Multi-Touch Verification
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Deterministic first-touch, multi-touch, and last-touch attribution
                with zero cookie deprecation loss.
              </p>
            </div>
            <div className="pt-2.5 sm:pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
              <span>Zero Cookie Loss</span>
              <ArrowUpRight className="w-3 h-3 text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Stage 3: Convert */}
          <div className="p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div>
              <div className="flex items-center justify-between text-emerald-600 font-mono text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  03. CONVERT
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-medium">Stage 3</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                Instant Lead Routing & SLA
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Under-3-minute transactional notifications, automated CRM account
                creation, and follow-up task dispatch.
              </p>
            </div>
            <div className="pt-2.5 sm:pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
              <span>&lt; 3-Minute Response SLA</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
