import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Growth Tiers & Commercial Retainers — Nexora",
  description:
    "Transparent enterprise retainers and growth partnerships designed for high-velocity scalability across India and the US.",
};

const TIERS = [
  {
    name: "Growth Starter",
    badge: "Emerging Scale",
    priceInr: "₹75,000",
    priceUsd: "$990",
    period: "per month",
    description: "Ideal for scaling ventures needing deterministic commercial search rank and conversion foundations.",
    features: [
      "Technical Core Web Vitals remediation",
      "High-intent commercial SEO architecture",
      "Full Google Search & PMax campaign launch",
      "Bi-weekly conversion rate audits",
      "Bi-weekly attribution reporting & analytics",
      "Dedicated Growth Strategist",
    ],
    ctaText: "Get Started",
    highlighted: false,
  },
  {
    name: "Performance Scale",
    badge: "Most Popular",
    priceInr: "₹1,85,000",
    priceUsd: "$2,450",
    period: "per month",
    description: "Full-funnel omnichannel engine for enterprise brands scaling lead velocity across channels.",
    features: [
      "Everything in Growth Starter",
      "Multi-channel ABM (LinkedIn + Google + Meta)",
      "Continuous scientific landing page split-testing",
      "Automated lead routing & WhatsApp integration",
      "Weekly executive pipeline telemetry",
      "Sub-second Core Web Vitals guarantee",
      "Dedicated engineering & CRO squad",
    ],
    ctaText: "Scale Pipeline",
    highlighted: true,
  },
  {
    name: "Enterprise Custom",
    badge: "Bespoke SLA",
    priceInr: "Custom Quote",
    priceUsd: "Custom Quote",
    period: "bespoke agreement",
    description: "Tailored multi-region infrastructure, dedicated squads, and deterministic revenue attribution models.",
    features: [
      "Everything in Performance Scale",
      "Multi-country regulatory compliance (DPDP + GDPR)",
      "Custom headless Next.js web application architecture",
      "Custom CRM data pipeline synchronization",
      "Guaranteed response SLA (under 2 hours)",
      "Dedicated Senior Growth Director & Engineering Lead",
    ],
    ctaText: "Contact Leadership",
    highlighted: false,
  },
];

export default async function PricingPage() {
  const region = resolveRegion();
  const isIndia = region.code === "IN";

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

      <main className="flex-1">
        {/* Page Hero */}
        <section className="py-20 sm:py-24 bg-slate-950 text-white relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="accent">Predictable Investment</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Transparent Commercial Partnerships
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              No hidden agency markups. Fixed monthly retainers paired with measurable pipeline goals and transparent deliverables.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                    tier.highlighted
                      ? "bg-slate-950 text-white shadow-2xl ring-2 ring-primary relative scale-105 z-10"
                      : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          tier.highlighted
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                    <p
                      className={`text-xs mb-6 ${
                        tier.highlighted ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {tier.description}
                    </p>

                    <div className="mb-8">
                      <span className="text-4xl font-black">
                        {isIndia ? tier.priceInr : tier.priceUsd}
                      </span>
                      <span
                        className={`text-xs ml-2 ${
                          tier.highlighted ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        / {tier.period}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              tier.highlighted ? "text-primary" : "text-primary"
                            }`}
                          />
                          <span
                            className={
                              tier.highlighted ? "text-slate-300" : "text-slate-700"
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Link
                      href="/contact"
                      className={`w-full py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                        tier.highlighted
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                          : "bg-slate-900 hover:bg-primary text-white"
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
