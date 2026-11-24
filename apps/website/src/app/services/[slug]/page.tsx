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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Search,
  Target,
  Zap,
  Layers,
  HelpCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

interface ServiceDetail {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  heroMetric: string;
  heroMetricLabel: string;
  deliverables: {
    title: string;
    description: string;
    highlight: string;
  }[];
  process: {
    step: string;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const SERVICES_DATA: Record<string, ServiceDetail> = {
  seo: {
    slug: "seo",
    title: "Search Engine Optimization (SEO)",
    category: "Digital Growth",
    tagline: "Drive predictable, compounding pipeline from organic search without recurring ad spend.",
    description: "We architect enterprise technical SEO, programmatic content clusters, and authoritative digital PR funnels that dominate commercial search queries and capture high-intent buyers.",
    heroMetric: "+340%",
    heroMetricLabel: "Average Inbound Pipeline Velocity",
    deliverables: [
      {
        title: "Technical Crawl & Core Web Vitals Optimization",
        description: "Eliminate indexation bottlenecks, fix JavaScript rendering gaps, and achieve sub-second LCP and INP performance across every domain.",
        highlight: "100% Core Web Vitals Pass Rate",
      },
      {
        title: "Programmatic Search Architecture",
        description: "Scale targeted landing pages for thousands of long-tail commercial queries with dynamic schema markup and zero manual content overhead.",
        highlight: "Scalable Page Generation",
      },
      {
        title: "High-Intent Commercial Keyword Clusters",
        description: "Identify and conquer bottom-of-funnel keywords where prospects are actively evaluating solutions and preparing to buy.",
        highlight: "Revenue-First Topic Modeling",
      },
      {
        title: "Digital PR & Authoritative Backlink Acquisition",
        description: "Build genuine editorial domain authority through data-driven industry studies, whitepapers, and tier-1 press mentions.",
        highlight: "Zero Spam / Pure Editorial Links",
      },
      {
        title: "Conversion-Focused Content Optimization",
        description: "Transform informational blog traffic into qualified commercial leads using inline proof blocks, interactive tools, and context-aware CTAs.",
        highlight: "Lead Capture Rate Multipliers",
      },
      {
        title: "Deterministic Organic Attribution Reporting",
        description: "Track the journey from first organic keyword impression to signed commercial contract with first-party multi-touch attribution.",
        highlight: "Full Revenue Transparency",
      },
    ],
    process: [
      {
        step: "01",
        title: "Comprehensive Domain & Competitor Audit",
        description: "We analyze technical infrastructure, backlink velocity, content gaps, and competitor vulnerabilities to build your 90-day growth roadmap.",
      },
      {
        step: "02",
        title: "Technical Resolution & Content Engineering",
        description: "Our engineers resolve all crawl errors and Core Web Vitals issues while our content strategists deploy authoritative keyword clusters.",
      },
      {
        step: "03",
        title: "Digital PR, Authority Scaling & CRO",
        description: "We scale editorial backlinks, optimize conversion pathways, and report direct pipeline attribution in real-time dashboards.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to see tangible revenue results from SEO?",
        answer: "While technical fixes and quick-win keyword optimizations often produce ranking and traffic improvements within 30 to 60 days, predictable enterprise pipeline compounding typically scales significantly between months 3 and 6.",
      },
      {
        question: "Do you guarantee first-page Google rankings?",
        answer: "We guarantee rigorous technical standards, world-class content quality, and aggressive execution. Because search engine algorithms update continuously, we focus on what matters most to your business: qualified inbound leads, pipeline velocity, and measurable revenue.",
      },
      {
        question: "How does Nexora handle programmatic SEO safely?",
        answer: "Our programmatic frameworks combine real-world data, proprietary entity research, and dynamic UI blocks rather than low-quality AI scrapes. Every generated page provides genuine user utility, fast loading speed, and strict schema compliance.",
      },
    ],
  },
  "paid-ads": {
    slug: "paid-ads",
    title: "Performance Paid Media (Google & Meta)",
    category: "Digital Growth",
    tagline: "Maximize ROAS and scale client acquisition with algorithmic bidding and deterministic attribution.",
    description: "We build, manage, and optimize multi-channel performance advertising campaigns across Google Search, Performance Max, YouTube, LinkedIn, and Meta Ads engineered to eliminate ad waste and maximize pipeline return.",
    heroMetric: "4.2x",
    heroMetricLabel: "Blended Return on Ad Spend (ROAS)",
    deliverables: [
      {
        title: "Algorithmic Search & Performance Max Campaigns",
        description: "Hyper-targeted intent bidding that captures active buyers while eliminating junk clicks with rigorous negative keyword architectures.",
        highlight: "Up to 40% Ad Waste Reduction",
      },
      {
        title: "Account-Based Retargeting & Audience Modeling",
        description: "Sync your first-party CRM data into dynamic lookalike and retargeting clusters across LinkedIn, Meta, and Google Display networks.",
        highlight: "First-Party Audience Sync",
      },
      {
        title: "High-Converting Modular Ad Creative",
        description: "Continuous multivariate creative testing with bespoke video, motion graphic, and static ad concepts that fight creative fatigue.",
        highlight: "Weekly Creative Refreshes",
      },
      {
        title: "Server-Side Conversions API (CAPI) Tracking",
        description: "Eliminate cookie loss and iOS privacy gaps with server-side conversion dispatch directly to Google and Meta ad platforms.",
        highlight: "Zero Signal Loss Architecture",
      },
      {
        title: "Frictionless Landing Page Funnels",
        description: "Bespoke high-converting landing pages matched to individual ad copy, ensuring message consistency and high quality scores.",
        highlight: "Sub-Second Funnel Velocity",
      },
      {
        title: "Live ROAS & Blended CAC Dashboards",
        description: "Real-time visibility into ad spend, customer acquisition cost (CAC), pipeline generated, and closed revenue per ad campaign.",
        highlight: "Closed-Loop Revenue Visibility",
      },
    ],
    process: [
      {
        step: "01",
        title: "Ad Account Audit & Signal Verification",
        description: "We audit past ad performance, verify conversion tracking tags, clean up negative match lists, and restructure bidding clusters.",
      },
      {
        step: "02",
        title: "Creative Production & Campaign Architecture",
        description: "We produce high-impact ad variants, build modular landing pages, and launch targeted search, social, and retargeting campaigns.",
      },
      {
        step: "03",
        title: "Algorithmic Scaling & Bid Optimization",
        description: "We reallocate budget dynamically to top-performing ad variants, expand lookalike audiences, and drive down blended CAC.",
      },
    ],
    faqs: [
      {
        question: "What minimum ad spend budget do you recommend?",
        answer: "For performance paid media, we typically recommend a monthly ad budget of at least $3,000 / ₹2,00,000 to gather statistically significant conversion data quickly and enable machine-learning bidding algorithms to optimize effectively.",
      },
      {
        question: "Who owns the ad accounts and creative assets?",
        answer: "You retain 100% ownership of your Google Ads, Meta Business Manager, LinkedIn Campaign Manager accounts, and all creative files. Nexora operates with partner administrative permissions.",
      },
      {
        question: "How do you protect campaigns from bot clicks and invalid traffic?",
        answer: "We deploy automated IP exclusion filters, click-fraud detection protocols, and server-side verification to ensure your ad spend is directed exclusively to genuine human decision-makers.",
      },
    ],
  },
  cro: {
    slug: "cro",
    title: "Conversion Rate Optimization (CRO)",
    category: "Digital Growth",
    tagline: "Turn existing website traffic into paying clients with behavioral research and multivariate testing.",
    description: "Double your sales pipeline without spending an extra dollar on traffic. We identify funnel drop-offs, optimize UX friction points, and engineer high-converting digital experiences.",
    heroMetric: "+68%",
    heroMetricLabel: "Average Form Conversion Lift",
    deliverables: [
      {
        title: "Heatmap, Scroll & Session Recording Analysis",
        description: "Identify exactly where prospective buyers hesitate, get confused, or abandon your checkout and lead capture funnels.",
        highlight: "Behavioral Drop-off Diagnostics",
      },
      {
        title: "Multivariate & A/B Split Testing",
        description: "Scientifically test headlines, CTA placements, form steps, pricing presentations, and social proof elements to find winning variants.",
        highlight: "Statistically Verified Lifts",
      },
      {
        title: "Frictionless Multi-Step Lead Intake",
        description: "Replace intimidating long forms with progressive disclosure funnels that guide prospects smoothly to the finish line.",
        highlight: "Up to 2.4x Higher Completion",
      },
      {
        title: "Mobile UX & Checkout Acceleration",
        description: "Streamline mobile navigation, tap targets, payment gateways, and autofill behaviors for seamless mobile buying.",
        highlight: "Mobile Abandonment Reduction",
      },
      {
        title: "Persuasive Copywriting & Value Architecture",
        description: "Reframe feature lists into urgent commercial outcomes that resonate directly with CFOs and business executives.",
        highlight: "Outcome-Driven Messaging",
      },
      {
        title: "Continuous Experimentation Cadence",
        description: "Regular bi-weekly experiment sprints with transparent hypothesis tracking, variant design, and impact metrics.",
        highlight: "Compounding Monthly Gains",
      },
    ],
    process: [
      {
        step: "01",
        title: "Qualitative & Quantitative Discovery",
        description: "We analyze GA4 funnels, session replays, user heatmaps, and on-site feedback to discover top conversion leakage points.",
      },
      {
        step: "02",
        title: "Hypothesis Formulation & Design",
        description: "We engineer high-fidelity test variants with optimized messaging, visual hierarchy, and frictionless interaction patterns.",
      },
      {
        step: "03",
        title: "Live Testing & Permanent Deployment",
        description: "We run statistically powered tests and deploy winning variants directly to production for immediate revenue lift.",
      },
    ],
    faqs: [
      {
        question: "How much traffic do I need for CRO to be effective?",
        answer: "Meaningful A/B testing usually requires at least 15,000 to 25,000 monthly unique visitors. For lower-traffic enterprise sites, we utilize qualitative heuristic analysis and micro-conversion optimization.",
      },
      {
        question: "Will CRO experiments slow down our website?",
        answer: "No. We utilize server-side and edge-rendered variant delivery, eliminating the visual flickering or layout shifts common with legacy client-side testing scripts.",
      },
      {
        question: "How do you measure success?",
        answer: "We measure success by qualified lead submissions, demo bookings, completed checkouts, and incremental revenue generated.",
      },
    ],
  },
  "content-marketing": {
    slug: "content-marketing",
    title: "Content Marketing & Thought Leadership",
    category: "Digital Growth",
    tagline: "Establish undeniable market authority with high-intent editorial content that converts.",
    description: "We develop research-backed whitepapers, executive LinkedIn commentary, and educational buyer guides that capture search intent, educate prospects, and drive qualified inquiries.",
    heroMetric: "5.4x",
    heroMetricLabel: "Organic Lead Compounding Multiplier",
    deliverables: [
      {
        title: "Executive Ghostwriting & Thought Leadership",
        description: "Turn your executive team's domain expertise into authoritative LinkedIn posts, Forbes articles, and keynote insights.",
        highlight: "C-Level Credibility Scaling",
      },
      {
        title: "Full-Funnel Content Architecture",
        description: "Create targeted assets for every stage of the buyer journey: problem discovery, vendor comparison, and ROI justification.",
        highlight: "Intent-Mapped Content",
      },
      {
        title: "Original Industry Research Reports",
        description: "Design proprietary benchmark studies and industry surveys that earn organic backlinks from leading trade publications.",
        highlight: "Natural Backlink Magnets",
      },
      {
        title: "High-Converting Lead Magnets",
        description: "Build actionable calculators, audit checklists, and strategy templates that generate high-quality opt-in business leads.",
        highlight: "High-AOV Lead Capture",
      },
      {
        title: "Search-Optimized Pillar Content",
        description: "In-depth definitive guides that capture top rankings for competitive broad-match commercial topics.",
        highlight: "Top-of-Funnel Market Dominance",
      },
      {
        title: "Multi-Format Repurposing Engine",
        description: "Transform single long-form research pieces into newsletters, slide decks, social carousels, and video scripts.",
        highlight: "Maximum Content ROI",
      },
    ],
    process: [
      {
        step: "01",
        title: "Audience & Topic Research",
        description: "We interview your subject matter experts and analyze commercial search patterns to identify high-value editorial topics.",
      },
      {
        step: "02",
        title: "Deep Research & Content Production",
        description: "Our senior copywriters and designers produce polished, thoroughly researched content tailored to enterprise buyers.",
      },
      {
        step: "03",
        title: "Distribution, Syndication & Lead Capture",
        description: "We amplify content through targeted email newsletters, executive social channels, and strategic syndication partners.",
      },
    ],
    faqs: [
      {
        question: "Who writes the content?",
        answer: "All content is produced by specialized industry copywriters with subject matter knowledge in B2B technology, finance, and enterprise marketing, overseen by our editorial leads.",
      },
      {
        question: "How do you ensure our brand tone remains authentic?",
        answer: "We conduct an in-depth brand voice onboarding session to catalog your style guidelines, technical vocabulary, and preferred point of view before drafting any copy.",
      },
      {
        question: "Can we review and edit content before it publishes?",
        answer: "Yes, every asset goes through an intuitive review and approval workflow before being scheduled for publication.",
      },
    ],
  },
  "web-design-development": {
    slug: "web-design-development",
    title: "High-Converting Business Websites",
    category: "Web & Conversion Experiences",
    tagline: "Ultra-fast, mobile-first business websites engineered to establish authority and drive sales inquiries.",
    description: "We design and develop high-performance modern web platforms using Next.js 15, Tailwind CSS, and headless architectures with sub-second loading speeds, perfect Core Web Vitals, and frictionless lead capture.",
    heroMetric: "< 0.8s",
    heroMetricLabel: "Average Page Load Speed",
    deliverables: [
      {
        title: "Next.js 15 & Server Components Architecture",
        description: "Modern, secure, and lightning-fast web architecture with zero client-side bloat and instantaneous route transitions.",
        highlight: "Sub-Second Global Edge Delivery",
      },
      {
        title: "Mobile-First Conversion Layouts",
        description: "Flawless responsive layouts engineered specifically for mobile decision-makers with thumb-friendly navigation and one-tap calling.",
        highlight: "100% Mobile Optimized",
      },
      {
        title: "Enterprise Design System & Token Architecture",
        description: "Consistent typography, micro-interactions, dark/light themes, and reusable component libraries built on modern standards.",
        highlight: "Pixel-Perfect Precision",
      },
      {
        title: "Full Headless CMS Integration",
        description: "Empower your marketing team to create, edit, and publish landing pages and blogs without needing developer intervention.",
        highlight: "Zero-Code Marketing Agility",
      },
      {
        title: "Automated SEO & Schema Markup",
        description: "Pre-configured OpenGraph tags, JSON-LD structured data, XML sitemaps, and canonical routing out of the box.",
        highlight: "Built-in Search Engine Visibility",
      },
      {
        title: "Security, Compliance & WCAG AA Accessibility",
        description: "Enterprise SSL, Content Security Policies, DPDP/GDPR compliant cookie handling, and accessible UI for all users.",
        highlight: "Bank-Grade Digital Security",
      },
    ],
    process: [
      {
        step: "01",
        title: "Information Architecture & Wireframing",
        description: "We map out user flows, navigation hierarchies, and high-converting wireframes tailored to your buyer personas.",
      },
      {
        step: "02",
        title: "High-Fidelity Design & Development",
        description: "We build your custom web experience with modern Next.js, sub-second performance optimizations, and headless CMS bindings.",
      },
      {
        step: "03",
        title: "Rigorous QA, Speed Testing & Launch",
        description: "We execute cross-browser testing, Core Web Vitals audits, and frictionless DNS cutover with zero downtime.",
      },
    ],
    faqs: [
      {
        question: "How long does a website build typically take?",
        answer: "Standard high-performance business websites are delivered within 3 to 5 weeks from initial design approval to live launch.",
      },
      {
        question: "Can our team update content without developers?",
        answer: "Yes! Every website includes an intuitive visual Admin CMS where you can update text, images, pricing, and case studies with immediate live publishing.",
      },
      {
        question: "Do you offer post-launch maintenance and support?",
        answer: "Yes, we provide ongoing SLAs including Core Web Vitals monitoring, security patches, content updates, and monthly performance enhancements.",
      },
    ],
  },
  "ai-marketing": {
    slug: "ai-marketing",
    title: "AI-Powered Marketing & Automation",
    category: "AI & Automation",
    tagline: "Scale customer acquisition and lead response times with autonomous AI workflows.",
    description: "Automate lead qualification, personalized outreach, programmatic copy variations, and real-time client reporting using modern AI workflows and automated CRM routing.",
    heroMetric: "10x",
    heroMetricLabel: "Operational Speed Multiplier",
    deliverables: [
      {
        title: "Autonomous 24/7 Lead Qualification Agents",
        description: "Engage inbound website prospects instantly with intelligent conversational agents that qualify budget, scope, and timeline.",
        highlight: "< 30s Lead Response Time",
      },
      {
        title: "Programmatic Copy & Creative Variation",
        description: "Generate and test hundreds of personalized ad copy and email subject line variations tuned to distinct buyer segments.",
        highlight: "Continuous Creative Generation",
      },
      {
        title: "Predictive Lead Scoring & Routing",
        description: "Score inbound inquiries in real time based on firmographic data and route top-tier prospects directly to senior account executives.",
        highlight: "Zero Sales Rep Wasted Time",
      },
      {
        title: "Automated Competitor & Price Telemetry",
        description: "Track competitor ad changes, keyword ranking shifts, and pricing updates automatically with weekly executive summaries.",
        highlight: "Proactive Market Intelligence",
      },
      {
        title: "Automated Monthly Client Reporting",
        description: "Consolidate Meta Ads, Google Ads, GA4, and CRM metrics into beautiful, automated monthly client performance reports.",
        highlight: "Hours of Manual Work Saved",
      },
      {
        title: "Custom CRM & Webhook Integration",
        description: "Connect your website forms and ad channels seamlessly with HubSpot, Salesforce, Zoho, Slack, and email notifications.",
        highlight: "Frictionless Data Pipelines",
      },
    ],
    process: [
      {
        step: "01",
        title: "Workflow & Systems Discovery",
        description: "We map out repetitive manual marketing and sales tasks to identify prime opportunities for autonomous AI acceleration.",
      },
      {
        step: "02",
        title: "Agent Engineering & Integration",
        description: "We build and test custom automation pipelines, lead scoring rules, and conversational assistants connected to your CRM.",
      },
      {
        step: "03",
        title: "Live Deployment & Performance Tuning",
        description: "We deploy the workflows into production, train your team, and continuously optimize accuracy and response quality.",
      },
    ],
    faqs: [
      {
        question: "Is our customer data secure with AI workflows?",
        answer: "Yes. All automation runs through enterprise API endpoints that do not train public models on your confidential corporate data, strictly adhering to DPDP and privacy guidelines.",
      },
      {
        question: "Can AI replace human sales representatives?",
        answer: "No. AI automates repetitive qualification and research tasks so your human sales team can spend 100% of their time closing high-intent enterprise deals.",
      },
      {
        question: "How difficult is it to integrate with our existing CRM?",
        answer: "Very simple. We build automated webhooks and API connectors that integrate cleanly into your existing CRM without disrupting ongoing operations.",
      },
    ],
  },
};

// Fallback generator for unlisted services
function getFallbackService(slug: string): ServiceDetail {
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug,
    title: formattedTitle,
    category: "Digital Growth & Technology",
    tagline: `Accelerate enterprise performance with bespoke ${formattedTitle} solutions.`,
    description: `We engineer comprehensive ${formattedTitle} strategies, enterprise execution, and real-time revenue attribution built specifically for scaling businesses.`,
    heroMetric: "+280%",
    heroMetricLabel: "Average Commercial Impact",
    deliverables: [
      {
        title: `Strategic ${formattedTitle} Architecture`,
        description: "Bespoke strategy development mapped directly to your commercial pipeline targets.",
        highlight: "Custom Roadmap",
      },
      {
        title: "High-Performance Execution",
        description: "Experienced digital marketing engineers deploy industry best practices for maximum velocity.",
        highlight: "Rapid Execution",
      },
      {
        title: "Deterministic Attribution & Analytics",
        description: "Measure every rupee and dollar of ad spend directly against closed commercial contracts.",
        highlight: "Full Transparency",
      },
    ],
    process: [
      {
        step: "01",
        title: "Discovery & Opportunity Sizing",
        description: "We inspect existing data, competitive dynamics, and funnel bottlenecks.",
      },
      {
        step: "02",
        title: "Rapid Execution Sprints",
        description: "We deploy optimizations in rapid weekly iterations with continuous testing.",
      },
      {
        step: "03",
        title: "Attribution & Scaling",
        description: "We scale high-performing initiatives and automate ongoing tracking.",
      },
    ],
    faqs: [
      {
        question: `How quickly can we launch a ${formattedTitle} project?`,
        answer: "Our onboarding sprints typically begin within 3 to 5 business days following commercial alignment.",
      },
      {
        question: "What reporting cadence do you provide?",
        answer: "You receive access to a 24/7 live telemetry dashboard alongside bi-weekly executive review calls.",
      },
    ],
  };
}

export async function generateStaticParams() {
  return [
    { slug: "seo" },
    { slug: "paid-ads" },
    { slug: "cro" },
    { slug: "content-marketing" },
    { slug: "web-design-development" },
    { slug: "ai-marketing" },
    { slug: "social-media-marketing" },
    { slug: "analytics-reporting" },
    { slug: "web-application-development" },
    { slug: "custom-software-development" },
    { slug: "ecommerce-development" },
    { slug: "lead-automation" },
    { slug: "crm-integrations" },
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
    (await getPublicPage(`services/${slug}`, region.code)) ||
    (await getPublicPage(slug, region.code));

  if (cmsPage) {
    return {
      title: cmsPage.metaTitle || `${cmsPage.title} — Nexora`,
      description:
        cmsPage.metaDescription ||
        `Explore enterprise ${cmsPage.title} services by Nexora.`,
    };
  }

  const service = SERVICES_DATA[slug] || getFallbackService(slug);

  return {
    title: `${service.title} — Nexora Digital Marketing`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = resolveRegion();

  const [siteSettings, headerMenu, cmsPage] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
    getPublicPage(`services/${slug}`, region.code).then(
      (res) => res || getPublicPage(slug, region.code),
    ),
  ]);

  // If a full custom CMS page exists in Admin, render its dynamic blocks!
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

  // Dynamic rich fallback service page
  const service = SERVICES_DATA[slug] || getFallbackService(slug);

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
                <Sparkles className="w-3.5 h-3.5" />
                <span>{service.category}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                {service.title}
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed">
                {service.tagline}
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                {service.description}
              </p>

              {/* Impact Metric Bar */}
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {service.heroMetric}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {service.heroMetricLabel}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/free-audit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
                >
                  <span>Request Free Marketing Audit</span>
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

        {/* Deliverables / Capabilities Grid */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Comprehensive Execution
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                What We Deliver
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                End-to-end strategy, rapid execution, and continuous optimization tailored to your growth goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                      {item.highlight}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Included in engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Proven Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                How We Drive Measurable Results
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                A structured, transparent framework designed to eliminate guesswork and compound commercial returns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {service.process.map((step, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-4"
                >
                  <div className="text-4xl font-black text-primary/30">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
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
                Clear Answers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="text-base font-bold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Bar */}
        <section className="py-16 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Accelerate Your Pipeline?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Get an actionable, tailored marketing diagnostic for {service.title} within 48 hours.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/free-audit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
              >
                <span>Request Free Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
              >
                <span>View Transparent Pricing</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
