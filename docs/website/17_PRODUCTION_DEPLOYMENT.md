# 17 — PRODUCTION DEPLOYMENT & ROLLBACK SPECIFICATION

**Document:** Production Release Engineering, CI/CD, Infrastructure & Rollback  
**Entity:** Nexora Technoligics Pvt. Ltd. (Nexora)  
**Deliverable:** Deployment Runbook & Operational Architecture  
**Target Markets:** India (IN) & United States (US)  

---

## 1. Hosting Architecture & Infrastructure Topology

- **Edge / Frontend Tier:** Deployed on Vercel / Node.js 20+ Container with global Cloudflare edge caching.
- **Backend API Tier:** ASP.NET Core 10 containerized service running on Azure App Service / AWS ECS behind an Application Gateway with TLS 1.3 termination.
- **Database Persistence Tier:** Managed PostgreSQL 16 (AWS RDS / Azure Database for PostgreSQL) with automated point-in-time recovery (PITR) and replica failover.
- **Media & Asset CDN:** Cloudflare R2 / AWS S3 with WebP/AVIF automated image transformation.

---

## 2. Release Engineering Pipeline

```
Code Commit (Local)
  │
  ├── 1. Pre-commit Linters & Type-check (`tsc --noEmit`, ESLint)
  ├── 2. Automated Test Run (`vitest run`)
  ├── 3. Production Build Validation (`next build`)
  │
  └── Deployment Gate
         ├── [IMPORTANT] No automated git push without explicit user order.
         ├── Zero critical / zero high-priority defects verified.
         └── Health check probe (/api/v1/health) verified HTTP 200.
```

---

## 3. Rollback & Disaster Recovery Runbook

1. **Instant Frontend Rollback:** If an edge regression is detected post-deployment, trigger instant rollback to previous successful deployment hash via Vercel / Cloudflare CLI (`vercel rollback [deployment-id]`).
2. **Backend API Rollback:** Blue/Green deployment slots allow traffic switching back to the previous deployment slot in < 15 seconds without service downtime.
3. **Database Migration Safety:** All EF Core migrations adhere to the expand-and-contract pattern:
   - Step 1: Add new nullable columns or tables.
   - Step 2: Deploy application code utilizing new schema.
   - Step 3: Backfill data and add non-null constraints in subsequent sprint.
   - Never drop columns or rename existing properties in the same release.
