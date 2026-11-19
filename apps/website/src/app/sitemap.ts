import type { MetadataRoute } from "next";

interface SitemapPageItem {
  slug: string;
  locale?: string;
  updatedAtUtc?: string;
}

interface BlogPostSummary {
  slug: string;
  updatedAtUtc?: string;
  publishedAtUtc?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  let dynamicPageEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/pages/published-sitemap`, {
      next: { revalidate: 3600, tags: ["cms-pages"] },
    });
    if (res.ok) {
      const pages: SitemapPageItem[] = await res.json();
      dynamicPageEntries = pages
        .filter((p) => p.slug && p.slug !== "home")
        .map((p) => ({
          url: `${siteUrl}/${p.slug.replace(/^\//, "")}`,
          lastModified: p.updatedAtUtc ? new Date(p.updatedAtUtc) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // API offline during static pre-rendering
  }

  let dynamicPostEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/posts?pageSize=100`, {
      next: { revalidate: 3600, tags: ["blog-posts"] },
    });
    if (res.ok) {
      const data = await res.json();
      const posts: BlogPostSummary[] = data.items || [];
      dynamicPostEntries = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified:
          post.updatedAtUtc || post.publishedAtUtc
            ? new Date(post.updatedAtUtc || post.publishedAtUtc!)
            : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
    }
  } catch {
    // API offline during static pre-rendering
  }

  return [...staticEntries, ...dynamicPageEntries, ...dynamicPostEntries];
}
