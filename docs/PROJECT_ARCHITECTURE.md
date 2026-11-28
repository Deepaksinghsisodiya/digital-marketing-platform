# Nexora Platform Architecture

## Monorepo Layout
- `apps/website`: Next.js 15 App Router public marketing website (`http://localhost:3000`)
- `apps/admin`: React 19 + Vite 6 + RTK Query + Formik/Yup Admin Cockpit (`http://localhost:5173`)
- `backend/src/Nexora.Domain`: Entities, Value Objects, Enums, Domain Constants (zero external infra deps)
- `backend/src/Nexora.Application`: DTOs, Interfaces, FluentValidation, Riok.Mapperly
- `backend/src/Nexora.Infrastructure`: EF Core SQL Server `AppDbContext`, Services (`LeadService`, `CmsService`, `MenuService`, `SiteSettingsService`, `BlogService`, `ThemeService`, `MediaService`, `IdentityService`), MailKit/Resend email senders, WhatsApp Cloud service, S3/Local storage, `StartupSeeder`
- `backend/src/Nexora.Api`: Minimal APIs (`Auth`, `Cms`, `Menu`, `Settings`, `Blog`, `Theme`, `Lead`, `Client`, `Email`, `WhatsApp`, `Media`, `AdminUser`, `AdminAudit`, `Lookup`, `Health`), Serilog, Rate Limiting, Antiforgery (`X-XSRF-TOKEN`)
- `backend/src/Nexora.Worker`: Background worker host
- `packages/contracts`, `packages/design-tokens`, `packages/eslint-config`, `packages/typescript-config`
- `infra/compose/docker-compose.yml`, `infra/tools/mailpit.exe`

## End-to-End Flows
1. **Admin CMS -> Website:** Admin saves Menu/Hero/Page/Theme/Settings via `POST/PUT` with cookie session + `X-XSRF-TOKEN` -> DB persists -> Website SSR fetches `no-store` from `/api/v1/public/*` -> renders immediately.
2. **Public Lead/Newsletter -> CRM -> Outbox:** Visitor submits `ContactForm` / `BookingEmbed` / `Footer` Newsletter -> `GET /api/v1/public/forms/contact` (TimeTrap nonce) -> `POST /api/v1/public/forms/contact/submissions` -> `LeadService` validates + persists `Lead` with UTM attribution + queues `OutboxMessage` -> `OutboxBackgroundDispatcher` delivers via MailKit SMTP (Mailpit locally) -> Admin views/updates in Leads CRM.
