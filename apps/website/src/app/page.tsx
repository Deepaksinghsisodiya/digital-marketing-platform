import Link from "next/link";
import { resolveRegion } from "../config/region";
import {
  getPublicPage,
  getPublicSiteSettings,
  getPublicMenu,
  type CmsBlock,
} from "../lib/cms";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import { HeroBlock } from "../components/blocks/HeroBlock";
import { ClientLogoMarquee } from "../components/home/ClientLogoMarquee";
import { Reveal } from "../components/motion/Reveal";
import { Stagger, StaggerItem } from "../components/motion/Stagger";
import type { Metadata } from "next";

export const revalidate = 3600;

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  authorName?: string;
  publishedAtUtc?: string;
  coverImageUrl?: string;
}

async function getLatestPosts(): Promise<BlogPostSummary[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/posts?pageSize=3`, {
      next: {
        revalidate: 3600,
        tags: ["blog-posts"],
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const region = resolveRegion();
  const cmsPage = await getPublicPage("home", region.code);

  if (cmsPage) {
    return {
      title:
        cmsPage.metaTitle ||
        cmsPage.title ||
        "Nexora — Digital Growth & Technology Agency",
      description:
        cmsPage.metaDescription ||
        "We Build Brands, Engineer Digital Experiences & Accelerate Business Growth.",
      alternates: {
        canonical: cmsPage.canonicalUrl || undefined,
      },
      robots: cmsPage.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  }

  return {
    title: "Nexora — Digital Growth & Technology Agency",
    description:
      "Technology Meets Creativity. Growth Becomes Reality. Enterprise SEO, Next.js web development, and intelligent AI automation for high-growth global brands.",
  };
}

const FALLBACK_HERO_SLIDER_BLOCK: CmsBlock = {
  id: "hero-fallback-slider",
  type: "Hero",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    isSlider: true,
    autoplay: true,
    interval: 6000,
    slides: [
      {
        id: "slide-1",
        tag: "Enterprise Growth & Revenue Architecture",
        headline: "Engineered for Growth. Architected for Scale.",
        subheadline:
          "We build compounding revenue engines for ambitious enterprises — uniting algorithmic performance marketing, bespoke Next.js platforms, and autonomous AI automation.",
        primaryCtaText: "Request Growth Diagnostic",
        primaryCtaLink: "/contact",
        secondaryCtaText: "Explore Capabilities",
        secondaryCtaLink: "/services",
        imageBadge: "Global Growth Platform",
      },
      {
        id: "slide-2",
        tag: "Next-Gen Conversion Platforms",
        headline: "Sub-Second Web Experiences Built to Convert Traffic into Pipeline.",
        subheadline:
          "High-performance custom web applications, frictionless client booking funnels, and enterprise storefronts engineered to maximize lifetime customer value.",
        primaryCtaText: "Upgrade Digital Infrastructure",
        primaryCtaLink: "/contact",
        secondaryCtaText: "View Audited Results",
        secondaryCtaLink: "/case-studies",
        imageBadge: "High-Converting Architecture",
      },
      {
        id: "slide-3",
        tag: "AI Lead Operations & Workflows",
        headline: "Autonomous AI Ingestion. Sub-60s Inbound Response SLA.",
        subheadline:
          "Conversational intake agents, event-driven CRM synchronizations, and deterministic revenue attribution that scales your team without operational friction.",
        primaryCtaText: "Deploy Intelligent AI",
        primaryCtaLink: "/contact",
        secondaryCtaText: "Explore AI Solutions",
        secondaryCtaLink: "/services",
        imageBadge: "Zero Operational Latency",
      },
    ],
  },
};

const FALLBACK_STATS_BLOCK: CmsBlock = {
  id: "stats-fallback",
  type: "Stats",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    metrics: [
      { value: "4.85x", label: "Average Portfolio ROAS", change: "+42% vs Industry" },
      { value: "99.8%", label: "Deterministic Attribution Accuracy", change: "Zero Cookie Loss" },
      { value: "$140M+", label: "Client Revenue Influenced", change: "Audited Pipeline" },
      { value: "< 3m", label: "Inbound Lead SLA Response", change: "Sub-Second Routing" },
    ],
  },
};

const FALLBACK_FEATURE_GRID_BLOCK: CmsBlock = {
  id: "feature-grid-fallback",
  type: "FeatureGrid",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    sectionTitle: "Full-Stack Growth & Technology Pillars",
    sectionSubtitle:
      "Everything your brand needs to generate qualified customer inquiries, maximize ad spend efficiency, and scale predictable revenue.",
  },
};

const FALLBACK_CASE_STUDY_BLOCK: CmsBlock = {
  id: "case-study-fallback",
  type: "CaseStudyShowcase",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    title: "Documented Client Performance Spotlight",
    subtitle: "Real outcomes, verified attribution data, and documented growth velocity across high-growth accounts.",
  },
};

const FALLBACK_PROCESS_BLOCK: CmsBlock = {
  id: "process-timeline-fallback",
  type: "ProcessTimeline",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    title: "Predictable Growth Execution Engine",
    subtitle:
      "How our 4-phase delivery methodology transforms marketing spend into compounding enterprise pipeline.",
  },
};

const FALLBACK_TESTIMONIALS_BLOCK: CmsBlock = {
  id: "testimonials-fallback",
  type: "Testimonials",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    sectionTitle: "Validated by Enterprise Leaders",
    sectionSubtitle:
      "Discover how venture-backed startups and market-leading enterprises achieve compounding revenue with Nexora.",
    testimonials: [
      {
        quote:
          "Nexora redesigned our acquisition funnels and attribution stack. Our CAC dropped by 77% while deal pipeline tripled within our first 90 days.",
        author: "Marcus Vance",
        role: "Chief Revenue Officer",
        company: "NexScale Cloud",
        rating: 5,
      },
      {
        quote:
          "The technical precision of their commercial SEO and programmatic Next.js architecture is unmatched. We now rank #1 across all our core keywords.",
        author: "Sarah Jenkins",
        role: "VP of Digital Marketing",
        company: "Aura Life Sciences",
        rating: 5,
      },
      {
        quote:
          "Our ad waste decreased by 40% in month one. The deterministic server tracking gives our executive board 100% confidence in our media spend.",
        author: "Rohan Patel",
        role: "Founder & CEO",
        company: "Stellar Logistics Global",
        rating: 5,
      },
    ],
  },
};

const FALLBACK_FAQ_BLOCK: CmsBlock = {
  id: "faq-fallback",
  type: "FAQ",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    title: "Frequently Asked Questions",
  },
};

const FALLBACK_CTA_BLOCK: CmsBlock = {
  id: "cta-fallback",
  type: "CTA",
  schemaVersion: 1,
  enabled: true,
  settings: {},
  content: {
    headline: "Ready to Scale Revenue with Predictable Marketing ROI?",
    buttonText: "Schedule Executive Diagnostic",
    buttonLink: "/contact",
  },
};

const DEFAULT_PAGE_BLOCKS: CmsBlock[] = [
  FALLBACK_HERO_SLIDER_BLOCK,
  FALLBACK_STATS_BLOCK,
  FALLBACK_FEATURE_GRID_BLOCK,
  FALLBACK_CASE_STUDY_BLOCK,
  FALLBACK_PROCESS_BLOCK,
  FALLBACK_TESTIMONIALS_BLOCK,
  FALLBACK_FAQ_BLOCK,
  FALLBACK_CTA_BLOCK,
];

export default async function HomePage() {
  const region = resolveRegion();

  const [cmsPage, siteSettings, latestPosts, headerMenu] = await Promise.all([
    getPublicPage("home", region.code),
    getPublicSiteSettings(),
    getLatestPosts(),
    getPublicMenu("header", region.code),
  ]);

  let sectionVisibility: Record<string, boolean> = {
    showHero: true,
    showMetricsBar: true,
    showCapabilitiesGrid: true,
    showBlogInsights: true,
    showCtaBanner: true,
    showFaq: true,
  };
  try {
    if (siteSettings?.sectionVisibilityJson) {
      const parsed = JSON.parse(siteSettings.sectionVisibilityJson);
      sectionVisibility = { ...sectionVisibility, ...parsed };
    }
  } catch {
    // fallback defaults
  }

  // Filter CMS blocks based on global section visibility toggles
  const filteredBlocks = (cmsPage?.blocks || []).filter((block) => {
    if (!block.enabled) return false;
    const type = (block.type || "").toLowerCase();
    if (type === "hero" && sectionVisibility.showHero === false) return false;
    if (
      (type === "stats" || type === "metrics") &&
      sectionVisibility.showMetricsBar === false
    )
      return false;
    if (
      (type === "featuregrid" || type === "features") &&
      sectionVisibility.showCapabilitiesGrid === false
    )
      return false;
    if (type === "cta" && sectionVisibility.showCtaBanner === false)
      return false;
    if (type === "faq" && sectionVisibility.showFaq === false) return false;
    if (type === "testimonials" && (sectionVisibility as Record<string, boolean>).showTestimonials === false) return false;
    if ((type === "casestudies" || type === "portfolio") && (sectionVisibility as Record<string, boolean>).showCaseStudies === false) return false;
    if (
      (type === "pricing" || type === "pricingblock") &&
      (sectionVisibility as Record<string, boolean>).showPricing === false
    ) {
      return false;
    }
    if (
      (type === "roicalculator" || type === "roi") &&
      (sectionVisibility as Record<string, boolean>).showRoiCalculator === false
    ) {
      return false;
    }
    if (
      (type === "comparisontable" || type === "comparison") &&
      (sectionVisibility as Record<string, boolean>).showComparison === false
    ) {
      return false;
    }
    if (type === "processsteps" && (sectionVisibility as Record<string, boolean>).showProcess === false) return false;
    if (type === "logostrip" && (sectionVisibility as Record<string, boolean>).showLogos === false) return false;
    return true;
  });

  const blocksToRender =
    filteredBlocks.length > 0 ? filteredBlocks : DEFAULT_PAGE_BLOCKS;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        <div>
          <BlockRenderer blocks={blocksToRender} userRegion={region.code} />

          {/* Global Trusted Platforms & Client Logo Marquee */}
          <ClientLogoMarquee />

          {/* Latest Insights / Blog Articles (when available) */}
          {sectionVisibility.showBlogInsights !== false &&
            latestPosts.length > 0 && (
              <Reveal
                variant="fade-up"
                distance="lg"
                duration="slower"
                as="div"
                className="w-full"
              >
                  <section className="py-10 sm:py-14 lg:py-18 bg-slate-50/70 border-t border-slate-200/80 w-full relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Strategic Knowledge Base</span>
                          </span>
                          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Latest Insights &amp; Market Intelligence
                          </h2>
                          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
                            Actionable analysis on customer acquisition, conversion optimization, and predictable pipeline growth.
                          </p>
                        </div>
                        <Link
                          href="/blog"
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-primary bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-primary/40 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition-all group shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Explore all articles</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch w-full">
                        {latestPosts.map((post, idx) => {
                          const fallbackImages = [
                            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
                          ];
                          const coverImg =
                            post.coverImageUrl || fallbackImages[idx % fallbackImages.length];
                          const author = post.authorName || "Chief Growth Strategist";
                          const initials = author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                          return (
                            <StaggerItem key={post.id} index={idx} className="h-full">
                              <article
                                className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group h-full"
                              >
                                {/* Card Image Banner */}
                                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                                  <img
                                    src={coverImg}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-white border border-white/20">
                                    {post.category || "Growth Strategy"}
                                  </span>
                                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white">
                                    4 min read
                                  </span>
                                </div>

                                {/* Card Content Body */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                                  <div className="space-y-2.5">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                      <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                      </Link>
                                    </h3>
                                    {post.excerpt && (
                                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                                        {post.excerpt}
                                      </p>
                                    )}
                                  </div>

                                  {/* Card Author & CTA Footer */}
                                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                                        {initials}
                                      </div>
                                      <span className="font-medium text-slate-700 truncate max-w-[120px] sm:max-w-none">
                                        {author}
                                      </span>
                                    </div>
                                    <Link
                                      href={`/blog/${post.slug}`}
                                      className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Read Analysis</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            </StaggerItem>
                          );
                        })}
                      </Stagger>
                    </div>
                  </section>
                </Reveal>
              )}
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
