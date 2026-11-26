import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu, getPublicPage, type CmsBlock } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PricingBlock } from "@/components/blocks/PricingBlock";
import { ROICalculatorBlock } from "@/components/blocks/ROICalculatorBlock";
import { ComparisonTableBlock } from "@/components/blocks/ComparisonTableBlock";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const region = resolveRegion();
  const cmsPage = await getPublicPage("pricing", region.code);

  if (cmsPage) {
    return {
      title:
        cmsPage.metaTitle ||
        cmsPage.title ||
        "Growth Tiers & Commercial Retainers — Nexora",
      description:
        cmsPage.metaDescription ||
        "Transparent enterprise retainers and growth partnerships designed for high-velocity scalability across India and the US.",
      alternates: {
        canonical: cmsPage.canonicalUrl || undefined,
      },
      robots: cmsPage.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  }

  return {
    title: "Growth Tiers & Commercial Retainers — Nexora",
    description:
      "Transparent enterprise retainers and growth partnerships designed for high-velocity scalability across India and the US.",
  };
}

export default async function PricingPage() {
  const region = resolveRegion();

  const [cmsPage, siteSettings, headerMenu] = await Promise.all([
    getPublicPage("pricing", region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  const hasCmsBlocks = cmsPage?.blocks && cmsPage.blocks.length > 0;
  const hasPricingBlockInCms = hasCmsBlocks && cmsPage.blocks.some(
    (b) => (b.type || "").toLowerCase() === "pricing" || (b.type || "").toLowerCase() === "pricingblock"
  );

  // Fallback synthetic blocks when CMS has not yet added them
  const fallbackPricingBlock: CmsBlock = {
    id: "pricing-main",
    type: "Pricing",
    schemaVersion: 1,
    enabled: true,
    settings: {},
    content: {
      sectionTitle: "Transparent Commercial Partnerships",
      sectionSubtitle:
        "No hidden agency markups. Fixed monthly retainers paired with measurable pipeline goals and transparent deliverables.",
    },
  };

  const fallbackRoiBlock: CmsBlock = {
    id: "pricing-roi",
    type: "RoiCalculator",
    schemaVersion: 1,
    enabled: true,
    settings: {},
    content: {
      sectionTitle: "Calculate Your Projected Growth ROI",
      sectionSubtitle:
        "Simulate how Nexora's automated audience modeling and deterministic attribution amplify your monthly revenue.",
      defaultSpend: 10000,
      defaultConversionRate: 2.2,
      defaultDealSize: 2500,
      ctaText: "Claim Custom Growth Forecast",
      ctaLink: "/contact",
    },
  };

  const fallbackComparisonBlock: CmsBlock = {
    id: "pricing-comparison",
    type: "ComparisonTable",
    schemaVersion: 1,
    enabled: true,
    settings: {},
    content: {
      sectionTitle: "Why High-Velocity Brands Choose Nexora",
      sectionSubtitle:
        "See how our unified digital marketing platform compares against traditional agencies and fragmented teams.",
      ctaText: "Deploy Nexora For Your Brand",
      ctaLink: "/contact",
    },
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="py-20 sm:py-24 bg-white text-slate-900 border-b border-slate-200/80 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="accent">Predictable Investment</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
              Transparent Commercial Partnerships
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              No hidden agency markups. Fixed monthly retainers paired with measurable pipeline goals, SLA guarantees, and deterministic ROI.
            </p>
          </div>
        </section>

        {/* If CMS has configured page blocks, render them; otherwise render our rich interactive blocks */}
        {hasCmsBlocks && hasPricingBlockInCms ? (
          <BlockRenderer blocks={cmsPage.blocks} userRegion={region.code} />
        ) : (
          <>
            <PricingBlock block={fallbackPricingBlock} />
            <ROICalculatorBlock block={fallbackRoiBlock} />
            <ComparisonTableBlock block={fallbackComparisonBlock} />
          </>
        )}
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
