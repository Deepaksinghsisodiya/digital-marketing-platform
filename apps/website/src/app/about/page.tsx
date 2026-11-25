import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShieldCheck, Target, Zap, Users, Globe2, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Nexora — Enterprise Digital Marketing Platform",
  description:
    "Learn about Nexora's mission, leadership, engineered growth framework, and multi-region marketing infrastructure.",
};

const VALUES = [
  {
    icon: Target,
    title: "Deterministic Attribution",
    description:
      "We replace ambiguous vanity metrics with auditable, revenue-linked pipeline attribution.",
  },
  {
    icon: Zap,
    title: "Engineering-First Velocity",
    description:
      "High-speed modern tech stacks (Next.js 15, Minimal APIs) engineered for sub-second Core Web Vitals.",
  },
  {
    icon: Globe2,
    title: "Multi-Region Governance",
    description:
      "Seamless commercial campaigns tailored to regulatory frameworks across India (DPDP Act) and the US (GDPR/CCPA).",
  },
  {
    icon: ShieldCheck,
    title: "Honesty & Zero-Fabrication",
    description:
      "Truth in data, verified performance figures, and client trust built upon verifiable telemetry.",
  },
];

const LEADERSHIP = [
  {
    name: "Enterprise Growth Squad",
    role: "Full-Funnel Acquisition",
    bio: "Senior specialists leading commercial intent SEO, programmatic paid search, and high-yield paid social.",
  },
  {
    name: "Conversion Engineering Team",
    role: "Architecture & CRO",
    bio: "Full-stack software engineers and CRO researchers optimizing funnel performance and technical web vitals.",
  },
  {
    name: "Client Success & Operations",
    role: "Strategic Account Leadership",
    bio: "Dedicated account leads ensuring strict SLA compliance, weekly pipeline audits, and seamless CRM integrations.",
  },
];

export default async function AboutPage() {
  const region = resolveRegion();

  const [siteSettings, headerMenu] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="accent">Enterprise Agency Infrastructure</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Pioneering Data-Driven Growth at Global Scale
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Nexora combines enterprise software engineering, deterministic revenue attribution,
              and programmatic campaign execution to accelerate pipeline velocity for ambitious organizations.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Guiding Principles"
              title="Built on Engineering Precision"
              highlight="Engineering"
              description="How we approach client growth with verifiable methodology rather than speculative agency hype."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {val.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership & Teams */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Cross-Functional Squads"
              title="Autonomous Growth Teams"
              highlight="Autonomous"
              description="Multi-disciplinary squads dedicated to specific commercial milestones and rapid pipeline delivery."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {LEADERSHIP.map((item) => (
                <div
                  key={item.name}
                  className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition-colors"
                >
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
                    {item.role}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-slate-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Partner with Nexora?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Schedule an executive consultation to discover how our engineering-first marketing framework elevates your customer acquisition.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
              >
                <span>Schedule Strategy Session</span>
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
