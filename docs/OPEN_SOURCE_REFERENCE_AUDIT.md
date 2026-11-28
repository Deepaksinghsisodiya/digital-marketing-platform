# Open-Source Reference Audit

| Reference Project | Relevant Functionality | Business Problem Solved | Pattern Adopted / Recommended for Nexora | License | Decision |
|---|---|---|---|---|---|
| **Mautic** | UTM attribution capture, lead scoring, contact segments, suppression/unsubscribe | Tracks marketing ROI from click to CRM conversion | Capture `utm_*`, `referrer`, `landingPage` on all public forms -> `Lead` entity -> Admin CRM | GPLv3 (reference only, zero code copied) | Implement independently |
| **Twenty CRM** | Clean lead/company detail timeline, inline stage transitions, modern SaaS table UX | Reduces CRM friction for sales/growth teams | Clean 2-col detail view + activity timeline + stage pills in Admin `LeadsPage` & `ClientsPage` | GPLv3 (reference only) | UI/UX pattern adapted |
| **Listmonk** | High-throughput template/campaign queuing, suppression lists, bounce handling | Prevents duplicate sends and protects sender reputation | Outbox-backed `EmailTemplate` + `OutboxBackgroundDispatcher` + suppression checks | AGPLv3 (reference only) | Architecture pattern adapted |
| **Directus / Strapi** | Structured section-based CMS (`schemaVersion`), draft/published snapshots, preview tokens | Lets marketing teams edit pages without developer deploys | `Page` + `PageVersion` (Draft/Published) + typed `BlockRenderer` + Preview tokens | BSL / MIT | Already aligned in Nexora CMS |
| **Cal.com** | Frictionless consultation slot request with timezone & duration selection | Increases strategy-call conversion rate | `BookingEmbed` component wired to `POST /api/v1/public/forms/contact/submissions` | AGPLv3 (reference only) | Pattern implemented |
