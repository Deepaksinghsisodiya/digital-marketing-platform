# 12 — LEAD GENERATION & CRM INTEGRATION SPECIFICATION

**Document:** Inbound Form Processing, Validation, Scoring & CRM Pipeline  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** End-to-End Inbound Lead Intake Architecture  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Public Lead Submission Flow

The website converts visitors through four primary entry points:
1. **Contact Page Form (`/contact`):** Comprehensive inquiry for enterprise projects.
2. **Consultation Booking (`/book-a-call`):** Direct discovery scheduling.
3. **Hero & Final CTA Inquiry Modal:** Low-friction project brief submission.
4. **Interactive ROI Calculator (`/tools/roi-calculator`):** High-intent value estimation capture.

### Complete Intake Sequence
```
Website Visitor
  │
  ├── 1. GET /api/v1/public/forms/contact
  │      └── Returns form schema + server-signed anti-bot timeTrapToken
  │
  ├── 2. Formik + Yup Frontend Validation
  │      └── Validates required fields, email format, phone format, consent checkbox
  │
  ├── 3. POST /api/v1/public/forms/contact/submissions
  │      └── Payload: fullName, email, phone, company, region, message,
  │                   idempotencyKey, honeypot, timeTrapToken, UTM tags
  │
  └── 4. ASP.NET Core Backend Processing
         ├── Honeypot check (rejects if populated)
         ├── Time-trap verification (>3 seconds elapsed, <24 hours old)
         ├── Idempotency deduplication check
         ├── Automated lead scoring calculation
         ├── Persistence into PostgreSQL `Leads` table
         ├── Outbox event enqueueing for email alert
         └── HTTP 200 JSON { success: true, referenceNumber: "NEX-..." }
```

---

## 2. Inbound Lead Scoring Engine

Every inbound lead is automatically scored by `Nexora.Application.Leads.LeadScoringService`:

| Attribute | Criteria | Score Weight |
|---|---|---|
| **Business Email** | Corporate domain (non-Gmail/Yahoo/Hotmail) | +25 pts |
| **Budget Tier** | Enterprise ($25k+ or ₹20L+) | +30 pts |
| **Budget Tier** | Growth ($10k–$25k or ₹8L–₹20L) | +20 pts |
| **Target Timeline** | Immediate (< 1 month) | +15 pts |
| **Complete Phone** | Valid regional E.164 phone number | +10 pts |
| **Scope Description** | Detailed project scope (> 50 words) | +10 pts |
| **Total Qualified Floor**| Leads scoring >= 60 are flagged as **High Priority** | Instant Slack/Email alert |

---

## 3. Preservation of Attribution & Metadata

The system preserves all campaign attribution data without exposing private tracking keys:
- `utm_source`: e.g. `google`, `linkedin`, `meta`
- `utm_medium`: e.g. `cpc`, `organic`, `email`
- `utm_campaign`: e.g. `enterprise-seo-2026`
- `referrer`: Original HTTP referrer URL
- `ip_country`: Inferred visitor country (`IN` / `US`)
- `client_user_agent`: Device and browser footprint for audit trail
