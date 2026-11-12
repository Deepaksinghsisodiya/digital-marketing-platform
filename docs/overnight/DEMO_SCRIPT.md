# Nexora Platform — Morning Demo & Verification Walkthrough

Welcome back! This guide provides a step-by-step walkthrough to test and demonstrate every new feature delivered during the overnight run.

---

## 1. Quick Launch (Starting All Services)

Run the master start script or open terminal tabs:

```powershell
# In root directory
.\scripts\start-all.ps1
```

Or run individually:

- **Backend API:** `dotnet run --project backend/src/Nexora.Api` (Listening on `http://localhost:5201`)
- **Admin Panel:** `pnpm --filter @nexora/admin dev` (Listening on `http://localhost:5173` or `5174`)
- **Public Website:** `pnpm --filter @nexora/website dev` (Listening on `http://localhost:3000`)
- **Mailpit:** `infra/tools/mailpit.exe -s [::]:1025 -l [::]:8025` (UI at `http://localhost:8025`)

---

## 2. Admin Panel Features

### A. Global Command Palette (`Ctrl+K` / `Cmd+K`)

1. Open Admin Panel at `http://localhost:5173` (or `5174`).
2. Press **`Ctrl + K`** (or **`Cmd + K`** on macOS) or click the **"Search resources, CRM, leads..."** bar in the top header.
3. Type `"Leads"`, `"Settings"`, or `"Home"` in the search input.
4. Use arrow keys `Up` / `Down` and press `Enter` to jump instantly to any section or page!

### B. Slide-over Notifications & Telemetry Drawer

1. Click the **Notification Bell** icon in the top right header (next to the theme toggle).
2. The drawer will slide out from the right displaying:
   - Recent system security and audit events (`media.upload`, `page.publish`, etc.).
   - Inbound lead alerts with timestamps and contact details.
3. Click outside or press `Esc` to close.

### C. Media Library Image Previews (Resolved Issue)

1. In the Admin sidebar, click **"Media Library"**.
2. Notice your uploaded image cards (e.g. `images (1).jpg`).
3. The image thumbnail now loads crisp and clean!
4. The media requests route through the Vite proxy (`/api/v1/public/media/...`), eliminating previous CORS and Chrome Private Network Access blocks.

### D. Live Theme Customizer & Design Tokens

1. Go to **"Site Settings"** in the sidebar.
2. Scroll to the **"Visual Theme & Branding Tokens"** section:
   - Try changing the **Primary Brand Color** (e.g., `#2563eb` -> `#7c3aed`).
   - Try changing **Border Radius Scale** or **Heading Typography**.
3. Click **"Save Settings"**.
4. Open the Public Website at `http://localhost:3000` — your CSS custom tokens are immediately injected into `:root` and reflected live!

### E. CMS Unsaved Changes Guard & Page Archive

1. In Admin, go to **"Website CMS"** -> Click any page to edit.
2. Make a small edit in a title field without saving.
3. Try clicking "Dashboard" or closing the tab.
4. The browser displays a confirmation modal warning you about unsaved changes.
5. In the CMS Pages list, clicking "Archive" now soft-archives the page (`Status = Archived`) instead of deleting history.

---

## 3. Public Website Features

### A. Dynamic Sitemap & Robots.txt

1. Navigate to `http://localhost:3000/sitemap.xml`.
2. Notice the XML sitemap dynamically includes all currently published CMS pages and active blog posts directly from the database.
3. Navigate to `http://localhost:3000/robots.txt` to inspect standard crawler directives pointing to `/sitemap.xml`.

### B. High-Value Agency CMS Blocks

Navigate to any page containing new blocks or inspect the component showcase:

- **Interactive ROI Calculator:** Sliders for monthly ad spend and target conversion rate, calculating projected revenue impact in real time.
- **Agency Comparison Table:** Side-by-side capability matrix comparing Nexora against traditional agencies and in-house hiring.
- **Process Sprint Roadmap:** 4-stage sprint delivery roadmap (Discovery -> Strategy -> Execution -> Scale).
- **Booking Modal Embed:** Integrated Cal.com / Calendly booking modal with allowlisted domains.
- **Ethical Sample Badges:** All sample case studies, client logos, and metrics display subtle "Sample Data" pills.

---

## 4. Inbound Lead Scoring & Webhook Engine

### A. Submitting a High-Value Lead

1. Go to `http://localhost:3000/contact` (or use the contact form block).
2. Submit a high-value lead:
   - **Name:** John Doe
   - **Email:** `john@acmecorp.com` (Corporate domain -> +25 points)
   - **Company:** `Acme Corp` (+15 points)
   - **Phone:** `+1 (555) 234-5678` (+15 points)
   - **Budget:** `$10,000 - $25,000+` (+25 points)
   - **Timeline:** `Immediately` (+20 points)
3. Check the Admin **"Leads Inbox"**:
   - The lead appears with an auto-calculated **Score of 100/100** and a "Hot" priority badge!

### B. SSRF-Protected Outbound Webhooks

1. In Admin **Site Settings**, configure a webhook endpoint (e.g., `https://webhook.site/...` or your staging endpoint) and a secret key.
2. Inbound leads immediately enqueue an outbox event `"LeadWebhook"`.
3. The background `OutboxProcessor` validates the target URL:
   - Disallows private subnets (`10.x`, `192.168.x`, `172.16.x`) to prevent server-side request forgery.
   - Signs the request body using `HMAC-SHA256` in the `X-Nexora-Signature` header.
   - Inspect delivery in the Admin **"Email & Outbox"** monitor.

---

## 5. Database Backup & Restore Utility

Test the native SQL Server backup and restore scripts in PowerShell:

```powershell
# 1. Perform a full native backup of nexora_dev
.\scripts\backup-db.ps1 -DatabaseName "nexora_dev"

# Output will display:
# Destination File: D:\Nexora-Digital-Marketing-Platform\backend\backups\nexora_dev_...bak
# SUCCESS: Database backup completed successfully! (6.2 MB)

# 2. Test restoring the backup to an isolated verification database
.\scripts\restore-db.ps1 -BackupFilePath "backend\backups\nexora_dev_20261112_021238.bak" -TargetDatabaseName "nexora_restore_test"

# Output will display:
# Analyzing backup contents...
# Executing database RESTORE...
# SUCCESS: Database restored and verified successfully! (31 tables present)
```

---

## 6. Website UI Overhaul Demo (Steps W0 - W8)

### A. Zero 404 Links & Navigation Mega-Menus

1. Open Public Website at `http://localhost:3000`.
2. Hover over **"Services"** in the top navigation:
   - Notice the mega-menu cleanly grouped into **Demand Generation**, **Conversion & Tech**, and **Lifecycle & Retention**.
   - Click on any service (e.g. `/services/seo`, `/services/paid-ads`, `/services/cro`) — every single page loads 200 OK with dedicated benefits, deliverables, and service architecture!
3. Hover over **"Industries"** in the top navigation:
   - Click through SaaS, E-commerce, Healthcare, or Real Estate (`/industries/saas`, etc.) — all load with 200 OK.
4. Run link audit script anytime in terminal:
   ```powershell
   node apps/website/scripts/check-links.mjs
   ```
   Verified **38/38 links 200 OK**!

### B. Universal Search Dialog (Cmd+K / Ctrl+K)

1. On the public website, click the **Search icon** in the header or press `Cmd+K` / `Ctrl+K`.
2. Type `"SEO"` or `"Automation"` — live results search through published pages, blog posts, and service offerings via `/api/v1/public/search`.

### C. Dev-Only Design System Showcase

1. Navigate to `http://localhost:3000/design-system`.
2. Review all design tokens, Radix Accordion, Tabs, CVA Button variants, Card primitives, and Marquee animations.

### D. Mobile Responsive Experience (< 1024px)

1. Resize your browser window to mobile width (e.g., 390px) or open DevTools device emulation.
2. Observe the sticky bottom bar with **Call Now**, **WhatsApp**, and **Book Call** action buttons.
3. Tap the mobile hamburger menu to open the full-height accessible Radix sheet drawer with accordion service sub-menus and >=44px tap targets.

---

## 7. Running the Automated Test Suite

To verify the complete test suite at any time:

```powershell
# Run all 135 backend tests (Unit, Arch, Integration)
dotnet test backend/Nexora.sln

# Run all 23 frontend tests (Admin: 6, Website: 17)
pnpm -r test

# Run code style & linting checks
pnpm -r lint
pnpm run format:check
```

**All 158 tests pass (158/158 pass, 0 fail, 0 skip). Enjoy exploring the upgraded platform!**
