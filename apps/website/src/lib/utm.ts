/**
 * UTM & Campaign Tracking Utility for Nexora Website
 * Automatically extracts UTM parameters and referrer from the landing URL
 * and caches them in sessionStorage so all downstream form submissions carry full attribution.
 */

export interface StoredUtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrerUrl?: string;
  landingPageUrl?: string;
}

const STORAGE_KEY = "nexora_utm_attribution";

/**
 * Captures UTM parameters from current window URL and document.referrer
 * Call this once on page load (e.g. in layout or form components).
 */
export function captureUtmParameters(): StoredUtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hasUtm =
      urlParams.has("utm_source") ||
      urlParams.has("utm_medium") ||
      urlParams.has("utm_campaign") ||
      urlParams.has("utm_term") ||
      urlParams.has("utm_content");

    // Retrieve existing UTMs if already saved in this session
    const existingRaw = sessionStorage.getItem(STORAGE_KEY);
    let existing: StoredUtmParams = existingRaw ? JSON.parse(existingRaw) : {};

    // If new UTMs are present in the current URL, override/update
    if (hasUtm) {
      existing = {
        ...existing,
        utmSource: urlParams.get("utm_source") || existing.utmSource,
        utmMedium: urlParams.get("utm_medium") || existing.utmMedium,
        utmCampaign: urlParams.get("utm_campaign") || existing.utmCampaign,
        utmTerm: urlParams.get("utm_term") || existing.utmTerm,
        utmContent: urlParams.get("utm_content") || existing.utmContent,
      };
    }

    // Capture referrer if available and not from current host
    if (document.referrer && !existing.referrerUrl) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.host !== window.location.host) {
          existing.referrerUrl = document.referrer;
        }
      } catch {
        existing.referrerUrl = document.referrer;
      }
    }

    // Capture initial landing page URL
    if (!existing.landingPageUrl) {
      existing.landingPageUrl = window.location.href;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return existing;
  } catch {
    return null;
  }
}

/**
 * Returns currently stored UTM parameters for inclusion in form payloads
 */
export function getStoredUtmParameters(): StoredUtmParams {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback: capture now if not yet saved
    return captureUtmParameters() || {};
  } catch {
    return {};
  }
}
