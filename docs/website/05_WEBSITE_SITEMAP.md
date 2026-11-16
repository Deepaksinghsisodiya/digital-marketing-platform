# 05 — COMPLETE WEBSITE SITEMAP & INFORMATION ARCHITECTURE

**Document:** Canonical URL Hierarchy & Website Sitemap Specification  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Information Architecture Across All Public Routes  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Master Route Architecture & Hierarchy

Every URL in the Nexora ecosystem follows a clean, descriptive, lowercase semantic hierarchy. There are zero dead-ends or empty placeholder pages.

```
/ (Homepage)
│
├── /about
│   ├── /about/our-story
│   ├── /about/mission-vision
│   ├── /about/our-approach
│   ├── /about/team
│   └── /about/careers
│
├── /services (Services Hub)
│   │
│   ├── DIGITAL GROWTH (Pillar 1)
│   │   ├── /services/seo
│   │   ├── /services/technical-seo
│   │   ├── /services/local-seo
│   │   ├── /services/ai-search-optimization (GEO/AEO)
│   │   ├── /services/paid-ads (Google & Meta PPC)
│   │   ├── /services/social-media-marketing
│   │   ├── /services/content-marketing
│   │   ├── /services/email-marketing
│   │   ├── /services/cro
│   │   ├── /services/analytics-reporting
│   │   └── /services/branding-creative
│   │
│   ├── TECHNOLOGY SOLUTIONS (Pillar 2)
│   │   ├── /services/web-design-development
│   │   ├── /services/web-application-development
│   │   ├── /services/custom-software-development
│   │   ├── /services/ecommerce-development
│   │   ├── /services/ui-ux-design
│   │   ├── /services/api-development
│   │   └── /services/cloud-solutions
│   │
│   └── AI & AUTOMATION (Pillar 3)
│       ├── /services/ai-integration
│       ├── /services/ai-chatbots
│       ├── /services/workflow-automation
│       └── /services/marketing-automation-crm
│
├── /industries (Industries Hub)
│   ├── /industries/saas
│   ├── /industries/ecommerce
│   ├── /industries/healthcare
│   ├── /industries/real-estate
│   ├── /industries/hospitality
│   ├── /industries/education
│   ├── /industries/manufacturing
│   └── /industries/professional-services
│
├── /solutions (Solutions Hub)
│   ├── /solutions/generate-leads
│   ├── /solutions/improve-search-visibility
│   ├── /solutions/build-digital-products
│   ├── /solutions/automate-operations
│   └── /solutions/scale-marketing
│
├── /our-work (Portfolio & Case Studies)
│   ├── /case-studies (Detailed Case Studies)
│   └── /portfolio (Project Showcase)
│
├── /insights (Blog & Knowledge Hub)
│   ├── /blog
│   ├── /blog/[slug]
│   └── /resources
│
├── /tools
│   └── /tools/roi-calculator
│
├── /contact
├── /book-a-call
├── /pricing
│
└── LEGAL & COMPLIANCE
    ├── /privacy (Privacy Policy)
    ├── /terms (Terms & Conditions)
    ├── /cookies (Cookie Policy & Preferences)
    ├── /trust (Trust & Security)
    └── /accessibility (Accessibility Statement)
```

---

## 2. Localization Routing Architecture (India & USA)

To serve both Indian and American enterprise clients seamlessly:

1. **Root URL (`/`):** Auto-detects visitor country via IP/Cookie (`nexora_region`) or defaults to `in`.
2. **Explicit Regional Paths:**
   - `/in/...` — Displays INR (`₹`) pricing context, IST timezone scheduling, and Indian DPDP legal disclosures.
   - `/us/...` — Displays USD (`$`) pricing context, EST/PST scheduling, and US privacy disclosures.
3. **Canonical Consistency:** All localized alternate pages implement explicit `<link rel="alternate" hreflang="en-IN" ...>` and `<link rel="alternate" hreflang="en-US" ...>` with canonical tags pointing to their regional self-reference.

---

## 3. Zero-404 Fallback Policy

If any database route is unseeded or temporarily offline:
- The website application provides built-in, static Server Component fallback content for all core Service, Industry, and Legal routes.
- The user will never encounter a broken 404 page for any route featured in the Header, Mega Menu, Bento Grid, or Footer.
