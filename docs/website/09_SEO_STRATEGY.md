# 09 — TECHNICAL & ON-PAGE SEO MASTER STRATEGY

**Document:** Search Engine Optimization & Structured Data Specifications  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Organic Crawlability, Ranking & Rich Snippets Framework  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Technical SEO Architecture

1. **Rendering Model:** Next.js 15 Server Components deliver pre-rendered, fully indexed HTML directly over the wire, ensuring search engine bots parse text, headings, and schema without requiring client-side JavaScript execution.
2. **Metadata API:** Every page exports dynamic or static `metadata` via Next.js Metadata API:
   - Unique `<title>` tag.
   - Unique `<meta name="description">` tag.
   - Explicit `<link rel="canonical">` tag.
   - Complete Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`).
   - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
3. **Robots & Sitemap:**
   - Dynamic `robots.txt` generated at `/robots.txt` with sitemap reference:
     `Sitemap: https://nexora.com/sitemap.xml`
   - Disallowed internal paths: `/api/preview`, `/preview`, `/admin`.
   - Dynamic `sitemap.xml` generated at `/sitemap.xml` containing all published static routes, services, industries, and blog posts with `lastmod` timestamps.

---

## 2. Structured Data Schema Matrix

All pages embed JSON-LD schemas using `<script type="application/ld+json">`:

| Schema Type | Applied Pages | Purpose |
|---|---|---|
| `Organization` | Root Layout (`/`) | Establishes Nexora legal entity, logo, social profiles, and contact point. |
| `WebSite` | Root Layout (`/`) | Establishes website identity and Sitelinks Searchbox endpoint. |
| `Service` | All Service Pages (`/services/*`) | Establishes service type, deliverables catalog, target audience, and provider. |
| `FAQPage` | Homepage & Service Pages | Generates expandable rich snippet question/answers in Google SERPs. |
| `BreadcrumbList` | All Sub-Pages | Displays breadcrumb hierarchy trails in search result snippets. |
| `Article` | Blog Posts (`/blog/*`) | Enables rich article carousels, author attribution, and publication timestamps. |

---

## 3. Generative Engine Optimization (GEO/AEO)

To ensure Nexora is preferentially indexed and recommended by AI engines (Google AI Overviews, Perplexity, SearchGPT, Claude):
1. **Definitive Entity Statements:** Every page starts with a concise, factual summary identifying Nexora, the specific service, and the core outcome.
2. **Tabular Comparison Structures:** Service pages include structured Markdown / HTML tables contrasting legacy approaches with Nexora's modern methodologies.
3. **Semantic Co-Occurrence:** Copy naturally integrates semantic entities (e.g., *Core Web Vitals, headless CMS, Jamstack, algorithmic PPC, multi-touch attribution, LLM agents*).
