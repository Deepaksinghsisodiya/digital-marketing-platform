import Link from "next/link";
import { resolveRegion } from "@/config/region";
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
  Cpu,
  ShoppingCart,
  Home,
  GraduationCap,
  Stethoscope,
  Building2,
  Briefcase,
  Hotel,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Industry Verticals & Sector Solutions — Nexora",
  description:
    "Bespoke digital growth, technology development, and automation solutions engineered for specific industry regulatory requirements and buyer behavior.",
};

const INDUSTRIES = [
  {
    title: "SaaS & Technology",
    slug: "saas",
    icon: Cpu,
    desc: "Accelerate pipeline velocity, reduce customer acquisition cost (CAC), and maximize net revenue retention (NRR) with product-led and enterprise sales funnels.",
    stats: "CAC-to-LTV Expansion",
    focus: ["Product-led acquisition funnels", "Algorithmic search positioning", "Automated trial-to-paid flows"],
  },
  {
    title: "E-Commerce & Retail",
    slug: "ecommerce",
    icon: ShoppingCart,
    desc: "Deterministic ROAS scaling, high-intent Google Shopping feed optimization, and automated cart abandonment recovery sequences.",
    stats: "Sub-Second Checkout Velocity",
    focus: ["Headless Shopify/Next.js store", "Automated cart recovery", "Multi-currency localized checkout"],
  },
  {
    title: "Healthcare & Life Sciences",
    slug: "healthcare",
    icon: Stethoscope,
    desc: "Strictly compliant, patient-centric acquisition funnels adhering to DPDP data handling guidelines and clinical trust protocols.",
    stats: "DPDP & HIPAA Compliance",
    focus: ["Compliant lead intake funnels", "Doctor credibility & reviews", "Secure appointment booking"],
  },
  {
    title: "Real Estate & Property",
    slug: "real-estate",
    icon: Home,
    desc: "Target high-net-worth property investors and home buyers with hyper-local geo-targeting, 3D tour conversion funnels, and VIP consultation booking.",
    stats: "High-Ticket Lead Qualification",
    focus: ["Investor acquisition funnels", "Interactive unit showcase", "CRM VIP appointment routing"],
  },
  {
    title: "Restaurants & Hospitality",
    slug: "hospitality",
    icon: Hotel,
    desc: "Bypass costly third-party aggregator commissions by driving direct customer bookings through local search capture and dynamic retargeting.",
    stats: "Direct Booking Maximization",
    focus: ["Local Google Maps dominance", "Direct booking engine", "Automated loyalty sequences"],
  },
  {
    title: "Education & EdTech",
    slug: "education",
    icon: GraduationCap,
    desc: "Predictable student recruitment and cohort enrollment campaigns adhering to education intake cycles and institutional credibility standards.",
    stats: "Intake Cycle Scaling",
    focus: ["Programmatic landing funnels", "Admissions qualification CRM", "Omnichannel intake nurturing"],
  },
  {
    title: "Manufacturing & Industrial",
    slug: "manufacturing",
    icon: Building2,
    desc: "Capture high-value B2B supplier inquiries, distributor contracts, and institutional RFPs with digital product catalogs and search authority.",
    stats: "Institutional B2B RFPs",
    focus: ["Digital engineering catalogs", "Global distributor lead routing", "Technical search domination"],
  },
  {
    title: "Professional Services & Consulting",
    slug: "professional-services",
    icon: Briefcase,
    desc: "Capture high-value institutional consulting contracts and advisory retainers with authoritative executive LinkedIn branding and account-based marketing.",
    stats: "Partner Credibility & Inbound",
    focus: ["Executive thought leadership", "Account-based targeting", "Bespoke RFP intake funnels"],
  },
];

export default async function IndustriesCatalogPage() {
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

      <main className="flex-1 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Header Hero */}
        <SectionHeading
          align="left"
          eyebrow="Target Verticals"
          title="Industry-Specific Growth & Technology"
          description="Every industry has unique buyer journeys, regulatory constraints, and sales cycles. We architect customized digital solutions tailored to your sector."
          className="mb-0 sm:mb-2"
        />

        {/* 8 Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <Card
                key={idx}
                className="bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-3xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {ind.stats}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    <Link href={`/industries/${ind.slug}`}>{ind.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed mt-2 text-sm font-normal">
                    {ind.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 pt-2">
                  <div className="space-y-1.5 border-t border-border pt-3">
                    {ind.focus.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 text-xs font-medium text-foreground"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6 border-t border-border">
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition group-hover:translate-x-1"
                  >
                    <span>View Industry Blueprint</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Consultation Callout */}
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 text-center space-y-6 border border-slate-800">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20">
            Sector-Specific Strategy
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Don&apos;t See Your Specific Industry Listed?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Our strategic methodology applies across diverse enterprise and high-growth commercial models. Contact our architects for a specialized discovery session.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-primary-foreground shadow-lg transition"
            >
              <span>Schedule Sector Consultation &rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
