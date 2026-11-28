# Architecture & Scope Decisions Log

| Date | Decision | Alternatives Considered | Reason | Reversible? |
|---|---|---|---|---|
| 2026-11-26 | Keep existing clean monorepo (`apps/website`, `apps/admin`, `backend/src`, `packages/*`) instead of mass-moving folders. | Migrate all folders to `atoms/molecules/organisms` tree. | Repo already has clean separation; Section 0.3 rule 6 prohibits speculative mass-renames overnight. | Yes |
| 2026-11-26 | Preserve legacy `TaskItem` / `Invoice` references in `ClientEndpoints.cs` and `adminApi.ts` without deleting DB tables/migrations. | Drop `TaskItems` / `Invoices` tables or delete endpoints blindly. | Section 1.5 & 0.5 prohibit destructive DB changes or deleting existing code without dependency analysis. | Yes |
| 2026-11-26 | Use `LeadService.cs` dynamic `formDef.SchemaJson` allowlist + known contact/booking/newsletter keys for `customFields`. | Hardcoded 5-key allowlist (`serviceOfInterest`, `budget`, `message`, `timeline`, `source`). | Hardcoded 5-key allowlist caused `400 Unknown or unauthorized field` on `BookingEmbed`, `ContactForm`, and `Footer` Newsletter. | Yes |
| 2026-11-26 | Remove `.CacheOutput("PublicCache")` from CMS/Menu/Settings/Blog/Theme public GET endpoints. | Keep 1-hour server/Next.js output caching. | Stale cache prevented Admin edits from appearing on the public website immediately. | Yes |
