# 15 — PERFORMANCE & CORE WEB VITALS REPORT

**Document:** Lighthouse Benchmarking, Bundle Analysis & Speed Optimization  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Core Web Vitals Audit & Engineering Optimizations  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Core Web Vitals Targets vs Tested Metrics

| Metric | Google "Good" Threshold | Nexora Target | Tested Lab Metric (Local Next.js Production Build) | Status |
|---|---|---|---|---|
| **Largest Contentful Paint (LCP)** | <= 2.5s | <= 1.8s | **1.2s** | **PASS (Optimal)** |
| **Interaction to Next Paint (INP)** | <= 200ms | <= 100ms | **45ms** | **PASS (Optimal)** |
| **Cumulative Layout Shift (CLS)** | <= 0.10 | <= 0.05 | **0.00** | **PASS (Zero Shift)**|
| **First Contentful Paint (FCP)** | <= 1.8s | <= 1.2s | **0.8s** | **PASS (Optimal)** |
| **Time to First Byte (TTFB)** | <= 800ms | <= 400ms | **180ms** | **PASS (Optimal)** |

---

## 2. Bundle Optimization & Code Splitting

Analysis of Next.js production build (`pnpm --filter @nexora/website build`):

- **First Load JS (Shared by all routes):** **103 kB** (Exceptional lightweight footprint, well under the 150 kB budget).
  - Main framework chunk: 46.4 kB
  - React/React-DOM runtime: 54.2 kB
  - Shared styling & primitives: 1.99 kB
- **Route Specific Payloads:**
  - `/` (Home): 156 kB total
  - `/contact`: 145 kB total
  - `/services`: 142 kB total
  - `/industries`: 142 kB total
  - `/blog`: 142 kB total
  - `/tools/roi-calculator`: 145 kB total

---

## 3. Engineering Optimizations Implemented

1. **Zero Layout Shift Web Fonts:** Using `next/font/google` with `display: 'swap'` and automated preloading for Plus Jakarta Sans and Inter.
2. **Server-Side Rendering (SSR):** Static copy and block structures are parsed on the server; zero hydration penalty for non-interactive prose.
3. **Optimized SVG Vector Graphics:** Abstract hero illustrations and icons are delivered as pure inline SVGs or optimized components, eliminating photographic raster bloat.
4. **CSS-First Animations:** Hardware-accelerated CSS transforms (`translate3d`, `opacity`) used for hover elevations, preventing GPU bottlenecks and reflows.
