# NEXORA — WEBSITE MASTER PROMPT (ek hi file, sab kuch)

> Ye file **self-contained** hai. Isi ko Antigravity mein paste karo ya repo root mein rakh ke bolo: "Is poori file ko padho aur step by step execute karo."
> Ye `NEXORA_WEBSITE_UI_OVERHAUL.md` aur `NEXORA_WEBSITE_WOW_ADDENDUM.md` ko replace karti hai (unki saari cheezein yahan merge hain, plus missing gaps). Owner bahar hai, koi sawal nahi poochhna, apne best decision lo aur `docs/overnight/DECISIONS.md` mein likho.

---

## 0. MISSION

Nexora ki public website ko **world-class digital marketing agency website** banao: dekhte hi premium, fast, mobile par perfect, aur **100% CMS/admin se dynamic, configurable aur customizable**. Static ya hardcoded kuch nahi. Koi page 404 nahi (jo menu mein hai). Digital marketing ke liye jo bhi sections/features chahiye, sab.

**Dynamic ka rule:** website ka har dikhne wala hissa (text, images, sections ka order/visibility, menus, theme colors/fonts, animations ki setting, forms, SEO, popups, banners, collections, tracking IDs, contact details, legal pages, 404 text) **admin se DB mein** badle. React code mein sirf layout, block components aur UI chrome strings (Submit, Close, aria labels) rahenge.

---

## 1. NIYAM (autonomy, safety, evidence)

**Allowed:** bina poochhe aage badhna; local git commits (har step ke gate ke baad); migrations (generated SQL `docs/overnight/migrations-review/` mein save, sirf `nexora_dev`/`nexora_test` par apply); `nexora_dev` drop/recreate/reseed; naye **free** packages (license verify, `docs/overnight/LICENSES.md` mein exact version); purani UI ko poora rewrite.

**NEVER:** `git push`/remote/history rewrite; production/DigitalOcean/DNS kaam; secrets/personal email print ya commit (report mein masked); PostgreSQL ya purane DB ko chhoona; paid service/library/account; copyrighted images/logos/competitor ka text ya design copy; fake client/logo/award/stat ko **asli** dikhana (sab "Sample" mark); test delete/skip/weaken; bina raw proof ke "done"; scope se bahar (multi-tenant, client portal, WhatsApp API, social publishing, automation builder, AI chatbot, Redis, SignalR).

**Evidence:** test count kabhi kam nahi hoga; har naya feature ka real test; har step ke baad `dotnet test --logger "console;verbosity=normal" > docs/overnight/logs/test-<step>.txt` aur `Total tests:` lines; screenshots `docs/overnight/screens/`; 3 koshish mein fail ho to `BLOCKERS.md` mein likho, feature hide karo, aage badho. Half-broken UI kabhi nahi chhodna.

**Locked tech:** single-tenant, Clean Architecture, SQL Server (`nexora_dev`/`nexora_test`, test DB `_test` guard), cookie auth + CSRF, RBAC explicit allowlists (naye permission add karo to matrix update), ports API 5201 / Website 3000 / Admin 5173 / Mailpit 1025+8025, pnpm.

---

## 2. STEP W0 — AUDIT (pehle, code se pehle)

1. `apps/website` ke saare routes/components ki inventory -> `docs/overnight/WEBSITE_AUDIT.md`.
2. **Link-crawl script** (`apps/website/scripts/check-links.mjs` ya Playwright): header, footer, home, har block ke saare internal links fetch karo -> table `URL | status | kahan se link`. 404/500 list.
3. Menus vs seeded pages ka diff. **404 ka root cause:** zero-404 fix ke baad hardcoded fallback hata, par menu/footer links ke pages/collection items seed hi nahi hue.
4. Mobile screenshots 360x640, 390x844, 430x932 (har page) `screens/before/`. Overflow, overlap, chhote tap targets, kata text list karo.
5. UI audit (spacing, alignment, typography, contrast, empty sections).
6. Output: gap list severity ke saath, phir **W1 se code**.

---

## 3. STEP W1 — DESIGN SYSTEM + THEME (DB se, admin editable)

**Tokens (CSS variables, `<html>` par inject, DB `ThemeSettings` se):**
primary/secondary/accent, background, surface, surface-alt, text, text-muted, border, success/warning/danger, ring; radius scale, shadow scale, container width, section spacing, heading/body font, button style (solid/gradient/outline), hero gradient stops, dark-section colors, **animation settings** (Sec 7).

**Default theme (seed, editable):**

- Primary indigo `#4F46E5` -> violet `#7C3AED` gradient; accent cyan `#06B6D4`, emerald `#10B981`, amber `#F59E0B` (kam use).
- Dark sections `#0B1020` / cards `#111833`; light `#FFFFFF`, alt `#F6F7FB`, text `#0F172A`, muted `#475569`, border `#E2E8F0`.
- Text **WCAG AA** (4.5:1). Admin theme save par contrast warning.
- Section rhythm: light -> alt -> **dark** -> light -> gradient CTA (monotone nahi).

**Fonts:** `next/font` se self-hosted OFL; admin allowlist dropdown (Plus Jakarta Sans, Inter, DM Sans, Manrope, Sora, Space Grotesk, Outfit). Heading 700/800 tight tracking, body 400/500/600. Eyebrow labels uppercase 12px.

**Type/spacing:** fluid `clamp()` (H1 mobile 32-36px, desktop 56-64px; body 16-18px), max text width ~65ch, 4/8px grid, section padding `clamp(56px, 8vw, 112px)`, container 1200-1280px, mobile side padding 16-20px.

**Shape/depth:** radius 14-20px cards, pill buttons, layered soft shadows, 1px borders, gradient mesh/dot-grid hero background, glass cards on dark.

**Icons:** `lucide-react`; icon name block settings mein (allowlisted set), admin dropdown.

**Primitives (shadcn/ui + Radix, apne folder mein):** Button, Card, Badge, Accordion, Tabs, Dialog/Drawer/Sheet, NavigationMenu, Tooltip, Input/Textarea/Select/Checkbox, Skeleton, Marquee, Counter, Carousel (embla), Toast.

**Libraries (free):** `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` (accordion, tabs, dialog, navigation-menu, dropdown-menu), `embla-carousel-react`, `framer-motion` (optional), `@tailwindcss/typography`, `sharp`, Playwright. **Avoid:** paid UI kits, unlicensed assets, jQuery sliders, heavy chart libs (SVG/CSS khud).

`/design-system` dev-only page (production mein 404): sab primitives + tokens.

---

## 4. STEP W2 — GLOBAL LAYOUT (mobile-first, sab admin-config)

- **Announcement bar:** on/off, text, link, dismissible (cookie), schedule start/end.
- **Header:** logo (admin upload/text), mega-menu Services (icons + descriptions, DB menu), Industries, Case Studies, Pricing, Resources, region switcher (IN/US), primary CTA. Sticky, scroll par blur+shadow. **Mobile (<1024px):** compact sticky bar, hamburger -> full-height drawer (Radix Dialog, focus trap, ESC, scroll lock), accordion sub-menus, CTA, region switcher. Tap >= 44px.
- **Footer (dark):** brand + description, 4 link columns (menu DB), newsletter form, region-aware contact, social icons, legal links, back-to-top. Mobile par accordion/stack.
- **Mobile sticky bottom bar** (admin toggle): Call / WhatsApp / Book, safe-area padding.
- **Floating WhatsApp button** (admin number), **cookie consent banner** (admin text, categories: necessary/analytics/marketing, consent store), **back-to-top**.
- **Global search** (header icon/Cmd+K): backend `GET /api/v1/public/search?q=` (published pages, services, blog, case studies), debounce, keyboard nav, empty/no-result states.
- **Breadcrumbs** inner pages par (BreadcrumbList JSON-LD).
- **Menus** DB se; link tabhi dikhao jab target published ho (ya external URL).
- **Maintenance mode** (admin toggle, branded page 503, admin preview bypass).
- **Popups/banners engine** (admin): types (exit-intent desktop only, timed, scroll-triggered), page targeting, frequency cap (cookie), consent-aware, mobile par intrusive nahi (full-screen interstitial nahi), close easy, a11y. Default **off**.

---

## 5. STEP W3 — PAGES, COLLECTIONS, SERVICES (404 khatam)

Har route ka **seed CMS page/collection item** (idempotent seeder, "Sample content" mark), aur menu mein sahi link. Menu mein jo hai wo 200 de.

**Collections (admin CRUD + public read published only):** Services, Industries, Case Studies, Testimonials, Team, FAQs, Pricing Plans, Blog Posts (categories, tags, authors), Resources (guides), Jobs (optional), Logos (trust strip), Stats.

**Seed services (12, Sample copy, icon, benefits, process, deliverables, FAQs):** SEO, Content Marketing, Social Media Marketing, Paid Ads (Google/Meta PPC), Email Marketing, WhatsApp Marketing, Web Design & Development, CRO, Analytics & Reporting, Branding & Creative, Influencer Marketing, Marketing Automation & CRM.

**Routes:**
`/`, `/services`, `/services/[slug]`, `/industries`, `/industries/[slug]` (SaaS, E-commerce, Real estate, Education, Healthcare, Local business, Professional services, Hospitality), `/case-studies`, `/case-studies/[slug]`, `/pricing`, `/about`, `/team` (about mein section), `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/resources`, `/resources/[slug]` (gated form), `/tools/roi-calculator`, `/contact`, `/book-a-call`, `/careers` (optional), `/privacy`, `/terms`, `/cookies`, `/accessibility`, `/lp/[slug]` (landing template: no nav/footer, single CTA), `/thank-you/[form]`, `/search`, branded **404/500/503**, `sitemap.xml`, `robots.txt`, `rss.xml`, `manifest.webmanifest`, favicon/apple-touch-icon (admin upload).

**Backend/admin:** jo collection endpoints/screens abhi nahi hain unhe banao: permission explicit allowlist, concurrency (rowversion), audit, tests. Public read DTOs mein internal fields leak nahi.

---

## 6. STEP W4 — HOME + BLOCK LIBRARY (digital marketing standard)

**Home sections (blocks, order/visibility admin se):**

1. Hero (outcome headline with gradient keyword, subhead, 2 CTAs, trust line **Sample**, hero visual SVG "growth dashboard": floating chart/leads/conversion/ROI cards; mobile par visual chhota, CTAs full-width).
2. Trust strip (logo marquee, "Sample logo" placeholders, admin upload).
3. Services bento grid (icons, hover lift/glow, "Learn more ->").
4. Why us (3-4 differentiators).
5. Process (5 steps; desktop horizontal timeline with line-fill, mobile vertical).
6. Results (dark, animated counters + sparklines, **Sample** badge + disclaimer).
7. Case studies (cards; mobile embla swipe).
8. Industries chips.
9. Testimonials (embla, quote, avatar initials, stars, **Sample**).
10. Tools/tech strip (generic icons, no brand logos copy).
11. Pricing teaser (3 plans).
12. FAQ (accordion + FAQPage JSON-LD).
13. Blog latest.
14. Lead magnet/newsletter.
15. Final CTA (gradient) + **booking embed** (Cal.com/Calendly URL allowlist).

**Block library (code-defined, JSON-schema validated, har block ka mobile layout):** Hero (3 variants), LogoStrip, FeatureGrid, BentoGrid, ServiceCards, ProcessSteps, Stats/Counters, CaseStudyCards, Testimonials, Pricing, ComparisonTable, FAQ, CTA, Form, BookingEmbed, RoiCalculator, BlogFeed, TeamGrid, Timeline, RichText, Tabs, Banner, VideoEmbed (YouTube-nocookie/Vimeo allowlist, lazy facade), Gallery, BeforeAfter, Divider/Spacer, SocialProofBar (rating badge Sample), TrustBadges, ContactCards, MapPlaceholder (no API key), NewsletterCard, Countdown (landing). Har block settings: background variant (token), spacing, alignment, anchor id, visibility (device-wise: desktop/mobile), **animation preset**.

**Reusable sections:** admin "save as reusable section" (Gutenberg patterns jaisa) aur kisi page mein insert.

---

## 7. ANIMATION SYSTEM (admin configurable, premium, safe)

**Library:** CSS transitions + IntersectionObserver default; `framer-motion` sirf jahan zaroori. Sab `transform/opacity` (60fps).

**Presets:** none, fade, fade-up, fade-in-left/right, scale-in, stagger-children, blur-in. **Global admin settings (`ThemeSettings.animation`):** enabled (master toggle), default preset, speed (fast/normal/slow), stagger delay, once/repeat, hover effects on/off, parallax on/off, marquee speed. **Per-block override** (block settings mein preset dropdown).

**Signature animations:** scroll reveal (fade-up 12-16px, 400-600ms), animated counters, hero floating cards (CSS keyframes), marquee (pause on hover), process line fill on scroll, card hover lift + border glow, button hover (lift, gradient shift, arrow nudge), nav underline slide, mega-menu fade/slide, accordion height, slider drag, skeleton shimmer, success-state checkmark in forms, page transition (light, optional).

**Rules:** `prefers-reduced-motion: reduce` par sab off (aur admin master toggle); animation LCP/CLS na bigade; mobile par heavy parallax/scroll-jack nahi; koi autoplay video sound ke saath nahi.

---

## 8. FEATURES (digital marketing website ke liye jo aksar miss hote hain, sab add karo)

**Conversion:** primary CTA har section mein, sticky mobile bar, exit-intent (desktop, off by default), lead magnets (gated resource -> lead), newsletter, booking embed, ROI calculator block (inputs/formula/labels/disclaimer admin se), pricing, comparison, FAQ objection handling, social proof (Sample), case-study results, trust badges (Sample), WhatsApp click-to-chat.
**Forms (DynamicFormRenderer, FormDefinitions):** fields/labels/validation messages/success/redirect/receivers admin se; Turnstile (env, Dev ke bahar fail-closed), honeypot, signed time-trap token, idempotency, UTM + referrer + landing page capture, consent checkbox (wording version store), region-aware (phone via libphonenumber-js, PIN/ZIP, state), multi-step form option, file upload **nahi** (abhi), success state animated, error a11y.
**Marketing tech:** GA4/GTM/Meta Pixel IDs admin Settings se, **consent ke baad hi load**; conversion events (form submit, CTA click, booking click, phone click, WhatsApp click); UTM cookie persist (30 din) -> lead attribution.
**SEO:** per-page title/description/canonical/OG/Twitter (admin), **dynamic OG image** (`next/og`, title + brand colors, admin template), `sitemap.xml` (published pages + collections), `robots.txt`, `rss.xml`, JSON-LD (Organization, WebSite+SearchAction, BreadcrumbList, Service, Article, FAQPage, LocalBusiness optional, Review sirf asli data ho to), `hreflang` ready (config flag), redirects engine (301/302 admin se, middleware), unknown slug = real 404, trailing-slash/canonical consistent.
**Content UX:** blog TOC, reading time, share buttons (no third-party scripts), related posts, author box, category/tag pages, pagination, newsletter inline, code/prose styling (`@tailwindcss/typography`).
**Trust/legal:** privacy/terms/cookies/accessibility pages (versioned, "legal review required"), cookie preferences re-open link in footer, DPDP/GDPR neutral wording (compliance claim nahi).
**Region (single URL nexora.com):** cookie `nexora_region` + Accept-Language, switcher, region-specific contact/currency/consent/phone fields, cache-safe (region parts request-time/client).
**Theme:** light default; optional dark-mode toggle (token se), system preference respect.
**Print/Share:** print CSS (legal/blog), social share meta.
**Error handling:** `error.tsx`, `not-found.tsx`, `loading.tsx` skeletons, API 5xx par branded error (404 nahi, cache nahi), image fallback.

---

## 9. STEP W5 — MOBILE 100% (non-negotiable)

Har page/block **360, 390, 430, 768, 1024, 1280, 1536, 1920** par:

- Horizontal scroll nahi (`scrollWidth <= innerWidth` automated).
- Tap targets >= 44x44, gap >= 8px; body text >= 16px; `text-wrap: balance` headings.
- `next/image` `sizes`, aspect-ratio reserve (CLS < 0.1); tables mobile par card/scroll container, comparison swipeable.
- Forms: `type=tel/email`, `autocomplete`, 16px input font (iOS zoom nahi), errors visible, keyboard overlap safe.
- Sticky header/bottom bar content ko na dhanke (`scroll-padding`), iOS safe-area, `100dvh`, hover-only interactions ka touch alternative.
- Drawer, accordion, slider swipe, dialogs touch par smooth.

---

## 10. STEP W6 — PERFORMANCE, A11Y, SECURITY

- Lighthouse mobile: Performance >= 85, Accessibility >= 95, SEO >= 95, Best Practices >= 90; LCP < 2.5s, CLS < 0.1. RSC default, client islands sirf interactive blocks; hero priority, baaki lazy; font swap; image AVIF/WebP; third-party scripts consent ke baad.
- A11y: landmarks, heading order, skip-to-content, focus-visible, aria (menu/accordion/dialog/carousel), alt text, AA contrast, reduced motion, keyboard-only walkthrough; `@axe-core/playwright` (dev-only) ya manual checklist.
- Security headers/CSP (frame-src sirf Cal.com/Calendly/YouTube-nocookie/Vimeo allowlist config se; `frame-ancestors` env se), no secrets in bundle, rich text sanitize, external links `rel="noopener noreferrer"`.

---

## 11. STEP W7 — ADMIN WIRING (sab kuch configurable)

Jo bhi website par dikhta hai wo admin se editable hona chahiye. Ye admin screens maujood hon (jo nahi hain banao):

- **Theme editor** (colors picker + contrast warning, fonts allowlist, radius, button style, hero gradient, animation settings, live preview, reset to default).
- **Menus editor** (header/footer/legal, nested, icons, mega-menu flag, broken-link warning).
- **Global sections** (announcement bar, footer text, cookie banner text, floating buttons, sticky bottom bar, maintenance mode, popups).
- **Collections screens** (Services, Industries, Case Studies, Testimonials, Team, FAQs, Pricing Plans, Blog, Resources, Logos, Stats): list/create/edit/publish/schedule, SEO, media picker.
- **Page editor:** block inserter, reorder (dnd-kit), inspector (schema-driven), device-wise visibility, animation preset, reusable sections, live preview iframe (desktop/tablet/mobile), save draft/publish/schedule, version history/compare/restore, signed preview link.
- **Media library:** upload (MIME/size allowlist), alt text, folders, picker, usage info.
- **SEO panel:** per-page + defaults, OG image template, redirects manager, sitemap/robots toggles.
- **Forms builder:** fields, labels, validation, success/redirect, receivers, spam settings, submissions.
- **Settings:** company, region-wise contact, social, tracking IDs, booking URL, webhook URL (SSRF block), legal page versions.
- **Revalidate:** publish ke baad `POST /api/revalidate` (secret header, tag-based), test.

`git grep` audit: website source mein hardcoded URL/email/phone/company naam/brand copy/hex (token file ke bahar) **nahi**.

---

## 12. STEP W8 — TESTS (raw output)

**Backend integration (nexora_test):** har collection CRUD + permission matrix (Owner/Admin/Editor/Sales/anonymous), public read sirf published, slugs 200/404, menus/theme/search/sitemap/rss APIs, redirects, popups/maintenance public config, public DTO leak tests.
**Vitest (website):** har block render, token injection, menu rendering, consent gating, animation preset mapping, link resolver.
**Playwright (apps/website):**

1. **Link crawl: 0 broken** (CI gate).
2. Har route x (390, 768, 1280): no overflow, h1 maujood, screenshot.
3. Mobile menu open/close, mega-menu, search (Cmd+K), cookie consent (analytics tabhi load jab accept).
4. Contact form -> success -> lead (API verify) -> Mailpit email.
5. Region switcher -> contact/currency badle.
6. Admin se theme color + animation toggle badlo -> website par reflect.
7. Unknown slug -> branded 404 (HTTP 404); maintenance mode -> 503 + admin bypass.
8. Reduced-motion emulate -> animations off.
9. Lighthouse run (mobile) raw summary file.

---

## 13. GATE (har step ke baad, local commit se pehle)

1. `dotnet build` 0 errors; `dotnet test` 0 fail/0 skip, count >= pichhla.
2. `pnpm -r lint`, `pnpm run format:check`, `pnpm -r test`, website + admin `build` clean.
3. Playwright suite pass (link crawl 0 broken, overflow tests).
4. Screenshots `docs/overnight/screens/after/` (home, services, service detail, case study, pricing, contact, blog, 404; 390px + 1280px).
5. Secrets/hardcode scan (`git grep --untracked -c -i -E "password|secret|token|apikey"`, email/URL/hex audit).
6. `.env` tracked nahi, naye package licenses `LICENSES.md`.
7. `git commit` (local): `website-WN: <kya> (tests: X pass, 0 fail, 0 skip)`. Push nahi.
8. `docs/overnight/PROGRESS.md` entry (raw numbers).

---

## 14. ORDER

W0 audit -> W1 design system -> **Header + Footer + Hero** (sabse visible) -> W3 collections/pages/services (404 fix) -> W4 baaki sections/blocks -> W7 admin wiring (theme/menus/collections) saath-saath -> animations (W7 section) -> W5 mobile pass -> W6 perf/a11y/SEO -> W8 tests -> **final gap re-check** (link crawl, overflow, hardcode audit, a11y) -> fix -> dobara test -> screenshots + `DEMO_SCRIPT.md` (5-min flow).

**Waqt kam ho to priority:** W0, W1, Header/Footer/Hero, Services (collection + pages), Process, Results, Final CTA, Contact, mobile pass, link crawl 0 broken. "Achha 8 sections" > "adhoora 25".

---

## 15. "WOW" ACCEPTANCE (khud se poochho, "no" ho to fix)

1. Hero 3 second mein batata hai agency kya karti hai aur kyun trust karein?
2. Sections ka rhythm (light/dark/gradient) alag hai?
3. Koi alignment/spacing/typography bug (cut text, uneven gaps)?
4. Services ek nazar mein samajh aati hain?
5. Mobile par hero/menu/CTA smooth hain?
6. Koi 404/blank/broken image? (crawl 0 broken)
7. Colors/fonts consistent aur admin theme se badalte hain?
8. AA contrast?
9. Lorem ipsum ya khali section?
10. "Sample" content kahin asli claim jaisa to nahi dikh raha?
11. Animations smooth hain aur admin se off ho jaati hain?
12. Admin se kya badla jaa sakta hai aur kya static reh gaya (honest list)?

---

## 16. HANDOFF: `docs/overnight/WEBSITE_REPORT.md`

1. 404 list pehle vs ab (raw crawl output). 2. Mobile viewport test results + screenshot paths. 3. Live pages/services/collections list. 4. Test numbers (raw `Total tests:`), Lighthouse, a11y. 5. Admin se configurable kya hua / kya static reh gaya (honest). 6. Naye packages + licenses, migrations SQL review files, naye permissions table. 7. Known issues, jo claim nahi kar sakte, next steps.

Sirf wahi likho jo raw output se prove ho; jo test nahi hua use "untested" likho.

**Ab shuru karo: W0 audit.**
