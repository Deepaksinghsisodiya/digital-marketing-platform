import { cookies } from "next/headers";
import Link from "next/link";
import { REGION_CONFIG, resolveRegion } from "../config/region";
import {
  getPublicPage,
  getPublicSiteSettings,
  getPublicMenu,
} from "../lib/cms";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Clock,
  Sparkles,
  Search,
  Target,
  BarChart3,
  Layers,
  Cpu,
  Zap,
  ArrowUpRight,
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
        "Nexora — Digital Marketing Platform",
      description:
        cmsPage.metaDescription ||
        "AI-powered digital marketing infrastructure for modern enterprises.",
      alternates: {
        canonical: cmsPage.canonicalUrl || undefined,
      },
      robots: cmsPage.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  }

  return {
    title: "Nexora — Unified Digital Growth Ecosystem",
    description:
      "Enterprise marketing automation, performance SEO, and attribution.",
  };
}

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
                <section className="py-24 bg-slate-50 border-t border-slate-200/80 px-6 sm:px-10 lg:px-12 xl:px-16">
                  <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-14">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Strategic Knowledge Base
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                          Latest Insights & Thought Leadership
                        </h2>
                      </div>
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow transition"
                      >
                        <span>Explore all articles</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {latestPosts.map((post) => (
                        <article
                          key={post.id}
                          className="rounded-3xl bg-white border border-slate-200/90 p-7 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                              {post.category || "Growth Strategy"}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 mt-4 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              <Link href={`/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed font-normal">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {post.authorName || "Chief Growth Strategist"}
                            </span>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                            >
                              <span>Read article</span>
                              <span>&rarr;</span>
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}
          </div>
        ) : (
          /* Full Enterprise Default Home Layout */
          <div>
            {/* 1. Hero Section */}
            {sectionVisibility.showHero !== false && (
              <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 text-slate-900 border-b border-slate-200">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/40 to-pink-100/30 blur-[130px] pointer-events-none rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 text-center space-y-8">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 backdrop-blur-md shadow-2xs">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-extrabold">Nexora Growth Engine</span>
                    <span className="text-indigo-400">&bull;</span>
                    <span>Trusted by 150+ Brands | Generated ₹120M+ Revenue</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto text-slate-900">
                    Stop Burning Money on Boring Ads.{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      We Scale Your Revenue.
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
                    High-intent Google Ads, Meta Paid Social, and revenue-driven SEO
                    engineered to generate qualified sales pipeline, not vanity clicks.
                    100% transparent live dashboard, zero long-term lock-in.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <span>Claim Free 30-Min Growth Diagnostic</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/tools/roi-calculator"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 shadow-xs hover:shadow transition-all duration-200"
                    >
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>Calculate Projected ROAS</span>
                    </Link>
                  </div>

                  {/* Trust badges */}
                  <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ₹0 Upfront Audit Fee
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Month-to-Month (No 12-Month Lock-in)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct Slack Access to Senior Strategists
                    </span>
                  </div>

                  {/* Live Campaign Analytics Console Preview Card */}
                  <div className="pt-8 max-w-5xl mx-auto">
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xl shadow-indigo-500/10 text-left">
                      {/* Console top bar */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-400" />
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-emerald-400" />
                          <span className="ml-3 text-xs font-mono font-bold text-slate-500">
                            nexora-campaign-analytics.live
                          </span>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE CLIENT CAMPAIGNS ACTIVE
                        </span>
                      </div>

                      {/* 3 Live Telemetry KPI Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                            Ad Spend vs Revenue
                          </span>
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            4.81x ROAS
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                            Spend: $14.2k ➔ Revenue: $68.4k
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block mb-1">
                            High-Intent Leads
                          </span>
                          <span className="text-2xl font-black text-indigo-900 font-mono">
                            1,240 Accounts
                          </span>
                          <span className="text-[10px] text-indigo-700 font-bold block mt-1">
                            Cost Per Lead Down -38%
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                            Organic Search Visibility
                          </span>
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            +340% Lift
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                            #1 Commercial Keywords
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                          </span>
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            $128.4M
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                            Across 14 Regions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. Key Metrics Bar */}
            {sectionVisibility.showMetricsBar !== false && (
              <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200/80 text-slate-900 px-6 sm:px-10 lg:px-12 xl:px-16 relative overflow-hidden">
                <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {[
                    {
                      value: "340%",
                      label: "Avg Pipeline Velocity",
                      change: "+42% QoQ",
                      icon: TrendingUp,
                    },
                    {
                      value: "$120M+",
                      label: "Enterprise Revenue Influenced",
                      change: "Audited",
                      icon: DollarSign,
                    },
                    {
                      value: "99.8%",
                      label: "Attribution Precision",
                      change: "Deterministic",
                      icon: ShieldCheck,
                    },
                    {
                      value: "14 Days",
                      label: "Time to Deploy & Convert",
                      change: "Guaranteed SLA",
                      icon: Clock,
                    },
                  ].map((m, idx) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={idx}
                        className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 space-y-4 group relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {m.change}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {m.value}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">
                            {m.label}
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Core Solutions Grid */}
            {sectionVisibility.showCapabilitiesGrid !== false && (
              <section className="py-24 lg:py-32 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 uppercase tracking-widest shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Enterprise Capabilities</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                    Engineered for High-Velocity Growth
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                    Comprehensive performance marketing infrastructure designed
                    for modern B2B SaaS, mid-market, and enterprise leaders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[
                    {
                      num: "01",
                      tag: "Search Architecture",
                      title: "High-Intent Performance SEO",
                      desc: "Dominate commercial search terms with bespoke landing architectures, programmatic schema, and deep semantic authority.",
                      icon: Search,
                    },
                    {
                      num: "02",
                      tag: "Account-Based Marketing",
                      title: "Account-Based Marketing (ABM)",
                      desc: "Engage enterprise buying committees with real-time intent signals, personalized campaigns, and automated CRM sync.",
                      icon: Target,
                    },
                    {
                      num: "03",
                      tag: "Revenue Attribution",
                      title: "Multi-Touch Revenue Attribution",
                      desc: "Eliminate vanity metrics with deterministic tracking across Google Ads, LinkedIn, organic search, and outbound touches.",
                      icon: BarChart3,
                    },
                    {
                      num: "04",
                      tag: "Conversion Optimization",
                      title: "Conversion Rate Optimization (CRO)",
                      desc: "Turn high-cost paid traffic into qualified sales inquiries with rigorous multivariate split testing and smart forms.",
                      icon: Zap,
                    },
                    {
                      num: "05",
                      tag: "Outbound Lead Ops",
                      title: "Automated Lead Routing & Outbox",
                      desc: "Instantly capture, score, and route inbound prospects with transactional email confirmations and follow-up SLAs.",
                      icon: Cpu,
                    },
                    {
                      num: "06",
                      tag: "Governance & Privacy",
                      title: "Multi-Country Data Compliance",
                      desc: "Native compliance with India DPDP, GDPR, and CCPA including immutable audit logging and consent tracking.",
                      icon: ShieldCheck,
                    },
                  ].map((f, idx) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase tracking-wider font-mono">
                              Phase {f.num}
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                            {f.tag}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {f.title}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed font-normal">
                            {f.desc}
                          </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                          <span>Explore capability</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Latest Insights / Blog Articles (from Admin) */}
            {sectionVisibility.showBlogInsights !== false &&
              latestPosts.length > 0 && (
                <section className="py-24 lg:py-32 bg-slate-50 border-y border-slate-200/80 px-6 sm:px-10 lg:px-12 xl:px-16">
                  <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-14">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Strategic Knowledge Base
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                          Latest Insights & Thought Leadership
                        </h2>
                      </div>
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow transition"
                      >
                        <span>View all articles</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {latestPosts.map((post) => (
                        <article
                          key={post.id}
                          className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                              {post.category || "Growth Strategy"}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 mt-4 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              <Link href={`/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed font-normal">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">
                              {post.authorName || "Chief Growth Strategist"}
                            </span>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                            >
                              <span>Read article</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}

            {/* 5. Enterprise CTA Banner */}
            {sectionVisibility.showCtaBanner !== false && (
              <section className="py-24 lg:py-32 px-6 sm:px-10 lg:px-12 xl:px-16">
                <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/90 p-10 sm:p-16 text-center text-slate-900 shadow-2xl shadow-indigo-600/10 relative overflow-hidden">
                  <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ready to Accelerate Growth?</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                      Scale Your Enterprise Pipeline with Certainty
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
                      Book an executive growth diagnostic with our digital
                      marketing strategists. We analyze your customer
                      acquisition funnel and deliver a deterministic ROI roadmap.
                    </p>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        <span>Schedule Discovery Diagnostic</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/tools/roi-calculator"
                        className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-300 px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-all duration-200"
                      >
                        <span>Run Growth ROI Model</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
