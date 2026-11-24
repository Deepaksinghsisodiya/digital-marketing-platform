import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveRegion } from "@/config/region";
import {
  getPublicSiteSettings,
  getPublicMenu,
  getPublicPage,
} from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Cpu,
  ShoppingCart,
  Stethoscope,
  Home,
  Hotel,
  GraduationCap,
  Layers,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

interface IndustryDetail {
  slug: string;
  title: string;
  heroTagline: string;
  description: string;
  kpiStat: string;
  kpiLabel: string;
  challenges: {
    title: string;
    description: string;
  }[];
  solutions: {
    title: string;
    description: string;
    impact: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const INDUSTRIES_DATA: Record<string, IndustryDetail> = {
  saas: {
    slug: "saas",
    title: "B2B SaaS & Enterprise Technology",
    heroTagline: "Lower customer acquisition cost (CAC) and scale qualified pipeline for recurring revenue.",
    description: "We help venture-backed and bootstrapped software companies capture high-intent search demand, orchestrate product-led acquisition funnels, and scale ARR.",
    kpiStat: "+312%",
    kpiLabel: "Average Inbound ARR Compounding",
    challenges: [
      {
        title: "Escalating CAC & Paid Ad Burn",
        description: "Bidding on hyper-competitive generic software keywords depletes budgets with low trial-to-paid conversion rates.",
      },
      {
        title: "Long Sales Cycles & Deal Stalls",
        description: "Enterprise buyers require consensus across CFOs, CTOs, and compliance teams before signing contracts.",
      },
      {
        title: "Attribution Blind Spots",
        description: "Inability to deterministically prove which marketing touchpoints influenced pipeline deals in CRM.",
      },
    ],
    solutions: [
      {
        title: "Programmatic Comparison & Alternative Pages",
        description: "Capture buyers actively comparing your product against legacy incumbents with high-converting comparison matrices.",
        impact: "Instant High-Intent Demos",
      },
      {
        title: "Multi-Touch CRM Revenue Attribution",
        description: "Connect HubSpot and Salesforce opportunities directly with Google and Meta ad impressions using server-side tracking.",
        impact: "Closed-Loop ROAS Visibility",
      },
      {
        title: "Interactive ROI & TCO Calculators",
        description: "Equip prospective champions with self-serve business case calculators they can hand directly to their CFO.",
        impact: "Accelerated Deal Velocity",
      },
    ],
    faqs: [
      {
        question: "How do you handle B2B sales cycles spanning 3 to 9 months?",
        answer: "We deploy deterministic first-party multi-touch attribution combined with account-based retargeting to maintain continuous brand touchpoints throughout the entire evaluation cycle.",
      },
      {
        question: "Do you integrate with HubSpot and Salesforce?",
        answer: "Yes, we build bi-directional webhooks and sync custom conversion events back into Google and LinkedIn Ads for algorithmic bid optimization.",
      },
    ],
  },
  ecommerce: {
    slug: "ecommerce",
    title: "E-Commerce & Direct-to-Consumer (DTC)",
    heroTagline: "Scale ROAS, maximize average order value (AOV), and conquer international markets.",
    description: "High-performance digital marketing, machine-learning ad creative testing, and sub-second headless storefronts engineered for fast-scaling online retailers.",
    kpiStat: "4.2x",
    kpiLabel: "Blended Return on Ad Spend (ROAS)",
    challenges: [
      {
        title: "Ad Signal Depletion & Privacy Changes",
        description: "iOS privacy changes and cookie degradation increase acquisition costs across traditional social channels.",
      },
      {
        title: "Cart Abandonment on Mobile",
        description: "Sluggish checkout pages and multi-step forms drive mobile visitors to abandon purchases before paying.",
      },
      {
        title: "Heavy Reliance on Discounting",
        description: "Constant price promotions erode gross margins and attract low lifetime value (LTV) shoppers.",
      },
    ],
    solutions: [
      {
        title: "Server-Side Conversions API (CAPI) Architecture",
        description: "Restore 100% conversion signal tracking to Meta and Google ad algorithms to slash customer acquisition costs.",
        impact: "Sub-Second Attribution Sync",
      },
      {
        title: "High-Velocity Creative Testing Engine",
        description: "Deploy 20+ creative variations weekly across TikTok, Instagram, and YouTube to combat ad fatigue.",
        impact: "Continuous Scale Without Burnout",
      },
      {
        title: "Sub-Second Headless Next.js Storefronts",
        description: "Replace slow legacy themes with edge-rendered storefronts that load in under 800 milliseconds.",
        impact: "Up to +38% Mobile Conversion Lift",
      },
    ],
    faqs: [
      {
        question: "What e-commerce platforms do you support?",
        answer: "We support Shopify Plus, WooCommerce, Magento/Adobe Commerce, and custom headless Next.js e-commerce architectures.",
      },
      {
        question: "How quickly can we see improvements in ROAS?",
        answer: "After server-side tracking setup and creative cluster optimization, clients typically see measurable ROAS gains within the first 30 days.",
      },
    ],
  },
  healthcare: {
    slug: "healthcare",
    title: "Healthcare, Clinics & Life Sciences",
    heroTagline: "Compliant patient acquisition funnels and reputation management engineered for medical trust.",
    description: "We help hospitals, multi-location clinics, and healthcare networks dominate local search, adhere to DPDP data privacy standards, and fill appointment books.",
    kpiStat: "+185%",
    kpiLabel: "Increase in Verified Patient Appointments",
    challenges: [
      {
        title: "Strict Regulatory & Privacy Compliance",
        description: "Handling patient inquiries requires strict adherence to DPDP Act, HIPAA, and medical advertising standards.",
      },
      {
        title: "Patient Skepticism & Credibility Gaps",
        description: "Patients demand verified doctor credentials, peer reviews, and transparent pricing before booking consultations.",
      },
      {
        title: "No-Show & Drop-off Rates",
        description: "High rates of missed appointments when follow-up confirmation sequences are manual or non-existent.",
      },
    ],
    solutions: [
      {
        title: "Compliant Privacy-First Intake Portals",
        description: "Secure, encrypted appointment forms that strictly safeguard patient data with zero third-party cookie leakage.",
        impact: "100% Regulatory Compliance",
      },
      {
        title: "Local Search & Google Business Profile Dominance",
        description: "Dominate the Google 3-Pack for local specialty medical queries across multiple clinic branch locations.",
        impact: "Top Organic Local Visibility",
      },
      {
        title: "Automated SMS/WhatsApp Appointment Reminders",
        description: "Frictionless automated booking confirmations and reminder sequences that reduce no-show rates by up to 60%.",
        impact: "Maximized Clinic Utilization",
      },
    ],
    faqs: [
      {
        question: "Are your healthcare marketing funnels compliant with privacy laws?",
        answer: "Yes, all patient forms, appointment routing, and data storage adhere strictly to DPDP data protection guidelines with end-to-end encryption.",
      },
      {
        question: "How do you manage doctor reviews and online reputation?",
        answer: "We implement automated post-consultation review request flows that encourage satisfied patients to share verified testimonials on Google.",
      },
    ],
  },
  "real-estate": {
    slug: "real-estate",
    title: "Real Estate & Commercial Property",
    heroTagline: "Target high-net-worth investors and home buyers with hyper-local digital funnels.",
    description: "Bespoke digital campaigns, 3D interactive unit showcases, and automated lead qualification that deliver serious property buyers to your sales gallery.",
    kpiStat: "₹85Cr+",
    kpiLabel: "Influenced Property Transaction Pipeline",
    challenges: [
      {
        title: "High-Ticket Qualification Hurdle",
        description: "Generic ad campaigns attract unqualified tire-kickers who lack the budget or financing for luxury properties.",
      },
      {
        title: "Over-Crowded Real Estate Portals",
        description: "Listing properties solely on aggregator portals makes your projects indistinguishable from competitors.",
      },
      {
        title: "Slow Broker Response Time",
        description: "High-net-worth buyers lose interest when inquiry follow-ups take hours or days instead of minutes.",
      },
    ],
    solutions: [
      {
        title: "HNW Geo-Fenced Paid Media Campaigns",
        description: "Target affluent buyers by specific residential enclaves, international NRI hubs, and executive job titles.",
        impact: "Verified High-Budget Inquiries",
      },
      {
        title: "Interactive Virtual Tour Funnels",
        description: "Immersive 3D floor plans and project tours that capture contact details before unlocking VIP pricing sheets.",
        impact: "Higher Lead Intent & Engagement",
      },
      {
        title: "Instant 60-Second Sales Handoff",
        description: "Automated WhatsApp and phone bridge routing that connects serious prospects with your sales gallery within seconds.",
        impact: "3x Higher Site Visit Bookings",
      },
    ],
    faqs: [
      {
        question: "Do you specialize in residential, commercial, or both?",
        answer: "We develop campaigns for luxury residential developments, commercial office leasing, and industrial logistics parks.",
      },
      {
        question: "Can you target NRI (Non-Resident Indian) or global buyers?",
        answer: "Yes, we execute targeted international campaigns across the UAE, Singapore, US, and UK specifically for NRI property investment.",
      },
    ],
  },
};

function getFallbackIndustry(slug: string): IndustryDetail {
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug,
    title: `${formattedTitle} Industry Solutions`,
    heroTagline: `Accelerate commercial growth and digital authority in the ${formattedTitle} sector.`,
    description: `We build bespoke customer acquisition systems, search visibility engines, and automated conversion experiences engineered specifically for ${formattedTitle}.`,
    kpiStat: "+260%",
    kpiLabel: "Average Commercial Growth Impact",
    challenges: [
      {
        title: "High Customer Acquisition Costs",
        description: "Inefficient advertising spend and unoptimized landing pages erode profit margins.",
      },
      {
        title: "Competitive Market Saturation",
        description: "Difficulty standing out against established legacy players and aggressive new entrants.",
      },
      {
        title: "Disconnected Digital Systems",
        description: "Fragmented tools and manual data entry prevent accurate visibility into customer ROI.",
      },
    ],
    solutions: [
      {
        title: "Intent-Driven Customer Acquisition",
        description: "Dominate high-value search queries and target prospective buyers with algorithmic precision.",
        impact: "Predictable Sales Pipeline",
      },
      {
        title: "High-Converting Conversion Architecture",
        description: "Engineer modern, sub-second web experiences that turn casual visitors into signed contracts.",
        impact: "Maximized Conversion Velocity",
      },
      {
        title: "Closed-Loop Attribution & Telemetry",
        description: "Gain complete transparency into which marketing channels produce the highest lifetime value.",
        impact: "Data-Backed Growth Decisions",
      },
    ],
    faqs: [
      {
        question: `How does Nexora tailor solutions for the ${formattedTitle} sector?`,
        answer: "We begin with deep competitive research and customer journey mapping specific to your sector before deploying custom growth frameworks.",
      },
      {
        question: "What is the typical timeframe to see tangible business impact?",
        answer: "Our sprint methodology delivers initial campaign launches and optimization wins within the first 30 days.",
      },
    ],
  };
}

export async function generateStaticParams() {
  return [
    { slug: "saas" },
    { slug: "ecommerce" },
    { slug: "healthcare" },
    { slug: "real-estate" },
    { slug: "hospitality" },
    { slug: "education" },
    { slug: "fintech" },
    { slug: "professional-services" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = resolveRegion();

  const cmsPage =
    (await getPublicPage(`industries/${slug}`, region.code)) ||
    (await getPublicPage(slug, region.code));

  if (cmsPage) {
    return {
      title: cmsPage.metaTitle || `${cmsPage.title} Solutions — Nexora`,
      description:
        cmsPage.metaDescription ||
        `Explore specialized ${cmsPage.title} growth solutions by Nexora.`,
    };
  }

  const industry = INDUSTRIES_DATA[slug] || getFallbackIndustry(slug);

  return {
    title: `${industry.title} — Nexora Digital Solutions`,
    description: industry.description,
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = resolveRegion();

  const [siteSettings, headerMenu, cmsPage] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
    getPublicPage(`industries/${slug}`, region.code).then(
      (res) => res || getPublicPage(slug, region.code),
    ),
  ]);

  if (cmsPage && cmsPage.blocks && cmsPage.blocks.length > 0) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
        <Header
          settings={siteSettings}
          currentRegionCode={region.code}
          menu={headerMenu}
        />
        <main className="flex-1">
          <BlockRenderer
            blocks={cmsPage.blocks}
            userRegion={region.code}
          />
        </main>
        <Footer settings={siteSettings} />
      </div>
    );
  }

  const industry = INDUSTRIES_DATA[slug] || getFallbackIndustry(slug);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[160px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>Industry Specialized Solutions</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                {industry.title}
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed">
                {industry.heroTagline}
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                {industry.description}
              </p>

              {/* Impact Metric Bar */}
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {industry.kpiStat}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {industry.kpiLabel}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
                >
                  <span>Schedule Industry Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
                >
                  <span>View Verified Case Studies</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Challenges & Bottlenecks */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Sector Headwinds
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Key Challenges We Solve in {industry.title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                We eliminate the bottlenecks preventing companies in this vertical from reaching their full revenue potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {industry.challenges.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {c.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tailored Solutions */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Engineered Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Our Growth Strategy for {industry.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {industry.solutions.map((sol, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                      {sol.impact}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {sol.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {sol.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Included in engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Sector FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Common Questions &amp; Answers
              </h2>
            </div>

            <div className="space-y-4">
              {industry.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <h3 className="text-base font-bold text-slate-900">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="py-16 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Scale Your {industry.title} Footprint
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Schedule a focused strategy discussion with an industry growth partner.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
              >
                <span>Request Growth Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
