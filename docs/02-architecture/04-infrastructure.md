# Infrastructure

> Overview of the deployment architecture, hosting providers, CI/CD workflow, environments, and operational strategy for ProjectOS.

---

# Infrastructure Overview

ProjectOS is designed as a cloud-native application using a modern Jamstack architecture.

The application consists of:

- Next.js frontend
- NestJS backend
- PostgreSQL database
- Cloudinary media storage

Each service is deployed independently while sharing the same codebase through a pnpm workspaces monorepo.

---

# Deployment Architecture

```text
                     GitHub Repository
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
      Vercel                            Render / Railway
 (Next.js Frontend)                  (Express Backend)
          │                                   │
          │ REST API / WebSocket              │
          └───────────────┬───────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
   MongoDB Atlas                    Cloudinary
   (Application Data)             (Media Storage)
```

---

# Hosting Services

| Component        | Provider          | Purpose                     |
| ---------------- | ----------------- | --------------------------- |
| Frontend         | Vercel            | Next.js hosting             |
| Backend          | Render or Railway | NestJS hosting              |
| Database         | Supabase / Neon   | Managed PostgreSQL database |
| File Storage     | Cloudinary        | Images and document storage |
| Source Control   | GitHub            | Version control             |
| Package Registry | npm               | Package distribution        |

---

# Environments

| Environment | Purpose           | Frontend                | Backend                 |
| ----------- | ----------------- | ----------------------- | ----------------------- |
| Development | Local development | `http://localhost:3000` | `http://localhost:5000` |
| Production  | Live application  | Production Domain       | Production API          |

ProjectOS intentionally skips a dedicated staging environment during Version 1 to keep deployment simple for a solo developer.

A staging environment can be introduced later if the deployment process becomes more complex.

---

# Deployment Flow

```text
Code Changes
      │
      ▼
Git Commit
      │
      ▼
GitHub
      │
      ├────────────► Vercel
      │                │
      │                ▼
      │          Deploy Frontend
      │
      └────────────► Render / Railway
                       │
                       ▼
                 Deploy Backend
```

---

# Development Workflow

```text
Create Feature
        │
        ▼
Local Development
        │
        ▼
Run Tests
        │
        ▼
Lint
        │
        ▼
Type Check
        │
        ▼
Build Project
        │
        ▼
Commit Changes
        │
        ▼
Push to GitHub
        │
        ▼
Automatic Deployment
```

---

# Build Process

Before every deployment, the application should successfully complete:

```text
pnpm install

↓

pnpm format:check

↓

pnpm lint

↓

pnpm build
```

A deployment should never proceed if any step fails.

---

# Environment Variables

Each deployment environment maintains its own configuration.

Backend:

- Database connection
- JWT secrets
- Cloudinary credentials
- CORS origin
- Cookie settings

Frontend:

- API URL
- WebSocket URL

Secrets are managed through the hosting provider and are never committed to the repository.

---

# Production Deployment

Production deployment follows this process:

1. Verify all tests pass.
2. Verify linting succeeds.
3. Verify type checking succeeds.
4. Build the application.
5. Push changes to the production branch.
6. Hosting providers automatically deploy the latest version.
7. Verify the deployed application.

---

# Rollback Strategy

If a deployment fails:

1. Identify the last stable commit.
2. Revert or redeploy that commit.
3. Confirm the application is functioning correctly.
4. Investigate the failed deployment.
5. Apply the fix before deploying again.

---

# Post-Deployment Checklist

After deployment verify:

- Frontend loads successfully.
- Backend API responds.
- Authentication works.
- Database connection succeeds.
- File uploads function correctly.
- Real-time notifications connect.
- Project creation works.
- Task management works.
- Client management works.
- No unexpected console or server errors.

---

# Monitoring

Version 1 uses provider-native monitoring.

| Concern            | Tool                      |
| ------------------ | ------------------------- |
| Application Logs   | Vercel / Render / Railway |
| Database Metrics   | Supabase / Neon Dashboard  |
| File Usage         | Cloudinary Dashboard      |
| Deployment History | GitHub + Hosting Provider |

---

# Backup Strategy

| Service               | Backup Method                            |
| --------------------- | ---------------------------------------- |
| Supabase / Neon       | Automated cloud backups                  |
| Cloudinary            | Managed storage redundancy               |
| GitHub                | Source code history                      |
| Environment Variables | Stored securely within hosting providers |

---

# Scalability

The infrastructure is designed to support future growth with minimal architectural changes.

Potential future additions include:

- Staging environment
- GitHub Actions CI/CD
- Docker
- Redis
- BullMQ
- Sentry
- Better Stack
- CDN optimization
- Horizontal backend scaling
- Load balancing

These services are intentionally postponed until they provide meaningful value.

---

# Infrastructure Summary

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Frontend        | Next.js + Vercel              |
| Backend         | NestJS + Render / Railway     |
| Database        | PostgreSQL                    |
| File Storage    | Cloudinary                    |
| Authentication  | JWT + HTTP-only Cookies       |
| Real-Time       | Socket.IO                     |
| Source Control  | GitHub                        |
| Package Manager | pnpm                          |
| Monorepo        | pnpm Workspaces               |

---

# Design Goals

The infrastructure is designed to provide:

- Fast deployments
- Simple maintenance
- Production reliability
- Low operational cost
- Easy scalability
- Secure configuration
- Independent frontend and backend deployments
- A straightforward workflow suitable for a solo developer while remaining capable of supporting future team collaboration.
