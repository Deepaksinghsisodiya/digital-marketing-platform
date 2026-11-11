import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5201';
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/posts?pageSize=12`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data: PaginatedPosts = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Insights & Strategy | Nexora Digital Marketing',
  description: 'Deep dives, playbooks, and ROI strategies for modern B2B growth and performance marketing.'
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 w-full">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Insights & Thought Leadership
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 text-white">
            Proven Playbooks for Modern Enterprise Growth
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Actionable strategies, technical breakdowns, and deep dives on pipeline velocity, generative media, and multi-region attribution.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <h3 className="text-lg font-medium text-slate-300">No articles published yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon for new research briefings and strategic guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {post.category}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(post.publishedAtUtc).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {(post.excerpt || post.summary) && (
                    <p className="mt-3 text-sm text-slate-400 line-clamp-3 leading-relaxed">
                      {post.excerpt || post.summary}
                    </p>
                  )}
                </div>

                {(() => {
                  const parsedTags = Array.isArray(post.tags)
                    ? post.tags
                    : typeof post.tags === "string"
                    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];

                  return (
                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      {parsedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {parsedTags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1 ml-auto"
                      >
                        Read article &rarr;
                      </Link>
                    </div>
                  );
                })()}
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

