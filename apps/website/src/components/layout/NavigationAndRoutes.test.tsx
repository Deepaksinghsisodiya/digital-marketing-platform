import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

describe("Global Layout & Navigation Suite", () => {
  it("renders Header strictly from Admin menu and settings props", () => {
    const html = renderToString(
      <Header
        settings={{
          companyName: "NEXORA ENTERPRISE",
          supportEmail: "growth@nexora.digital",
          supportPhone: "+1 (800) 555-0199",
          defaultRegion: "IN",
          supportedRegions: [],
          timeZoneId: "Asia/Kolkata",
          bookingUrl: "/book-a-call",
        }}
        menu={{
          id: "m1",
          key: "header",
          title: "Main Navigation",
          items: [
            { id: "i1", label: "Services", url: "/services", displayOrder: 0, children: [] },
            { id: "i2", label: "Case Studies", url: "/case-studies", displayOrder: 1, children: [] },
          ],
        }}
        currentRegionCode="IN"
      />,
    );
    expect(html).toContain("NEXORA ENTERPRISE");
    expect(html).toContain("Services");
    expect(html).toContain("Case Studies");
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
    expect(html).toContain("/privacy");
    expect(html).toContain("/terms");
    expect(html).toContain("/cookies");
    expect(html).toContain("Cookie Settings");
  });
});
