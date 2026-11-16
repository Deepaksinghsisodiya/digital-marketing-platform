# 11 — CMS CONFIGURATION & BLOCK RENDERER SPECIFICATION

**Document:** Headless CMS Schema, Block Types & Dynamic Rendering  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Content Management System Architecture  
**Target Markets:** India (IN) & United States (US)  

---

## 1. CMS Block Ecosystem & Data Contract

Nexora's headless CMS stores pages as structured JSON blocks inside the `Pages` table (`BlocksJson`).

Each block implements the `CmsBlock` contract:
```typescript
export interface CmsBlock {
  id: string;
  type: string;
  schemaVersion: number;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
  enabled: boolean;
  regionFilter?: string[] | null;
}
```

---

## 2. Supported Block Types in `BlockRenderer.tsx`

| Block Type | Component | Purpose & Configurable Content |
|---|---|---|
| `hero` | `HeroBlock.tsx` | Eyebrow, headline, subheadline, primary CTA, secondary CTA, visual style (abstract SVG / growth graphic). |
| `stats` | `StatsBlock.tsx` | 3–4 high-impact numerical statistics with metric labels and contextual notes. |
| `featureGrid` | `FeatureGridBlock.tsx` | Grid of 3–12 features/services with icons, headings, descriptions, and links. |
| `logoStrip` | `LogoStripBlock.tsx` | Infinite horizontal scrolling marquee of verified technologies and framework badges. |
| `process` | `ProcessSteps.tsx` | 4-step execution timeline (*Discover, Strategize, Execute, Optimize*). |
| `testimonials` | `TestimonialsBlock.tsx` | Client quote cards with author name, designation, company, and avatar. |
| `faq` | `FaqBlock.tsx` | Collapsible Q&A accordion with automatic `FAQPage` JSON-LD schema injection. |
| `cta` | `CtaBlock.tsx` | Closing high-contrast conversion block with headline, description, and primary button. |
| `comparison` | `ComparisonTable.tsx` | Feature-by-feature matrix comparing Nexora with generic agencies or in-house hiring. |
| `roiCalculator` | `RoiCalculator.tsx` | Interactive slider tool estimating marketing pipeline or development cost savings. |
| `bookingEmbed` | `BookingEmbed.tsx` | Cal.com / Calendly calendar scheduling iframe with timezone detection. |
| `richText` | `RichTextBlock.tsx` | Long-form markdown or HTML prose for editorial guidelines and legal policies. |

---

## 3. Cache Invalidation & On-Demand Revalidation

Whenever a page is saved or published in the Admin CMS, the backend sends a secure POST request to the website frontend:
```
POST https://nexora.com/api/revalidate?secret={REVALIDATION_SECRET}&slug={SLUG}
```
The Next.js App Router calls `revalidatePath(slug)` to clear stale cache and ensure visitors immediately see updated copy without rebuilding the entire application.
