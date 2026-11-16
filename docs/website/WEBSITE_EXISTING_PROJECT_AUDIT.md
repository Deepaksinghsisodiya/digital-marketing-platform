# EXISTING PROJECT AUDIT & TECHNICAL DISCOVERY REPORT

**Document:** Comprehensive Codebase & Architecture Audit  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Pre-Implementation Architectural Discovery (Phase 0)  
**Audit Date:** November 2026  
**Status:** Audit Complete & Validated Against Production Codebase  

---

## 1. Executive Summary & Repository Context

This audit evaluates the complete Nexora ecosystem located at `D:\Nexora-Digital-Marketing-Platform`. The platform is a modern multi-app monorepo built using `pnpm` workspaces on the frontend and a clean .NET 10 modular monolith on the backend.

The public marketing website exists in `apps/website` and is directly connected to the centralized ASP.NET Core backend API (`backend/src/Nexora.Api`) and shared packages (`@nexora/design-tokens`, `@nexora/contracts`, `@nexora/typescript-config`).

---

## 2. Determination of Core Architectural Questions

### 1. Whether a public marketing website already exists?
**YES.** A modern Next.js App Router application is located in `apps/website`. It possesses established routing, server-side CMS block rendering, region handling, and core atomic/molecule components.

### 2. Which application should own the public website?
`apps/website` (`@nexora/website`). It is purpose-built with Next.js 15, React 19, and Tailwind CSS. It is decoupled from the internal staff application (`apps/admin`), ensuring optimal public performance, crawlability, and security.

### 3. Which frontend framework is actually installed?
- **Framework:** Next.js 15.2.1 / 15.5.29 (App Router).
- **Core Runtime:** React 19.0.0 and React-DOM 19.0.0.
- **Styling:** Tailwind CSS 3.4.17, PostCSS 8.5.3, Autoprefixer 10.4.20.
- **Icons:** Lucide React 1.16.0.
- **Primitives:** `@radix-ui/react-accordion`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`.
- **Localization:** `next-intl` 3.26.3, `i18n-iso-countries`, `libphonenumber-js`.
- **Testing:** Vitest 3.2.7.

### 4. Which backend should receive contact and lead submissions?
`backend/src/Nexora.Api` running on port `5201` (or configured via `INTERNAL_API_URL` / `NEXT_PUBLIC_API_URL`). Specifically, the endpoint `POST /api/v1/public/forms/{formKey}/submissions` handled by `LeadEndpoints.cs`.

### 5. Whether an existing CRM API can be reused?
**YES, 100%.** The existing `Nexora.Application.Leads` and `LeadEndpoints.cs` provide a fully functional, enterprise-grade lead intake engine:
- Anti-bot time-trap tokens via `GET /api/v1/public/forms/{formKey}`.
- Idempotency key deduplication.
- Automated lead scoring based on region, company size, and budget tier.
- UTM parameter capture (`utm_source`, `utm_medium`, `utm_campaign`, `referrer`).
- Audit logging and webhook events.
No duplicate CRM module should be built.

### 6. Whether a CMS already exists?
**YES.** The backend includes a complete headless CMS engine:
- `Page`, `CmsBlock`, `MediaItem`, `Menu`, `SiteSettings` entities in Entity Framework Core.
- Public read endpoints:
  - `GET /api/v1/public/pages/{slug}`
  - `GET /api/v1/public/site-settings`
  - `GET /api/v1/public/preview/{token}`
  - `GET /api/v1/public/menus/{key}`
- `apps/website/src/lib/cms.ts` provides typed SDK helpers and fetch wrappers.

### 7. Whether any existing components can be reused?
**YES.** The block library is highly modular:
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
- UI Primitives (`Button`, `Input`, `Textarea`, `Dialog`, `Accordion`, `Tabs`, `Badge`, `Card`, `Marquee`).

### 8. Whether any architectural conflicts exist?
- **Build-Time Dynamic Server Usage:** The build passes cleanly with code 0, but during static export attempts, `getPublicSiteSettings` correctly falls back to dynamic SSR because the backend is not running during local offline builds. This is expected and proper behavior for server-rendered routes with database fallbacks.
- **Seeded Slugs vs Frontend Routes:** The database seeder (`StartupSeeder.cs`) seeds 12 services, 8 industries, and legal pages, but the frontend route structure previously had missing dedicated pages for `/privacy`, `/terms`, etc., which are mapped through the dynamic `[...slug]` CMS route.

---

## 3. Inventory of Monorepo Modules & Packages

```
Nexora-Digital-Marketing-Platform/
├── apps/
│   ├── website/             # Public Marketing & Client Portal (Next.js 15, React 19)
│   └── admin/               # Internal Agency Management Dashboard (Vite + React)
├── backend/
│   └── src/
│       ├── Nexora.Api/            # Minimal API Endpoints (Auth, Leads, CMS, Settings)
│       ├── Nexora.Application/    # CQRS Handlers, DTOs, Business Logic, Lead Scoring
│       ├── Nexora.Domain/         # Core Domain Entities (Page, Lead, User, FormDefinition)
│       └── Nexora.Infrastructure/ # EF Core, PostgreSQL, Outbox, MailKit, Cloud Storage
├── packages/
│   ├── contracts/           # Shared TypeScript interfaces & API contract DTOs
│   ├── design-tokens/       # Central design tokens, CSS variables, theme variables
│   ├── eslint-config/       # Shared linting rules
│   └── typescript-config/   # Shared tsconfig bases (Next.js, Vite, Node)
└── docs/
    ├── architecture/        # Architecture Decision Records (ADRs)
    └── website/             # Website Specifications, Benchmarks & Implementation Guides
```

---

## 4. Reusable Modules vs Missing Modules

### Reusable Modules (Keep & Enhance)
1. `apps/website/src/lib/cms.ts` — Type-safe client for CMS pages and site settings.
2. `apps/website/src/components/forms/ContactForm.tsx` — Direct integration with time-trap tokens and backend lead endpoints.
3. `apps/website/src/components/blocks/BlockRenderer.tsx` — Dynamic renderer converting database CMS block JSON into React components.
4. `packages/design-tokens` — CSS variable mappings for runtime theming.
5. `StartupSeeder.cs` — Rich seed data for services, industries, and site settings.

### Missing or Incomplete Modules (To Implement in Blueprint)
1. **Mega Menu Architecture:** Header navigation needs a rich 3-pillar Mega Menu with Lucide icons and descriptive copy.
2. **Dedicated Static Service & Legal Routes:** Provide resilient fallbacks so that if the backend database is cold, every critical page (`/services/seo`, `/privacy`, `/terms`, etc.) renders complete, authoritative copy immediately.
3. **Abstract SVG Visual Assets:** Replace empty visual areas in the hero and capability blocks with premium geometric SVG growth illustrations.
4. **Interactive ROI Calculator Enhancement:** Enhance the tool at `/tools/roi-calculator` with currency switching (INR/USD) and lead gate integration.
5. **Generative Engine (GEO/AEO) Enhancements:** Add complete `Service`, `FAQPage`, and `BreadcrumbList` JSON-LD schemas.

---

## 5. Technical Risks & Mitigation Plan

| Identified Risk | Severity | Mitigation Strategy |
|---|---|---|
| **Backend Unavailability during Static Builds** | Medium | Implement defensive try-catch fallbacks in all page loaders with pre-rendered static content backups. |
| **Duplicate CRM Logic** | High | Strictly reuse `POST /api/v1/public/forms/contact/submissions`; never create disconnected form handlers. |
| **Layout Shifts on Mobile (<430px)** | Medium | Use strict CSS clamp values, fixed aspect ratio containers, and zero layout shift web fonts (`next/font/google`). |
| **Large JS Bundle Size** | Medium | Avoid client-side component bloat; retain Server Components for all static copy and structural markup. |
| **Git Push Accidental Trigger** | Critical | Strict user constraint: **NEVER execute `git push` unless explicitly ordered by user in plain text.** |

---

## 6. Recommended Target Architecture

The target architecture is a **Hybrid Next.js 15 Jamstack + Modular Headless API**:
- **Content Delivery:** Server Components render rich semantic HTML directly from CMS cache or built-in fallbacks.
- **Revalidation:** Instant cache invalidation via `POST /api/revalidate?secret=...` whenever content is published in the Admin CMS.
- **Client Interactivity:** Light, accessible Radix UI and Formik islands for forms, mega menus, search modals, and calculators.
- **Observability:** Health check probes at `/api/v1/health` and dynamic sitemaps at `/sitemap.xml`.
