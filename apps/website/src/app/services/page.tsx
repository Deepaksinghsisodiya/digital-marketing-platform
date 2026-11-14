import { cookies } from "next/headers";
import Link from "next/link";
import { REGION_CONFIG, resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Marketing Services — Nexora",
  description:
    "12 specialized performance marketing and engineering capabilities designed for modern enterprise scale.",
};

const SERVICES = [
  {
    title: "High-Intent Commercial SEO",
    slug: "seo",
    category: "Demand Generation",
    icon: SearchCode,
    desc: "Dominate commercial keyword clusters, optimize technical Core Web Vitals, and scale programmatic content engines.",
    highlights: [
      "Technical crawl budget audits",
      "Programmatic content scale",
      "Commercial query domination",
    ],
  },
  {
    title: "Paid Media (Google & Meta PPC)",
    slug: "paid-ads",
    category: "Demand Generation",
    icon: TrendingUp,
    desc: "Algorithmic bid orchestration, hyper-targeted account-based retargeting, and negative matching saving up to 40% in ad waste.",
    highlights: [
      "First-party audience sync",
      "Automated negative matching",
      "Multi-touch server tracking",
    ],
  },
  {
    title: "Content Marketing & Thought Leadership",
    slug: "content-marketing",
    category: "Demand Generation",
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
    category: "Demand Generation",
    icon: Share2,
    desc: "LinkedIn thought leadership programs, audience amplification, and authentic multi-channel community growth.",
    highlights: [
      "LinkedIn executive branding",
      "B2B social community building",
      "Organic engagement scaling",
    ],
  },
  {
    title: "Web Design & Conversion Architecture",
    slug: "web-design-development",
    category: "Conversion & Tech",
    icon: Layout,
    desc: "Sub-second Next.js web platforms engineered for maximum conversion velocity, WCAG AA accessibility, and mobile elegance.",
    highlights: [
      "Zero-hydration flicker",
      "Sub-second load times",
      "Dynamic headless CMS wiring",
    ],
  },
  {
    title: "Scientific CRO & Funnel Experimentation",
    slug: "cro",
    category: "Conversion & Tech",
    icon: Sparkles,
    desc: "Continuous multivariate A/B testing, scroll heatmapping, and frictionless lead form architectures that double conversion rates.",
    highlights: [
      "Multivariate form optimization",
      "Heatmap & drop-off audits",
      "Frictionless multi-step intake",
    ],
  },
  {
    title: "Deterministic Multi-Touch Attribution",
    slug: "analytics-reporting",
    category: "Conversion & Tech",
    icon: BarChart3,
    desc: "Server-side tracking eliminating third-party cookie loss, linking ad impressions directly to closed enterprise revenue.",
    highlights: [
      "Server-side Meta/Google CAPI",
      "Deterministic revenue attribution",
      "Custom Looker/BI dashboards",
    ],
  },
  {
    title: "Brand Identity & Conversion Creative",
    slug: "branding-creative",
    category: "Conversion & Tech",
    icon: Palette,
    desc: "High-impact visual systems, typographic hierarchies, and multi-variant ad creative designed to stop the scroll.",
    highlights: [
      "Complete design systems",
      "Ad creative variation testing",
      "Enterprise pitch assets",
    ],
  },
  {
    title: "Lifecycle Email & Automated Drips",
    slug: "email-marketing",
    category: "Lifecycle & Retention",
    icon: Mail,
    desc: "Sophisticated behavioral drip sequences, trigger-based lead nurturing, and transactional deliverability infrastructure.",
    highlights: [
      "Behavioral trigger sequences",
      "Automated re-engagement drips",
      "99.8% inbox deliverability",
    ],
  },
  {
    title: "Conversational WhatsApp Funnels",
    slug: "whatsapp-marketing",
    category: "Lifecycle & Retention",
    icon: MessageSquare,
    desc: "High-engagement WhatsApp Business routing, instant qualification bots, and transactional notification engines.",
    highlights: [
      "Verified green badge setup",
      "Instant lead qualification",
      "Click-to-chat routing",
    ],
  },
  {
    title: "Enterprise Influencer & Creator Partnerships",
    slug: "influencer-marketing",
    category: "Lifecycle & Retention",
    icon: Users,
    desc: "Vetted B2B creators, industry podcast syndication, and co-branded webinar funnels that build instant trust.",
    highlights: [
      "Contract negotiation & vetting",
      "Co-marketing webinars",
      "Performance attribution tagging",
    ],
  },
  {
    title: "Marketing Automation & RevOps CRM",
    slug: "marketing-automation-crm",
    category: "Lifecycle & Retention",
    icon: Cpu,
    desc: "Automated lead scoring, instantaneous SLA routing, and bidirectional synchronization across Salesforce, HubSpot, and Nexora.",
    highlights: [
      "Algorithmic lead scoring",
      "Instant SLA outbox routing",
      "Full CRM synchronization",
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

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto space-y-16">
        {/* Header Hero */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Institutional Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Full-Spectrum Digital Marketing Architecture
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            12 specialized performance marketing disciplines engineered to
            eliminate wasted spend, establish category authority, and accelerate
            enterprise pipeline velocity.
          </p>
        </div>

        {/* 12 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Card
                key={idx}
                className="bg-white border border-slate-200/90 shadow-sm hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group rounded-3xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {srv.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <Link href={`/services/${srv.slug}`}>{srv.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed mt-2 text-sm font-normal">
                    {srv.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 pt-2">
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    {srv.highlights.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/services/${srv.slug}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 group-hover:translate-x-1"
                  >
                    <span>Explore service architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Diagnostic Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/90 p-10 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Diagnostic Strategy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Not Sure Which Marketing Channels to Prioritize?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed font-normal">
            Our digital marketing architects review your historical analytics,
            attribution data, and CAC benchmarks to build a customized channel
            allocation strategy.
          </p>
          <div className="pt-2">
            <Link
              href="/book-a-call"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Schedule Channel Discovery Session</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
