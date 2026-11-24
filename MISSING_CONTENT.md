# 📋 Missing Content — What You Need to Provide

Everything needed to make the Nexora website production-ready.
Check off items as you provide them, then run `pnpm check:content`.

---

## 🔴 Critical — Site Looks Incomplete Without These

- [ ] **Legal company name** → `site.config.ts → company.legalName`
  - Full registered entity name, e.g. "Nexora Digital Marketing LLP"

- [ ] **Year founded** → `site.config.ts → company.yearFounded`
  - e.g. 2019

- [ ] **Phone number** → `site.config.ts → contact.phone`
  - With country code, e.g. "+91 98765 43210"

- [ ] **WhatsApp number** → `site.config.ts → contact.whatsapp`
  - No spaces, e.g. "+919876543210"

- [ ] **Business email** → `site.config.ts → contact.email`
  - e.g. "hello@nexora.in"

- [ ] **Office address** → `site.config.ts → contact.address`
  - Street, city, state, PIN code

- [ ] **Founder name & title** → `site.config.ts → founder.name, founder.title`
  - e.g. "Rahul Sharma", "Founder & CEO"

- [ ] **Founder short bio** → `site.config.ts → founder.shortBio`
  - 2–3 sentences about your journey and why you started Nexora

- [ ] **Founder photo** → `/public/images/founder/portrait.jpg`
  - Professional portrait, 4:5 ratio, min 1200×1500px

- [ ] **Brand logo** → `/public/images/brand/logo.svg`
  - Horizontal SVG (+ icon-only version + white version)

- [ ] **At least 3 real client logos** → `/public/images/clients/logos/`
  - SVG preferred, transparent PNG OK. Update `site.config.ts → clients`

- [ ] **At least 3 real testimonials** → `site.config.ts → testimonials`
  - Quote, person's name, their role, company name. Photo is a bonus.

- [ ] **Business stats** → `site.config.ts → stats`
  - e.g. clients served, years of experience, projects completed

---

## 🟡 Important — Builds Trust & Professionalism

- [ ] **Team members** → `site.config.ts → team`
  - Name, role, short bio, square headshot per member

- [ ] **At least 1 case study** → `site.config.ts → caseStudies`
  - Client, challenge, what you did, measurable result, cover image

- [ ] **Certification badges** → `site.config.ts → certifications`
  - Google Partner, Meta Partner, HubSpot, etc. with logo files

- [ ] **Social media URLs** → `site.config.ts → social`
  - Only active, real profiles. Remove/leave empty any that don't exist.

- [ ] **Google Maps embed URL** → `site.config.ts → contact.mapEmbedUrl`
  - Go to Google Maps → Share → Embed → copy the iframe src URL

- [ ] **OG/social share image** → `/public/images/og/default.jpg`
  - Branded image, 1200×630px, shown when links are shared

- [ ] **Founder full bio** → `site.config.ts → founder.fullBio`
  - 3–5 sentences for the About page

---

## 🔵 Nice to Have — Extra Polish

- [ ] **Office photos** → `/public/images/office/`
  - 3–5 workspace / team photos, 16:9 ratio

- [ ] **Testimonial headshots** → `/public/images/testimonials/`
  - 1:1 square, 200×200px min

- [ ] **Case study screenshots** → `/public/images/case-studies/<slug>/`
  - Dashboard screenshots, before/after comparisons

- [ ] **Video testimonials** → YouTube/Vimeo links
  - Add URL to each testimonial entry in config

- [ ] **Awards** → `site.config.ts → awards`
  - Name, year, issuer, link

- [ ] **Blog posts** → At least 3 initial articles (titles + content)

- [ ] **Lead magnet PDF** → Downloadable checklist or guide

- [ ] **Custom OG images** → Per-page branded images (home, services, about)

---

## How to Update

1. Edit `apps/website/src/content/site.config.ts`
2. Place images in `apps/website/public/images/` following the paths above
3. Run `pnpm check:content` to verify all fields are filled
4. Run `pnpm check:links` to verify no dead links
5. Rebuild and test: `pnpm build && pnpm start`

## File Reference

| File | Purpose |
|------|---------|
| `src/content/site.config.ts` | All business data (single source of truth) |
| `IMAGE_CHECKLIST.md` | Full image spec list with sizes and priorities |
| `CHANGELOG.md` | What changed in the rebuild |
