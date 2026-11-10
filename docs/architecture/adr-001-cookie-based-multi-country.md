# ADR 001: Single-URL Cookie-Based Localization vs Subpath Routing

## Status

Accepted (Locked Decision for Phase 1 / Initial Launch)

## Context

Nexora operates globally, serving target markets starting with India (`en-IN`) and the United States (`en-US`).
When designing the public website routing architecture, two core options were evaluated:

1. **Single-URL with Cookie + Accept-Language Resolution (`nexora.com`)**: No locale or region prefix in the URL.
2. **Subpath-based Routing (`nexora.com/in`, `nexora.com/us`)**: Explicit geographic or language subdirectories.

## Decision

We adopt **Option 1 (Single-URL Cookie-Based Localization)** for initial launch.

- Canonical address is `nexora.com`.
- The user's active region is determined from the `nexora_region` cookie, with a fallback to the `Accept-Language` header (defaulting to India `IN`).
- `next-intl` is configured in `localePrefix: "never"` mode.
- A visual region switcher is provided in the header to allow users to switch regions, persisting their choice to the cookie.
- The routing architecture includes a configuration switch (`NEXT_PUBLIC_URL_STRATEGY=cookie`) to ensure a smooth transition to subpaths if architectural triggers are met.

---

## Comparison Matrix

| Evaluation Dimension        | Option 1: Single-URL (Cookie-based)                                                                                                  | Option 2: Subpath-based (`/in`, `/us`)                                                         |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **User Experience**         | Clean, unified URL (`nexora.com`) across all marketing channels.                                                                     | Explicit URLs indicating geographic targeting.                                                 |
| **URL Complexity**          | Low. Zero redirection chains for sharing links.                                                                                      | Higher. Requires directory prefixes across all links and sitemaps.                             |
| **SEO & Hreflang**          | Search engines index the default region (India). Regional variants are not indexed as separate search results.                       | Search engines index separate regional pages; straightforward `hreflang` indexing per country. |
| **Edge / CDN Caching Risk** | **High Risk if unmanaged**: Static CDN caching could serve cached India content to US visitors if cache key does not vary by cookie. | Low Risk: Each subpath has its own unique cache URL.                                           |
| **Implementation Effort**   | Very fast for initial launch.                                                                                                        | Requires prefix handling, redirect matrices, and nested routing.                               |

---

## Critical Cache-Safety Protocol (CDN & ISR)

> [!WARNING]
> Because the URL remains identical across regions (`nexora.com`), naive full-page caching at the CDN (Cloudflare, DigitalOcean App Platform, or reverse proxy) can inadvertently cache an `en-IN` page and serve it to visitors from `en-US`.

### Mitigation Pattern Implemented

1. **Dynamic / Request-Time Resolution**: Edge middleware reads the `nexora_region` cookie and attaches `x-nexora-region-strategy` headers.
2. **Client-Side Hydration for Region-Sensitive Blocks**: Any block that displays region-specific data (pricing in INR vs USD, phone country codes, localized compliance disclaimers) must be resolved request-time or rendered on the client side.
3. **Cache-Control Headers**: When caching static assets, ensure `Vary: Cookie, Accept-Language` is declared, or limit edge caching to static assets (`_next/static`, images) while keeping HTML responses dynamic or micro-cached with appropriate `Vary` headers.

---

## Triggers for Shifting to Subpaths (`/in`, `/us`)

The platform will automatically trigger a transition from single-URL to subpath routing when any of the following milestones are reached:

1. **Dedicated SEO Campaigns**: When organic search traffic from the US requires country-specific Google Search Console indexation with distinct `hreflang` URLs.
2. **Extensive Region-Specific Content**: When more than 40% of page content, blog posts, case studies, or regulatory notices differ fundamentally between India and the US.
3. **Edge Caching Efficiency Demands**: When high traffic volumes necessitate 100% full-page static caching at the edge without cookie-variance overhead.
