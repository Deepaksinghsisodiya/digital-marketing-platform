# Local Setup & Operations Guide

## Prerequisites

- **.NET 10 LTS SDK** (v10.0.403 pinned in `global.json`)
- **Node.js LTS** (v24+ LTS)
- **pnpm** (v12.x or enabled via `npm install -g pnpm` / `corepack enable pnpm`)
- **SQL Server** (LocalDB or SQL Server Express / Developer)
- **Mailpit** (Local SMTP server on port 1025)

---

## First-Time Local Setup

1. **Clone & Configure Environment**:

   ```bash
   cp .env.example .env
   cp apps/website/.env.example apps/website/.env
   cp apps/admin/.env.example apps/admin/.env
   ```

2. **Start Infrastructure (SQL Server & Mailpit)**:
   _Via Docker Compose_:

   ```bash
   pnpm run up
   ```

   _Note for environments without Docker Desktop_:
   - Ensure LocalDB is running (`sqllocaldb start MSSQLLocalDB`) or your SQL Server instance is active.
   - For SMTP testing, run Mailpit standalone binary on port 1025 / 8025.

3. **Install Workspace Dependencies**:

   ```bash
   pnpm install
   ```

4. **Run Backend Service**:

   ```bash
   pnpm run backend:run
   ```

   Backend listens at `http://localhost:5000`. Verify probes:
   - `http://localhost:5000/health/live`
   - `http://localhost:5000/health/ready`
   - `http://localhost:5000/scalar/v1` (Scalar API interactive reference in Development)

5. **Run Public Website**:

   ```bash
   pnpm run website:dev
   ```

   Website listens at `http://localhost:3000`.

6. **Run Agency Admin**:
   ```bash
   pnpm run admin:dev
   ```
   Admin panel listens at `http://localhost:5173`.

---

## Future Production Deployment Notes (DigitalOcean Droplet)

> [!NOTE]
> Production configuration is deferred. Below is the approved high-level roadmap for deployment:

1. **DigitalOcean Droplet Hosting**:
   - Single Linux droplet running Docker Compose.
   - Pinned container versions for SQL Server (2022 CU17), .NET Core API, Next.js Node server, and Admin static files.
2. **Reverse Proxy & SSL**:
   - Reverse proxy (Caddy or Nginx) handling automatic Let's Encrypt SSL certificates.
   - Subdomain routing: `nexora.com` (Website), `admin.nexora.com` (Admin Panel), `api.nexora.com` (Backend API).
3. **Email Delivery**:
   - DigitalOcean blocks outbound SMTP port 25 on default droplets.
   - Production must use an external provider (HTTPS REST API adapter or authenticated port 587 SMTP).
4. **Off-Server Backups**:
   - Automated daily SQL Server database backups (.bak) and uploaded off-server (Cloudflare R2 or Backblaze B2) with encrypted snapshots.
