# Nexora Digital Marketing Platform

A unified enterprise growth ecosystem featuring a dynamic public website, an internal agency administration panel, and a modular .NET backend architecture.

---

## 🛠️ Tech Stack & Verified Versions

| Component             | Framework / Technology                                 | Installed Version                        | License            |
| :-------------------- | :----------------------------------------------------- | :--------------------------------------- | :----------------- |
| **Runtime: .NET**     | .NET 10 LTS SDK                                        | `10.0.403`                               | MIT                |
| **Runtime: Node**     | Node.js LTS                                            | `v24.16.0`                               | MIT                |
| **Runtime: pnpm**     | pnpm Workspaces                                        | `12.18.0`                                | MIT                |
| **Backend API**       | ASP.NET Core Web API (.NET 10)                         | `10.0.403`                               | MIT                |
| **Database**          | Microsoft SQL Server (LocalDB / Express / Docker)      | `2019 / 2022 (CU17)`                     | Commercial / Free Dev |
| **ORM**               | EF Core + SQL Server Provider                          | `10.0.14` / `10.0.14`                    | MIT                |
| **Logging**           | Serilog + Console Sink                                 | `9.0.0` / `6.0.0`                        | Apache-2.0         |
| **Validation**        | FluentValidation.DependencyInjectionExtensions         | `11.11.0`                                | Apache-2.0         |
| **Mapping**           | Riok.Mapperly                                          | `4.1.1`                                  | Apache-2.0         |
| **Email**             | MailKit / MimeKit                                      | `4.18.2` / `4.18.2`                      | MIT                |
| **OpenAPI / Swagger** | Microsoft.AspNetCore.OpenApi + SwaggerUI + Scalar      | `10.0.14` / `10.3.1` / `2.0.18`         | MIT / MIT / MIT    |
| **Testing: Backend**  | xUnit + Shouldly + NetArchTest                         | `2.9.3` / `4.3.0` / `1.4.3`              | MIT / MIT / MIT    |
| **Public Website**    | Next.js (App Router) + TypeScript                      | `15.5.29`                                | MIT                |
| **Agency Admin**      | React 19 + Vite                                        | `19.3.1` / `6.4.5`                       | MIT                |
| **Styling**           | Tailwind CSS                                           | `3.4.19`                                 | MIT                |
| **UI Primitives**     | shadcn/ui pattern + Radix UI (@radix-ui/react-slot)    | `1.5.0`                                  | MIT                |
| **Icons**             | Lucide React                                           | `1.70.0`                                 | ISC                |
| **State Mgmt**        | Redux Toolkit + RTK Query                              | `2.14.0`                                 | MIT                |
| **Tables**            | TanStack Table                                         | `8.21.3`                                 | MIT                |
| **Forms**             | Formik + Yup                                           | `2.4.9` / `1.7.1`                        | Apache-2.0 / MIT   |
| **i18n: Website**     | next-intl                                              | `3.26.5`                                 | MIT                |
| **i18n: Admin**       | react-i18next + i18next                                | `15.7.4` / `24.2.3`                      | MIT                |
| **Country Data**      | i18n-iso-countries                                     | `7.14.0`                                 | MIT                |
| **Phone**             | libphonenumber-js                                      | `1.13.15`                                | MIT                |
| **Linting**           | ESLint (website: next-lint, admin: @typescript-eslint) | `9.39.5`                                 | MIT                |
| **Testing: Frontend** | Vitest                                                 | `3.2.7`                                  | MIT                |
| **Testing: E2E**      | Playwright Test (@playwright/test)                     | `1.50+` (planned)                        | Apache-2.0         |
| **Email Dev Capture** | Mailpit standalone                                     | `v1.33.1`                                | MIT                |

---

## 🚀 First-Time Setup (Windows — No Docker Required)

### Prerequisites

- **.NET 10 LTS SDK** — [download](https://dotnet.microsoft.com/download)
- **Node.js v24+** — [download](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **SQL Server** — Windows LocalDB (included with Visual Studio/Build Tools) or SQL Server Express / Developer

> **Note:** Docker Desktop is optional (marked unverified). Steps below use native SQL Server LocalDB + Mailpit standalone binary.

---

### Step 1: Clone & Configure Environment

```powershell
git clone <repo-url>
cd Nexora-Digital-Marketing-Platform

# Copy env example
Copy-Item .env.example .env
```

Edit `.env` and set at minimum:

```env
ConnectionStrings__DefaultConnection=Server=(localdb)\MSSQLLocalDB;Database=nexora_dev;Trusted_Connection=True;TrustServerCertificate=True
ConnectionStrings__TestConnection=Server=(localdb)\MSSQLLocalDB;Database=nexora_test;Trusted_Connection=True;TrustServerCertificate=True
Smtp__Host=localhost
Smtp__Port=1025
Smtp__FromEmail=noreply@nexora.local
Smtp__FromName=Nexora Platform
```

---

### Step 2: SQL Server Setup (LocalDB — No Docker)

Ensure LocalDB instance is started and databases exist:

```powershell
sqllocaldb start MSSQLLocalDB
```

---

### Step 3: API & Documentation URLs (Development)

- **Swagger UI**: [http://localhost:5201/swagger](http://localhost:5201/swagger)
- **Scalar UI**: [http://localhost:5201/scalar](http://localhost:5201/scalar)
- **OpenAPI JSON**: [http://localhost:5201/openapi/v1.json](http://localhost:5201/openapi/v1.json)
- **Health Live**: [http://localhost:5201/health/live](http://localhost:5201/health/live)
- **Health Ready**: [http://localhost:5201/health/ready](http://localhost:5201/health/ready)

---

### Step 3: Start Mailpit (Email Capture)

Mailpit standalone binary is included at `infra/tools/mailpit.exe`:

```powershell
# Start Mailpit (SMTP port 1025, Web UI port 8025)
Start-Process -FilePath "infra\tools\mailpit.exe" -ArgumentList "-s [::]:1025 -l [::]:8025" -WindowStyle Hidden

# Verify: http://localhost:8025 should show the Mailpit UI
```

---

### Step 4: Install Frontend Dependencies

```powershell
pnpm install
```

---

### Step 5: Start Development Servers (3 terminals)

```powershell
# Terminal 1 — Backend API (port 5201 from launchSettings)
pnpm run backend:run

# Terminal 2 — Public Website (port 3000)
pnpm run website:dev

# Terminal 3 — Agency Admin (port 5173)
pnpm run admin:dev
```

---

## 🌐 Service Port Map

| Service             | URL                                  | Description                     |
| :------------------ | :----------------------------------- | :------------------------------ |
| **Public Website**  | `http://localhost:3000`              | Next.js App Router              |
| **Agency Admin**    | `http://localhost:5173`              | React + Vite admin panel        |
| **Backend API**     | `http://localhost:5201`              | ASP.NET Core 10 Web API         |
| **Scalar API Docs** | `http://localhost:5201/scalar/v1`    | Interactive API docs (Dev only) |
| **Health: Live**    | `http://localhost:5201/health/live`  | Liveness probe                  |
| **Health: Ready**   | `http://localhost:5201/health/ready` | Readiness probe (requires DB)   |
| **Mailpit Web UI**  | `http://localhost:8025`              | Email preview inbox             |
| **Mailpit SMTP**    | `localhost:1025`                     | SMTP capture (dev only)         |
| **SQL Server**      | `(localdb)\MSSQLLocalDB` / `1433`    | Database                        |

> **Note:** Backend port is set in `backend/src/Nexora.Api/Properties/launchSettings.json`. Override with `ASPNETCORE_URLS` env var.

---

## 🔧 Workspace Commands

```powershell
# Tests
pnpm run backend:test         # .NET backend + architecture tests
pnpm run test                 # All frontend Vitest tests
pnpm -r test                  # Same (recursive over all packages)

# Quality
pnpm -r lint                  # ESLint across website + admin
pnpm run format               # Prettier formatting

# Dev servers
pnpm run backend:run          # .NET API
pnpm run website:dev          # Next.js website
pnpm run admin:dev            # Vite admin

# Infrastructure (Docker Compose — Unverified: Docker host par test nahi hua)
# Note: Local dev environment mein Docker unavailable hai. Pehle jab Docker host mile tab test karna hai.
pnpm run up                   # Start sqlserver + mailpit containers (requires Docker)
pnpm run down                 # Stop containers
```

---

## 🔍 Troubleshooting

**`/health/ready` returns 503**

- SQL Server (LocalDB or SQL Server instance) must be running
- `nexora_dev` database must exist
- `ConnectionStrings__DefaultConnection` env var must be set correctly

**CORS errors in browser**

- Origin must be in `Cors:AllowedOrigins` in `appsettings.json` or `Cors__AllowedOrigins__0` env var

**pnpm workspace link errors**

- Run `pnpm install` from the repo root; workspace packages (`@nexora/contracts`, `@nexora/design-tokens`) are linked automatically

**Backend port differs from 5000**

- The API uses `launchSettings.json` port `5201` by default. Set `ASPNETCORE_URLS=http://localhost:5000` in your env to override.

**Mailpit not starting**

- Check if port 1025 or 8025 is already in use: `netstat -ano | findstr ":1025"`
- Kill the conflicting process and restart Mailpit

**Integration tests skipped (health/ready)**

- Set `ConnectionStrings__TestConnection` env var to point to your test SQL Server database:
  ```powershell
  $env:ConnectionStrings__TestConnection = "Server=(localdb)\MSSQLLocalDB;Database=nexora_test;Trusted_Connection=True;TrustServerCertificate=True"
  dotnet test backend/Nexora.sln
  ```

---

## 📁 Project Structure

```
Nexora-Digital-Marketing-Platform/
├── backend/                    # .NET 10 solution
│   ├── src/
│   │   ├── Nexora.Api/         # ASP.NET Core Web API (entry point)
│   │   ├── Nexora.Application/ # Use cases, interfaces, domain services
│   │   ├── Nexora.Domain/      # Core domain entities (no dependencies)
│   │   ├── Nexora.Infrastructure/ # EF Core, email, external adapters
│   │   └── Nexora.Worker/      # Background service host
│   └── tests/
│       ├── Nexora.UnitTests/
│       ├── Nexora.IntegrationTests/
│       └── Nexora.ArchitectureTests/
├── apps/
│   ├── website/                # Next.js public website
│   └── admin/                  # React + Vite agency admin panel
├── packages/
│   ├── contracts/              # Shared TypeScript API types
│   ├── design-tokens/          # Semantic CSS variable tokens
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared tsconfig
├── docs/
│   ├── architecture/           # ADRs and decision log
│   └── operations/             # Setup and runbook guides
└── infra/
    ├── compose/                # Docker Compose (sqlserver + mailpit - unverified)
    └── tools/                  # Standalone tools (mailpit.exe)
```
