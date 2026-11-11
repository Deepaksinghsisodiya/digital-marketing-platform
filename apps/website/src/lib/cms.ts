export interface CmsBlock {
  id: string;
  type: string;
  schemaVersion: number;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
  enabled: boolean;
  regionFilter?: string[] | null;
}

export interface PublicPageDetail {
  id: string;
  slug: string;
  locale: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  versionNumber: number;
  blocks: CmsBlock[];
  publishedAtUtc: string;
}

export interface PublicSiteSettings {
  companyName: string;
  legalName?: string | null;
  supportEmail: string;
  supportPhone: string;
  address?: string | null;
  defaultRegion: string;
  supportedRegions: string[];
  timeZoneId: string;
  logoMediaId?: string | null;
  sectionVisibilityJson?: string;
}

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5201";

export async function getPublicPage(
  slug: string,
  locale = "en"
): Promise<PublicPageDetail | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "") || "home";
  const url = `${API_BASE}/api/v1/public/pages/${encodeURIComponent(cleanSlug)}?locale=${encodeURIComponent(locale)}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`CMS Fetch failed for slug '${cleanSlug}': HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as PublicPageDetail;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`CMS Fetch network error for slug '${cleanSlug}':`, err);
    return null;
  }
}

export async function getPreviewPage(token: string): Promise<PublicPageDetail | null> {
  const url = `${API_BASE}/api/v1/public/preview/${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as PublicPageDetail;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("CMS Preview fetch error:", err);
    return null;
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings | null> {
  const url = `${API_BASE}/api/v1/public/site-settings`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as PublicSiteSettings;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Public site settings fetch error:", err);
    return null;
  }
}
