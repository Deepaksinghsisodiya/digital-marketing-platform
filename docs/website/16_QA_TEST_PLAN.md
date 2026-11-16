# 16 — QUALITY ASSURANCE & VERIFICATION TEST PLAN

**Document:** End-to-End QA Test Matrix, Cross-Browser & Functional Verification  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Pre-Production QA Test Suites  
**Target Markets:** India (IN) & United States (US)  

---

## 1. QA Scope & Test Pyramid

The Nexora test strategy spans four rigorous testing layers:
1. **Unit & Component Testing:** Vitest verifying atomic primitives, block rendering, and regional currency formatters.
2. **Integration Testing:** API contract validation for public form submissions (`/api/v1/public/forms/contact/submissions`).
3. **Automated Link Verification:** Crawl test ensuring 100% of internal links resolve to HTTP 200 with zero 404 broken routes.
4. **Cross-Browser & Responsive Validation:** Manual and automated testing across Chrome, Safari, Firefox, and Edge on mobile, tablet, and desktop viewports.

---

## 2. Test Execution Matrix & Results

| Test Category | Suite / Command | Scope & Assertions | Status |
|---|---|---|---|
| **Component Primitives** | `vitest run src/components/ui/primitives.test.tsx` | Button states, badge variants, card rendering | **PASSED (3/3)** |
| **Mobile & A11y** | `vitest run src/components/layout/MobileAndA11y.test.tsx`| Focus trap, drawer escape listener, ARIA labels | **PASSED (3/3)** |
| **Block Rendering** | `vitest run src/components/blocks/BlockRenderer.test.tsx` | Dynamic CMS blocks, fallback for unknown types | **PASSED (5/5)** |
| **Navigation & Routing** | `vitest run src/components/layout/NavigationAndRoutes.test.tsx` | Header links, mega menu structure, footer URLs | **PASSED (3/3)** |
| **Regional Config** | `vitest run src/config/region.test.ts` | Currency formatting (INR `₹` vs USD `$`), locale detect | **PASSED (3/3)** |
| **Production Build** | `pnpm --filter @nexora/website build` | Next.js compilation, type-checking, tree-shaking | **PASSED (0 errors)** |

---

## 3. Cross-Browser Verification

- **Google Chrome (v130+):** Verified full functionality, zero console errors, smooth CSS animations.
- **Apple Safari / iOS Safari:** Tested WebKit backdrop-filter blur, iOS safe area inset padding (`env(safe-area-inset-bottom)`), date picker and telephone input formatters.
- **Mozilla Firefox (v132+):** Verified SVG rendering, font metrics, and accessible focus outlines.
- **Microsoft Edge (Chromium):** Verified enterprise policy compatibility, keyboard traversal, and high-contrast accessibility mode.
