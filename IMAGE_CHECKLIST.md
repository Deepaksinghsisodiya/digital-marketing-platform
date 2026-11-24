# 📸 Image Checklist — Nexora Website

Every image slot on the website, its recommended spec, where it appears, and priority.

> **Priority key:** **Must** = site looks incomplete without it · **Important** = builds trust · **Nice** = polish

---

## Brand Assets

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Logo (horizontal) | `/public/images/brand/logo.svg` | SVG, \~200×50 | Header, Footer, OG | **Must** |
| Logo mark (icon only) | `/public/images/brand/logo-mark.svg` | SVG, square | Favicon, mobile | **Must** |
| Logo (white version) | `/public/images/brand/logo-white.svg` | SVG | Dark backgrounds | **Must** |
| Favicon | `/public/favicon.svg` | SVG, 32×32 | Browser tab | **Must** |

## Founder

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Portrait | `/public/images/founder/portrait.jpg` | 4:5 ratio, min 1200×1500px, JPEG/WebP | Home spotlight, About | **Must** |
| Casual / working shot | `/public/images/founder/casual.jpg` | 16:9 or square | About page hero | Nice |

## Team Members

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Headshot (per member) | `/public/images/team/<first-name>.jpg` | 1:1 square, min 600×600px | About, Team grid | **Must** per member |

## Office / Workspace

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Workspace wide shot | `/public/images/office/workspace-1.jpg` | 16:9, min 1600×900px | About | Nice |
| Team meeting | `/public/images/office/team-meeting.jpg` | 16:9, min 1600×900px | About | Nice |
| Detail / culture | `/public/images/office/culture.jpg` | 16:9, min 1600×900px | About, Careers | Nice |

## Client Logos

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Logo (per client) | `/public/images/clients/logos/<name>.svg` | SVG (preferred) or transparent PNG, \~200×80 | Home logo strip, About | **Must** (3+ logos) |

## Testimonials

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Headshot (per person) | `/public/images/testimonials/<name>.jpg` | 1:1 square, min 200×200px | Home, Contact | Important |

## Case Studies

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Cover image | `/public/images/case-studies/<slug>/cover.jpg` | 16:9, min 1200×675px | Home cards, listing | **Must** per study |
| Screenshots | `/public/images/case-studies/<slug>/screenshot-*.jpg` | Flexible, min 1200px wide | Detail page | Important |
| Before / after | `/public/images/case-studies/<slug>/before-after.jpg` | Side-by-side, 2:1 ratio | Detail page | Nice |

## Certifications & Badges

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Google Partner | `/public/images/badges/google-partner.svg` | SVG / transparent PNG | Home, Footer, About | **Must** if certified |
| Meta Business Partner | `/public/images/badges/meta-partner.svg` | SVG / transparent PNG | Home, Footer, About | **Must** if certified |
| HubSpot | `/public/images/badges/hubspot.svg` | SVG / transparent PNG | About | Important if certified |
| Clutch | `/public/images/badges/clutch.svg` | SVG / transparent PNG | About, Footer | Nice |
| GoodFirms / DesignRush | `/public/images/badges/goodfirms.svg` | SVG / transparent PNG | About | Nice |

## OG / Social Share Images

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Default OG | `/public/images/og/default.jpg` | 1200×630px, JPEG | All pages (fallback) | **Must** |
| Home OG | `/public/images/og/home.jpg` | 1200×630px | Home page | Nice |
| Services OG | `/public/images/og/services.jpg` | 1200×630px | Services page | Nice |
| About OG | `/public/images/og/about.jpg` | 1200×630px | About page | Nice |
| Blog OG | `/public/images/og/blog.jpg` | 1200×630px | Blog listing | Nice |

## Hero / Marketing

| Slot | Path | Spec | Used On | Priority |
|------|------|------|---------|----------|
| Home hero photo | `/public/images/hero/home.jpg` | 16:9, min 1920×1080px | Home hero (if photo-based) | Nice |
| Free audit sample | `/public/images/marketing/audit-sample.jpg` | 4:3, min 800×600px | Free Audit page | Important |
| Lead magnet cover | `/public/images/marketing/lead-magnet.jpg` | 3:4 (book style), min 600×800px | Lead magnet page | Nice |

---

## Directory Structure (create all folders)

```
public/images/
├── brand/           # Logo files
├── founder/         # Founder photos
├── team/            # Team headshots
├── office/          # Office / workspace photos
├── clients/
│   └── logos/       # Client logo files
├── case-studies/
│   └── <slug>/      # Per case-study images
├── testimonials/    # Client headshots
├── badges/          # Certification badges
├── og/              # Open Graph / social share
├── hero/            # Hero section images
└── marketing/       # Audit samples, lead magnets
```

## Image Optimization Notes

- Serve AVIF/WebP via `next/image` (automatic with the `<OptimizedImage>` component)
- Use `priority` prop only for above-the-fold hero images
- Always set explicit `width` and `height` to prevent layout shift (CLS)
- All images must have descriptive `alt` text (required by the component)
- Use `sizes` prop to prevent serving oversized images on mobile
- Aim for < 200KB per image after optimization
