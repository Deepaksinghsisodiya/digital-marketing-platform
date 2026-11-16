# 10 — TECHNICAL ARCHITECTURE & INFRASTRUCTURE SPECIFICATION

**Document:** System Architecture, Framework Integrations & Deployment Pipeline  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Full-Stack Technical Topology  
**Target Markets:** India (IN) & United States (US)  

---

## 1. System Topology Overview

Nexora operates on a high-performance decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (BROWSER)                     │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       HTML / CSS / JS              Direct API (Leads/Settings)
                │                        │
┌───────────────▼───────────────┐ ┌──────▼───────────────┐
│     NEXT.JS 15 (APP ROUTER)   │ │  ASP.NET CORE 10 API │
│     apps/website              │ │  backend/src         │
│     - Server Components (SSR) │ │  - Lead Intake & CRM │
│     - Dynamic BlockRenderer   │ │  - Headless CMS API  │
│     - Next-Intl Localization  │ │  - Auth & Security   │
│     - Design Token Styling    │ │  - PostgreSQL Storage│
└───────────────▲───────────────┘ └──────▲───────────────┘
                │                        │
                └───────────┬────────────┘
                            │
               ┌────────────▼───────────┐
               │    SHARED MONOREPO     │
               │    - @nexora/tokens    │
               │    - @nexora/contracts │
               └────────────────────────┘
```

---

## 2. Core Frontend Stack (`apps/website`)

- **Runtime:** Node.js 20+ / Next.js 15.2.1 / 15.5.29 App Router.
- **Rendering Strategy:** Server Components by default; Client Components (`"use client"`) only where interactive browser state or events are required (Formik forms, mobile drawers, search dialogs).
- **Styling:** Tailwind CSS with centralized design tokens and CSS variables.
- **State & Forms:** Formik + Yup schema validation with accessible error mapping.
- **Data Fetching:** Typed fetch requests wrapped in `src/lib/cms.ts` with error boundaries and local fallback defaults.

---

## 3. Backend & API Services (`backend/src/Nexora.Api`)

- **Runtime:** .NET 10 Minimal APIs with C# 13.
- **Persistence:** PostgreSQL with Entity Framework Core and StartupSeeder.
- **Lead Intake Pipeline:**
  1. Frontend fetches anti-bot time-trap token via `GET /api/v1/public/forms/contact`.
  2. Client submits payload to `POST /api/v1/public/forms/contact/submissions`.
  3. Server validates idempotency key, checks honeypot, scores lead based on budget/region, logs event to audit table, and enqueues notification email.
- **Headless CMS Pipeline:**
  1. Content editors publish pages in `apps/admin`.
  2. Webhook triggers `POST /api/revalidate?secret=...` on Next.js frontend to invalidate ISR cache.
