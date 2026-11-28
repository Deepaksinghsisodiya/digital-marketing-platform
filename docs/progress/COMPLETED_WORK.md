# Completed Workstreams

| ID | Description | Files Changed | Verification |
|---|---|---|---|
| WS-01 | Repository Discovery & Mapping | — | Mapped `apps/website`, `apps/admin`, `backend/src`, `packages/*`, `infra/*`, `docs/*` |
| WS-08 | Environment Safety Guard & Backup Snapshot | `docs/progress/*` | Local SQL Server + Mailpit (`:8025`) verified; backup `D:\Nexora-Backup-20261126-2240.tar.gz` created |
| WS-13b | Remove stale OutputCache on Blog, Theme, Cms, Menu, Settings endpoints | `BlogEndpoints.cs`, `ThemeEndpoints.cs`, `CmsEndpoints.cs` | Built & verified in Release build |
| WS-14b | Fix `LeadService` customFields allowlist (`inquiryType`, `landingPageUrl`, `websiteUrl`, schema-defined fields) | `LeadService.cs`, `StartupSeeder.cs` | Built; integration tests running (`task-2211`) |
| WS-44 | Wire Website Newsletter (`Footer.tsx`), `ContactForm`, `BookingEmbed` to real API + inline Yup validation | `Footer.tsx`, `ContactForm.tsx`, `BookingEmbed.tsx` | `tsc --noEmit` + `23/23` Website Vitest passed |
| WS-60 | Remove static fallback arrays in `CaseStudiesBlock`, `FeatureGridBlock`, `FaqBlock` + delete 4 empty dead files | `CaseStudiesBlock.tsx`, `FeatureGridBlock.tsx`, `FaqBlock.tsx` | `tsc --noEmit` + `23/23` Website Vitest passed |
| WS-58 | Remove Admin validation toasters in CMS studios (inline field errors only) | `CaseStudiesPage.tsx`, `FaqsPage.tsx`, `ServicesCatalogPage.tsx`, `TestimonialsPage.tsx`, `HeroBannersPage.tsx` | `tsc --noEmit` + `46/46` Admin Vitest + `vite build` passed |
