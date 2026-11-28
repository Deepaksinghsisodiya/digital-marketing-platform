import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu, getPublicPage } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Briefcase, ArrowRight, CheckCircle2, Sparkles, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const region = resolveRegion();
  const cmsPage = await getPublicPage("careers", region.code);
  if (cmsPage) {
    return {
      title: cmsPage.metaTitle || cmsPage.title || "Careers at Nexora — Join Our Growth Engineering Squad",
      description:
        cmsPage.metaDescription ||
        "Explore open career opportunities across engineering, commercial SEO, paid media, and growth strategy at Nexora.",
      alternates: { canonical: cmsPage.canonicalUrl || undefined },
      robots: cmsPage.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
  }
  return {
    title: "Careers at Nexora — Join Our Growth Engineering Squad",
    description:
      "Explore open career opportunities across engineering, commercial SEO, paid media, and growth strategy at Nexora.",
  };
}

const OPENINGS = [
  {
    title: "Senior Technical SEO Lead",
    department: "Organic Growth",
    location: "Remote / Hybrid (India / US)",
    type: "Full-Time",
    description:
      "Drive programmatic SEO architecture, Core Web Vitals remediation, and enterprise keyword dominance.",
  },
  {
    title: "Performance Paid Media Director",
    department: "Paid Acquisition",
    location: "Remote / Hybrid (India / US)",
    type: "Full-Time",
    description:
      "Lead high-yield Google Search, PMax, and LinkedIn ABM campaigns with deterministic attribution modeling.",
  },
  {
    title: "Full-Stack Conversion Engineer",
    department: "Engineering & CRO",
    location: "Remote",
    type: "Full-Time",
    description:
      "Build high-speed Next.js 15 architectures, split-testing experiments, and sub-second landing page engines.",
  },
];

export default async function CareersPage() {
  const region = resolveRegion();

  const [cmsPage, siteSettings, headerMenu] = await Promise.all([
    getPublicPage("careers", region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  const hasCmsBlocks = cmsPage?.blocks && cmsPage.blocks.length > 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      {hasCmsBlocks ? (
        <main className="flex-1">
          <BlockRenderer blocks={cmsPage.blocks} userRegion={region.code} />
        </main>
      ) : (

      <main className="flex-1">
        {/* Page Hero */}
        <section className="py-20 sm:py-24 bg-white text-slate-900 border-b border-slate-200/80 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="accent">Join Our Mission</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
              Build the Future of Enterprise Marketing
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              We are a team of data scientists, software engineers, and growth architects obsessed with measurable commercial pipeline.
            </p>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Open Roles"
              title="Current Opportunities"
              highlight="Opportunities"
              description="Join an autonomous squad with high ownership, continuous learning, and competitive compensation."
            />

            <div className="space-y-6 mt-12">
              {OPENINGS.map((job) => (
                <div
                  key={job.title}
                  className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {job.department}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-primary text-white text-sm font-bold transition-colors shrink-0"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      )}

      <Footer settings={siteSettings} />
    </div>
  );
}
