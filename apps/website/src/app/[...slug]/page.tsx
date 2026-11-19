import { notFound } from "next/navigation";
import { resolveRegion } from "../../config/region";
import {
  getPublicPage,
  getPublicSiteSettings,
  getPublicMenu,
} from "../../lib/cms";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { BlockRenderer } from "../../components/blocks/BlockRenderer";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5201";
  try {
    const res = await fetch(`${apiUrl}/api/v1/public/pages/published-sitemap`, {
      next: { revalidate: 3600, tags: ["cms-pages"] },
    });
    if (!res.ok) return [];
    const pages: { slug: string }[] = await res.json();
    return pages
      .filter((p) => p.slug && p.slug !== "home")
      .map((p) => ({
        slug: p.slug.replace(/^\/+|\/+$/g, "").split("/"),
      }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const region = resolveRegion();

  const cmsPage = await getPublicPage(slugPath, region.code);

  if (!cmsPage) {
    return {
      title: "Page Not Found — Nexora",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: cmsPage.metaTitle || `${cmsPage.title} — Nexora`,
    description: cmsPage.metaDescription || undefined,
    alternates: {
      canonical: cmsPage.canonicalUrl || undefined,
    },
    robots: cmsPage.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const region = resolveRegion();

  const [cmsPage, siteSettings, headerMenu] = await Promise.all([
    getPublicPage(slugPath, region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  if (!cmsPage) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        <BlockRenderer blocks={cmsPage.blocks} userRegion={region.code} />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
