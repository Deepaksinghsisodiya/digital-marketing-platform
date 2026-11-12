import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardTitle, CardContent } from "./card";

describe("UI Primitives Suite", () => {
  it("renders Button with variant styles and accessibility attributes", () => {
    const html = renderToString(
      <Button variant="gradient" size="lg">
        Get Free Diagnostic
      </Button>,
    );
    expect(html).toContain("Get Free Diagnostic");
    expect(html).toContain("bg-gradient-to-r");
    expect(html).toContain("h-13");
  });

  it("renders Badge with custom variants", () => {
    const html = renderToString(<Badge variant="sample">Sample Data</Badge>);
    expect(html).toContain("Sample Data");
    expect(html).toContain("border-dashed");
  });

  it("renders Card container with title and content", () => {
    const html = renderToString(
      <Card>
        <CardTitle>SEO Performance</CardTitle>
        <CardContent>Commercial Intent</CardContent>
      </Card>,
    );
    expect(html).toContain("SEO Performance");
    expect(html).toContain("Commercial Intent");
    expect(html).toContain("rounded-2xl");
  });
});
