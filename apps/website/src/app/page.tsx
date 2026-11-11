import { cookies } from "next/headers";
import Link from "next/link";
import { REGION_CONFIG, resolveRegion } from "../config/region";
import { getPublicPage, getPublicSiteSettings, getPublicMenu } from "../lib/cms";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import type { Metadata } from "next";

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
      title: cmsPage.metaTitle || cmsPage.title || "Nexora — Digital Marketing Platform",
      description: cmsPage.metaDescription || "AI-powered digital marketing infrastructure for modern enterprises.",
      alternates: {
        canonical: cmsPage.canonicalUrl || undefined,
      },
      robots: cmsPage.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
  }

  return {
    title: "Nexora — Unified Digital Growth Ecosystem",
    description: "Enterprise marketing automation, performance SEO, and attribution.",
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
    if ((type === "stats" || type === "metrics") && sectionVisibility.showMetricsBar === false) return false;
    if ((type === "featuregrid" || type === "features") && sectionVisibility.showCapabilitiesGrid === false) return false;
    if (type === "cta" && sectionVisibility.showCtaBanner === false) return false;
    if (type === "faq" && sectionVisibility.showFaq === false) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header settings={siteSettings} currentRegionCode={region.code} menu={headerMenu} />

      <main className="flex-1">
        {filteredBlocks.length > 0 ? (
          <div>
            <BlockRenderer blocks={filteredBlocks} userRegion={region.code} />

            {/* Latest Insights / Blog Articles (when using CMS blocks) */}
            {sectionVisibility.showBlogInsights !== false && latestPosts.length > 0 && (
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
                          <span className="font-medium text-slate-700">{post.authorName || "Chief Growth Strategist"}</span>
                          <Link href={`/blog/${post.slug}`} className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
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
              <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] pointer-events-none rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 text-center space-y-8">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-inner shadow-indigo-500/20">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-bold">Nexora Engine 2.0</span>
                    <span className="text-indigo-400">&bull;</span>
                    <span>Worldwide Enterprise Delivery</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto">
                    Data-Driven Marketing at{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300">
                      Enterprise Scale
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
                    Connect your enterprise to target audiences with AI campaign automation, precision audience modeling, and verifiable multi-touch attribution.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/35 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <span>Schedule Free Growth Diagnostic</span>
                    </Link>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/80 backdrop-blur-md px-7 py-4 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200"
                    >
                      <span>Explore Insights & Strategy &rarr;</span>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* 2. Key Metrics Bar */}
            {sectionVisibility.showMetricsBar !== false && (
              <section className="py-16 bg-slate-900 text-white border-y border-slate-800 px-6 sm:px-10 lg:px-12 xl:px-16">
                <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  <div className="space-y-1">
                    <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                      340%
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Avg Pipeline Velocity
                    </div>
                  </div>
                  <div className="pt-6 md:pt-0 space-y-1">
                    <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                      $120M+
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Revenue Influenced
                    </div>
                  </div>
                  <div className="pt-6 md:pt-0 space-y-1">
                    <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                      99.8%
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Attribution Precision
                    </div>
                  </div>
                  <div className="pt-6 md:pt-0 space-y-1">
                    <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                      14 Days
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Time to Value
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 3. Core Solutions Grid */}
            {sectionVisibility.showCapabilitiesGrid !== false && (
              <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 uppercase tracking-widest">
                    Enterprise Capabilities
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                    Engineered for High-Velocity Growth
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                    Comprehensive performance marketing infrastructure designed for modern B2B SaaS and enterprise services.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      num: "01",
                      tag: "Search Architecture",
                      title: "High-Intent Performance SEO",
                      desc: "Dominate commercial search terms with bespoke landing architectures, programmatic schema, and deep semantic authority.",
                    },
                    {
                      num: "02",
                      tag: "Account-Based Marketing",
                      title: "Account-Based Marketing (ABM)",
                      desc: "Engage enterprise buying committees with real-time intent signals, personalized campaigns, and automated CRM sync.",
                    },
                    {
                      num: "03",
                      tag: "Revenue Attribution",
                      title: "Multi-Touch Revenue Attribution",
                      desc: "Eliminate vanity metrics with deterministic tracking across Google Ads, LinkedIn, organic search, and outbound touches.",
                    },
                    {
                      num: "04",
                      tag: "Conversion Optimization",
                      title: "Conversion Rate Optimization (CRO)",
                      desc: "Turn high-cost paid traffic into qualified sales inquiries with rigorous multivariate split testing and smart forms.",
                    },
                    {
                      num: "05",
                      tag: "Outbound Lead Ops",
                      title: "Automated Lead Routing & Outbox",
                      desc: "Instantly capture, score, and route inbound prospects with transactional email confirmations and follow-up SLAs.",
                    },
                    {
                      num: "06",
                      tag: "Governance & Privacy",
                      title: "Multi-Country Data Compliance",
                      desc: "Native compliance with India DPDP, GDPR, and CCPA including immutable audit logging and consent tracking.",
                    },
                  ].map((f, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                            {f.num}
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {f.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                          {f.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-normal">
                          {f.desc}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                        <span>Explore capability</span>
                        <span>&rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Latest Insights / Blog Articles (from Admin) */}
            {sectionVisibility.showBlogInsights !== false && latestPosts.length > 0 && (
              <section className="py-24 bg-slate-50 border-y border-slate-200/80 px-6 sm:px-10 lg:px-12 xl:px-16">
                <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-14">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Knowledge Base
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                        Latest Insights & Thought Leadership
                      </h2>
                    </div>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow transition"
                    >
                      <span>View all articles &rarr;</span>
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
                          <span className="font-medium text-slate-700">{post.authorName || "Nexora Team"}</span>
                          <Link href={`/blog/${post.slug}`} className="font-bold text-indigo-600 hover:underline">
                            Read article &rarr;
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
              <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16">
                <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 p-12 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                      Ready to Scale Your Enterprise Pipeline?
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                      Book an executive growth diagnostic with our digital marketing strategists. We analyze your customer acquisition funnel and provide an actionable ROI roadmap.
                    </p>
                    <div className="pt-4">
                      <Link
                        href="/contact"
                        className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 transition transform hover:-translate-y-0.5"
                      >
                        Schedule Discovery Diagnostic
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
