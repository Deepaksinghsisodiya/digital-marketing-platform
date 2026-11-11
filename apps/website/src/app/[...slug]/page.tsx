import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "../../config/region";
import {
  getPublicPage,
  getPublicSiteSettings,
  getPublicMenu,
  type CmsBlock,
  type PublicPageDetail,
} from "../../lib/cms";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { BlockRenderer } from "../../components/blocks/BlockRenderer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const FALLBACK_PAGES: Record<
  string,
  { title: string; metaDescription: string; blocks: CmsBlock[] }
> = {
  solutions: {
    title: "Enterprise Solutions & Services — Nexora",
    metaDescription:
      "Comprehensive B2B performance marketing, high-intent SEO, and deterministic attribution.",
    blocks: [
      {
        id: "fb_sol_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Enterprise Marketing Infrastructure",
          subheadline:
            "Accelerate pipeline velocity, dominate high-intent search, and eliminate attribution blindspots with Nexora Engine.",
          primaryCtaText: "Request Solutions Diagnostic",
          primaryCtaLink: "/contact",
          secondaryCtaText: "Explore Insights",
          secondaryCtaLink: "/blog",
        },
      },
      {
        id: "fb_sol_stats",
        type: "Stats",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          metrics: [
            { value: "340%", label: "Pipeline Velocity Increase" },
            { value: "$120M+", label: "Influenced Pipeline" },
            { value: "99.8%", label: "Attribution Precision" },
          ],
        },
      },
      {
        id: "fb_sol_features",
        type: "FeatureGrid",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Full-Funnel Enterprise Capabilities",
          sectionSubtitle:
            "Engineered for high-performing marketing teams requiring scale, security, and predictability.",
          features: [
            {
              title: "High-Intent Performance SEO",
              description:
                "Dominate commercial search terms with programmatic content and technical architecture.",
            },
            {
              title: "Deterministic Revenue Attribution",
              description:
                "Multi-touch server-side tracking mapping ad spend directly to closed institutional contracts.",
            },
            {
              title: "Conversion Rate Optimization (CRO)",
              description:
                "High-velocity experimentation frameworks turning traffic into validated SQL opportunities.",
            },
          ],
        },
      },
      {
        id: "fb_sol_pricing",
        type: "Pricing",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Predictable Investment Models",
          sectionSubtitle:
            "Transparent engagement packages designed for enterprise marketing velocity.",
        },
      },
      {
        id: "fb_sol_testimonials",
        type: "Testimonials",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Validated by Enterprise Leaders",
          sectionSubtitle:
            "Hear how global brands scale predictable pipeline with Nexora.",
        },
      },
      {
        id: "fb_sol_cta",
        type: "CTA",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Ready to Scale Your Marketing Infrastructure?",
          buttonText: "Schedule Architecture Session",
          buttonLink: "/contact",
        },
      },
    ],
  },
  about: {
    title: "About Nexora — Company & Mission",
    metaDescription:
      "Building the operating system for modern B2B marketing with verifiable attribution.",
    blocks: [
      {
        id: "fb_about_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "The Operating System for Modern B2B Marketing",
          subheadline:
            "Nexora brings mathematical precision, deterministic revenue attribution, and multi-region governance to global enterprises.",
          primaryCtaText: "Connect with Leadership",
          primaryCtaLink: "/contact",
          secondaryCtaText: "Read Our Insights",
          secondaryCtaLink: "/blog",
        },
      },
      {
        id: "fb_about_stats",
        type: "Stats",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          metrics: [
            { value: "1,200+", label: "Enterprise Campaigns" },
            { value: "5 Countries", label: "Global Routing" },
            { value: "SOC2 Type II", label: "Audited & Certified" },
          ],
        },
      },
      {
        id: "fb_about_features",
        type: "FeatureGrid",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Our Foundational Principles",
          sectionSubtitle:
            "Built for institutional rigor, radical transparency, and verifiable commercial impact.",
          features: [
            {
              title: "Verifiable Attribution",
              description:
                "Zero guesswork. Every revenue dollar is attributed back to the source touchpoint.",
            },
            {
              title: "Privacy & Compliance First",
              description:
                "Full consent lifecycle telemetry complying with India DPDP, GDPR, and CCPA.",
            },
            {
              title: "Continuous Velocity",
              description:
                "Deploy campaigns across borders in days rather than quarters.",
            },
          ],
        },
      },
      {
        id: "fb_about_testimonials",
        type: "Testimonials",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Trusted by Global Teams",
          sectionSubtitle:
            "Our track record across tech, finance, and enterprise retail.",
        },
      },
      {
        id: "fb_about_cta",
        type: "CTA",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Partner with Nexora Today",
          buttonText: "Schedule Executive Briefing",
          buttonLink: "/contact",
        },
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  let cmsPage = await getPublicPage(slugPath, region.code);

  if (!cmsPage && FALLBACK_PAGES[slugPath.toLowerCase()]) {
    const fb = FALLBACK_PAGES[slugPath.toLowerCase()]!;
    return {
      title: fb.title,
      description: fb.metaDescription,
    };
  }

  if (!cmsPage) {
    return {
      title: "Page Not Found — Nexora",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: cmsPage.metaTitle || `${cmsPage.title} — Nexora`,
    description: cmsPage.metaDescription || undefined,
    alternates: {
      canonical: cmsPage.canonicalUrl || undefined,
    },
    robots: cmsPage.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  const [cmsPageRaw, siteSettings, headerMenu] = await Promise.all([
    getPublicPage(slugPath, region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  let cmsPage: PublicPageDetail | null = cmsPageRaw;

  // Gracefully fallback to structured default content for primary navbar routes if not yet customized
  if (!cmsPage && FALLBACK_PAGES[slugPath.toLowerCase()]) {
    const fb = FALLBACK_PAGES[slugPath.toLowerCase()]!;
    cmsPage = {
      id: `fallback-${slugPath}`,
      slug: slugPath,
      locale: region.code,
      title: fb.title,
      blocks: fb.blocks,
      metaTitle: fb.title,
      metaDescription: fb.metaDescription,
      canonicalUrl: `/${slugPath}`,
      noIndex: false,
      versionNumber: 1,
      publishedAtUtc: new Date().toISOString(),
    };
  }

  if (!cmsPage) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        <BlockRenderer blocks={cmsPage.blocks} userRegion={region.code} />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
