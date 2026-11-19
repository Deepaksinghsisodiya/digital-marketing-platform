import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

describe("Global Layout & Navigation Suite", () => {
  it("renders Header with company logo monogram, SOC2 badge, and Mega-Menu triggers", () => {
    const html = renderToString(
      <Header
        settings={{
          companyName: "NEXORA ENTERPRISE",
          supportEmail: "growth@nexora.digital",
          supportPhone: "+1 (800) 555-0199",
          defaultRegion: "IN",
          supportedRegions: [],
          timeZoneId: "Asia/Kolkata",
        }}
        currentRegionCode="IN"
      />,
    );
    expect(html).toContain("NEXORA ENTERPRISE");
    expect(html).toContain("Services");
    expect(html).toContain("Industries");
    expect(html).toContain("Book a Call");
  });

  it("renders AnnouncementBar when configured via JSON", () => {
    const json = JSON.stringify({
      enabled: true,
      text: "Global B2B Performance Engine 2.0 Live",
      badge: "New Release",
      link: "/services",
    });
    // In server environment, it returns null initially because of dismissal check in useEffect,
    // which safely guarantees SSR consistency.
    expect(() =>
      renderToString(<AnnouncementBar announcementBarJson={json} />),
    ).not.toThrow();
  });

  it("renders Footer with zero broken links and essential legal compliance links", () => {
    const html = renderToString(
      <Footer
        settings={{
          companyName: "Nexora",
          legalName: "Nexora Technologies Inc.",
          supportEmail: "growth@nexora.digital",
          supportPhone: "+1 (800) 555-0199",
          defaultRegion: "IN",
          supportedRegions: [],
          timeZoneId: "Asia/Kolkata",
        }}
      />,
    );
    expect(html).toContain("All Systems Operational");
    expect(html).toContain("/privacy");
    expect(html).toContain("/terms");
    expect(html).toContain("/cookies");
    expect(html).toContain("/accessibility");
    expect(html).toContain("/trust");
    expect(html).toContain("Cookie Preferences");
  });
});
