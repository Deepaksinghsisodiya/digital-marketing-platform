import { getPreviewPage, getPublicSiteSettings } from "../../lib/cms";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { BlockRenderer } from "../../components/blocks/BlockRenderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Draft Preview — Nexora",
  robots: { index: false, follow: false },
};

interface PreviewPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8">
          <h2 className="text-lg font-bold text-red-900">
            Missing Preview Token
          </h2>
          <p className="mt-2 text-xs text-red-700">
            A valid short-lived preview token is required to preview draft
            pages. Please generate a new preview link from the Admin CMS.
          </p>
        </div>
      </div>
    );
  }

  const [previewPage, siteSettings] = await Promise.all([
    getPreviewPage(token),
    getPublicSiteSettings(),
  ]);

  if (!previewPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-lg font-bold text-amber-900">
            Preview Expired or Invalid
          </h2>
          <p className="mt-2 text-xs text-amber-700">
            This draft preview token has either expired (tokens expire after 4
            hours) or the page was deleted. Please generate a fresh preview link
            in the Admin CMS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      {/* Draft Preview Bar */}
      <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
        <span>DRAFT PREVIEW MODE</span>
        <span className="opacity-70 font-normal">
          — Viewing unpublished version for /{previewPage.slug} (NoIndex)
        </span>
      </div>

      <Header settings={siteSettings} currentRegionCode={previewPage.locale} />

      <main className="flex-1">
        <BlockRenderer
          blocks={previewPage.blocks}
          userRegion={previewPage.locale}
        />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
