# Static Business Data Audit

| File | Classification | Issue Found | Action Taken | Status |
|---|---|---|---|---|
| `apps/website/src/components/layout/Header.tsx` | 5 (Hardcoded Nav) | Had static fallback links/dropdowns | Removed; 100% driven by `/api/v1/public/menus/header` & `SiteSettings` | FIXED |
| `apps/website/src/components/layout/AnnouncementBar.tsx` | 5 (Hardcoded Banner) | Static fallback slides | Driven by `settings.announcementBarJson`; hides when disabled | FIXED |
| `apps/website/src/components/blocks/HeroBlock.tsx` | 5 (Hardcoded Proof) | Hardcoded `4.9/5`, `120+ teams`, trust badges | Moved into `StartupSeeder.cs` + `HeroBannersPage.tsx` + live DB | FIXED |
| `apps/website/src/components/home/HeroResultsVisual.tsx` | 5 (Hardcoded KPIs) | `getSlideDefaults()` hardcoded `4.85x`, `-36.4%`, etc. | Removed `getSlideDefaults()`; renders strictly from Admin/DB slide metrics | FIXED |
| `apps/website/src/components/blocks/CaseStudiesBlock.tsx` | 5 (Fake Case Studies) | Fell back to `DEFAULT_CASE_STUDIES` (`Apex Cloud`, `UrbanLux`, `Synapse`) | Removed fallback; renders only CMS/DB `caseStudies` (returns `null` if empty) | FIXED |
| `apps/website/src/components/blocks/FeatureGridBlock.tsx` | 5 (Static Features) | Fell back to `defaultFeatures` | Removed fallback; renders only CMS/DB `services`/`features` | FIXED |
| `apps/website/src/components/blocks/FaqBlock.tsx` | 5 (Static FAQs) | Fell back to hardcoded 4 FAQ items | Removed fallback; renders only CMS/DB `items` | FIXED |
| `apps/website/src/components/ui/OptimizedImage.tsx` | 7 (Dead 0-byte file) | Empty unused file | Deleted | REMOVED |
| `apps/website/src/content/services/*` | 7 (Dead 0-byte files) | Empty unused files (`all-services.ts`, `index.ts`, `types.ts`) | Deleted | REMOVED |
