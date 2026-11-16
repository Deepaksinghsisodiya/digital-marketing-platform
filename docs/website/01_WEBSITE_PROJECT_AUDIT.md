# WEBSITE PROJECT AUDIT (PHASE 0 DISCOVERY)

*See full audited findings and discovery architecture in [WEBSITE_EXISTING_PROJECT_AUDIT.md](./WEBSITE_EXISTING_PROJECT_AUDIT.md).*

## Summary of Findings

1. **Framework:** Next.js 15.2+ (App Router) with React 19 and Tailwind CSS.
2. **Owning App:** `apps/website` (`@nexora/website`).
3. **Backend & CRM:** Centralized .NET 10 API at `backend/src/Nexora.Api`, consuming `LeadEndpoints.cs` at `POST /api/v1/public/forms/{formKey}/submissions`.
4. **CMS Engine:** Headless EF Core PostgreSQL CMS with dynamic BlockRenderer and ISR cache revalidation.
5. **Zero 404 & Resilience Strategy:** Hybrid database CMS backing paired with comprehensive Server Component fallback defaults across all 12 Services, 8 Industries, and Legal compliance routes.
6. **No Git Push Constraint:** Strict enforcement: `git push` is never executed without explicit user instruction.
