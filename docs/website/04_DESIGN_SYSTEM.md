# 04 — DESIGN SYSTEM & COMPONENT TOKEN ARCHITECTURE

**Document:** Centralized Token Architecture & Atomic UI Specifications  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Frontend Component Standard & CSS Token Layer  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Centralized CSS Variables & Design Tokens

Nexora standardizes all styling through semantic CSS variables defined in `@nexora/design-tokens` and imported into `src/styles/tokens.css`, `src/styles/theme.css`, and `src/styles/globals.css`.

### Core Token Mappings
```css
:root {
  /* Surface & Background */
  --nexora-bg: #f8fafc;
  --nexora-surface: #ffffff;
  --nexora-surface-alt: #f1f5f9;
  --nexora-border: #e2e8f0;

  /* Typography & Text */
  --nexora-text-heading: #111827;
  --nexora-text-body: #475569;
  --nexora-text-muted: #64748b;
  --nexora-text-on-dark: #f8fafc;

  /* Primary Brand Blue */
  --nexora-primary: #2563eb;
  --nexora-primary-hover: #1d4ed8;
  --nexora-primary-light: #eff6ff;
  --nexora-primary-electric: #3b82f6;

  /* Midnight Navy */
  --nexora-navy: #101828;
  --nexora-navy-light: #1e293b;

  /* Secondary Violet */
  --nexora-violet: #7c3aed;
  --nexora-violet-light: #f5f3ff;

  /* Status Colors */
  --nexora-success: #16a34a;
  --nexora-warning: #f59e0b;
  --nexora-error: #dc2626;

  /* Geometry & Radius */
  --nexora-radius-sm: 0.375rem; /* 6px */
  --nexora-radius-md: 0.5rem;   /* 8px */
  --nexora-radius-lg: 0.75rem;  /* 12px */
  --nexora-radius-xl: 1rem;     /* 16px */
  --nexora-radius-full: 9999px;

  /* Transitions */
  --nexora-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --nexora-transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. Component Hierarchy: Atomic System

### Atoms (Foundational Elements)
- `ATMButton`: Primary solid, Secondary outline, Ghost, Destructive, Link. Includes loading spinner and icon slots.
- `ATMHeading`: H1–H6 with responsive fluid clamp scales.
- `ATMText`: Paragraph, lead, caption, and mono variants.
- `ATMIcon`: Lucide React wrapper ensuring uniform stroke width (1.75px) and accessible labels.
- `ATMInput`: Text, email, tel, search, number fields with built-in validation states.
- `ATMTextarea`: Auto-expanding accessible multi-line input.
- `ATMSelect`: Radix-based accessible dropdown selector.
- `ATMBadge`: Pill badge with variant tints (Primary, Success, Violet, Warning).
- `ATMContainer`: Responsive centered container with max-width constraints (`max-w-7xl px-4 sm:px-6 lg:px-8`).

### Molecules (Composite UI Controls)
- `ServiceCard`: Icon, title, benefit statement, feature bullets, and explore link.
- `IndustryCard`: Sector icon, industry title, core challenge addressed, and CTA link.
- `CaseStudyCard`: Metric callout pill, project title, challenge, outcome, and tag list.
- `BlogCard`: Thumbnail image, category badge, publication date, reading time, title, and excerpt.
- `FAQItem`: Collapsible Radix accordion item with smooth CSS grid height transition.
- `Breadcrumb`: Accessible semantic breadcrumb list with chevron dividers.
- `FormField`: Wrapped input control with label, required asterisk, helper text, and accessible error message.

### Organisms (Full-Width Page Sections)
- `AnnouncementBar`: Dismissible dynamic notification strip.
- `Navbar & MegaMenu`: Sticky glassmorphic header with 3-pillar services mega menu, search trigger, and country switch.
- `MobileNavigation`: Accessible right-side drawer with keyboard trap and accordion navigation.
- `HeroSection`: High-impact headline, abstract vector growth visual, and dual CTAs.
- `CapabilitiesSection`: 3 large feature cards for Digital Growth, Technology Solutions, and AI & Automation.
- `FeatureGridBlock`: Modular bento grid displaying services or core strengths.
- `ProcessSteps`: 4-step interactive timeline (*Discover, Strategize, Execute, Optimize*).
- `TechnologySection`: 6-category architecture matrix showing verified engineering stacks.
- `InsightsSection`: Dynamic 3-card blog and guide feed.
- `FaqSection`: Comprehensive structured FAQ accordion.
- `CtaSection`: High-contrast conversion block with direct inquiry trigger.
- `Footer`: 5-column comprehensive sitemap and legal compliance footer.

---

## 3. Interaction & Accessibility Requirements

- **Focus Rings:** All interactive elements must render a 2px high-visibility outline on keyboard tab navigation (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`).
- **Touch Targets:** Minimum dimension of 44px x 44px on all mobile viewports (<768px).
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is detected via CSS media query, all transform transitions and looping keyframe animations are suppressed to immediate opacity shifts.
