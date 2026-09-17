# 02 - System Architecture & Data Flow

## 🏗️ High-Level Architecture
Tickon is structured as a high-performance **Turborepo** monorepo using **pnpm workspaces** to maintain type-safe integration, fast parallel builds, and clear separation of concerns.

*   **Frontend App (`apps/client` / `@tickon/client`):** A Next.js 16 application (port 3000) responsible for UI rendering, routing, and client-side state. It communicates with the backend via REST APIs and WebSockets.
*   **Backend App (`apps/server` / `@tickon/server`):** A NestJS application (port 4000) that handles business logic, database transactions, authentication, and real-time event broadcasting.
*   **Shared Types (`packages/types` / `@tickon/types`):** A shared TypeScript package containing common models, enums, DTOs, and API contract interfaces consumed across both frontend and backend.
*   **Database:** PostgreSQL managed via Prisma ORM for strict type-safety and relational integrity.
*   **Orchestration:** Turborepo 2.x for incremental task pipelines (`dev`, `build`, `lint`, `test`) with persistent dev concurrency and intelligent remote/local build caching.

---

## 🗄️ Database Strategy (PostgreSQL + Prisma)
PostgreSQL was selected to cleanly handle the inherently relational data of project management (Projects contain Tasks, Tasks have Assignees and Comments). Prisma serves as the ORM, acting as the single source of truth for the database schema and providing auto-generated, type-safe queries.

### Core Entities & Relations
*(Note: The exact schema code is maintained in `apps/server/prisma/schema.prisma`)*

*   **User:** The central identity. Can be assigned to Tasks and can author Comments.
*   **Client:** Represents a business or customer. Has a one-to-many relationship with Projects.
*   **Project:** The main container for work. Belongs to a Client and contains many Tasks.
*   **Task:** The core unit of work. Belongs to a Project, has an assignee (User), and tracks progress via Enum states (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`). Includes an `orderIndex` (Float) for Kanban fractional positioning.
*   **Comment & FileAsset:** Relational entities attached to specific Tasks or Projects.

---

## 🔐 Authentication & Security Flow
Tickon uses stateless JWT authentication with enhanced security via HTTP-only cookies to prevent XSS attacks.

1.  **Login:** Client sends credentials to the `POST /api/auth/login` endpoint.
2.  **Token Generation:** NestJS validates the credentials, generates a JWT, and attaches it to an `HTTP-Only`, `Secure`, `SameSite=Strict` cookie in the response header.
3.  **Client State:** The frontend does *not* store the JWT in `localStorage` or `sessionStorage`. The Zustand store only holds non-sensitive user profile data (name, email, avatar).
4.  **Authorized Requests:** The browser automatically includes the HTTP-Only cookie with every subsequent API request.
5.  **Backend Validation:** NestJS `JwtAuthGuard` intercepts incoming requests, extracts the token from the cookie, verifies the signature, and grants or denies access.

---

## ⚡ Real-Time Architecture (Socket.IO)
To enable seamless collaboration, Tickon implements a WebSocket layer alongside the standard REST API.

*   **Connection & Rooms:** When a user opens a project dashboard, the Next.js client establishes a Socket.IO connection and joins a specific room for that project (e.g., `room_project_123`).
*   **Event Broadcasting:** When User A moves a Kanban card via a REST `PATCH` request, the NestJS controller updates PostgreSQL, then calls the internal `EventsGateway`. The gateway emits a `task:updated` event exclusively to `room_project_123`.
*   **Client Sync:** User B's client listens for the `task:updated` event. Upon receiving it, TanStack Query is triggered to update the local cache, instantly rendering the moved card for User B without a full page refresh.
