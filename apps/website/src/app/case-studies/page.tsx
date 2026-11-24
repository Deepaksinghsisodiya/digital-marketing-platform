import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu, getPublicPage, CmsBlock } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CaseStudiesBlock } from "@/components/blocks/CaseStudiesBlock";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Client Case Studies & Verified Pipeline Results — Nexora",
  description:
    "Explore how enterprise organizations scale inbound pipeline, improve ROAS, and optimize conversion funnels with Nexora.",
};

export default async function CaseStudiesPage() {
  const region = resolveRegion();

  const [siteSettings, headerMenu, pageData, homePageData] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
    getPublicPage("case-studies", region.code),
    getPublicPage("home", region.code),
  ]);

  // Find CMS block saved from Admin CaseStudiesPage
  const candidateBlocks = [
    ...(pageData?.blocks || []),
    ...(homePageData?.blocks || []),
  ];

  const cmsCaseStudyBlock = candidateBlocks.find(
    (b) =>
      b.type.toLowerCase() === "casestudies" ||
      b.type.toLowerCase() === "bentogrid" ||
      b.type.toLowerCase() === "portfolio",
  );

  const activeBlock: CmsBlock = cmsCaseStudyBlock || {
    id: "dedicated-case-studies",
    type: "CaseStudies",
    schemaVersion: 1,
    enabled: true,
    settings: {},
    content: {
      sectionTitle: "Enterprise Growth Case Studies",
      sectionSubtitle:
        "Filter by vertical to inspect how we architect conversion funnels, search authority, and paid acquisition.",
    },
  };

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
            <Badge variant="accent">Documented Results</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Enterprise Growth Case Studies
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Real-world transformations, verifiable attribution models, and commercial outcomes delivered for leading enterprises.
            </p>
          </div>
        </section>

        {/* Case Studies Container */}
        <CaseStudiesBlock block={activeBlock} />

        {/* CTA Banner */}
        <section className="py-16 bg-slate-900 text-white text-center border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready for Similar Growth Results?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Our growth strategists will conduct a tailored opportunity diagnostic on your domain and ad accounts.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
              >
                <span>Request Growth Diagnostic</span>
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
