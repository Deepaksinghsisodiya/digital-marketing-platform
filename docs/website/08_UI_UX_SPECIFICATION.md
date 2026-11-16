# 08 — UI/UX SPECIFICATION & FRONTEND GUIDELINES

**Document:** Component Behaviors, Accessibility Rules & Layout Geometry  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** UI/UX Engineering Manual  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Ergonomic Viewport Standards & Fluid Layouts

All components must render cleanly without horizontal scroll or clipping across viewports from **360px** up to **1920px+**:

```css
/* Fluid Typography & Spacing Scales */
:root {
  --font-hero: clamp(2.25rem, 5vw, 4rem);
  --font-h1: clamp(1.875rem, 4vw, 3rem);
  --font-h2: clamp(1.5rem, 3vw, 2.25rem);
  --font-h3: clamp(1.25rem, 2vw, 1.75rem);
  --section-pad: clamp(3rem, 6vw, 6rem);
}
```

---

## 2. Component States & Behaviors

### 1. Primary Buttons (`ATMButton`)
- **Default:** Solid background (`#2563EB`), text white, font-medium, rounded-lg, height 44px (touch-friendly).
- **Hover:** Darker blue (`#1D4ED8`), subtle translate-y (`-1px`), soft drop-shadow.
- **Focus-Visible:** 2px solid ring (`ring-2 ring-primary-500 ring-offset-2`).
- **Active:** Scale down slightly (`scale-[0.98]`).
- **Disabled:** Background slate-200, text slate-400, cursor `not-allowed`.
- **Loading:** Background primary blue, text transparent or dimmed, spinning Lucide `Loader2` centered.

### 2. Mega Menu Behavior
- **Trigger:** Hover (desktop >= 1024px) with 100ms exit delay to prevent accidental dismissal when crossing mouse paths. Click on keyboard focus (`Enter` / `Space`).
- **Keyboard Access:** Tab enters first menu item; Arrow keys cycle through columns; `Escape` key closes menu and restores focus to parent navigation trigger.
- **Backdrop:** Light scrim or blur behind dropdown content to isolate text readability.

### 3. Mobile Navigation Sheet (<1024px)
- **Trigger:** Hamburger button on top right (`w-10 h-10` touch target).
- **Animation:** Slides smoothly from right using hardware-accelerated CSS `transform: translateX()`.
- **Focus Management:** Focus trapped inside drawer using Radix Dialog / FocusScope.
- **Close Triggers:** Close button (`X`), backdrop tap, or keyboard `Escape` press.

---

## 3. Accessibility & Contrast Verification (WCAG 2.2 AA)

- **Text Contrast:**
  - Dark text (`#111827`) on light background (`#FFFFFF` / `#F8FAFC`): **14.2:1** (Exceeds AAA).
  - Body text (`#475569`) on light background (`#FFFFFF`): **5.9:1** (Exceeds AA).
  - White text (`#FFFFFF`) on primary blue (`#2563EB`): **4.6:1** (Passes AA).
  - White text (`#FFFFFF`) on midnight navy (`#101828`): **18.1:1** (Exceeds AAA).
- **Screen Reader Labels:** All icon buttons (search trigger, mobile menu toggle, close dialog) must have explicit `aria-label` attributes.
