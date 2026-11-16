import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { BlockRenderer } from "./BlockRenderer";
import type { CmsBlock } from "../../lib/cms";

describe("BlockRenderer", () => {
  it("safely skips unknown block types without throwing an error", () => {
    const blocks: CmsBlock[] = [
      {
        id: "b-unknown",
        type: "NonExistentBlockType_X99",
        schemaVersion: 1,
        settings: {},
        content: {},
        enabled: true,
      },
    ];

    expect(() => {
      const html = renderToString(<BlockRenderer blocks={blocks} />);
      expect(html).not.toContain("NonExistentBlockType");
    }).not.toThrow();
  });

  it("skips blocks where enabled is false", () => {
    const blocks: CmsBlock[] = [
      {
        id: "b-disabled",
        type: "Hero",
        schemaVersion: 1,
        settings: {},
        content: { headline: "Secret Unpublished Headline" },
        enabled: false,
      },
    ];

    const html = renderToString(<BlockRenderer blocks={blocks} />);
    expect(html).not.toContain("Secret Unpublished Headline");
  });

  it("filters blocks based on userRegion", () => {
    const blocks: CmsBlock[] = [
      {
        id: "b-us-only",
        type: "Hero",
        schemaVersion: 1,
        settings: {},
        content: { headline: "US Exclusive Promotion" },
        enabled: true,
        regionFilter: ["us"],
      },
      {
        id: "b-all",
        type: "Hero",
        schemaVersion: 1,
        settings: {},
        content: { headline: "Global Headline For Everyone" },
        enabled: true,
        regionFilter: null,
      },
    ];

    // Case 1: Indian user should not see US Exclusive Promotion
    const htmlIn = renderToString(
      <BlockRenderer blocks={blocks} userRegion="in" />,
    );
    expect(htmlIn).not.toContain("US Exclusive Promotion");
    expect(htmlIn).toContain("Global Headline For Everyone");

    // Case 2: US user should see US Exclusive Promotion
    const htmlUs = renderToString(
      <BlockRenderer blocks={blocks} userRegion="us" />,
    );
    expect(htmlUs).toContain("US Exclusive Promotion");
    expect(htmlUs).toContain("Global Headline For Everyone");
  });

  it("renders registered blocks with accurate content", () => {
    const blocks: CmsBlock[] = [
      {
        id: "b-hero",
        type: "Hero",
        schemaVersion: 1,
        settings: { theme: "light" },
        content: {
          headline: "Nexora Growth Platform",
          subheadline: "Attribution and Automation",
        },
        enabled: true,
      },
      {
        id: "b-stats",
        type: "Stats",
        schemaVersion: 1,
        settings: {},
        content: {
          metrics: [{ value: "99.9%", label: "Uptime SLA" }],
        },
        enabled: true,
      },
    ];

    const html = renderToString(<BlockRenderer blocks={blocks} />);
    expect(html).toContain("Nexora Growth Platform");
    expect(html).toContain("Attribution and Automation");
    expect(html).toContain("99.9%");
    expect(html).toContain("Uptime SLA");
  });

  it("renders new growth blocks: ComparisonTable, RoiCalculator, ProcessSteps, and BookingEmbed", () => {
    const blocks: CmsBlock[] = [
      {
        id: "b-comparison",
        type: "ComparisonTable",
        schemaVersion: 1,
        settings: {},
        content: {
          sectionTitle: "Enterprise Platform Benchmark",
          rows: [
            {
              feature: "Attribution Engine",
              nexora: "Deterministic ML",
              agency: "Spreadsheets",
              freelancer: "Basic GA4",
            },
          ],
        },
        enabled: true,
      },
      {
        id: "b-roi",
        type: "RoiCalculator",
        schemaVersion: 1,
        settings: {},
        content: {
          sectionTitle: "Growth ROI Modeling Tool",
          defaultSpend: 10000,
        },
        enabled: true,
      },
      {
        id: "b-process",
        type: "ProcessSteps",
        schemaVersion: 1,
        settings: {},
        content: {
          sectionTitle: "4-Phase Execution Framework",
        },
        enabled: true,
      },
      {
        id: "b-booking",
        type: "BookingEmbed",
        schemaVersion: 1,
        settings: {},
        content: {
          sectionTitle: "Book Executive Briefing",
        },
        enabled: true,
      },
      {
        id: "b-logostrip",
        type: "LogoStrip",
        schemaVersion: 1,
        settings: {},
        content: {
          title: "Trusted Partners Across Industry Sectors",
        },
        enabled: true,
      },
      {
        id: "b-bentogrid",
        type: "BentoGrid",
        schemaVersion: 1,
        settings: {},
        content: {
          sectionTitle: "Bento Performance Grid Architecture",
        },
        enabled: true,
      },
    ];

    const html = renderToString(<BlockRenderer blocks={blocks} />);
    expect(html).toContain("Enterprise Platform Benchmark");
    expect(html).toContain("Attribution Engine");
    expect(html).toContain("Growth ROI Modeling Tool");
    expect(html).toContain("4-Phase Execution Framework");
    expect(html).toContain("Book Executive Briefing");
    expect(html).toContain("Trusted Partners Across Industry Sectors");
    expect(html).toContain("Bento Performance Grid Architecture");
  });

  it("renders customizable Hero banner image across split, bottom banner, and background layouts", () => {
    // 1. Right Split Hero with custom banner image
    const splitBlock: CmsBlock = {
      id: "hero-split",
      type: "Hero",
      schemaVersion: 1,
      settings: {},
      content: {
        headline: "Split Hero Headline",
        imageUrl: "https://images.unsplash.com/custom-split-banner.jpg",
        imageAlt: "Custom Split Banner Alt",
        imagePosition: "right",
        imageBadge: "Live System 2.4",
      },
      enabled: true,
    };
    const htmlSplit = renderToString(
      <BlockRenderer blocks={[splitBlock]} />,
    );
    expect(htmlSplit).toContain("Split Hero Headline");
    expect(htmlSplit).toContain("https://images.unsplash.com/custom-split-banner.jpg");
    expect(htmlSplit).toContain("Custom Split Banner Alt");
    expect(htmlSplit).toContain("Live System 2.4");

    // 2. Wide Bottom Banner Hero with custom banner image
    const bottomBlock: CmsBlock = {
      id: "hero-bottom",
      type: "Hero",
      schemaVersion: 1,
      settings: {},
      content: {
        headline: "Wide Banner Headline",
        imageUrl: "https://images.unsplash.com/custom-bottom-banner.jpg",
        imageAlt: "Wide Showcase Mockup",
        imagePosition: "bottom",
      },
      enabled: true,
    };
    const htmlBottom = renderToString(
      <BlockRenderer blocks={[bottomBlock]} />,
    );
    expect(htmlBottom).toContain("Wide Banner Headline");
    expect(htmlBottom).toContain("https://images.unsplash.com/custom-bottom-banner.jpg");
    expect(htmlBottom).toContain("Wide Showcase Mockup");

    // 3. Background Overlay Hero with custom banner image
    const bgBlock: CmsBlock = {
      id: "hero-bg",
      type: "Hero",
      schemaVersion: 1,
      settings: {},
      content: {
        headline: "Background Hero Headline",
        imageUrl: "https://images.unsplash.com/custom-bg-banner.jpg",
        imageAlt: "Background Ambient Banner",
        imagePosition: "background",
      },
      enabled: true,
    };
    const htmlBg = renderToString(
      <BlockRenderer blocks={[bgBlock]} />,
    );
    expect(htmlBg).toContain("Background Hero Headline");
    expect(htmlBg).toContain("https://images.unsplash.com/custom-bg-banner.jpg");
  });

  it("renders Hero multi-slide slider/carousel mode with controls and slides", () => {
    const sliderBlock: CmsBlock = {
      id: "hero-carousel",
      type: "Hero",
      schemaVersion: 1,
      settings: {},
      content: {
        isSlider: true,
        slides: [
          {
            id: "s1",
            eyebrow: "Pillar 1 • Growth",
            headline: "First Slide Growth Headline",
            subheadline: "First Slide Subheadline",
            imageUrl: "https://images.unsplash.com/slide-1.jpg",
            imageAlt: "Slide 1 Alt",
            imagePosition: "right",
          },
          {
            id: "s2",
            eyebrow: "Pillar 2 • Tech",
            headline: "Second Slide Tech Headline",
            subheadline: "Second Slide Subheadline",
            imageUrl: "https://images.unsplash.com/slide-2.jpg",
            imageAlt: "Slide 2 Alt",
            imagePosition: "right",
          },
        ],
      },
      enabled: true,
    };

    const htmlSlider = renderToString(
      <BlockRenderer blocks={[sliderBlock]} />,
    );
    expect(htmlSlider).toContain("First Slide Growth Headline");
    expect(htmlSlider).toContain("https://images.unsplash.com/slide-1.jpg");
    // Verify slide counter rendering
    expect(htmlSlider).toContain("01 / 02");
  });
});
