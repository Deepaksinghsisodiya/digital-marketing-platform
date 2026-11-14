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
  Cpu,
  ShoppingCart,
  Home,
  GraduationCap,
  Stethoscope,
  Store,
  Briefcase,
  Hotel,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Verticals & Sector Solutions — Nexora",
  description:
    "Bespoke digital marketing architectures engineered for specific industry regulatory requirements and buyer behavior.",
};

const INDUSTRIES = [
  {
    title: "SaaS & Cloud Platforms",
    slug: "saas",
    icon: Cpu,
    desc: "Accelerate pipeline velocity, reduce customer acquisition cost (CAC), and maximize net revenue retention (NRR) with product-led and enterprise sales funnels.",
    stats: "3.8x Avg Pipeline Lift",
  },
  {
    title: "E-Commerce & DTC",
    slug: "ecommerce",
    icon: ShoppingCart,
    desc: "Deterministic ROAS scaling, high-intent Google Shopping feed optimization, and automated cart abandonment recovery sequences.",
    stats: "4.2x ROAS Multiplier",
  },
  {
    title: "Real Estate & Property Development",
    slug: "real-estate",
    icon: Home,
    desc: "Target high-net-worth property investors and home buyers with hyper-local geo-fencing, 3D tour conversion funnels, and VIP appointment booking.",
    stats: "65% Lower Cost Per Booking",
  },
  {
    title: "Education & EdTech",
    slug: "education",
    icon: GraduationCap,
    desc: "Predictable student recruitment and cohort enrollment campaigns adhering to education intake cycles and institutional credibility standards.",
    stats: "2.4x Application Velocity",
  },
  {
    title: "Healthcare & Life Sciences",
    slug: "healthcare",
    icon: Stethoscope,
    desc: "Strictly compliant, patient-centric acquisition funnels adhering to DPDP/HIPAA data handling guidelines and clinical trust protocols.",
    stats: "100% Audit Compliance",
  },
  {
    title: "Local Business & Multi-Location",
    slug: "local-business",
    icon: Store,
    desc: "Dominate Google Maps local packs, automate review velocity, and drive qualified phone calls and foot traffic across hundreds of locations.",
    stats: "Top 3 Local Map Ranking",
  },
  {
    title: "Professional Services & Consulting",
    slug: "professional-services",
    icon: Briefcase,
    desc: "Capture high-value institutional RFPs and partner consultations with authoritative executive LinkedIn branding and account-based marketing.",
    stats: "+85% Qualified RFP Lead Rate",
  },
  {
    title: "Hospitality, Travel & Resorts",
    slug: "hospitality",
    icon: Hotel,
    desc: "Bypass costly OTA commissions by driving high-margin direct guest bookings through seasonal search capture and dynamic retargeting.",
    stats: "-30% OTA Commission Waste",
  },
];

export default async function IndustriesCatalogPage() {
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
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tailored ICP Growth Models</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Specialized Solutions for Every Industry
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Generic marketing playbooks fail in complex industries. Nexora
            builds vertical-specific performance engines configured for your
            industry&apos;s regulatory landscape and buyer buying committee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
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
                    <Badge variant="sample" className="text-[10px] font-bold">
                      Sector Model
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <Link href={`/industries/${ind.slug}`}>{ind.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed mt-2 text-xs sm:text-sm font-normal">
                    {ind.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                    <span className="text-xs font-black text-indigo-700 font-mono">
                      {ind.stats}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 group-hover:translate-x-1"
                  >
                    <span>Explore vertical architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
