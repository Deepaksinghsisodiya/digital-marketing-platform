import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReadingProgressBar } from "@/components/motion/ReadingProgressBar";
import { Reveal } from "@/components/motion/Reveal";

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
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <ReadingProgressBar />
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Navigation & Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            &larr; Back to all insights
          </Link>
        </div>

        {/* Article Header */}
        <Reveal variant="fade-up" distance="lg" duration="slower" as="header" className="mb-10 w-full">
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
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
            <span className="text-xs text-slate-500 font-medium">
              &bull; By {post.authorName || "Nexora Team"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 text-lg sm:text-xl text-slate-700 leading-relaxed font-normal border-l-2 border-primary pl-4 py-1 italic bg-primary/5 rounded-r-xl">
              {post.excerpt}
            </p>
          )}
        </Reveal>

        {/* Article Content */}
        <Reveal variant="fade-up" distance="md" duration="slower" as="article" className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed text-base sm:text-lg border-y border-slate-200 py-10 w-full">
          <div
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            className="space-y-6"
          />
        </Reveal>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Tags:</span>
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Card */}
        <div className="mt-16 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 sm:p-10 text-center shadow-lg shadow-emerald-500/5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ready to accelerate your B2B growth?
          </h2>
          <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Book an executive growth diagnostic with Nexora&apos;s digital
            marketing strategists. We analyze your pipeline, attribution, and
            acquisition channels.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/25"
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
