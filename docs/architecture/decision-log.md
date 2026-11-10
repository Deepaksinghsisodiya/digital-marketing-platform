# Architecture Decision Log

## Locked Decisions (Step 1 Foundation)

1. **Single-Tenant Foundation**
   - **Decision**: The platform is built as single-tenant for initial delivery. Multi-tenancy, row-level security (RLS), `OrganizationId` fields, and tenant resolution are completely skipped in Step 1.
   - **Architectural Guard**: Clean Architecture layering (`Domain` -> `Application` -> `Infrastructure` -> `Api`) is strictly enforced so multi-tenancy can be layered in later without modifying core business rules.

2. **Scope Boundary**
   - **Decision**: Limited strictly to Nexora Public Website + Agency Admin Panel + .NET Core Backend. Client portal, client website builder, WhatsApp API, automation workflows, AI, and social posting are deferred to future roadmap phases.

3. **Public URL Strategy**
   - **Decision**: Single canonical domain `nexora.com`. No locale or region subpath prefixes (`/in/`, `/us/`). Country and regional localization are handled via request cookie (`nexora_region`) and `Accept-Language` header.
   - **Migration Path**: `next-intl` is configured in `localePrefix: "never"` mode with an architectural switch flag (`NEXT_PUBLIC_URL_STRATEGY=cookie`) so transition to subpaths can occur via configuration if triggers are met.

4. **Admin Authentication Strategy**
   - **Decision**: ASP.NET Core Identity with HttpOnly, Secure, SameSite Cookie. Storing JWTs in `localStorage` or `sessionStorage` is strictly prohibited to prevent XSS-based credential theft.
   - **Domain Cookie**: In local dev, services run on different localhost ports. In production, `admin.<domain>` and `api.<domain>` share a parent domain cookie (`.domain.com`).

5. **Permissive Open-Source & FOSS Component Licensing**
   - **Decision**: Zero paid SaaS or commercial proprietary NuGet/npm libraries. Application dependencies use permissive open-source licenses (MIT, Apache-2.0, BSD, ISC).
   - **Prohibited Libraries**: AutoMapper, MediatR, MassTransit, FluentAssertions v8+, ImageSharp, Hangfire Pro, commercial UI kits.

6. **Local Development First**
   - **Decision**: Local environment uses SQL Server (LocalDB or pinned SQL Server 2022 container) + Mailpit. Production deployment will target a dedicated Linux host with Docker Compose, reverse proxy (Caddy/Nginx), and off-server backups.

7. **Email Delivery Architecture**
   - **Decision**: Dual-adapter design.
     - _Local Dev_: MailKit SMTP adapter pointing to Mailpit (port 1025).
     - _Production_: External HTTPS API adapter or external authenticated SMTP provider (as cloud droplets frequently block outbound port 25).

8. **Language Roadmap**
   - **Decision**: Launch language is strictly English (`en-IN`, `en-US`). Hindi (`hi-IN`) and other regional languages will follow in subsequent localization phases.

9. **Database Provider: SQL Server**
   - **Decision**: Microsoft SQL Server is the primary relational database provider using EF Core `Microsoft.EntityFrameworkCore.SqlServer` (MIT license). *(History note: PostgreSQL provider replaced by SQL Server during Step 2 architecture refinement).*
   - **Licensing & Resource Review**: SQL Server is commercial proprietary Microsoft software. Express edition is free for production but restricted to 10 GB max database size, 1.4 GB buffer pool RAM, and 4 CPU cores. Production container deployments on Linux require minimum 2 GB RAM. A formal licensing and edition review (Express vs Standard vs Web) is required prior to production launch.
   - **Authentication**: Windows Integrated Authentication (`Trusted_Connection=True`) is restricted to local developer workstations. Production connections must use authenticated SQL logins supplied strictly through environment variables or cloud secrets management (never hardcoded, no `MultipleActiveResultSets` unless specifically required).
   - **Concurrency Model**: Optimistic concurrency is implemented using SQL Server native `rowversion` (`byte[] [Timestamp]`), mapped to `Version` properties. Mismatch triggers HTTP 409 Conflict.
   - **Append-Only Audit Security**: `AuditLogs` immutability is enforced at the database level using a T-SQL `INSTEAD OF UPDATE, DELETE` trigger throwing error 50001. In production, runtime database roles will be restricted to `SELECT` and `INSERT` only, with `UPDATE`, `DELETE`, and `TRUNCATE` permissions completely revoked.

10. **Interactive API Documentation: OpenAPI, Swagger UI & Scalar**
    - **Decision**: Interactive API explorers are provided using native .NET 10 `Microsoft.AspNetCore.OpenApi` specification generation (`/openapi/v1.json`).
    - **UIs**: Swagger UI (`Swashbuckle.AspNetCore.SwaggerUI`, MIT license) at `/swagger` and Scalar (`Scalar.AspNetCore`, MIT license) at `/scalar`. In Development, `/` redirects to `/swagger`.
    - **Security & Environment Guard**: Documentation UIs and JSON specification endpoints are strictly isolated to Development (`app.Environment.IsDevelopment()`) and return HTTP 404 in Production. Identity Application Cookie is documented dynamically from configuration (`AuthCookieOptions`), with explicit notes for CSRF token submission (`X-XSRF-TOKEN`).

---

## Open Decisions (To be decided in future phases)

| Decision Item                     | Candidates Considered                  | Decision Trigger / Criteria                     |
| :-------------------------------- | :------------------------------------- | :---------------------------------------------- |
| **Privacy-friendly Analytics**    | Umami, Plausible, self-hosted PostHog  | Before public website marketing launch          |
| **Production Email Provider**     | Resend, Brevo, AWS SES, Postmark       | Prior to production transactional email go-live |
| **Rich Text Editor for CMS**      | TipTap (headless ProseMirror), Lexical | During Phase 3 CMS Block Builder implementation |
| **Off-server Backup Destination** | Backblaze B2, Cloudflare R2, AWS S3    | Phase 5 Hardening & Production deployment       |
