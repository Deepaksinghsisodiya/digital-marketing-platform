# Nexora: Missing Content & Real Business Data Register

This register documents all typed placeholders and pending business information required before full public launch. In accordance with Ground Rule #2, **no synthetic or invented business identity data** is committed to the codebase. When rendered, the front-end gracefully hides unpopulated optional sections or uses strictly typed placeholders.

---

## 1. Identity & Contact Information (`apps/website/src/content/site.config.ts`)

| Key / Path | Current Placeholder Value | Description / Required Real Information |
| :--- | :--- | :--- |
| `company.phone` | `TODO_REAL_VALUE` | Official corporate phone number with country code (e.g., `+91 98765 43210`) |
| `company.whatsapp` | `TODO_REAL_VALUE` | Dedicated WhatsApp Business phone number |
| `company.supportEmail` | `TODO_REAL_VALUE` | Support desk inbox (e.g., `support@nexora.digital`) |
| `company.salesEmail` | `TODO_REAL_VALUE` | High-intent sales inbox (e.g., `growth@nexora.digital`) |
| `company.billingEmail` | `TODO_REAL_VALUE` | Accounts / Finance inbox (e.g., `billing@nexora.digital`) |
| `company.legalName` | `TODO_REAL_VALUE` | Registered legal entity name (e.g., *Nexora Digital Technologies Private Limited*) |
| `company.taxId` | `TODO_REAL_VALUE` | Corporate GSTIN (India) / EIN (US) / VAT ID |
| `company.registrationNumber` | `TODO_REAL_VALUE` | Corporate Identification Number (CIN) or state filing number |
| `company.address` | `TODO_REAL_VALUE` | Physical office address, building, suite, city, state, postal code |

---

## 2. Social Media & External Profiles (`site.config.ts`)

| Key | Current Placeholder Value | Required Real Information |
| :--- | :--- | :--- |
| `socialLinks.linkedin` | `TODO_REAL_VALUE` | Official LinkedIn Company Page URL |
| `socialLinks.twitter` | `TODO_REAL_VALUE` | Official X / Twitter handle URL |
| `socialLinks.youtube` | `TODO_REAL_VALUE` | Official YouTube channel URL |
| `socialLinks.instagram` | `TODO_REAL_VALUE` | Official Instagram profile URL |
| `socialLinks.github` | `TODO_REAL_VALUE` | Official GitHub organization URL |
| `socialLinks.facebook` | `TODO_REAL_VALUE` | Official Facebook business page URL |

---

## 3. Leadership & Testimonials

| Section | Current Status | Required Real Information |
| :--- | :--- | :--- |
| **Client Testimonials** | Hidden / Placeholders banned | Authentic client quotes, client full names, verified designations, verified company names, high-res portrait headshots, and signed permission to publish. |
| **Case Study Metrics** | Verified client attribution needed | Verified revenue metrics, signed case study releases for named logos. |
| **Leadership Team** | Real headshots needed | Actual leadership roster, real LinkedIn profiles, bios, and photography. |

---

## 4. Third-Party Integrations & Marketing Tracking Keys

| Service | Environment Variable | Required Real Key |
| :--- | :--- | :--- |
| **Google Tag Manager** | `NEXT_PUBLIC_GTM_ID` | Real Container ID (`GTM-XXXXXXX`) |
| **Google Analytics 4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Real Measurement ID (`G-XXXXXXXXXX`) |
| **Meta Pixel** | `NEXT_PUBLIC_META_PIXEL_ID` | Real Pixel ID (`123456789012345`) |
| **Cloudflare Turnstile** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production Turnstile site key |
| **Cloudflare Turnstile Secret** | `TURNSTILE_SECRET_KEY` | Production Turnstile backend secret |

---

## Build Enforcement Notice
Running `pnpm --filter @nexora/website build` in `NODE_ENV=production` automatically invokes `apps/website/scripts/check-placeholders.mjs`. If any `TODO_REAL_VALUE` or dummy markers remain, the build will purposefully fail with exit code 1 to guard against launching unverified placeholder data. For staging deployments, pass `ALLOW_PLACEHOLDERS=1`.
