# NEXORA FINAL DESIGN & ARCHITECTURAL DECISIONS

**Document:** Formal Architecture & Design Decision Record (Pre-Implementation Sign-Off)  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Definitive Architectural Decisions Across All 18 Development Phases  
**Target Markets:** India (IN) & United States (US)  
**Status:** Approved & Frozen for Implementation  

---

## 1. Brand Identity & Visual Language Decisions

1. **Brand Mark & Wordmark:**
   - **Symbol:** Clean, minimal geometric vector symbol representing convergence (interlocking geometric angles symbolizing Technology, Marketing, and AI).
   - **Wordmark:** Clean uppercase custom-spaced typography: `NEXORA`.
   - **Assets Required:** Full color on light, monochrome dark, pure white on navy, square avatar, and multi-resolution favicon (`favicon.ico`, `apple-touch-icon.png`, `icon.svg`).
   - *Decision:* Standardize SVG vector logos stored in `/public/brand/` for sub-second vector rendering.

2. **Color Palette & Contrast Ratios:**
   - **Primary Surface (65%):** Pure White (`#FFFFFF`) and Clean Off-White (`#F8FAFC`).
   - **Contrast Surface (20%):** Deep Midnight Navy (`#101828`) for the Footer, Technology/AI blocks, and High-Impact Dark highlights.
   - **Primary Accent (10%):** Royal Digital Blue (`#2563EB`) and Electric Blue (`#3B82F6`) for primary buttons, focus rings, and active state indicators.
   - **Secondary Accent (5%):** Deep Violet (`#7C3AED`) used strictly for AI & Automation badges, subtle glows, and strategic gradient highlights.
   - **Text Contrast:** Headings in Slate-900 (`#0F172A`), body copy in Slate-600 (`#475569`), borders in Slate-200 (`#E2E8F0`).
   - *Decision:* Exceed WCAG 2.2 AA with a minimum 7:1 contrast ratio for all primary body text and 4.5:1 for UI controls.

3. **Typography Stack:**
   - **Display / Headings:** Plus Jakarta Sans (`font-heading`), weights 600, 700, 800.
   - **Body & Editorial:** Inter (`font-sans`), weights 400, 500, 600.
   - **UI Labels & Tags:** DM Sans / Inter, weight 600.
   - *Decision:* Load via Next.js Font Optimization (`next/font/google`) with zero layout shift (CLS = 0) and local fallbacks.

---

## 2. Information Architecture & Navigation Decisions

1. **Header Navigation:**
   - Sticky header with blurred glassmorphism on scroll (`backdrop-blur-md bg-white/90 border-b border-slate-200/80`).
   - **3-Pillar Mega Menu:** Grouped into *Digital Growth*, *Technology Solutions*, and *AI & Automation*, with Lucide icons and 1-line benefit descriptors for every service.
   - **Dropdowns:** Dedicated dropdowns for *Industries* and *Solutions*.
   - **Direct Links:** *Our Work*, *Insights*, *About*, *Contact*.
   - **Global Search:** Accessible modal triggered by `Cmd+K` / `Ctrl+K`.
   - **Region Switcher:** Accessible selector toggling `IN (₹)` and `US ($)`.
   - **Mobile Navigation:** Slide-over sheet from right with focus trapping, keyboard Escape handler, and expandable accordion sections.

2. **Footer Architecture:**
   - Deep Midnight Navy background (`#101828`) with 5 organized columns:
     1. Brand & Corporate Registration (*Nexora Technoligics Pvt. Ltd.*, positioning, region switch).
     2. Services (Top Growth & Technology offerings).
     3. Industries & Solutions.
     4. Company, Resources & ROI Calculator.
     5. Legal, DPDP/Privacy, Terms, Cookies, Accessibility Statement.
   - Re-open Cookie Preferences link.
   - Verified active routes with zero 404 links.

---

## 3. Technology & Framework Decisions

1. **Frontend Core:**
   - **Framework:** Next.js 15 (App Router).
   - **Rendering Strategy:** Server Components by default for optimal TTFB and SEO. Client Components only where user interaction is mandatory (forms, dropdowns, calculators, tabs).
   - **Styling:** Tailwind CSS with centralized CSS variables (`src/styles/tokens.css`, `theme.css`).
   - **Component Primitives:** Radix UI (`Accordion`, `Dialog`, `Tabs`, `Slot`).
   - **Icons:** Lucide React exclusively (uniform stroke width 1.75px).
   - **Forms:** Formik + Yup with strict client-side validation paired with server-side validation.
   - **Animations:** Lightweight CSS keyframes + Framer Motion (only where required), strictly guarded by `prefers-reduced-motion`.

2. **Backend & CRM Integration:**
   - **Backend API:** Reuse existing ASP.NET Core API at `http://localhost:5201/api/v1/public/`.
   - **Lead Endpoint:** `POST /api/v1/public/leads` with payload capturing:
     - Full Name, Business Email, Company Name, Country, Website URL, Interested Services, Budget Tier, Timeline, Project Description, UTM Source, UTM Medium, UTM Campaign, Referrer, and Lead Score.
   - **Site Settings Endpoint:** `GET /api/v1/public/site-settings` for dynamic announcement banner, maintenance state, and theme overrides.
   - **Spam Protection:** Honeypot field + rate-limiting to block automated abuse.

---

## 4. Content & Localization Decisions

1. **Dual Market Localization:**
   - Regional cookie and URL structure supporting `/in` (India) and `/us` (United States).
   - **Currency Formatting:**
     - India: Indian Rupees (`INR` / `₹`) with Lakh/Crore notation where applicable.
     - USA: US Dollars (`USD` / `$`).
   - **Time Zones:** IST for India; EST/PST for USA.
   - **Honest Physical Representation:** Display registered Indian corporate identity (*Nexora Technoligics Pvt. Ltd.*) and transparent global remote delivery model. Never invent fictitious US physical addresses or phone numbers.

2. **Zero Fabricated Content Policy:**
   - Absolutely no fake client logos (e.g., claiming Fortune 500 clients without verified contracts).
   - Absolutely no fake reviews or stock photo testimonials.
   - Clearly label demonstration projects and verified architecture showcases.
   - No guaranteed Google #1 ranking claims.

---

## 5. Performance & Quality Gates

1. **Core Web Vitals Thresholds:**
   - Largest Contentful Paint (LCP): <= 2.0s (Target: < 1.5s).
   - Interaction to Next Paint (INP): <= 150ms.
   - Cumulative Layout Shift (CLS): <= 0.05 (Target: 0.00).
   - Total First Load JS: < 150 kB.

2. **Accessibility (WCAG 2.2 AA):**
   - 100% keyboard navigable without mouse.
   - Visible focus indicators on every interactive control (`ring-2 ring-primary-500 ring-offset-2`).
   - Screen-reader accessible ARIA labels on all icon-only buttons.
   - Automated testing via Axe-core and Vitest.

3. **Zero 404 Gate:**
   - Automated link crawler verifying all header, footer, bento grid, and sitemap URLs return HTTP 200 before production release.
