import { cookies } from "next/headers";
import Link from "next/link";
import { REGION_CONFIG, resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
    name: "Technology Solutions",
    badge: "Pillar 2",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    desc: "Production-grade web applications, headless corporate websites, and enterprise software engineered for sub-second load times and maintainability.",
    services: [
      {
        title: "Corporate Website Development",
        slug: "web-design-development",
        pillar: "Technology Solutions",
        icon: Layout,
        desc: "Sub-second Next.js web platforms engineered for maximum conversion velocity, WCAG AA accessibility, and mobile elegance.",
        highlights: [
          "Zero-hydration layout shifts",
          "Sub-second load times",
          "Dynamic headless CMS wiring",
        ],
      },
      {
        title: "Custom Web Applications",
        slug: "web-application-development",
        pillar: "Technology Solutions",
        icon: Code2,
        desc: "Scalable, resilient web applications built with modern frontend frameworks and robust backend architectures.",
        highlights: [
          "Modular component systems",
          "Type-safe API contracts",
          "Microservices & modular monoliths",
        ],
      },
      {
        title: "Custom Software Engineering",
        slug: "custom-software-development",
        pillar: "Technology Solutions",
        icon: Terminal,
        desc: "Bespoke business platforms, internal portals, and enterprise engineering tailored to proprietary business models.",
        highlights: [
          "C# .NET & Node.js backends",
          "PostgreSQL & Redis caching",
          "Automated test coverage",
        ],
      },
      {
        title: "Enterprise E-Commerce Development",
        slug: "ecommerce-development",
        pillar: "Technology Solutions",
        icon: ShoppingCart,
        desc: "High-converting, lightning-fast digital storefronts and headless commerce platforms optimized for high AOV and checkout speed.",
        highlights: [
          "Headless commerce architecture",
          "Sub-second product filtering",
          "Multi-currency payment gateways",
        ],
      },
      {
        title: "UI/UX Design & Design Systems",
        slug: "ui-ux-design",
        pillar: "Technology Solutions",
        icon: Palette,
        desc: "Human-centered digital product design, high-fidelity prototypes, and scalable design token systems that bridge design and engineering.",
        highlights: [
          "Atomic design tokens",
          "Figma prototypes & usability tests",
          "Strict WCAG 2.2 AA compliance",
        ],
      },
      {
        title: "API Development & System Integration",
        slug: "api-development",
        pillar: "Technology Solutions",
        icon: Database,
        desc: "Connect mission-critical enterprise systems with secure, high-throughput RESTful and event-driven APIs, webhooks, and cloud services.",
        highlights: [
          "OpenAPI / Swagger specs",
          "Event-driven webhooks",
          "Rate-limiting & security middleware",
        ],
      },
    ],
  },
  {
    name: "AI & Automation",
    badge: "Pillar 3",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Custom AI integrations, intelligent chatbots, and event-driven business process automations that eliminate manual bottlenecks and scale lead velocity.",
    services: [
      {
        title: "AI Integration & Custom Agents",
        slug: "ai-integration",
        pillar: "AI & Automation",
        icon: Bot,
        desc: "Custom LLM integrations, retrieval-augmented generation (RAG) knowledge bases, and autonomous workflow agents.",
        highlights: [
          "Private RAG knowledge bases",
          "Autonomous workflow agents",
          "Secure enterprise API connectors",
        ],
      },
      {
        title: "AI Conversational Chatbots",
        slug: "ai-chatbots",
        pillar: "AI & Automation",
        icon: MessageSquare,
        desc: "Intelligent, natural language conversational bots for website lead qualification, appointment booking, and customer intake.",
        highlights: [
          "Instant lead qualification",
          "CRM appointment booking",
          "Multi-channel deployment",
        ],
      },
      {
        title: "Business Process Automation",
        slug: "workflow-automation",
        pillar: "AI & Automation",
        icon: Workflow,
        desc: "End-to-end event-driven workflow automation connecting intake forms, internal communications, and fulfillment systems.",
        highlights: [
          "Webhook event triggers",
          "Cross-platform data sync",
          "Error monitoring & retries",
        ],
      },
      {
        title: "Marketing Automation & CRM Architecture",
        slug: "marketing-automation-crm",
        pillar: "AI & Automation",
        icon: Cpu,
        desc: "Automated lead scoring, instantaneous SLA routing, and bidirectional synchronization across CRMs.",
        highlights: [
          "Algorithmic lead scoring",
          "Instant SLA outbox routing",
          "Full CRM synchronization",
        ],
      },
      {
        title: "Lifecycle Email & Automated Sequences",
        slug: "email-marketing",
        pillar: "AI & Automation",
        icon: Mail,
        desc: "Automated B2B lead nurturing sequences, behavioral trigger flows, and transactional deliverability infrastructure.",
        highlights: [
          "Behavioral trigger sequences",
          "Automated re-engagement drips",
          "99.8% inbox deliverability",
        ],
      },
    ],
  },
];

export default async function ServicesCatalogPage() {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

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
        <div className="max-w-4xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Three Major Capabilities</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Digital Growth, Technology Solutions &amp; AI Automation
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal">
            We unite strategic marketing, modern software engineering, and intelligent automation into a single cohesive growth engine. Explore our capabilities below.
          </p>
        </div>

        {/* 3 Pillars Sections */}
        {PILLARS.map((pillar) => (
          <div key={pillar.name} className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
            <div className="border-b border-slate-200 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md border ${pillar.badgeColor}`}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {pillar.services.map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <Card
                    key={idx}
                    className="bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl sm:rounded-3xl overflow-hidden p-0"
                  >
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest text-slate-600 bg-slate-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200 shrink-0">
                          {srv.pillar}
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
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
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/50">
                      <Link
                        href={`/services/${srv.slug}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition group-hover:translate-x-1"
                      >
                        <span>Explore Full Architecture</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Closing Conversion CTA */}
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:p-10 lg:p-14 text-center space-y-4 sm:space-y-6">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 bg-slate-800 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border border-slate-700 inline-block">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-lg transition"
            >
              <span>Request Custom Proposal &rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
