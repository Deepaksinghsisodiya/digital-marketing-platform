import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  tags: string;
  coverImageUrl?: string;
  authorName: string;
  status: number;
  publishedAtUtc?: string;
  metaTitle?: string;
  metaDescription?: string;
}

async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/posts/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | Nexora" };
  }
  return {
    title: `${post.metaTitle || post.title} | Nexora Insights`,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tagsList = post.tags
    ? post.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Navigation & Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            &larr; Back to all insights
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {post.category}
              </span>
            )}
            {post.publishedAtUtc && (
              <time className="text-xs text-slate-500">
                {new Date(post.publishedAtUtc).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            )}
            <span className="text-xs text-slate-500">
              &bull; By {post.authorName || "Nexora Team"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal border-l-2 border-emerald-500/50 pl-4 py-1 italic">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed text-base sm:text-lg border-y border-slate-800/80 py-10">
          <div
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            className="space-y-6"
          />
        </article>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Tags:</span>
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Card */}
        <div className="mt-16 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to accelerate your B2B growth?
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Book an executive growth diagnostic with Nexora&apos;s digital
            marketing strategists. We analyze your pipeline, attribution, and
            acquisition channels.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Schedule Growth Diagnostic
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
