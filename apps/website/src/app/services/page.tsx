import Link from "next/link";
import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import {
  SearchCode,
  TrendingUp,
  Megaphone,
  Share2,
  Mail,
  MessageSquare,
  Layout,
  BarChart3,
  Palette,
  Users,
  Cpu,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Workflow,
  Bot,
  Database,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Digital Growth & Technology Services — Nexora",
  description:
    "Explore our three integrated capabilities: Digital Growth, Technology Solutions, and AI & Automation, engineered for high-performance enterprises across India and the US.",
};

interface ServiceItem {
  title: string;
  slug: string;
  pillar: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  highlights: string[];
}

const PILLARS = [
  {
    name: "Digital Growth",
    badge: "Pillar 1",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Data-driven customer acquisition programs designed to turn commercial search intent and targeted advertising into predictable, compounded pipeline.",
    services: [
      {
        title: "Search Engine Optimization (SEO)",
        slug: "seo",
        pillar: "Digital Growth",
        icon: SearchCode,
        desc: "Dominate commercial keyword clusters, optimize technical Core Web Vitals, and scale programmatic content engines.",
        highlights: [
          "Technical crawl budget audits",
          "Programmatic search architecture",
          "High-intent commercial keyword domination",
        ],
      },
      {
        title: "Performance Paid Media (Google & Meta)",
        slug: "paid-ads",
        pillar: "Digital Growth",
        icon: TrendingUp,
        desc: "Algorithmic bid orchestration, hyper-targeted account-based retargeting, and negative matching saving up to 40% in ad waste.",
        highlights: [
          "First-party audience sync",
          "Automated negative matching",
          "Multi-touch server tracking",
        ],
      },
      {
        title: "Conversion Rate Optimization (CRO)",
        slug: "cro",
        pillar: "Digital Growth",
        icon: Sparkles,
        desc: "Continuous multivariate A/B testing, scroll heatmapping, and frictionless lead form architectures that increase conversion velocity.",
        highlights: [
          "Multivariate form optimization",
          "Heatmap & drop-off audits",
          "Frictionless multi-step intake",
        ],
      },
      {
        title: "Content Marketing & Thought Leadership",
        slug: "content-marketing",
        pillar: "Digital Growth",
        icon: Megaphone,
        desc: "Authoritative editorial strategy and search-led content that establishes industry leadership and captures buyer intent.",
        highlights: [
          "Executive ghostwriting",
          "In-depth research whitepapers",
          "Buyer journey content funnels",
        ],
      },
      {
        title: "Social Media & Executive Amplification",
        slug: "social-media-marketing",
        pillar: "Digital Growth",
        icon: Share2,
        desc: "LinkedIn thought leadership programs, audience amplification, and authentic multi-channel community growth.",
        highlights: [
          "LinkedIn executive branding",
          "B2B social community building",
          "Organic engagement scaling",
        ],
      },
      {
        title: "Deterministic Attribution & Analytics",
        slug: "analytics-reporting",
        pillar: "Digital Growth",
        icon: BarChart3,
        desc: "Server-side tracking eliminating third-party cookie loss, linking ad impressions directly to closed enterprise revenue.",
        highlights: [
          "Server-side Meta/Google CAPI",
          "Deterministic revenue attribution",
          "Custom Looker/BI dashboards",
        ],
      },
      {
        title: "Brand Identity & Creative Systems",
        slug: "branding-creative",
        pillar: "Digital Growth",
        icon: Palette,
        desc: "High-impact visual systems, typographic hierarchies, and multi-variant conversion creative designed to stop the scroll.",
        highlights: [
          "Complete design systems",
          "Ad creative variation testing",
          "Enterprise brand guidelines",
        ],
      },
    ],
  },
  {
    name: "Web & Conversion Experiences",
    badge: "Pillar 2",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    desc: "Fast-loading, mobile-optimized business websites, landing pages, and storefronts engineered to turn casual visitors into paying customers.",
    services: [
      {
        title: "High-Converting Business Websites",
        slug: "web-design-development",
        pillar: "Web & Conversion Experiences",
        icon: Layout,
        desc: "Lightning-fast business websites designed to establish immediate market authority and convert visitor traffic into high-value sales inquiries.",
        highlights: [
          "Ultra-fast mobile loading speed",
          "Mobile-first lead capture forms",
          "Clean, trust-building brand aesthetics",
        ],
      },
      {
        title: "Client Portals & Booking Experiences",
        slug: "web-application-development",
        pillar: "Web & Conversion Experiences",
        icon: Code2,
        desc: "Interactive client portals, online quote calculators, and automated appointment booking systems that make buying from you effortless.",
        highlights: [
          "Frictionless customer intake",
          "Interactive appointment booking",
          "Seamless mobile & desktop flow",
        ],
      },
      {
        title: "Interactive Lead Generation Tools",
        slug: "custom-software-development",
        pillar: "Web & Conversion Experiences",
        icon: Terminal,
        desc: "Custom price estimators, ROI calculators, and interactive assessment funnels that capture high-intent contact details before prospects bounce.",
        highlights: [
          "Custom quote & ROI calculators",
          "Automated lead qualification funnels",
          "Instant lead handoff to sales team",
        ],
      },
      {
        title: "High-AOV E-Commerce Storefronts",
        slug: "ecommerce-development",
        pillar: "Web & Conversion Experiences",
        icon: ShoppingCart,
        desc: "High-converting online storefronts optimized to increase average order value, reduce cart abandonment, and maximize customer lifetime value.",
        highlights: [
          "High-converting 1-page checkout",
          "Instant product search & filtering",
          "Multiple localized payment methods",
        ],
      },
      {
        title: "Conversion-Focused UI/UX Design",
        slug: "ui-ux-design",
        pillar: "Web & Conversion Experiences",
        icon: Palette,
        desc: "Modern, customer-focused visual design and psychology-driven page layouts that build immediate credibility and guide buyers to act.",
        highlights: [
          "Buyer psychology page wireframes",
          "Trust-building visual hierarchy",
          "Mobile-first usability testing",
        ],
      },
      {
        title: "CRM & Marketing Tool Integrations",
        slug: "api-development",
        pillar: "Web & Conversion Experiences",
        icon: Database,
        desc: "Connect your website directly to your CRM, payment processors, WhatsApp, and email tools so your marketing operations run on autopilot.",
        highlights: [
          "Real-time CRM contact sync",
          "Instant WhatsApp & email notifications",
          "Automated pipeline data flow",
        ],
      },
    ],
  },
  {
    name: "Marketing Automation & AI Lead Ops",
    badge: "Pillar 3",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Automate lead qualification, respond to inquiries within 60 seconds, and eliminate manual busywork so your sales team closes more deals.",
    services: [
      {
        title: "24/7 Smart AI Lead Assistants",
        slug: "ai-integration",
        pillar: "Marketing Automation & AI Lead Ops",
        icon: Bot,
        desc: "Intelligent AI assistants trained on your business offerings to answer customer questions, collect contact details, and book consultations 24/7.",
        highlights: [
          "24/7 instant client inquiry support",
          "Trained on your business FAQs",
          "Automated consultation booking",
        ],
      },
      {
        title: "Conversational WhatsApp & Web Chatbots",
        slug: "ai-chatbots",
        pillar: "Marketing Automation & AI Lead Ops",
        icon: MessageSquare,
        desc: "Natural language chatbots for your website and WhatsApp that qualify buyer intent and schedule appointments directly on your calendar.",
        highlights: [
          "Instant buyer qualification",
          "Direct calendar meeting booking",
          "WhatsApp & website integration",
        ],
      },
      {
        title: "Automated Lead Routing & Team Alerts",
        slug: "workflow-automation",
        pillar: "Marketing Automation & AI Lead Ops",
        icon: Workflow,
        desc: "Connect your intake forms to team WhatsApp and Slack so your sales reps are alerted within seconds of a hot lead submission.",
        highlights: [
          "Sub-60s new inquiry alerts",
          "Automated customer record updates",
          "Zero manual data entry delay",
        ],
      },
      {
        title: "CRM Pipeline Architecture & Lead Scoring",
        slug: "marketing-automation-crm",
        pillar: "Marketing Automation & AI Lead Ops",
        icon: Cpu,
        desc: "Set up automated lead scoring and deal stages in HubSpot, Zoho, or Salesforce so high-value buyers get prioritized by your team.",
        highlights: [
          "Automated high-intent lead scoring",
          "Instant sales rep assignment",
          "Complete lead-to-revenue tracking",
        ],
      },
      {
        title: "Automated Email & Lead Nurturing Flows",
        slug: "email-marketing",
        pillar: "Marketing Automation & AI Lead Ops",
        icon: Mail,
        desc: "Nurture cold leads and re-engage past buyers with automated email drip campaigns that consistently turn interest into revenue.",
        highlights: [
          "Automated client onboarding drips",
          "Lead re-engagement campaigns",
          "High inbox deliverability setup",
        ],
      },
    ],
  },
];

export default async function ServicesCatalogPage() {
  const region = resolveRegion();

  const [siteSettings, headerMenu] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-10 sm:py-16 lg:py-24 px-3 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">
        {/* Header Hero */}
        <Reveal variant="fade-up" distance="lg" duration="slower" as="div" className="max-w-4xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Three Major Capabilities</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Full-Funnel Digital Marketing, High-Converting Websites &amp; Lead Automation
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal">
            Everything ambitious businesses need to attract high-intent buyers, generate qualified inquiries, and scale revenue predictably. Explore our services below.
          </p>
        </Reveal>

        {/* 3 Pillars Sections */}
        {PILLARS.map((pillar) => (
          <Reveal key={pillar.name} variant="fade-up" distance="lg" duration="slower" as="div" className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 w-full">
            <div className="border-b border-slate-200 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md border bg-primary/10 text-primary border-primary/20">
                  {pillar.badge}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {pillar.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                {pillar.desc}
              </p>
            </div>

            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch w-full">
              {pillar.services.map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <StaggerItem key={idx} index={idx} className="h-full">
                    <Card
                      className="bg-white border border-slate-200/90 shadow-xs hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl sm:rounded-3xl overflow-hidden p-0 h-full"
                    >
                      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs shrink-0">
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest text-slate-600 bg-slate-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200 shrink-0">
                            {srv.pillar}
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                          <Link href={`/services/${srv.slug}`}>{srv.title}</Link>
                        </CardTitle>
                        <CardDescription className="text-slate-600 leading-relaxed mt-1.5 sm:mt-2 text-xs sm:text-sm font-normal">
                          {srv.desc}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-2 px-4 sm:px-6 pt-0 pb-3 sm:pb-4">
                        <div className="space-y-1.5 sm:space-y-2 border-t border-slate-100 pt-3 sm:pt-4">
                          {srv.highlights.map((h, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/50">
                        <Link
                          href={`/services/${srv.slug}`}
                          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-primary hover:text-primary-hover transition group-hover:translate-x-1"
                        >
                          <span>Explore Full Architecture</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </CardFooter>
                    </Card>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </Reveal>
        ))}

        {/* Closing Conversion CTA */}
        <Reveal variant="fade-up" distance="lg" duration="slower" as="div" className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:p-10 lg:p-14 text-center space-y-4 sm:space-y-6">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary bg-slate-800 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border border-slate-700 inline-block">
            Tailored Engineering &amp; Growth Scope
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
            Need a Combined Technology &amp; Growth Retainer?
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We assemble dedicated sprint teams combining software architects, performance marketers, and automation engineers tailored to your exact roadmap.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-primary-foreground shadow-lg transition"
            >
              <span>Request Custom Proposal &rarr;</span>
            </Link>
          </div>
        </Reveal>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
