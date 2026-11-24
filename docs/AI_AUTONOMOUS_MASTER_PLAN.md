# NEXORA — Autonomous Master Plan & Architecture Roadmap

> **Author / Role:** Autonomous CTO, Product Architect & Engineering Lead  
> **Platform:** Nexora Digital Marketing Platform (Enterprise .NET 10 + Next.js 15 + React 19 Admin)  
> **Design Philosophy:** Linear Minimalism + Stripe Precision + Vercel Simplicity  
> **Operational Standard:** Production-grade Agency & Client Growth Infrastructure (HubSpot / Twenty CRM / Webflow standard)  
> **Status:** Active Execution Phase  

---

## 1. Product Understanding & Agency Business Model

Nexora is a high-velocity digital marketing and technology consultancy servicing enterprise clients across India (DPDP Act compliance) and the US/Global markets. A true digital marketing agency platform requires:

1. **Client Acquisition & Attribution Engine (Website):**
   - High-intent commercial search pages and responsive landing pages.
   - Interactive ROI & ad spend growth calculators.
   - Transparent, region-aware commercial retainers (Monthly/Annual, USD/INR/EUR).
   - Dynamic capabilities and service catalog with verified deliverables.
   - Multi-channel UTM parameter tracking (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `fbclid`).
   - Free 20-point digital marketing audit intake pipeline.

2. **Lead Qualification & CRM Lifecycle (Admin Panel):**
   - Real-time intake pipeline with multi-touch attribution analysis.
   - Automatic Lead Scoring (0-100) based on commercial budget, service tier, and corporate email.
   - Kanban pipeline & Directory views with 1-click status advancement (New Inquiry -> Under Evaluation -> Contacted -> SQL -> Converted / Won).
   - Seamless 1-click conversion from Lead to Enterprise Client Account with automated onboarding task generation.

3. **Agency Project & Task Management (Client Workspaces):**
   - Client workspaces with dedicated Contacts, Activity timelines, and Deliverable Tasks.
   - Task lifecycle with priority, due date, assignee, and progress states.

4. **Content & Programmatic SEO Engine:**
   - Editorial blog workflow (Draft -> Under Review -> Scheduled -> Published).
   - Dynamic OpenGraph (OG) image generation and Twitter cards.
   - Search sitemap (`sitemap.xml`) and search bots directive (`robots.txt`).

5. **Security, Privacy & Infrastructure:**
   - ASP.NET Core 10 Minimal APIs with FluentValidation, EF Core 10, PostgreSQL.
   - Outbox pattern for transactional email delivery via Mailpit / SMTP.
   - Zero hardcoded colors; strict semantic token governance (`check:colors`).
   - 100% test pass rate across unit, architecture, and integration suites.

---

## 2. Current Project Architecture & Baseline Status

- **Frontend (Website):** Next.js 15.5 App Router, React 19, Tailwind CSS, TypeScript strict mode. 49 pre-rendered static routes.
- **Admin Panel:** Vite 6, React 19, Redux Toolkit Query (RTK Query), Tailwind CSS, Lucide icons, Geist/Inter typography.
- **Backend:** .NET 10.0 ASP.NET Core, EF Core 10, PostgreSQL (Npgsql), MediatR/CQRS-inspired pattern, FluentValidation, Testcontainers, Mailpit SMTP.
- **Shared Contracts:** `@nexora/contracts` and `@nexora/design-tokens`.
- **Baseline QA:**
  - `check:colors`: 0 violations.
  - `typecheck`: 0 TypeScript errors across all 3 apps.
  - `admin test`: 16/16 test files passed, 46/46 tests passed.
  - `website test`: 6/6 test files passed, 21/21 tests passed.
  - `dotnet test`: 142/142 tests passed (37 unit, 3 architecture, 102 integration).

---

## 3. Autonomous Goals & Strategic Roadmap

### Goal A: Agency Client Performance Reporting & Monthly Retainer Analytics (Goal ID: `GOAL-REPORTING-01`)
- **Importance:** Digital marketing clients require transparent, data-driven monthly ROI reports detailing ad spend, impressions, CPC, conversions, and organic search gains.
- **Current Problem:** `ClientsPage.tsx` allows tracking contacts and tasks, but has no Client Performance Reporting tab or printable/exportable Executive Growth Summary.
- **Expected Outcome:** Add a dynamic "Performance Telemetry & Growth Reports" module to Client Details with key marketing metrics (Spend, ROAS, Conversions, Search Impressions) and 1-click summary generation.
- **Priority:** HIGH

### Goal B: Programmatic Blog Publishing Workflow & Reading Time Metadata (Goal ID: `GOAL-CONTENT-02`)
- **Importance:** A marketing agency relies on authoritative thought leadership; posts need estimated reading time, author avatar previews, and category filtering on the public website.
- **Current Problem:** `apps/website/src/app/blog/page.tsx` and `[slug]/page.tsx` render basic posts; reading time and rich social tags need seamless calculation and fallback assets.
- **Expected Outcome:** Compute reading time dynamically, ensure responsive tags/category filters, and verify rich editorial formatting.
- **Priority:** MEDIUM

### Goal C: Admin Quick Command Palette (`⌘K`) Enhancements (Goal ID: `GOAL-UX-03`)
- **Importance:** Agency project managers switch rapidly between Leads, Clients, Blog, CMS blocks, and Settings.
- **Current Problem:** Command palette (`CommandPalette.tsx`) has basic navigation links; it should support direct quick actions (e.g. "Create New Lead", "Add Client", "New Blog Post", "Toggle Theme").
- **Expected Outcome:** Enrich `CommandPalette.tsx` with categorized actions and keyboard shortcuts.
- **Priority:** MEDIUM

### Goal D: Database Schema & Entity Hygiene Review (Goal ID: `GOAL-BACKEND-04`)
- **Importance:** Ensure all entities follow clean EF Core conventions, proper soft-delete indexing, and no orphaned relationships.
- **Expected Outcome:** Verified schema migrations and query performance for Client, Lead, and Task queries.
- **Priority:** MEDIUM

---

## 4. Current Execution Status

- `GOAL-REPORTING-01`: Planning & Implementation in progress.
- `GOAL-CONTENT-02`: Queued.
- `GOAL-UX-03`: Queued.
- `GOAL-BACKEND-04`: Queued.
