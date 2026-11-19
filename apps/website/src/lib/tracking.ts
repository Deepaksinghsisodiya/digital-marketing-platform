/**
 * Nexora Unified Tracking & DataLayer Bridge
 * Dispatches consent-gated analytics & marketing events to GTM, GA4, and Meta Pixel.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function hasTrackingConsent(category: "analytics" | "marketing" = "analytics"): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("nexora_cookie_consent");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed[category]);
  } catch {
    return false;
  }
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  // Push to GTM dataLayer if consent given
  if (hasTrackingConsent("analytics")) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...params,
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  }

  // Push to Meta Pixel if marketing consent given
  if (hasTrackingConsent("marketing") && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params);
  }
}

export function trackFormSubmit(formName: string, leadReference?: string): void {
  trackEvent("form_submission", {
    form_name: formName,
    lead_reference: leadReference,
  });
}

export function trackCtaClick(label: string, url: string, location?: string): void {
  trackEvent("cta_click", {
    cta_label: label,
    cta_url: url,
    section_location: location,
  });
}

export function trackPhoneClick(phone: string): void {
  trackEvent("phone_contact_click", {
    phone_number: phone,
  });
}

export function trackWhatsAppClick(source: string = "floating_widget"): void {
  trackEvent("whatsapp_click", {
    source,
  });
}
