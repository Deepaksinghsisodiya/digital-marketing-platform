# NEXORA PLATFORM PRODUCTION AUDIT (Phase 0)

> **Document Type:** Production Hardening Baseline Audit  
> **Repository:** Nexora Digital Marketing Platform  
> **Timestamp:** November 2026  
> **Auditor:** Release & Full-Stack Platform Engineering Team  

---

## 1. Executive Summary & Verification Matrix

| Area | Current Status | Test Coverage | Primary Finding |
| :--- | :--- | :--- | :--- |
| **Backend API (.NET 10)** | Production-Grade Architecture | 37 Unit Tests Passing | Clean Architecture, Minimal APIs, EF Core with Outbox pattern implemented. Needs S3/R2 storage provider beside Local, and Data Protection key DB persistence. |
| **Admin Portal (React 19 + Vite)** | Feature Complete | 46 Unit Tests Passing | Complete module suite (CMS, Leads, Media, Theme Studio, Menus, Users). Needs production S3/R2 direct upload and mobile card view. |
| **Website (Next.js 15 App Router)** | 59 Static Routes Generated | 21 Unit Tests Passing | 100% resilient via local content fallback (`src/content/`), zero broken links (38/38 routes verified 200 OK), real CMP cookie blocker, context-aware WhatsApp, PPC landing pages. |
| **Monorepo Test Suite** | **104 Unit Tests Total** | **100% Passing** | Backend (37), Admin (46), Website (21). Playwright e2e suite needs to be connected to CI. |

---

## 2. Module & Section Mapping (CMS-Driven vs Local Content)

### A. Admin Modules (14 Mapped)
1. **Audit Logs (`apps/admin/src/pages/audit/AuditLogsPage.tsx`)**: Fully API-driven. Queries `/api/v1/audit-logs`.
2. **Authentication (`apps/admin/src/pages/auth/LoginPage.tsx`)**: Fully API-driven. ASP.NET Core Identity JWT & Cookie endpoints.
3. **Clients (`apps/admin/src/pages/clients/ClientsPage.tsx`)**: Fully API-driven. CRUD for agency client roster.
4. **CMS Pages (`apps/admin/src/pages/cms/PagesListPage.tsx`, `PageEditorPage.tsx`)**: Fully API-driven. Block-based page builder (`CmsBlock` schema).
5. **Blog & Content (`apps/admin/src/pages/content/`)**: Fully API-driven. Posts, Categories, Draft/Publish workflow.
6. **Dashboard (`apps/admin/src/pages/dashboard/DashboardPage.tsx`)**: Fully API-driven. Aggregates monthly lead counts, conversion velocity, and audit activity.
7. **Leads CRM (`apps/admin/src/pages/leads/LeadsPage.tsx`, `LeadDetailsPage.tsx`)**: Fully API-driven. Inbound lead captures, status transitions, notes, and CSV export.
8. **Media Library (`apps/admin/src/pages/media/MediaLibraryPage.tsx`)**: API-driven via `IMediaStorageService`. Currently writing to local filesystem disk storage.
9. **Menus (`apps/admin/src/pages/menus/MenusPage.tsx`)**: Fully API-driven. Tree structure editor for header and footer navigation.
10. **Redirects (`apps/admin/src/pages/redirects/RedirectsPage.tsx`)**: Fully API-driven. 301/302 routing rules.
11. **Roles (`apps/admin/src/pages/roles/RolesPage.tsx`)**: Fully API-driven. Role definitions and permission matrices.
12. **Settings (`apps/admin/src/pages/settings/SettingsPage.tsx`)**: Fully API-driven. Company name, legal name, GTM/GA4/Pixel IDs, email SMTP settings.
13. **Theme Studio (`apps/admin/src/pages/theme-studio/ThemeStudioPage.tsx`)**: Fully integrated with `@nexora/design-tokens`.
14. **Users (`apps/admin/src/pages/users/UsersPage.tsx`)**: Fully API-driven. Staff invitations, password management, and account status.

### B. Website Sections: CMS vs Local Content Hierarchy
* **Homepage (`/`)**: Hybrid. Attempts to read published CMS page blocks for slug `"home"`. If CMS is offline or empty, falls back to local curated sections (Hero slider, Results visual, Services catalog, FAQs, CTA banner).
* **Services (`/services/[slug]`)**: Hybrid. Primary source of truth is local typed data (`src/content/services/all-services.ts`) ensuring 100% offline uptime; CMS page can override when published.
* **Pricing (`/pricing`)**: Hybrid. Renders pricing tiers, interactive ROI calculator (`InteractiveROICalculator.tsx`), and comparison tables.
* **About (`/about`)**: Bound to `site.config.ts`.
* **Contact (`/contact`)**: Bound to `site.config.ts`.
* **Tools (`/tools/roi-calculator`)**: Code-built standalone interactive simulator supporting INR (`₹`) and USD (`$`).
* **PPC Funnels (`/lp/google-ads`, `/lp/meta-ads`)**: Dedicated high-converting code funnels with zero navigation leaks.
* **Resources (`/resources/growth-checklist`)**: Lead magnet opt-in page with instant PDF checklist download trigger.

---

## 3. Override Logic & Dual Source of Truth Analysis

* **Current Implementation:**
  The website utilizes an **Offline-Resilient Local Fallback** architecture:
  ```
  Page Request → Check CMS Cache/API → If 200 OK & Blocks Exist → Render BlockRenderer
                                      → If Offline/Empty/404   → Render Local Content File
  ```
* **Phase 2 Task:**
  Formalize this relationship so that local files in `src/content/services/` act as an idempotent database seed upon backend first startup, eliminating divergence while preserving local fallback resilience.

---

## 4. `TODO_REAL_VALUE` Sentinel Usage Audit

All placeholders live exclusively in **`apps/website/src/content/site.config.ts`**:
* `siteConfig.company.legalName`: `TODO_REAL_VALUE`
* `siteConfig.company.yearFounded`: `TODO_REAL_VALUE`
* `siteConfig.contact.phone`: `TODO_REAL_VALUE`
* `siteConfig.contact.whatsapp`: `TODO_REAL_VALUE`
* `siteConfig.contact.email`: `TODO_REAL_VALUE`
* `siteConfig.contact.address.street`: `TODO_REAL_VALUE`
* `siteConfig.contact.address.city`: `TODO_REAL_VALUE`
* `siteConfig.contact.address.state`: `TODO_REAL_VALUE`
* `siteConfig.contact.address.zip`: `TODO_REAL_VALUE`
* `siteConfig.contact.mapEmbedUrl`: `TODO_REAL_VALUE`
* `siteConfig.founder.name`: `TODO_REAL_VALUE`
* `siteConfig.founder.title`: `TODO_REAL_VALUE`
* `siteConfig.founder.shortBio`: `TODO_REAL_VALUE`
* `siteConfig.founder.fullBio`: `TODO_REAL_VALUE`
* `siteConfig.founder.photoPath`: `TODO_REAL_VALUE`
* `siteConfig.team`: Empty array `[]`
* `siteConfig.clientLogos`: Empty array `[]`
* `siteConfig.testimonials`: Empty array `[]`
* `siteConfig.caseStudies`: Empty array `[]`
* `siteConfig.certifications`: Empty array `[]`
* `siteConfig.awards`: Empty array `[]`

**Behavioral Guard:** Every field is guarded with `isRealValue()`. If a field is `TODO_REAL_VALUE` or empty, the corresponding section **automatically hides from visitors** rather than showing broken boxes or fake lorem ipsum.

---

## 5. Architectural Patterns Implemented vs Claimed

| Architecture Pattern | Claimed | Actually Implemented | File References |
| :--- | :---: | :---: | :--- |
| **Clean Architecture** | Yes | **YES (100%)** | `backend/src/Nexora.Domain/`, `Nexora.Application/`, `Nexora.Infrastructure/`, `Nexora.Api/` |
| **Outbox Pattern** | Yes | **YES (100%)** | `backend/src/Nexora.Domain/Entities/OutboxMessage.cs`, `backend/src/Nexora.Infrastructure/Services/OutboxDispatcher.cs` |
| **Block-Based CMS** | Yes | **YES (100%)** | `apps/website/src/components/blocks/BlockRenderer.tsx`, `HeroBlock.tsx`, `PricingBlock.tsx`, `CtaBlock.tsx`, `FaqBlock.tsx` |
| **Semantic Design Tokens** | Yes | **YES (100%)** | `packages/design-tokens/src/compiler.ts`, `presets.ts`, `resolver.ts`, `tailwind-preset.ts` |
| **Consent Management (CMP)**| Yes | **YES (100%)** | `apps/website/src/components/layout/CookieBanner.tsx`, `TrackingScripts.tsx` |
| **Spam / Bot Protection** | Yes | **YES (100%)** | `ContactForm.tsx`, `PPCLeadForm.tsx` (Honeypot, Timetrap, Idempotency keys) |
| **Command Palette** | Yes | **YES (Admin)** | `apps/admin/src/components/CommandPalette.tsx` |
| **S3/R2 Cloud Storage** | Claimed | **PARTIAL** | Currently only `LocalFileStorageService.cs` exists; `S3MediaStorage.cs` must be added in Phase 1.3. |
| **DataProtection in DB** | Claimed | **PARTIAL** | In-memory key ring; must be migrated to `PersistKeysToDbContext` in Phase 1.4. |
| **Health Probes (/live, /ready)** | Claimed | **PARTIAL** | Basic `/health` exists; needs distinct `/health/live` and `/health/ready` with DB/storage checks. |

---

## 6. Monorepo Test Baseline (104 Tests)

* **Backend:** 37 / 37 Passed (`dotnet test backend/Nexora.sln`)
* **Admin:** 46 / 46 Passed (`pnpm --filter @nexora/admin test`)
* **Website:** 21 / 21 Passed (`pnpm --filter @nexora/website test`)
* **Total:** **104 / 104 Passing (0 Failures)**

---
*Audit completed without unauthorized code modifications. Proceeding to Phase 1 (Launch Blockers).*
