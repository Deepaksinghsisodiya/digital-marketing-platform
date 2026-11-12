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
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto space-y-16">
        {/* Header Hero */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent">Institutional Capabilities</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Full-Spectrum Digital Marketing Architecture
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
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
                className="hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                      {srv.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-300 transition">
                    <Link href={`/services/${srv.slug}`}>{srv.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-slate-400 leading-relaxed mt-2 text-xs">
                    {srv.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 pt-2">
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                    {srv.highlights.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-800/60">
                  <Link
                    href={`/services/${srv.slug}`}
                    className="text-xs font-bold text-indigo-400 hover:text-white transition flex items-center gap-1.5 group-hover:translate-x-1"
                  >
                    Explore service architecture{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Diagnostic Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-10 sm:p-14 text-center space-y-6">
          <Badge variant="sample">Sample Diagnostic Flow</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Not Sure Which Marketing Channels to Prioritize?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Our digital marketing architects review your historical analytics,
            attribution data, and CAC benchmarks to build a customized channel
            allocation strategy.
          </p>
          <div className="pt-2">
            <Button asChild variant="gradient" size="lg" shape="pill">
              <Link href="/book-a-call">
                Schedule Channel Discovery Session{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
