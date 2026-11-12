# WEBSITE AUDIT — NEXORA DIGITAL MARKETING PLATFORM (STEP W0)

## 1. Inventory of Routes & Components

### Existing Routes in `apps/website/src/app`

- `/` (`page.tsx`) — Dynamic CMS block renderer for slug `"home"`
- `/blog` (`blog/page.tsx`) — Blog listing page
- `/blog/[slug]` (`blog/[slug]/page.tsx`) — Blog post detail
- `/contact` (`contact/page.tsx`) — Contact page with FormDefinition
- `/preview` (`preview/page.tsx`) — Admin live preview token bridge
- `/[...slug]` (`[...slug]/page.tsx`) — Dynamic CMS fallback route (calls `notFound()` if slug does not exist in DB)
- `/robots.ts` & `/sitemap.ts` — Dynamic SEO generators

### Existing Layout & UI Components

- `src/components/layout/Header.tsx` — Sticky header with flat menu and basic mobile sheet
- `src/components/layout/Footer.tsx` — 5-column footer with static capability links
- `src/components/layout/CookieBanner.tsx` — Basic cookie consent banner
- `src/components/RegionSwitcher.tsx` — Region dropdown switcher
- `src/components/forms/ContactForm.tsx` — Dynamic form renderer
- `src/components/blocks/`:
  - `HeroBlock.tsx`
  - `StatsBlock.tsx`
  - `FeatureGridBlock.tsx`
  - `CtaBlock.tsx`
  - `FaqBlock.tsx`
  - `ProcessSteps.tsx`
  - `ComparisonTable.tsx`
  - `RoiCalculator.tsx`
  - `BookingEmbed.tsx`
  - `TestimonialsBlock.tsx`
  - `RichTextBlock.tsx`

---

## 2. Link Crawl & Route Audit Matrix

Run from `apps/website/scripts/check-links.mjs`:

| URL                                  | Status        | Source / Requirement | Root Cause & Severity                   |
| ------------------------------------ | ------------- | -------------------- | --------------------------------------- |
| `/`                                  | 200 OK        | Header Logo / Home   | N/A                                     |
| `/solutions`                         | 200 OK        | Header Nav           | Seeded CMS page                         |
| `/case-studies`                      | 200 OK        | Header Nav           | Seeded CMS page                         |
| `/about`                             | 200 OK        | Header Nav           | Seeded CMS page                         |
| `/blog`                              | 200 OK        | Header Nav           | Dedicated Next.js Route                 |
| `/contact`                           | 200 OK        | Header Nav & CTA     | Dedicated Next.js Route                 |
| `/pricing`                           | 200 OK        | Seeded CMS           | Seeded CMS page                         |
| `/services`                          | 404 NOT FOUND | W3 Master Prompt     | High: Missing listing route & CMS seed  |
| `/services/seo`                      | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/content-marketing`        | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/social-media-marketing`   | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/paid-ads`                 | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/email-marketing`          | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/whatsapp-marketing`       | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/web-design-development`   | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/cro`                      | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/analytics-reporting`      | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/branding-creative`        | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/influencer-marketing`     | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/services/marketing-automation-crm` | 404 NOT FOUND | Services Mega-Menu   | High: Missing seed & route              |
| `/industries`                        | 404 NOT FOUND | W3 Master Prompt     | High: Missing listing route & CMS seed  |
| `/industries/saas`                   | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/ecommerce`              | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/real-estate`            | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/education`              | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/healthcare`             | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/local-business`         | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/professional-services`  | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/industries/hospitality`            | 404 NOT FOUND | Industries Menu      | High: Missing seed & route              |
| `/resources`                         | 404 NOT FOUND | W3 Master Prompt     | Medium: Missing resource hub            |
| `/tools/roi-calculator`              | 404 NOT FOUND | W3 Master Prompt     | Medium: Missing dedicated tool route    |
| `/book-a-call`                       | 404 NOT FOUND | W3 Master Prompt     | Medium: Missing dedicated booking route |
| `/privacy`                           | 404 NOT FOUND | Footer Nav           | Critical: Menu links to missing page    |
| `/terms`                             | 404 NOT FOUND | Footer Nav           | Critical: Menu links to missing page    |
| `/cookies`                           | 404 NOT FOUND | Footer Legal         | Critical: Menu links to missing page    |
| `/accessibility`                     | 404 NOT FOUND | Footer Legal         | Critical: Menu links to missing page    |
| `/trust`                             | 404 NOT FOUND | Footer Nav           | Critical: Menu links to missing page    |
| `/search`                            | 404 NOT FOUND | Global Search        | Medium: Missing search endpoint & page  |

**Summary:** 38 Links Audited — 7 OK (18.4%), 31 404 (81.6%).
**Root Cause:** When zero-404 hardcoded fallback was removed, the database seeder was not updated with the complete suite of digital marketing services, industries, legal pages, and resource hubs required for a full-scale agency platform.

---

## 3. UI, UX & Mobile Responsiveness Gaps

1. **Header Experience:**
   - Missing Mega-Menu: Navigation is flat. Digital marketing clients expect multi-column dropdowns for Services (with icons and 1-line descriptors), Industries, and Resources.
   - Missing Global Search (Cmd+K modal) for querying published pages, blog posts, and services.
   - Announcement bar is static in code instead of consuming `SiteSettings.AnnouncementBarJson`.

2. **Footer Experience:**
   - Legal links (`/privacy`, `/terms`, `/trust`, `/cookies`, `/accessibility`) are broken (404).
   - Missing re-open cookie preferences link.
   - Missing animated back-to-top button.
   - Newsletter signup is non-functional markup.

3. **Design Tokens & Rhythm:**
   - Light/Dark rhythm is inconsistent: sections look monotone dark instead of alternating (Light -> Alt -> Dark -> Gradient CTA).
   - Animation settings are not wired to `ThemeSettings` in DB.
   - Missing dev-only `/design-system` page displaying all primitives and tokens.

4. **Mobile Experience (<768px & <430px):**
   - Missing sticky bottom contact bar (Call / WhatsApp / Book) with safe-area padding.
   - Floating WhatsApp button missing.
   - Hamburger drawer lacks Radix focus lock and keyboard escape trapping.

5. **Block Ecosystem:**
   - Hero lacks interactive SVG visual (growth charts, floating metrics, attribution nodes).
   - Missing Logo marquee / trust strip.
   - Missing Bento Grid for services showcase.
   - Process steps lacks animated line-fill.
   - Missing exit-intent modal and dynamic lead magnet gates.

---

## 4. Execution Plan (W1 - W8)

- **W1:** Design System & Theme Engine (Tokens, CSS Variables, Radix primitives, `/design-system` dev route).
- **W2:** Global Layout Overhaul (Header Mega-Menu, Global Search Cmd+K, Dynamic Announcement Bar, Dark Footer, Mobile Drawer, Floating WhatsApp, Sticky Bottom Bar, Cookie Preferences Re-opener).
- **W3:** Seed CMS Pages & Zero-404 Resolution (12 Services, 8 Industries, Legal pages, Dedicated routes for `/services`, `/industries`, `/tools/roi-calculator`, `/book-a-call`, `/privacy`, `/terms`, `/cookies`, `/accessibility`, `/search`).
- **W4:** Premium Home & Block Library (Hero with SVG growth engine, Marquee, Bento Grid, Process with timeline, Case Studies Carousel, FAQ with JSON-LD, Final CTA with booking modal).
- **W5:** Mobile 100% Polish (360px - 1920px overflow guard, tap target >= 44px, safe area padding).
- **W6:** Performance, A11y, WCAG AA contrast check, Reduced Motion.
- **W7:** Admin Wiring (Theme editor preview, Menus editor, Collections management, Revalidate hook).
- **W8:** Automated Verification (Backend integration tests, Vitest, Link crawler 0 broken CI gate, screenshots).
