import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { BreadcrumbJsonLd, ServiceJsonLd, LocalBusinessJsonLd } from "./StructuredData";

describe("StructuredData JSON-LD", () => {
  it("renders BreadcrumbList, Service, and LocalBusiness schemas", () => {
    const html = renderToString(
      <>
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: "https://nexora.digital" },
            { name: "Services", url: "https://nexora.digital/services" },
          ]}
        />
        <ServiceJsonLd
          name="Enterprise SEO"
          description="Technical SEO and pipeline growth"
          url="https://nexora.digital/services/seo"
          category="Digital Growth"
        />
        <LocalBusinessJsonLd
          name="Nexora Digital"
          url="https://nexora.digital"
          email="support@nexora.digital"
        />
      </>,
    );

    expect(html).toContain("BreadcrumbList");
    expect(html).toContain("Service");
    expect(html).toContain("Enterprise SEO");
    expect(html).toContain("LocalBusiness");
  });
});
