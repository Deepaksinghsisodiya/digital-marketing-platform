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
});
