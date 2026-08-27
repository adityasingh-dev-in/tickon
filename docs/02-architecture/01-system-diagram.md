# System Diagram

> High-level architecture showing how the frontend, backend, database, real-time communication, and external services interact within ProjectOS.

---

# Overall Architecture

```text
                                   USER
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                               Browser Client                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────-─────┐
│                          Frontend (apps/client)                                │
│                                                                               │
│  Next.js 15 (App Router)                                                      │
│                                                                               │
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────────────────┐        │
│  │ React 19 UI  │   │ TanStack Query  │   │ Socket.IO Client         │        │
│  └──────┬───────┘   └────────┬────────┘   └─────────────┬────────────┘        │
│         │                    │                          │                     │
│  ┌──────▼───────┐     ┌──────▼───────┐          ┌───────▼────────┐            │
│  │ Zustand      │     │ React Hook   │          │ Authentication │            │
│  │ Global State │     │ Form + Zod   │          │ JWT Cookies    │            │
│  └──────────────┘     └──────────────┘          └────────────────┘            │
└──────────────────────────────┬───────────────────────────────┬────────────────┘
                               │ REST API                      │ WebSocket
                               ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Backend (apps/server)                               │
│                                                                              │
│                        Express.js + TypeScript                               │
│                                                                              │
│  Routes                                                                      │
│      │                                                                       │
│      ▼                                                                       │
│  Middlewares                                                                 │
│      │                                                                       │
│      ▼                                                                       │
│  Controllers                                                                 │
│      │                                                                       │
│      ▼                                                                       │
│  Services (Business Logic)                                                   │
│      │                                                                       │
│      ▼                                                                       │
│  Models (Mongoose)                                                           │
│                                                                              │
│  Supporting Layers                                                           │
│  • Authentication (JWT)                                                      │
│  • Validation (Zod)                                                          │
│  • Socket.IO Server                                                          │
│  • File Upload (Multer)                                                      │
│  • Cloudinary Integration                                                    │
│  • Error Handling                                                            │
│  • Logging                                                                   │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                ┌──────────────┴───────────────┐
                ▼                              ▼
┌────────────────────────────┐      ┌─────────────────────────────┐
│      MongoDB Atlas         │      │         Cloudinary          │
│                            │      │                             │
│ Users                      │      │ Images                      │
│ Projects                   │      │ Attachments                 │
│ Tasks                      │      │ Documents                   │
│ Clients                    │      │ User Avatars                │
│ Comments                   │      │                             │
│ Notifications              │      └─────────────────────────────┘
│ Activity Logs              │
│ Settings                   │
└────────────────────────────┘
```

---

# Monorepo Architecture

```text
tickon/

├── apps/
│   ├── client/              # Next.js Frontend (@tickon/client)
│   └── server/              # NestJS Backend (@tickon/server)
│
├── packages/
│   └── types/               # Shared types & interfaces (@tickon/types)
│
├── docs/                    # Project documentation
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

# Core Components

| Component      | Responsibility              | Technology              |
| -------------- | --------------------------- | ----------------------- |
| Frontend       | UI, routing, rendering      | Next.js, React          |
| Global State   | Client-only state           | Zustand                 |
| Server State   | API cache & synchronization | TanStack Query          |
| Forms          | Form management             | React Hook Form         |
| Validation     | Client & server validation  | Zod                     |
| API Server     | REST APIs & business logic  | NestJS                  |
| Authentication | Login, JWT, Cookies         | JWT + HTTP-only Cookies |
| Database       | Persistent storage          | PostgreSQL + Prisma     |
| Real-time      | Live updates                | Socket.IO               |
| File Storage   | Images & attachments        | Cloudinary              |
| Shared Package | Shared types & utilities    | TypeScript              |

---

# Communication Flow

| Source  | Destination      | Protocol          | Purpose             |
| ------- | ---------------- | ----------------- | ------------------- |
| Browser | NestJS API       | HTTPS / REST      | CRUD operations     |
| Browser | Socket.IO Server | WebSocket         | Live updates        |
| NestJS  | PostgreSQL       | Prisma ORM        | Database operations |
| NestJS  | Cloudinary       | HTTPS SDK         | File uploads        |
| NestJS  | Browser          | HTTP-only Cookies | Authentication      |

---

# Typical Request Flow

```text
1. User performs an action.

2. React Hook Form collects input.

3. Zod validates the data.

4. TanStack Query sends a REST request.

5. NestJS receives the request.

6. Middleware executes:
   • Authentication
   • Authorization
   • Validation
   • Error handling

7. Controller forwards the request to a Service.

8. Service executes business logic.

9. Prisma reads/writes PostgreSQL.

10. If files exist:
    • Upload to Cloudinary.
    • Save file metadata in PostgreSQL.

11. Response is returned.

12. TanStack Query updates its cache.

13. Zustand updates local UI state if needed.

14. Socket.IO broadcasts live updates to connected clients.
```

---

# External Services

| Service          | Purpose          |
| ---------------- | ---------------- |
| Supabase / Neon  | Primary database |
| Cloudinary       | File storage     |
| GitHub           | Source control   |
| Vercel           | Frontend hosting |
| Render / Railway | Backend hosting  |

---

# Deployment Overview

```text
GitHub
   │
   ├──────────────► Vercel
   │                  │
   │                  ▼
   │             Next.js Frontend
   │
   └──────────────► Render / Railway
                      │
                      ▼
                NestJS Backend
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   Supabase / Neon           Cloudinary
```
