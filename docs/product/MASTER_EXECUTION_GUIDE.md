# NEXORA — MASTER EXECUTION GUIDE (Antigravity ke liye)

> Ye file repo ke root mein rakho (ya `docs/product/`). Antigravity ko bolo: **"Pehle is poori file ko padho. Isi ke hisaab se ek-ek step karo. Ek step complete + test + approval ke baad hi agla step."**
> Language: Hinglish. Last update: 10 Nov 2026.

---

## 0. GOLDEN RULES (har step par lagu, kabhi todna nahi)

1. **Ek ke baad ek step.** Ek hi prompt mein poora project mat banao. Step khatam, local par run + test, report, user approval, tab agla step.
2. **Pehle PLAN, phir code.** Har step ki shuruaat mein plan dikhao (kya banega, files, packages, DB changes, tests). User approve kare tab code.
3. **Har step ka exit gate** (Section 3) pass hona zaroori hai. Summary kaafi nahi, **raw proof** do (command output, test names, curl output).
4. **Koi test skip nahi.** `Skipped: 0`. Test names paste karo, sirf count nahi.
5. **Git:** branch/commit/push/merge sirf user ki explicit approval se. Commit se pehle diff summary. `.env` kabhi commit nahi.
6. **Secrets:** kisi bhi password/token/connection string ko log, chat, report, ya repo mein mat likho. Sirf `.env`/user-secrets. Report mein "password print mat karna".
7. **Koi hardcoding nahi** (Section 2.4).
8. **Scope creep nahi.** Jo step mein nahi likha wo mat banao. Kuch zaroori lage to RUKO aur batao.
9. **Conflict ya doubt ho to RUKO** aur poochho. Apni marzi se architecture mat badlo.
10. **Har step ke baad report format** (Section 4) follow karo, phir ROKO.

---

## 1. PROJECT KYA HAI

**Nexora** = Digital Marketing Agency ka platform. Abhi sirf 3 cheezein banti hain:
1. **Public Website** (Next.js): visitors dekhte hain, lead form bharte hain.
2. **Agency Admin Panel** (React + Vite): Nexora team website, leads, clients, email, users manage karti hai.
3. **Backend API** (.NET 10 + EF Core + SQL Server): saara logic, security, data.

**Business goal:** Website se lead aaye, admin mein follow-up ho, lead client bane, client ko email isi system se jaye. India aur USA ke clients (ek hi URL `nexora.com`, region cookie se).

**Sabse zaroori product rule:** Website aur admin dono **dynamic** hain. Page content, blocks, menus, theme, forms, email templates, statuses, settings sab admin se configure honge. **Code mein business content hardcoded nahi.**

**Abhi scope ke BAHAR (baad mein):** multi-tenant, RLS, client portal, client website builder, WhatsApp API, social publishing, automation builder, AI, Redis, SignalR, microservices, free-form drag-anywhere page builder.

---

## 2. LOCKED DECISIONS (badlenge nahi, user hi badal sakta hai)

### 2.1 Architecture
- **Single-tenant.** `OrganizationId`, RLS, tenant resolution nahi. Layering rakho: Domain / Application / Infrastructure / Api / Worker (baad mein tenant add ho sake).
- **Modular monolith + Clean Architecture.** Domain kisi par depend nahi (architecture test enforce karta hai). Identity (ApplicationUser/Role) **Infrastructure** mein, Domain/Application mein Identity dependency nahi.
- Website aur admin **seedha DB nahi** chhuenge. Sirf API ke through.
- Auth: **ASP.NET Core Identity + HttpOnly Secure cookie.** JWT/localStorage nahi.
- Public URL ek: `nexora.com`, locale prefix nahi. Region = cookie (`nexora_region`) + `Accept-Language`. Supported regions config se. URL strategy config flag se baad mein subpath mein switch ho sake.
- Launch language: English. `locale` field rakho, Hindi baad mein.

### 2.2 Tech stack (versions repo ke `global.json`, `Directory.Packages.props`, `pnpm-lock.yaml` se pinned)
| Layer | Tech |
|---|---|
| Backend | .NET 10 LTS, ASP.NET Core Web API, EF Core 10, **SQL Server** (`Microsoft.EntityFrameworkCore.SqlServer`) |
| Backend libs | Serilog, FluentValidation, Mapperly (ya manual mapping), MailKit, built-in OpenAPI + Scalar + Swashbuckle.AspNetCore.SwaggerUI (sirf Development) |
| Tests | xUnit, Shouldly, NetArchTest, WebApplicationFactory (real SQL Server `nexora_test`) |
| Website | Next.js (App Router) + TypeScript strict, next-intl (`localePrefix: never`), Tailwind, shadcn/ui + Radix, Lucide |
| Admin | React + Vite + TypeScript strict, Redux Toolkit + RTK Query, TanStack Table, Formik + Yup, react-i18next, Tailwind, shadcn/ui |
| Phone/country | libphonenumber-js, i18n-iso-countries (MIT) |
| Tools | pnpm workspaces, ESLint, Prettier, Vitest, Playwright, Mailpit (local email catcher) |
| Later (CMS step mein) | TipTap (rich text), dnd-kit (block reorder) |

**Library rules:** install se pehle license verify (MIT/Apache-2.0/BSD/ISC). Paid, trial, GPL/AGPL runtime dependency nahi. **Avoid:** AutoMapper, MediatR, MassTransit, FluentAssertions v8+, ImageSharp, Hangfire Pro, paid UI kit/font/icon. Sirf wahi library jo abhi use ho. License table mein **exact version** (kabhi "Latest" nahi).

**Ek jaan-boojhkar apwaad:** SQL Server open-source nahi hai. Express edition free hai (10 GB DB, 1 GB buffer RAM, 4 cores). Production Linux container par min 2 GB RAM (droplet 4 GB lo). Licensing production se pehle review.

### 2.3 Local environment (Windows)
| Service | URL / Port |
|---|---|
| API | `http://localhost:5201` (Swagger `/swagger`, Scalar `/scalar`, Dev only) |
| Website | `http://localhost:3000` |
| Admin | `http://localhost:5173` |
| SQL Server | `(localdb)\MSSQLLocalDB` ya `localhost\SQLEXPRESS`, Windows Auth (`Trusted_Connection=True`) |
| Databases | `nexora_dev` (development), `nexora_test` (sirf tests) |
| Mailpit | SMTP `localhost:1025`, UI `http://localhost:8025` (binary: `infra/tools/mailpit.exe`) |
| Docker | Abhi host par nahi. `docker-compose.yml` "unverified" hai. Production se pehle Docker wali machine par test karna hai. |

PostgreSQL **hata diya gaya** hai. Koi Postgres reference active nahi (sirf decision-log mein history note).

### 2.4 NO-HARDCODING RULES
- Code mein hardcoded nahi: URL, port, connection string, email, password, API key, secret, company naam, phone, color, font, country/region list, locale list, cookie name, rate limit numbers, token expiry.
- **Config hierarchy:** environment variables / `.env` / user-secrets -> `appsettings*.json` (non-secret defaults) -> **DB settings (admin se editable)**.
- Repo mein sirf `.env.example` (placeholders). Real `.env` gitignored.
- Frontend bundle mein sirf public config (API base URL). Koi secret nahi.
- Seed/initial data "initial data" hai, admin se editable. Code mein constants ki tarah use nahi.
- Seed admin: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` sirf env/user-secrets se. Repo mein koi default credential nahi.
- **Code mein fix rahega (kyunki code enforce karta hai):** block types (Hero, FAQ...), field types, permission KEYS, email variable names. Baaki sab admin se.

### 2.5 Security baseline
Password hash (Identity default), lockout config se, rate limit (per-IP built-in, per-account Identity lockout), CSRF (antiforgery, `GET /api/v1/auth/csrf` + header `X-XSRF-TOKEN`), CORS `AllowCredentials` sirf explicit origin allowlist, security headers/CSP, forgot-password same response (enumeration nahi), token URL fragment (`#`) mein (email query string mein nahi), audit mein password/token/request-body kabhi nahi, logs mein secrets/PII redact, server-side validation hamesha, UI visibility sirf convenience (API authoritative).

---

## 3. HAR STEP KA EXIT GATE (checklist, sab PASS chahiye)

Har step ke end mein ye 10 cheezein proof ke saath:
1. `dotnet build` 0 errors, `dotnet test` raw output (test names, Passed/Failed/Skipped=0)
2. `pnpm -r lint`, `pnpm -r test`, `pnpm run format:check` clean
3. Teeno apps local par chalein (API, website, admin); `/health/ready` real SQL Server par 200
4. Step ke apne acceptance criteria (step ke section mein) ka end-to-end proof (curl/screenshot/test)
5. Migration ho to: generated SQL pehle dikhao, **apply user approval ke baad**, apply ke baad tables/indexes ka proof
6. Secrets scan: `git grep --untracked -n -i -E "password|secret|token|apikey|connectionstring|@[a-z0-9.-]+\.[a-z]{2,}|https?://" .` (node_modules/bin/obj/dist skip). Har non-placeholder match explain.
   (Note: plain `git grep` untracked files nahi dekhta, isliye `--untracked` zaroori.) `git ls-files` se confirm: `.env` tracked nahi.
7. License table update (exact versions)
8. Architecture tests pass (Domain/Application mein Infrastructure/Identity leak nahi)
9. OpenAPI types regenerate: `packages/contracts` script, diff dikhao
10. Report format (Section 4) + Deviations/Assumptions/Open issues

---

## 4. HAR STEP KE BAAD REPORT FORMAT

- Kya banaya (short) + naye/badle files
- Endpoint table (method, path, permission) agar API badli
- Raw outputs (build, test names, health, curl)
- Screenshots/curl proof (UI steps ke liye)
- Versions + license table (naye packages)
- Deviations, assumptions, open issues
- Phir **ROKO**. Next step ka wait karo.

---

## 5. FRONTEND <-> BACKEND <-> DATABASE CONNECTION GUIDE (errors se bachne ke liye)

### 5.1 Flow
```
Browser (Admin :5173) --cookie+CSRF--> API :5201 --EF Core--> SQL Server
Browser (Website :3000) --> Next.js server --(server-side fetch)--> API :5201 (public endpoints)
Website form submit (browser) --> API public form endpoint (rate-limited)
```
Admin aur website kabhi DB se baat nahi karte.

### 5.2 Env variables (names fix, values `.env` mein)
Backend:
- `ConnectionStrings__DefaultConnection`, `ConnectionStrings__TestConnection`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- Cookie options (name, domain, SameSite, Secure) `AuthCookieOptions` se; cookie name abhi `.Nexora.Session` (config)
- CORS allowed origins (list), SMTP host/port/sender (config), rate limit values, token lifespans, trusted proxies
Frontend:
- Admin: `VITE_API_BASE_URL`
- Website: `NEXT_PUBLIC_API_BASE_URL` (browser) aur `API_INTERNAL_BASE_URL` (server-side), `REVALIDATE_SECRET`
- Koi secret `VITE_`/`NEXT_PUBLIC_` mein nahi.

### 5.3 Cookie auth local par kaise chalega
- `localhost` ke alag ports **same-site** hain, cookie chalegi. Admin se API call: `fetch/RTK Query` mein `credentials: "include"` zaroori.
- API CORS: `WithOrigins(<allowlist from config>)` + `AllowCredentials()`. `*` kabhi nahi.
- Pehle `GET /api/v1/auth/csrf` call karo, token ko header `X-XSRF-TOKEN` mein har mutating request (POST/PUT/PATCH/DELETE) par bhejo.
- 401 = login chahiye (admin login page par bhejo). 403 `MUST_CHANGE_PASSWORD` = password change page. 403 normal = permission nahi.
- Production: `admin.<domain>` aur `api.<domain>` same parent domain, cookie domain config se, `Secure=true`.

### 5.4 SQL Server gotchas (migration/EF mein dhyan)
- Concurrency: `byte[] Version` + `rowversion`; stale update -> `DbUpdateConcurrencyException` -> HTTP **409**.
- Indexed string columns par explicit `MaxLength` (index key 900 bytes limit). Identity composite keys 128.
- Nullable unique index -> **filtered unique index** (`WHERE col IS NOT NULL`).
- JSON columns `nvarchar(max)` + `CHECK (ISJSON(col)=1)`; EF mein value converter + **ValueComparer**.
- Timestamps `datetime2`, hamesha UTC.
- Trigger wali table (`AuditLogs`) par `HasTrigger(...)` (EF OUTPUT clause conflict nahi). Trigger `THROW` use kare (RAISERROR+ROLLBACK nahi). `CREATE OR ALTER TRIGGER` batch ka pehla statement ho (`EXEC(N'...')` mein wrap).
- `TRUNCATE` trigger fire nahi karta: production runtime DB role ko AuditLogs par sirf INSERT/SELECT.
- Connection string mein `MultipleActiveResultSets` tab hi jab zaroori.
- Migration: reviewed, source-controlled. **Production mein app startup par auto-migrate nahi.**

### 5.5 Common errors aur fix
| Error | Wajah / Fix |
|---|---|
| CORS error browser mein | Origin allowlist mein nahi / `AllowCredentials` ke saath `*`. Config mein exact origin daalo |
| 401 login ke baad bhi | `credentials: "include"` nahi, ya cookie `Secure` local par http par. Cookie options config check |
| 400 on POST (antiforgery) | `X-XSRF-TOKEN` header nahi / csrf pehle fetch nahi hua |
| 403 `MUST_CHANGE_PASSWORD` | Pehle password change |
| `/health/ready` 503 | Connection string / SQL Server service / DB exist nahi |
| Migration fail "key too long" | Indexed column par MaxLength |
| Trigger/OUTPUT error | `HasTrigger` configure karo |
| Website par data stale | ISR/revalidate (Step 5) ya cache tag |
| `nexora_test` par tests fail | `ConnectionStrings__TestConnection` set nahi (user-secrets Api project ko dikhte hain, test project ko nahi) |

---

## 6. ROADMAP (STEPS)

Status legend: DONE / OPEN / TODO

| Step | Naam | Status |
|---|---|---|
| 1 | Project setup (skeleton, monorepo, config, docs) | DONE (gaps closed) |
| 1.1 / 1.2 | Setup gap closure | DONE |
| 2 | Backend: Identity, RBAC, Audit, Settings (SQL Server) | **OPEN** (code + 34 tests hain, closure proofs baaki) |
| 2.1 | Step 2 closure (missing tests + proofs) | **OPEN, agla kaam** |
| 3 | Admin foundation (login, layout, menu, dashboard shell) | TODO |
| 4 | **CMS core** (backend + admin): theme, media, menus, pages, blocks, SEO, draft/publish/version | TODO |
| 5 | **Public website renderer** (CMS se connected, preview, SEO) | TODO |
| 6 | Forms builder + Leads inbox (+ auto-reply, team notification) | TODO |
| 7 | Contacts / Clients / Tasks / follow-up / activity timeline | TODO |
| 8 | Email module (templates, send from admin, email log, unsubscribe) | TODO |
| 9 | Blog, services, case studies, content collections | TODO |
| 10 | Multi-country form formats + region-specific content parts | TODO |
| 11 | SEO extras, redirects, analytics, cookie consent, webhooks, import/export | TODO |
| 12 | Hardening (security, performance, accessibility, E2E, backup/restore) | TODO |
| 13 | Production deployment (DigitalOcean) | TODO |
| 14+ | P1/P2 features (pipeline kanban, scoring, broadcast email, multi-tenant...) | LATER |

**Ordering note (user ki demand):** Admin auth ke turant baad **CMS ready karna hai** taaki website ke saath-saath dikha sakein. Isliye Step 3 (admin shell) -> Step 4 (CMS) -> Step 5 (website renderer) seedhe ek ke baad ek. Forms/leads uske baad.

---

## STEP 2 / 2.1 — Backend Identity, RBAC, Audit, Settings (OPEN: closure)

### Ab tak kya hai (commit `64a396e`, local)
- SQL Server migration applied: `AuditLogs`, `Roles`, `RolePermissions`, `SiteSettings`, `Users`, `UserRoles`, `UserClaims`, `UserLogins`, `UserTokens`, `RoleClaims`.
- `AuditLogs` append-only trigger (INSERT ok, UPDATE/DELETE THROW).
- Endpoints: `/api/v1/auth/{csrf, login, logout, logout-everywhere, me, password/change, password/forgot, password/reset}`, `/api/v1/admin/users` (GET, `POST /invite`, `PATCH /{id}`), `/admin/roles`, `/admin/permissions`, `/admin/audit-logs`, `/admin/settings` (GET/PATCH), `/api/v1/public/site-settings`.
- Roles: Owner (all), Admin, Editor, Sales.
- 34 tests pass (16 unit, 3 architecture, 15 integration).

### Role-Permission Matrix (locked)
| Permission | Owner | Admin | Editor | Sales |
|---|---|---|---|---|
| settings.view / settings.manage | Y | Y | - | - |
| audit.view | Y | Y | - | - |
| users.view | Y | Y | - | - |
| users.manage | Y | - | - | - |
| roles.view | Y | Y | - | - |
| pages.view | Y | Y | Y | - |
| pages.edit | Y | Y | Y | - |
| pages.publish | Y | Y | - | - |
| leads.view / leads.manage / leads.export | Y | Y | - | Y |

Owner = catalog ki saari permissions automatically. Naye steps mein nayi permissions add hongi (media.*, menus.*, forms.*, clients.*, email.*, etc.), Owner ko auto, baaki roles ko matrix approve karwake.

### Design rules jo lagu hain
- Role change par security stamp **nahi** badlta. Stamp sirf password change/reset, logout-everywhere, suspend par.
- Permissions claims mein nahi; har request par DB/cache se resolve; cache `UserPerms_{userId}` role change, suspend, delete par evict.
- Security stamp validation interval zero/chhota (suspend turant effect).
- `logout` sirf current session; `logout-everywhere` alag.
- Password change: current session valid (RefreshSignIn), dusre invalid.
- `MustChangePassword=true` ho to allowed: me, password/change, logout, logout-everywhere, csrf. Baaki 403 `MUST_CHANGE_PASSWORD`.
- Invite: passwordless user, link email se, token URL fragment mein, invite expiry alag config; password set par Status=Active, MustChangePassword=false. Seed admin MustChangePassword=true.
- Seed admin: sirf env se; Owner exist nahi + env missing => app fail; Owner exist => env ke bina boot.
- Last active Owner delete/suspend/demote nahi; user khud ko suspend/role change nahi.
- Audit metadata: per-event allowlisted fields, request body kabhi nahi, failed login email masked.

### STEP 2.1 PROMPT (Antigravity ko do)
```
STEP 2.1: STEP 2 CLOSURE. Koi naya feature nahi. Sirf missing tests aur proof.

1. dotnet test --logger "console;verbosity=normal": har test ka naam + PASS raw. Skipped = 0.
2. Missing tests likho (real SQL Server, nexora_test):
   Login success/wrong password (generic)/lockout; suspended + invited login block; me;
   logout (dusra session valid) / logout-everywhere (sab invalid); CSRF reject;
   rate limit 429 (deterministic; baaki tests ke liye limits bade);
   forgot/reset (same response, expiry, reset ke baad purana session invalid);
   password change (current session valid, dusre invalid);
   seed admin boot matrix: (A) 0 Owners+env -> created, (B) Owner exists+env missing -> boot, (C) 0 Owners+env missing -> fail;
   MustChangePassword allowlist; invited user password set -> Active + MustChange=false; seed admin MustChange=true;
   permission matrix endpoint-level (Editor/Sales: pages.publish, users.manage 403; allowed 200; anonymous 401);
   permission cache eviction (role change, suspend, delete);
   suspend ke baad existing session turant 401.
3. End-to-end proof (curl/PowerShell, cookies+CSRF, password/token print mat karna):
   seed admin DB mein; login -> me (MustChangePassword=true) -> /admin/settings 403 MUST_CHANGE_PASSWORD -> password/change 200 -> /admin/settings 200;
   Editor/Sales users se 403/200; settings GET/PATCH/stale PATCH 409; GET /api/v1/public/site-settings poora JSON.
4. Audit sample: 10 recent AuditLogs rows (Action, Outcome, MetadataJson) + query jo MetadataJson mein 'password'/'token' dhoondhe (0 hona chahiye).
5. Email proof: forgot + invite email Mailpit API se; token URL fragment (#) mein, email query string mein nahi.
6. Security checklist har item PASS/FAIL + proof: password hash, no password/token in logs, enumeration, lockout, cookie flags, CSRF, CORS allowlist, rate limits, stamp invalidation, generic login error, audit redaction.
7. RegionContext default test: confirm config se aata hai, India/US hardcoded nahi.
8. Secrets scan (git grep --untracked ...), git ls-files se .env tracked nahi.
9. packages/contracts type generation, diff.
10. Ek poori license table (backend+frontend), exact versions.
11. Deviations/Assumptions/Open issues. Commit mat karna. ROKO.
```
**Exit:** Section 3 ke 10 points + upar ke sab proofs. Tab Step 2 close.

---

## STEP 3 — ADMIN FOUNDATION (login, layout, permission-aware menu, dashboard shell)

**Goal:** Admin React app asli auth ke saath chale: login, forced password change, set/reset password pages, protected layout, permission-aware menu, real dashboard shell, error/loading/empty states.

**Scope:**
- Pages: Login, Forgot password, Set/Reset password (token URL fragment `#` se padho, email URL mein nahi), Force Change Password, 404, 403, Dashboard shell.
- Auth flow: boot par `GET /auth/csrf` + `GET /auth/me`. 401 -> login. `MustChangePassword` -> change-password page par redirect. Logout, logout-everywhere (profile menu).
- RTK Query base API: `credentials: "include"`, CSRF header automatic, 401/403/409/422 ka centralized handling, ProblemDetails se error message, correlation id dikhao.
- Layout: left nav (compact), top bar (user menu, region/timezone indicator), responsive content. Light theme. Semantic design tokens (CSS variables), hardcoded colors nahi.
- Permission-aware menu/routes: `me.permissions` se. **Sirf convenience, API authoritative.** Route guard + `<Can permission="...">` component.
- Menu groups (jo module abhi nahi bana wo disabled/hidden): Overview, Website, Leads, Clients, Content, Users & Access, Settings, System.
- Users & Access screens (backend ready hai): users list (TanStack Table, search, pagination, filters), invite user, edit role/suspend (self/last-owner errors dikhao), roles & permissions view (read-only).
- Audit log viewer (filters, pagination).
- Settings screen: company profile, default region, supported regions, timezone (optimistic concurrency 409 handle: "kisi aur ne badal diya, reload").
- Dashboard shell: sirf real data (users count, recent audit, system status). **Fake analytics nahi.**
- Forms: Formik + Yup, server validation errors fields par map.
- Tests: Vitest (auth reducers, guards, formatters, forms), Playwright E2E (seed admin login -> forced password change -> dashboard; Editor ko Users menu nahi dikhe).
- OpenAPI contracts se typed API.

**Out of scope:** CMS, leads, clients, email, MFA UI.

**Acceptance:**
1. Seed admin se login -> forced password change -> dashboard (Playwright + screenshot).
2. Editor login karne par Users/Settings menu nahi; direct URL par 403 page.
3. User invite karne par Mailpit mein email, fragment link se set-password, phir login.
4. Settings stale update par 409 message.
5. Logout, logout-everywhere kaam kare. Cookie `credentials` aur CORS errors nahi.
6. Lint/test/E2E pass. Section 3 exit gate.

---

## STEP 4 — CMS CORE (backend + admin)

**Goal:** Admin se website ka sab kuch configure ho. Structured **block CMS** (free-form builder nahi).

**Data model (SQL Server, nayi migration, SQL pehle review):**
- `Pages` (Id, Slug, Title, Locale, Status [Draft/Published/Archived], PublishedVersionId, IsEnabled, SeoSettings fields/relations, Version rowversion, audit fields). Unique `(Slug, Locale)`.
- `PageVersions` (PageId, VersionNumber, SchemaVersion, ContentJson `nvarchar(max)`+ISJSON, CreatedBy, CreatedAtUtc, PublishedAtUtc). **Published version immutable.** Edit = naya draft version.
- `ContentJson`: `blocks[]`, har block: `id, type, schemaVersion, settings, content, visibility`.
- `MediaAssets`, `MediaFolders` (storage key, MIME, size, dimensions, alt text, tags). Raw public path nahi, storage abstraction.
- `Menus`, `MenuItems` (header/footer), `GlobalSections` (announcement bar, footer blocks), `ThemeSettings` (design tokens: colors, fonts, radius, spacing, button style), `Redirects`.
- `PreviewTokens` (short-lived signed, revocable), `PublishJobs`/`OutboxMessages` (publish -> cache revalidate).
- `FormDefinitions` Step 6 mein.

**Block types (code-defined, typed, versioned):** Hero, Rich Text, Image, Video, Feature Grid, Service Cards, Testimonials, Logo Strip, Stats, Pricing, FAQ, CTA, Form (placeholder), Blog Feed, Case Studies. Har block ka JSON schema + server-side validation. Admin arbitrary JS/React upload nahi kar sakta. Naya block type = developer kaam.

**Backend:**
- Endpoints (`/api/v1/admin/...` permission-scoped): pages CRUD/duplicate/archive/enable-disable, versions list/compare/restore, save draft, validate, publish (transaction: published version pointer + outbox event atomically), schedule (BackgroundService), rollback (previous version pointer + audit with reason), media upload/list/patch/delete, menus, global sections, theme, redirects, SEO.
- Public read: `GET /api/v1/public/pages/{slug}`, `/navigation`, `/site-settings`, `/theme`, `/sitemap` data (sirf **published**, cacheable).
- Preview: signed short-lived token, draft content ke liye; noindex; revocable.
- Worker: outbox dispatcher (at-least-once, lease, retry bounded), scheduled publish, cache revalidate call (website ka revalidate endpoint, `REVALIDATE_SECRET`).
- Media: upload allowlist (MIME sniff), size limits (config), local disk storage adapter (dev) behind `IStorageProvider`; production object storage baad mein. Private/public rule.
- Rich text sanitization (server-side), safe link validation.
- New permissions: media.*, menus.*, theme.manage, redirects.manage, pages.schedule, pages.rollback etc. (matrix approval ke saath).
- Optimistic concurrency (rowversion) page edits par. Slug uniqueness validation. Audit events har sensitive action.

**Admin UI:**
- Page list (search/status/locale/updated/author/actions).
- **Page editor:** left block inserter/tree (dnd-kit reorder), center live preview, right settings inspector (Formik+Yup, block schema se). Unsaved-changes warning, autosave draft (safe jagah), validation errors field ke paas.
- Actions: Save draft, Preview, Publish, Schedule, Archive, Revision history (compare/restore), Rollback.
- Media library (upload, alt text, folders/tags), Menus editor, Footer/Global sections, Theme editor (tokens), Redirects, SEO panel (title, description, canonical, OG).
- Role-based visibility + API authoritative.

**Tests:** unit (status transitions, slug, block validation), integration (draft vs published, public API sirf published, preview token expiry/revoke, publish transaction + outbox, rollback, wrong permission 403, Editor publish nahi kar sakta, concurrency 409, upload abuse/size/MIME, media key guess se access nahi), Playwright (create page, add blocks, preview, publish).

**Out of scope:** public website rendering (Step 5), forms builder (Step 6), blog posts (Step 9), multi-locale content.

**Acceptance:** Admin se naya page banao, blocks add/reorder, preview, publish; public API sirf published de; rollback chale; Editor publish na kar sake; menus/theme/media admin se editable.

---

## STEP 5 — PUBLIC WEBSITE RENDERER (Next.js, CMS se connected)

**Goal:** Admin se publish kiya page website par dikhe. **Demo-ready milestone** (website + admin ek saath dikhane ke liye).

**Scope:**
- Dynamic catch-all route `app/[[...slug]]/page.tsx`: API se page fetch (server-side, `API_INTERNAL_BASE_URL`), block renderer (`type -> React component` map, unknown type safe fallback, har block ka typed props).
- Global layout: header/footer/announcement bar menus aur settings API se. Theme tokens API se CSS variables mein inject.
- **Cache:** ISR/tag-based revalidate; `POST /api/revalidate` (secret header `REVALIDATE_SECRET`) outbox worker call kare. Publish ke baad page refresh dikhe. Region-specific parts (phone, address, currency, consent text) request-time ya client-side resolve (CDN galat region cache na kare).
- Region: cookie `nexora_region` + Accept-Language, region switcher (IN/US), config-driven. Default region config se.
- Preview mode: admin se preview token URL, draft dikhe, `noindex`, token invalid par 404/403.
- SEO: `generateMetadata` (title, description, canonical, Open Graph), `sitemap.xml`, `robots.txt`, structured data jahan accurate, 404 page (admin se editable text), redirects (API se).
- Performance/a11y: next/image, font optimization, semantic HTML, keyboard focus, reduced motion, strict CSP/secure headers, no secrets in bundle.
- Sab pages seed content (initial data, admin se editable): Home, About, Services (+ individual), Pricing, Contact, Privacy, Terms, Cookie Policy. **Content seed file/DB mein, React code mein hardcoded copy nahi.**
- Tests: Vitest components, Playwright (admin publish -> website par change, preview token, unpublished 404, sitemap).

**Acceptance (live demo):** Admin mein Home page edit -> publish -> website `http://localhost:3000` par change; draft preview link; menu/theme change reflect; Lighthouse basic (SEO/a11y/perf) report.

---

## STEP 6 — FORMS BUILDER + LEADS INBOX

**Goal:** Website se lead aaye, admin mein dikhe, team ko email, visitor ko auto-reply.

- Data: `FormDefinitions`, `FormFields` (type, label, placeholder, required, validation, options, region-aware), `FormSubmissions`, `Leads`, `LeadNotes`, `LeadAssignments`, `LeadStatuses`/`LeadSources` (admin configurable), consent evidence (purpose, wording version, timestamp, source URL, UTM, IP hash/timezone as policy).
- Admin: form builder (fields, labels, validation messages, success message, thank-you page, notification receivers, auto-reply template), lead statuses (New, In Progress, Contacted, Qualified, Closed/Spam; configurable), lead inbox (filters, search, assign, notes, status change, duplicate detection by email/phone, CSV export with `leads.export`).
- Public: `POST /api/v1/public/forms/{formKey}/submissions`: server-side schema validation (allowlist), rate limit, honeypot, **Cloudflare Turnstile** (free; keys env se, local par test mode), idempotency key, size limits.
- Flow: submission -> lead (same transaction) + outbox -> worker email (team notification + auto-reply via IEmailSender, Mailpit local). Email provider fail par lead kho nahi.
- Website: Form block renderer (Step 4 placeholder) + thank-you page + UTM capture + WhatsApp click-to-chat button (admin-configured number).
- Dashboard cards: new leads, overdue (Step 7 ke baad).
- Tests: malformed/oversized/abusive payload reject, rate limit, duplicate, consent stored, lead inbox permission (Sales ko haan, Editor ko nahi), email in Mailpit, E2E (website form -> admin inbox -> email).

**Acceptance:** website form submit -> admin inbox mein lead + Mailpit mein 2 emails (team + auto-reply).

---

## STEP 7 — CONTACTS / CLIENTS / TASKS (Lite CRM)

- Data: `Contacts`, `Companies`, `Clients`, `Tasks` (due date, assignee, status), `ActivityTimeline` (notes, emails, status changes), tags, custom fields (limited, admin configurable).
- Lead -> Contact/Client conversion (Qualified/Won), follow-up date/reminders, overdue alerts (dashboard + email via worker), assignment rules (simple).
- Admin: lead/client detail page (timeline, notes, tasks, emails), Clients list, Tasks list (my tasks, overdue), CSV import/export (contacts/leads).
- Permissions: clients.*, tasks.* (matrix approval).
- Tests: conversion, timeline entries, overdue job, permission matrix.

**Acceptance:** lead ko client banao, task assign, overdue reminder dikhe.

---

## STEP 8 — EMAIL MODULE (transactional + admin send)

- Email templates (admin-editable, variables allowlist: `{{name}}`, `{{company}}`, ...), preview, test send.
- Send email from lead/client page, **email log** (Pending, Processing, ConfirmedAccepted, ConfirmedRejected, DeliveryOutcomeUnknown, RetryScheduled, Completed, DeadLetter). Ambiguous timeout par auto-retry nahi (duplicate risk).
- `IEmailSender`: SMTP (MailKit) adapter + HTTPS API adapter (production; DigitalOcean par SMTP ports blocked ho sakte hain). Provider settings encrypted, credentials API response mein kabhi nahi, test-connection flow.
- Unsubscribe link + suppression list (marketing vs transactional alag).
- SPF/DKIM/DMARC checklist docs mein (domain par; deliverability ke liye zaroori).
- Free-tier limits provider banate waqt verify; kabhi "unlimited free" assume nahi.

**Acceptance:** admin se client ko templated email, log mein status, unsubscribe kaam kare.

---

## STEP 9 — BLOG, SERVICES, CASE STUDIES (content collections)

- Reusable collections: Posts (categories, tags, authors, rich text TipTap, schedule), Services, Case Studies, Testimonials, FAQs, Team, Pricing plans. Blocks inhe kai pages mein dikha sakein (Blog Feed, Case Studies, etc.).
- Blog listing/detail routes, RSS (optional), related posts, SEO per item.
- Tests + E2E.

---

## STEP 10 — MULTI-COUNTRY FORMATS

- Country/region-aware forms: phone (libphonenumber-js), PIN (India) / ZIP (USA), state lists, GST/tax fields (India), currency/pricing display, consent text per region, contact details/address per region (admin configurable).
- Region config admin settings se (DB override env default). Ek URL, cookie-based. ADR mein "kab subpath par shift karna chahiye" triggers.
- Time zone aware dates (store UTC, display user/region).

---

## STEP 11 — SEO EXTRAS, ANALYTICS, WEBHOOKS, IMPORT/EXPORT

- Redirect manager, broken-link check, structured data config, robots/sitemap settings.
- Analytics: Umami self-host (decision pending) ya GA4; consent-aware; conversion events (form submit), UTM report. Cookie banner admin-configurable.
- Outbound webhook on new lead (Slack/Sheet/WhatsApp alert), HMAC signed, retry, delivery log.
- Error tracking: Sentry/GlitchTip (free tier, verify).
- Calendar booking embed (Cal.com/Calendly link).

---

## STEP 12 — HARDENING

- Security: cross-role IDOR tests, CSRF/XSS, upload abuse, rate limits, session revocation, dependency/secret/container scan, CSP.
- MFA (TOTP) privileged accounts ke liye (launch se pehle).
- Performance: Core Web Vitals, API p95, EF query plans, indexes.
- Accessibility: WCAG 2.2 AA (keyboard, contrast, labels, focus).
- Recovery: DB backup/restore drill, media restore, rollback page, redeploy previous build.
- Playwright critical flows, load test basic.
- Definition of Done (Section 8).

---

## STEP 13 — PRODUCTION (DigitalOcean) — user approval ke baad hi

- Droplet (4 GB RAM+), Docker Compose: API, Worker, Website (Node), Admin (static), **SQL Server container (pinned CU tag, `ACCEPT_EULA`, SQL login via secret; Windows Auth sirf local)**, Caddy/Nginx reverse proxy (auto TLS), forwarded headers + trusted proxy config.
- **Pehle Docker wali machine par compose test** (abhi unverified).
- DNS: `nexora.com`, `admin.nexora.com`, `api.nexora.com`; cookie domain config; HSTS; Cloudflare optional (country header free).
- Do DB roles: migration/owner role aur runtime role (AuditLogs par sirf INSERT/SELECT; UPDATE/DELETE/TRUNCATE nahi).
- Secrets env/secret manager mein, images mein nahi. Migrations manual/approved script se.
- Backups (`.bak`), encrypted, off-server (R2/B2), restore drill. Uptime check, logs, alerts, incident runbook.
- External email provider (HTTPS API), SPF/DKIM/DMARC.
- SQL Server edition/licensing review.

---

## STEP 14+ — LATER (P1/P2, alag approval)
Pipeline kanban, lead scoring, tag segments + broadcast email, 2-step follow-up sequence, scheduled/approval workflow expand, analytics dashboard, **multi-tenant**, client portal, client website builder, WhatsApp Business API (official only), social publishing, automation builder (n8n sirf reference, license restricted), AI features, Hindi/other locales.

---

## 7. OPEN DECISIONS (user se poochho, assume mat karo)
- Analytics tool (Umami vs GA4)
- Email provider production (Resend/Brevo/SES/Zoho: free limits verify)
- Hosting details (droplet size, region), domain DNS
- Launch languages (abhi English)
- Extra roles (Support/Client Manager?)
- MFA timing, Turnstile account
- SQL Server edition/licensing production

---

## 8. DEFINITION OF DONE (first release)
- Nexora website approved pages, responsive, SEO crawlable, sitemap/robots/canonical/metadata.
- Admin secure login, roles/permissions backend par enforce.
- Admin pages create/edit/duplicate/archive, blocks, preview, publish, schedule, rollback, history + audit.
- Media validated, storage abstraction. Menus/footer/theme/blog/SEO admin se configurable.
- Forms safe, leads inbox, team notification + auto-reply email.
- Contacts/clients/tasks/follow-up, email from admin + log.
- India/USA region support (ek URL).
- Backup/restore tested, deployment rollback documented.
- Playwright critical flows, backend integration, security, accessibility pass. Koi critical/high defect nahi.

---

## 9. PER-STEP PROMPT TEMPLATE (user ya Antigravity har step ke liye use kare)

```
STEP <N>: <naam>. Pehle NEXORA_MASTER_EXECUTION_GUIDE.md ke Golden Rules (Sec 0), Locked Decisions (Sec 2),
Connection Guide (Sec 5) aur is step ka section padho.

PRECONDITION: pichla step Section 3 exit gate pass hai? git status clean? /health/ready 200? test baseline (count) kitna?
PLAN dikhao (entities, endpoints, packages+license, migration plan, tests) aur meri APPROVAL ka wait karo.
Approval ke baad hi code. Migration ho to SQL pehle dikhao, apply meri approval ke baad.
Scope se bahar kuch nahi. Hardcoding nahi. Secrets print nahi.
Kaam ke baad Section 3 exit gate + Section 4 report format. Commit mat karna. Phir ROKO.
```

---

## 10. USER KE LIYE QUICK CHECKLIST (har step ke baad)
1. Test output mein `Skipped: 0` aur test names dikhe?
2. Teeno apps local par chal rahe hain? (`/health/ready` 200)
3. Step ka end-to-end proof (screenshot/curl) dekha?
4. Secrets scan clean? `.env` tracked nahi?
5. Migration SQL maine dekhi thi?
6. Tab hi local commit approve karo (push alag).
7. Phir agla step.

*(Is file ko step complete hone par update karte raho: Roadmap table ka status DONE karo.)*