import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { MobileStickyBar } from "./MobileStickyBar";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { CookieBanner } from "./CookieBanner";

describe("Mobile and Accessibility Suite", () => {
  it("renders MobileStickyBar with tap targets and action links", () => {
    const html = renderToString(
      <MobileStickyBar
        supportPhone="+1 (800) 555-0199"
        bookingUrl="/book-a-call"
      />,
    );
    expect(html).toContain("tel:+18005550199");
    expect(html).toContain("wa.me/18005550199");
    expect(html).toContain("/book-a-call");
    expect(html).toContain("Call Now");
    expect(html).toContain("WhatsApp");
    expect(html).toContain("Book Call");
  });

  it("renders FloatingWhatsApp when phone number is supplied", () => {
    const html = renderToString(<FloatingWhatsApp phone="+91 98765 43210" />);
    expect(html).toContain("https://wa.me/919876543210");
    expect(html).toContain("Chat with us on WhatsApp");
    expect(html).toContain("Chat on WhatsApp");
  });

  it("safely handles CookieBanner SSR mounting without hydration mismatches", () => {
    // In server rendering environment, CookieBanner intentionally returns null
    // until client hydration checks localStorage consent status.
    const html = renderToString(<CookieBanner />);
    expect(html).toBe("");
  });
});
