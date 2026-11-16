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
  logoUrl?: string | null;
  faviconMediaId?: string | null;
  faviconUrl?: string | null;
  sectionVisibilityJson?: string;
  themeTokensJson?: string;
  socialLinksJson?: string;
  trackingCodesJson?: string;
  bookingUrl?: string | null;
  announcementBarJson?: string;
}

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5201";

export async function getPublicPage(
  slug: string,
  locale = "en",
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
      console.warn(
        `CMS Fetch failed for slug '${cleanSlug}': HTTP ${res.status}`,
      );
      return null;
    }

    return (await res.json()) as PublicPageDetail;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`CMS Fetch network error for slug '${cleanSlug}':`, err);
    return null;
  }
}

export async function getPreviewPage(
  token: string,
): Promise<PublicPageDetail | null> {
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

export interface PublicMenuItem {
  id: string;
  label: string;
  url: string;
  displayOrder: number;
  parentItemId?: string | null;
  children: PublicMenuItem[];
}

export interface PublicMenu {
  id: string;
  key: string;
  title: string;
  regionCode?: string | null;
  items: PublicMenuItem[];
}

export async function getPublicMenu(
  key: string,
  region?: string,
): Promise<PublicMenu | null> {
  const url = `${API_BASE}/api/v1/public/menus/${encodeURIComponent(key)}${
    region ? `?region=${encodeURIComponent(region)}` : ""
  }`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as PublicMenu;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Public menu fetch error for key '${key}':`, err);
    return null;
  }
}

export interface PublicThemePayload {
  app: string;
  themeId: string;
  name: string;
  slug: string;
  schemaVersion: number;
  config: unknown;
  source: string;
  isDefault: boolean;
}

export async function getPublicTheme(
  app: "website" | "admin" = "website",
): Promise<PublicThemePayload | null> {
  const url = `${API_BASE}/api/v1/public/theme?app=${app}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicThemePayload;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Public theme fetch error:", err);
    return null;
  }
}
