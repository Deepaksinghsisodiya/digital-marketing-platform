import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.digital";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts: Array<{
    slug: string;
    title: string;
    excerpt?: string;
    publishedAtUtc?: string;
    createdAtUtc?: string;
    authorName?: string;
    category?: string;
  }> = [];

  try {
    const res = await fetch(`${API_URL}/api/v1/public/blog?page=1&pageSize=30`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      posts = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    }
  } catch {
    // Graceful empty feed when backend is offline during static build
  }

  const itemsXml = posts
    .map((p) => {
      const link = `${SITE_URL.replace(/\/$/, "")}/blog/${encodeURIComponent(p.slug)}`;
      const pubDate = new Date(p.publishedAtUtc || p.createdAtUtc || Date.now()).toUTCString();
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(p.excerpt || "")}</description>
      <pubDate>${pubDate}</pubDate>
      ${p.category ? `<category>${escapeXml(p.category)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nexora Digital Marketing Insights</title>
    <link>${SITE_URL}</link>
    <description>Enterprise performance marketing, technical SEO, and attribution engineering insights.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL.replace(/\/$/, "")}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
