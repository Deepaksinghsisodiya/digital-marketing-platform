import { cookies } from "next/headers";
import Link from "next/link";
import { REGION_CONFIG, resolveRegion } from "../config/region";
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
import { Reveal } from "../components/motion/Reveal";
import { Stagger, StaggerItem } from "../components/motion/Stagger";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  SearchCode,
  Target,
  BarChart3,
  Layers,
  Cpu,
  Zap,
  ArrowUpRight,
  Code2,
  Terminal,
  Workflow,
  Bot,
  Layout,
  Database,
  Cloud,
  ShoppingCart,
  Home,
  GraduationCap,
  Stethoscope,
  Building2,
  Briefcase,
  Hotel,
  Clock,
  Compass,
  Check,
  ChevronDown,
  Star,
  Quote,
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
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);
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
    interval: 5000,
    slides: [
      {
        id: "slide-1",
        tag: "Performance Marketing & Growth",
        headline: "Technology Meets Creativity. Growth Becomes Reality.",
        subheadline:
          "We help ambitious businesses build stronger digital brands, engineer powerful digital experiences and accelerate growth through strategic marketing, innovative technology and intelligent automation.",
        primaryCtaText: "Let's Build Something Great",
        primaryCtaLink: "/contact",
        secondaryCtaText: "Explore Capabilities",
        secondaryCtaLink: "/services",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
        imageAlt: "Digital Growth Analytics Dashboard",
        imageBadge: "Global Growth Platform",
        imagePosition: "background",
      },
      {
        id: "slide-2",
        tag: "High-Converting Digital Platforms",
        headline: "Engineered Digital Experiences Built to Turn Traffic into Revenue.",
        subheadline:
          "High-speed custom websites, optimized sales funnels, and enterprise e-commerce platforms designed to maximize your customer conversion rate.",
        primaryCtaText: "Upgrade Your Website",
        primaryCtaLink: "/contact",
        secondaryCtaText: "View Client Results",
        secondaryCtaLink: "/case-studies",
        imageUrl:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2000&q=85",
        imageAlt: "High-Converting Digital Growth Architecture",
        imageBadge: "High-Converting Sales Platforms",
        imagePosition: "background",
      },
      {
        id: "slide-3",
        tag: "Intelligent AI Automation",
        headline: "Automate Business Operations with Intelligent AI.",
        subheadline:
          "Conversational AI chatbots, event-driven CRM synchronizations, and intelligent lead scoring that scales operations without friction.",
        primaryCtaText: "Deploy Intelligent AI",
        primaryCtaLink: "/contact",
        secondaryCtaText: "AI Solutions Catalog",
        secondaryCtaLink: "/services",
        imageUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=85",
        imageAlt: "Intelligent AI Automation Platform",
        imageBadge: "Event-Driven • Zero Latency",
        imagePosition: "background",
      },
    ],
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

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
      type === "roicalculator" ||
      type === "roi" ||
      type === "comparisontable" ||
      type === "comparison" ||
      type === "pricing" ||
      type === "pricingblock"
    ) {
      return false;
    }
    if (type === "processsteps" && (sectionVisibility as Record<string, boolean>).showProcess === false) return false;
    if (type === "logostrip" && (sectionVisibility as Record<string, boolean>).showLogos === false) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        {filteredBlocks.length > 0 ? (
          <div>
            <BlockRenderer blocks={filteredBlocks} userRegion={region.code} />

            {/* Latest Insights / Blog Articles (when using CMS blocks) */}
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
        ) : (
          /* COMPLETE 17-SECTION BLUEPRINT ENTERPRISE HOMEPAGE */
          <div>
            {/* 03. HERO SECTION (INTERACTIVE SLIDER WITH HIGH-RES BANNER IMAGES) */}
            {sectionVisibility.showHero !== false && (
              <HeroBlock block={FALLBACK_HERO_SLIDER_BLOCK} />
            )}

            {/* 04. TRUST & SOCIAL PROOF STRIP */}
            <section className="py-4 sm:py-6 bg-[#080c14] text-slate-300 border-y border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6 text-xs text-center sm:text-left">
                {/* Client Rating & Reviews Badge */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center text-amber-400 gap-0.5">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  </div>
                  <span className="font-bold text-white text-xs">
                    4.9/5 Rating
                  </span>
                  <span className="text-slate-400 hidden sm:inline">
                    &bull; 80+ B2B, SaaS &amp; E-Commerce Clients Worldwide
                  </span>
                </div>

                {/* Performance & Engineering Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5 text-white"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Sub-Second CWV</span>
                  <span className="flex items-center gap-1.5 text-white"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Next.js 15 &amp; React 19</span>
                  <span className="flex items-center gap-1.5 text-white"><Check className="w-3.5 h-3.5 text-accent shrink-0" /> Server-Side Attribution</span>
                </div>
              </div>
            </section>

            {/* 05. ABOUT NEXORA */}
            <section className="py-24 sm:py-28 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-6xl mx-auto space-y-6 text-center relative">
              <div className="absolute inset-0 -z-10 aurora-bg pointer-events-none" />
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Agency Purpose &amp; Philosophy</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                More Than a Service Provider.
                <br />
                <span className="text-gradient-emerald">Your Partner in Digital Progress.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto">
                Modern businesses face an operational divide: marketing agencies lack engineering depth, and traditional software development firms don&apos;t understand customer acquisition. Nexora bridges this divide.
                We combine brand strategy, software engineering, and intelligent automation into a unified growth engine.
              </p>
            </section>

            {/* 06. CORE CAPABILITIES (3 Large Feature Cards) */}
            <section className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80 px-3 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
              <div className="absolute inset-0 grid-matrix-light opacity-50 pointer-events-none" />
              <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 lg:space-y-14 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
                  <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 uppercase tracking-widest px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 inline-block shadow-2xs">
                    Full-Funnel Capabilities
                  </span>
                  <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Comprehensive Digital Capabilities
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                    Engineered from the ground up for measurable commercial pipeline and enterprise resilience.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {/* Card 1: Digital Growth */}
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 lg:p-10 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block border border-emerald-100">
                        Capability 01
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Digital Growth
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Data-driven customer acquisition programs designed to turn commercial search intent and targeted advertising into predictable, compounded pipeline.
                      </p>
                      <ul className="space-y-2 sm:space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                        <li className="flex items-center gap-2 sm:gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Search Engine Optimization (SEO)</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Performance Paid Media (Google &amp; Meta)</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Conversion Rate Optimization (CRO)</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Content &amp; Editorial Marketing</li>
                      </ul>
                    </div>
                    <div className="pt-6 sm:pt-8 border-t border-slate-100 mt-6 sm:mt-8">
                      <Link href="/services/seo" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                        <span>Explore Growth Capabilities</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Card 2: Technology Solutions */}
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 lg:p-10 shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-400" />
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md inline-block border border-teal-100">
                        Capability 02
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                        Technology Solutions
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Production-grade web applications, headless corporate websites, and enterprise software engineered for sub-second load times and long-term maintainability.
                      </p>
                      <ul className="space-y-2 sm:space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                        <li className="flex items-center gap-2 sm:gap-2.5"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Corporate Website Development (Next.js)</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Custom Web Application Engineering</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Headless E-Commerce Development</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> UI/UX Design &amp; Central Design Systems</li>
                      </ul>
                    </div>
                    <div className="pt-6 sm:pt-8 border-t border-slate-100 mt-6 sm:mt-8">
                      <Link href="/services/web-design-development" className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                        <span>Explore Technology Capabilities</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Card 3: AI & Automation */}
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 lg:p-10 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-400" />
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <Workflow className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md inline-block border border-cyan-100">
                        Capability 03
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                        AI &amp; Automation
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Custom AI integrations, intelligent chatbots, and event-driven business process automations that eliminate manual bottlenecks and scale lead velocity.
                      </p>
                      <ul className="space-y-2 sm:space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                        <li className="flex items-center gap-2 sm:gap-2.5"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> AI Integrations &amp; Custom LLM Tools</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Conversational AI Intake Chatbots</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Automated Lead Scoring &amp; CRM Sync</li>
                        <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Event-Driven Business Workflow Pipelines</li>
                      </ul>
                    </div>
                    <div className="pt-6 sm:pt-8 border-t border-slate-100 mt-6 sm:mt-8">
                      <Link href="/services/marketing-automation-crm" className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                        <span>Explore AI Capabilities</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 07. CLIENT SOCIAL PROOF & TESTIMONIALS (Measurable Impact) */}
            <section className="py-24 bg-white px-3 sm:px-6 lg:px-8 border-b border-slate-200/80">
              <div className="max-w-7xl mx-auto space-y-14">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="text-xs font-extrabold text-primary uppercase tracking-widest px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block">
                    Proven Commercial Outcomes
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                    Trusted by Growth-Stage Leaders
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600">
                    Real results from real partnerships. Here is how Nexora accelerates commercial pipeline across sectors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Testimonial 1 */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-primary font-mono">+340%</span>
                        <div className="flex text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Pipeline Velocity • B2B SaaS
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                        &ldquo;Nexora overhauled our organic search architecture and deployed high-intent landing pages. We closed $1.8M in influenced pipeline within the first two quarters.&rdquo;
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                        AR
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Ananya Roy</h4>
                        <span className="text-[11px] text-slate-500">VP Marketing, FinScale AI</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-primary font-mono">4.2x ROAS</span>
                        <div className="flex text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Performance Paid Ads • D2C Brands
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                        &ldquo;Their algorithmic Google and Meta campaigns reduced our customer acquisition cost by 38% while scaling monthly order volume. True performance marketing.&rdquo;
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm border border-accent/20">
                        MK
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Michael Krause</h4>
                        <span className="text-[11px] text-slate-500">Co-Founder, UrbanLux Apparel (US)</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-primary font-mono">&lt; 0.8s CWV</span>
                        <div className="flex text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Web Engineering &bull; Healthcare
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                        &ldquo;The engineering team migrated our monolithic corporate portal to Next.js 15. The speed improvements alone increased form conversion rates by 42%.&rdquo;
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                        DS
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dr. Sanjay Mehta</h4>
                        <span className="text-[11px] text-slate-500">Operations Director, Apex Health</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 08. WHY NEXORA (Key Differentiators) */}
            <section className="py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  The Nexora Advantage
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Why Leading Brands Choose Nexora
                </h2>
                <p className="text-base text-slate-600">
                  We eliminate agency overhead and deliver measurable engineering and growth outcomes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Strategy-Led Execution",
                    desc: "No cookie-cutter templates. Every project begins with in-depth commercial intent discovery, technical audits, and market alignment.",
                    icon: Compass,
                  },
                  {
                    title: "Integrated Marketing & Tech",
                    desc: "Software developers and performance marketers work in the same repository, eliminating handover friction.",
                    icon: Layers,
                  },
                  {
                    title: "Customized Architectures",
                    desc: "Purpose-built Next.js and .NET solutions with zero monolithic bloat, engineered specifically for your business goals.",
                    icon: Code2,
                  },
                  {
                    title: "Transparent Communication",
                    desc: "Direct access to senior strategists and engineers. Clear sprint milestones, live analytics, and zero corporate bureaucracy.",
                    icon: Target,
                  },
                  {
                    title: "Deterministic Measurement",
                    desc: "Attribution tied directly to qualified pipeline and revenue in your CRM, not superficial vanity impressions.",
                    icon: BarChart3,
                  },
                  {
                    title: "Continuous Optimization",
                    desc: "Post-launch monitoring, Core Web Vitals maintenance, and multivariate A/B testing to ensure compounding returns.",
                    icon: Zap,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group relative overflow-hidden"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 10. OUR APPROACH (4 Steps) */}
            <section className="py-24 sm:py-28 bg-[#080c14] text-white px-6 sm:px-10 lg:px-12 xl:px-16 border-y border-white/10 relative overflow-hidden">
              {/* Dynamic Ambient Background Orbs */}
              <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-teal-500/15 blur-[140px] rounded-full pointer-events-none" />
              <div className="absolute inset-0 grid-matrix-dark opacity-40 pointer-events-none" />

              <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 inline-block">
                    Execution Methodology
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                    Our 4-Step Approach to Compounding Growth
                  </h2>
                  <p className="text-sm sm:text-base text-slate-400">
                    Precision engineering sprints that eliminate guesswork and accelerate time-to-market.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {[
                    {
                      step: "01",
                      title: "Discover",
                      gradient: "from-emerald-400 to-teal-400",
                      badge: "Diagnostic Audit",
                      desc: "Comprehensive audit of your current tech stack, search footprint, customer journey, and revenue bottlenecks.",
                    },
                    {
                      step: "02",
                      title: "Strategize",
                      gradient: "from-teal-400 to-cyan-400",
                      badge: "Architecture Roadmap",
                      desc: "Architectural blueprints, keyword cluster mapping, UX wireframes, and sprint roadmaps aligned with business goals.",
                    },
                    {
                      step: "03",
                      title: "Execute",
                      gradient: "from-cyan-400 to-emerald-400",
                      badge: "High-Velocity Build",
                      desc: "Multi-channel campaign deployment, conversion rate optimization, CRM tracking integrations, and rigorous funnel QA.",
                    },
                    {
                      step: "04",
                      title: "Optimize",
                      gradient: "from-emerald-400 to-teal-300",
                      badge: "Continuous Scaling",
                      desc: "Continuous multivariate testing, conversion funnel tuning, customer journey optimization, and systematic revenue scaling.",
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-[#0d1422]/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all duration-300 space-y-4 hover:-translate-y-1 group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-3xl font-mono font-black bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent block`}>
                          {s.step}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {s.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">{s.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 15. FAQ SECTION */}
            <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-4xl mx-auto space-y-12 relative">
              <div className="text-center space-y-3">
                <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 inline-block">
                  Frequently Asked Questions
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Transparent Answers to Common Questions
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "How does Nexora combine marketing and technology development?",
                    a: "Unlike traditional agencies that separate marketing from engineering, Nexora operates cross-functional teams where frontend developers, SEO strategists, and automation engineers collaborate in the same repository. This ensures marketing campaigns are backed by high-performance architecture, and web applications are optimized for search and conversion from day one.",
                  },
                  {
                    q: "Do you work with global and international clients?",
                    a: "Yes. Nexora is a full-service global digital marketing and engineering agency. We support scaling brands and enterprises worldwide with seamless timezone-aligned collaboration (PST, EST, GMT, IST), transparent sprint milestones, and enterprise data privacy standards.",
                  },
                  {
                    q: "What technology stack powers your digital marketing and web solutions?",
                    a: "We engineer solutions using enterprise-grade cloud architecture and ultra-fast web frameworks engineered for speed, bank-grade data security, multi-channel attribution, and seamless CRM integrations to turn traffic into qualified pipeline.",
                  },
                  {
                    q: "What is your pricing and engagement model?",
                    a: "We do not sell commoditized generic packages. We operate transparent, scope-driven engagement models: Sprint-based projects for web builds and audits, and monthly managed retainers for ongoing growth, engineering, and AI automation. Every proposal includes concrete deliverables, timelines, and SLAs.",
                  },
                  {
                    q: "How do you measure and report ROI?",
                    a: "We prioritize deterministic, server-side attribution tied directly to CRM pipeline and closed revenue, eliminating reliance on easily skewed third-party cookies or vanity metrics.",
                  },
                ].map((faq, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-md transition-all duration-200 space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 16. FINAL CONVERSION CTA */}
            <section className="py-20 lg:py-28 bg-gradient-to-r from-emerald-900 via-teal-900 to-[#080c14] text-white px-6 sm:px-10 lg:px-12 xl:px-16 text-center relative overflow-hidden border-t border-white/10">
              <div className="absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
              <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                <span className="text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md inline-block shadow-sm">
                  Let&apos;s Build Together
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Ready to Build Your Next Growth Story?
                </h2>
                <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
                  Let&apos;s understand your business goals and explore the right combination of strategy,
                  technology and creativity to move your business forward.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-black text-primary hover:text-primary-hover shadow-2xl hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span>Start Your Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/book-a-call"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md px-7 py-4 text-sm font-bold text-white hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span>Schedule Strategic Call &rarr;</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
