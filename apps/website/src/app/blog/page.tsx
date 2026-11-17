import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  coverImageUrl?: string;
  category?: string;
  tags?: string | string[];
  publishedAtUtc: string;
  viewCount?: number;
}

interface PaginatedPosts {
  items: BlogPostSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/posts?pageSize=12`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: PaginatedPosts = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Insights & Strategy | Nexora Digital Marketing",
  description:
    "Deep dives, playbooks, and ROI strategies for modern B2B growth and performance marketing.",
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />
      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 w-full">
        <Reveal variant="fade-up" distance="lg" duration="slower" as="div" className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            Insights & Thought Leadership
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Proven Playbooks for Modern Enterprise Growth
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Actionable strategies, technical breakdowns, and deep dives on
            pipeline velocity, generative media, and multi-region attribution.
          </p>
        </Reveal>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <h3 className="text-lg font-medium text-slate-700">
              No articles published yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon for new research briefings and strategic guides.
            </p>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch w-full">
            {posts.map((post, idx) => (
              <StaggerItem key={post.id} index={idx} className="h-full">
                <article
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm h-full"
                >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {post.category}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(post.publishedAtUtc).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {(post.excerpt || post.summary) && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {post.excerpt || post.summary}
                    </p>
                  )}
                </div>

                {(() => {
                  const parsedTags = Array.isArray(post.tags)
                    ? post.tags
                    : typeof post.tags === "string"
                      ? post.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      : [];

                  return (
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {parsedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {parsedTags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-primary group-hover:text-primary-hover flex items-center gap-1 ml-auto"
                      >
                        Read article &rarr;
                      </Link>
                    </div>
                  );
                })()}
              </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </main>
      <Footer />
    </div>
  );
}
