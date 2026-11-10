/**
 * Nexora Platform - Multi-Country Configuration
 * All regions, cookies and locale resolutions are loaded from config, never hardcoded.
 */

export interface RegionDefinition {
  code: string;
  name: string;
  defaultLocale: string;
  currency: string;
  flag: string;
}

export const REGION_CONFIG = {
  cookieName: process.env.NEXT_PUBLIC_REGION_COOKIE_NAME || "nexora_region",
  defaultRegion: process.env.NEXT_PUBLIC_DEFAULT_REGION || "IN",
  urlStrategy: (process.env.NEXT_PUBLIC_URL_STRATEGY || "cookie") as
    "cookie" | "subpath",
  supportedRegions: {
    IN: {
      code: "IN",
      name: "India",
      defaultLocale: "en-IN",
      currency: "INR",
      flag: "🇮🇳",
    },
    US: {
      code: "US",
      name: "United States",
      defaultLocale: "en-US",
      currency: "USD",
      flag: "🇺🇸",
    },
  } as Record<string, RegionDefinition>,
} as const;

export type SupportedRegionCode = keyof typeof REGION_CONFIG.supportedRegions;

export function resolveRegion(code?: string | null): RegionDefinition {
  if (code && code.toUpperCase() in REGION_CONFIG.supportedRegions) {
    return REGION_CONFIG.supportedRegions[code.toUpperCase()]!;
  }
  return REGION_CONFIG.supportedRegions[REGION_CONFIG.defaultRegion]!;
}
