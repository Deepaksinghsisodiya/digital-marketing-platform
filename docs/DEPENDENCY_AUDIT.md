# Dependency & License Audit

| Package | App / Layer | Usage | Issue | Recommendation | Reason |
|---|---|---|---|---|---|
| `next` (^15.2.1) | Website | App Router SSR/ISR | None | Keep | Core framework |
| `react` / `react-dom` (^19.0.0) | Website & Admin | UI runtime | None | Keep | Core runtime |
| `framer-motion` (^14.14.0) | Website | Hero/motion animations | Heavy if used everywhere | Keep (targeted) | Used selectively in Hero/Motion wrappers; honors reduced motion |
| `embla-carousel-react` + `autoplay` (^8.6.0) | Website | AnnouncementBar, Hero, Testimonials | None | Keep | Lightweight, MIT licensed |
| `@radix-ui/react-accordion`, `dialog`, `tabs` | Website | Accessible primitives | None | Keep | WAI-ARIA compliant |
| `yup` (^1.7.1 / ^1.6.1) + `formik` (^2.4.6) | Website & Admin | Schema form validation | Some manual `toast.error` bypasses found & fixed | Keep | Standard per Section 10.1 |
| `libphonenumber-js` (^1.11.20) | Website & Admin | E.164 phone validation (IN/US) | None | Keep | Accurate international parsing |
| `isomorphic-dompurify` (^4.7.0) | Website & Admin | HTML XSS sanitization | None | Keep | Essential for rich-text safety |
| `@tanstack/react-table` (^8.21.2) | Admin | Data tables | None | Keep | Headless, performant |
| `@reduxjs/toolkit` (^2.6.1) | Admin | State & RTK Query APIs | None | Keep | Centralized cache invalidation |
| `sonner` (^2.0.8) | Website & Admin | API success/error notifications | Was misused for validation toasts | Keep (API toasts only) | Inline validation moved under fields |
| `FluentValidation.DependencyInjectionExtensions` | Backend | DTO validation | None | Keep | MIT/Apache permissive |
| `Riok.Mapperly` | Backend | Compile-time mapping | None | Keep | Zero-reflection, Apache-2.0 |
| `HtmlSanitizer` | Backend | Server-side HTML sanitization | None | Keep | MIT licensed |
| `MailKit` / `MimeKit` | Backend | SMTP email delivery | None | Keep | MIT licensed |
| `Serilog.AspNetCore` | Backend | Structured logging | None | Keep | Apache-2.0 |
