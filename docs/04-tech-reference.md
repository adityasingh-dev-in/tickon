# Tickon - Core Technical Specification (v1.2, corrected)

## 0. Key Decisions (single source of truth)

| Topic | Decision |
| --- | --- |
| Password hashing | `bcryptjs` (pure JS, cost factor 12). Password length 8 to 72 characters (bcrypt ignores bytes after 72). |
| Auth tokens | Short-livaed access JWT (15 min) + opaque rotating refresh token (7 days), both in HTTP-only cookies. Refresh tokens belong to a **family** (one per login/device); reuse revokes only that family, with a 10 second grace window for parallel refresh calls. |
| Enum sync | Prisma enums are the source of truth; a CI test fails if `@tickon/types` enums drift. `@prisma/client` is never imported in the client app. |
| Task ordering | `Task.position` is `Float` (midpoint scheme, server-computed). `KanbanColumn.position` is `Int` (reordered in one transaction). |
| Task keys | `Project.taskCounter` is incremented atomically; `Task.taskNumber` + `Task.taskKey` (e.g. `TCK-12`). `Project.key` is immutable. |
| Column to Task FK | `onDelete: NoAction` (not `Restrict`), so a project delete can cascade safely while a direct column delete is still blocked. |
| Authorization | One `ProjectRoleGuard`; every endpoint declares a Min Role; project is resolved from the resource ID. |
| Client (CRM) ownership | `Client.createdById`; a user only sees clients they created. |
| Activity log | Polymorphic: `entityType` + `entityId` (no FK), so history survives deleted entities. |
| Realtime | Socket.IO, rooms `project:{id}` and `user:{id}`, every payload uses one typed envelope. The server disconnects a socket when its access token expires; the client refreshes early, reconnects, re-joins its rooms and refetches. |

---

## 1. Monorepo Architecture & Packages

Orchestrated via **Turborepo 2.x** with **pnpm workspaces**.

- Node.js: `engines.node = ">=20.9"` (Node 22 LTS recommended). Declare `packageManager` (pnpm version) in the root `package.json`.
- Pin exact versions through `pnpm-lock.yaml`; commit the lockfile.
- Turbo pipeline: `build` has `dependsOn: ["^build"]` so `@tickon/types` is built before the apps.

### Frontend (`apps/client` / `@tickon/client`)
- **Core:** `next@16`, `react@19`, `react-dom@19`
- **Port:** `3000`
- **State Management:** `zustand` (client state), `@tanstack/react-query` (server state)
- **Styling & UI:** `tailwindcss`, `@tailwindcss/postcss`, `lucide-react` (icons), `sonner` (toasts)
- **Forms & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Real-time:** `socket.io-client`
- **Shared Types:** Consumes `@tickon/types` (`workspace:*`)
- **API access:** `next.config` rewrites `/api/:path*` to `http://localhost:4000/api/:path*` (same-origin REST, no CORS or cookie problems). Socket.IO connects directly to `NEXT_PUBLIC_SOCKET_URL` with `withCredentials: true` (Next rewrites do not reliably proxy WebSockets).

### Backend (`apps/server` / `@tickon/server`)
- **Core:** `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `reflect-metadata`, `rxjs`
- **Port:** `4000` (global prefix `api`)
- **Database:** `prisma@6` (dev dependency, CLI), `@prisma/client@6`, PostgreSQL
- **Security & Auth:** `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcryptjs`, `cookie-parser`, `helmet`, `@nestjs/throttler`
- **Real-time:** `@nestjs/websockets`, `@nestjs/platform-socket.io`
- **File Uploads:** `multer` (memory storage), `cloudinary`
- **Validation:** `class-validator`, `class-transformer`
- **Dev types:** `@types/bcryptjs`, `@types/multer`, `@types/cookie-parser`, `@types/passport-jwt`
- **Shared Types:** Consumes `@tickon/types` (`workspace:*`)

### Shared Contracts (`packages/types` / `@tickon/types`)
- Shared TypeScript data models (`User`, `Project`, `Task`, `KanbanColumn`, `Client`, `Label`, `Comment`, `FileAsset`, `Notification`, `ActivityLog`)
- Common enums (`ProjectRole`, `Priority`, `NotificationType`, `ActivityEntityType`) and the `ActivityAction` constant (section 8) exported as runtime values. The package is built with `tsup` as **dual CJS + ESM**, because NestJS (CJS) and Next.js (ESM) both import runtime enums from it.
- `package.json` must declare matching entry points, otherwise one of the two apps fails to import:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```
- Standard API response types (`ApiResponse<T>`, `PaginatedResponse<T>`, `ApiErrorResponse`)
- Real-time event names and payload types (see section 8)
- Prisma is the schema source of truth. Enums in this package must mirror Prisma enums exactly. Do **not** import `@prisma/client` in the client app (it must not enter the browser bundle). Instead, the server has a unit test that runs in CI and fails on drift:

```ts
import * as Prisma from '@prisma/client';
import * as Types from '@tickon/types';

const enums = ['ProjectRole', 'Priority', 'NotificationType', 'ActivityEntityType'] as const;

it.each(enums)('%s matches the Prisma enum', (name) => {
  expect(Object.values(Types[name]).sort()).toEqual(Object.values(Prisma[name]).sort());
});
```

---

## 2. Database Entity-Relationship Architecture

> Visual map of all models, enums, fields, and relationships in PostgreSQL via Prisma. Optional foreign keys use `|o` on the parent side. Composite constraints are listed under the diagram because Mermaid cannot express them.

### Mermaid ER Diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT : "created"
    USER ||--o{ CLIENT : "creates"
    USER ||--o{ PROJECT_MEMBER : "belongs to"
    USER |o--o{ TASK : "assigned to"
    USER |o--o{ COMMENT : "writes"
    USER |o--o{ FILE_ASSET : "uploads"
    USER ||--o{ NOTIFICATION : "receives"
    USER |o--o{ ACTIVITY_LOG : "triggers"
    USER ||--o{ REFRESH_TOKEN : "owns"

    CLIENT |o--o{ PROJECT : "associated with"

    PROJECT ||--o{ PROJECT_MEMBER : "has members"
    PROJECT ||--o{ KANBAN_COLUMN : "contains"
    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ LABEL : "defines"
    PROJECT ||--o{ ACTIVITY_LOG : "records"

    KANBAN_COLUMN ||--o{ TASK : "groups"

    TASK ||--o{ COMMENT : "has discussions"
    TASK ||--o{ FILE_ASSET : "has attachments"
    TASK }o--o{ LABEL : "tagged with"

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }

    REFRESH_TOKEN {
        string id PK
        string tokenHash UK
        string familyId
        string userId FK
        datetime expiresAt
        datetime rotatedAt
        datetime revokedAt
        datetime createdAt
    }

    CLIENT {
        string id PK
        string name
        string email
        string company
        string phone
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK
        string key UK
        string name
        string description
        int taskCounter
        string clientId FK
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    PROJECT_MEMBER {
        string id PK
        string projectId FK
        string userId FK
        ProjectRole role "OWNER, ADMIN, MEMBER, VIEWER"
        datetime joinedAt
    }

    KANBAN_COLUMN {
        string id PK
        string title
        int position
        string projectId FK
        datetime createdAt
    }

    TASK {
        string id PK
        int taskNumber
        string taskKey UK
        string title
        string description
        Priority priority "LOW, MEDIUM, HIGH, URGENT"
        float position
        datetime dueDate
        string projectId FK
        string columnId FK
        string assigneeId FK
        datetime createdAt
        datetime updatedAt
    }

    LABEL {
        string id PK
        string name
        string color
        string projectId FK
        datetime createdAt
    }

    COMMENT {
        string id PK
        string content
        string taskId FK
        string authorId FK
        datetime createdAt
        datetime updatedAt
    }

    FILE_ASSET {
        string id PK
        string publicId UK
        string secureUrl
        string fileName
        int fileSize
        string fileType
        string resourceType
        string taskId FK
        string uploadedById FK
        datetime createdAt
    }

    NOTIFICATION {
        string id PK
        string recipientId FK
        NotificationType type
        string title
        string message
        string linkUrl
        boolean isRead
        datetime createdAt
    }

    ACTIVITY_LOG {
        string id PK
        string actorId FK
        string projectId FK
        ActivityEntityType entityType
        string entityId
        string action
        json details
        datetime createdAt
    }
```

### Composite Constraints & Indexes

| Model | Constraint / Index |
| --- | --- |
| `ProjectMember` | `@@unique([projectId, userId])`, `@@index([userId])` |
| `Task` | `@@unique([projectId, taskNumber])`, `taskKey @unique`, `@@index([projectId])`, `@@index([columnId, position])`, `@@index([assigneeId])` |
| `KanbanColumn` | `@@index([projectId, position])` (no unique, so reordering inside a transaction never collides) |
| `Label` | `@@unique([projectId, name])` |
| `Comment` | `@@index([taskId, createdAt])` |
| `FileAsset` | `publicId @unique`, `@@index([taskId])` |
| `Notification` | `@@index([recipientId, isRead, createdAt])` |
| `ActivityLog` | `@@index([projectId, createdAt])`, `@@index([projectId, entityType, entityId])` |
| `Client` | `@@index([createdById])` |
| `Project` | `key @unique`, `@@index([clientId])`, `@@index([createdById])` |
| `RefreshToken` | `tokenHash @unique`, `@@index([userId])`, `@@index([familyId])` |

---

## 3. Relationship & Cascade Rules Summary

| Parent Model   | Child Model     | Relation | `onDelete` Action |
| -------------- | --------------- | -------- | ----------------- |
| `User`         | `Project` (`createdById`) | 1:N | `SetNull` (creator is historical; authority comes from `ProjectMember.role = OWNER`) |
| `User`         | `Client`        | 1:N      | `Restrict` (clients must be deleted or handed over first) |
| `User`         | `ProjectMember` | 1:N      | `Cascade` |
| `User`         | `Task` (`assigneeId`) | 1:N | `SetNull` |
| `User`         | `Comment`       | 1:N      | `SetNull` |
| `User`         | `FileAsset`     | 1:N      | `SetNull` |
| `User`         | `Notification`  | 1:N      | `Cascade` |
| `User`         | `ActivityLog`   | 1:N      | `SetNull` |
| `User`         | `RefreshToken`  | 1:N      | `Cascade` |
| `Client`       | `Project`       | 1:N      | `SetNull` |
| `Project`      | `ProjectMember` | 1:N      | `Cascade` |
| `Project`      | `KanbanColumn`  | 1:N      | `Cascade` |
| `Project`      | `Task`          | 1:N      | `Cascade` |
| `Project`      | `Label`         | 1:N      | `Cascade` |
| `Project`      | `ActivityLog`   | 1:N      | `Cascade` |
| `KanbanColumn` | `Task`          | 1:N      | `NoAction` (checked at end of statement: a direct column delete fails while tasks exist, but a project delete cascades cleanly) |
| `Task`         | `Comment`       | 1:N      | `Cascade` |
| `Task`         | `FileAsset`     | 1:N      | `Cascade` |
| `Task` / `Label` | (join table)  | M:N      | Prisma implicit join table; rows are removed automatically when either side is deleted (no `onDelete` option exists for implicit relations) |

### Nullable foreign keys (required by `SetNull`)

`Project.clientId`, `Project.createdById`, `Task.assigneeId`, `Comment.authorId`, `FileAsset.uploadedById`, `ActivityLog.actorId`

### User deletion (not exposed in v1)

There is no delete-user endpoint in v1. If added later, it must first verify that the user (a) owns no clients and (b) is not the only `OWNER` of any project. Everything else is handled by the rules above.

---

## 4. Canonical Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum NotificationType {
  TASK_ASSIGNED
  COMMENT_ADDED
  MEMBER_ADDED
  MEMBER_ROLE_CHANGED
}

enum ActivityEntityType {
  PROJECT
  MEMBER
  COLUMN
  TASK
  LABEL
  COMMENT
  FILE
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  createdProjects Project[]
  createdClients  Client[]
  memberships     ProjectMember[]
  assignedTasks   Task[]
  comments        Comment[]
  fileAssets      FileAsset[]
  notifications   Notification[]
  activityLogs    ActivityLog[]
  refreshTokens   RefreshToken[]
}

model RefreshToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  familyId  String    // one family per login (device/session); rotation keeps the same familyId
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  rotatedAt DateTime? // set when this token was replaced by a newer one in the same family
  revokedAt DateTime? // set when revoked (rotation, logout, or family revocation)
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([familyId])
}

model Client {
  id          String   @id @default(cuid())
  name        String
  email       String?
  company     String?
  phone       String?
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id], onDelete: Restrict)
  projects    Project[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([createdById])
}

model Project {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String?
  taskCounter Int      @default(0)
  clientId    String?
  client      Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  createdById String?
  createdBy   User?    @relation(fields: [createdById], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members      ProjectMember[]
  columns      KanbanColumn[]
  tasks        Task[]
  labels       Label[]
  activityLogs ActivityLog[]

  @@index([clientId])
  @@index([createdById])
}

model ProjectMember {
  id        String      @id @default(cuid())
  projectId String
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())

  @@unique([projectId, userId])
  @@index([userId])
}

model KanbanColumn {
  id        String   @id @default(cuid())
  title     String
  position  Int
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks     Task[]
  createdAt DateTime @default(now())

  @@index([projectId, position])
}

model Task {
  id          String       @id @default(cuid())
  taskNumber  Int
  taskKey     String       @unique
  title       String
  description String?
  priority    Priority     @default(MEDIUM)
  position    Float
  dueDate     DateTime?
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  columnId    String
  column      KanbanColumn @relation(fields: [columnId], references: [id], onDelete: NoAction)
  assigneeId  String?
  assignee    User?        @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  labels      Label[]
  comments    Comment[]
  files       FileAsset[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([projectId, taskNumber])
  @@index([projectId])
  @@index([columnId, position])
  @@index([assigneeId])
}

model Label {
  id        String   @id @default(cuid())
  name      String
  color     String
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks     Task[]
  createdAt DateTime @default(now())

  @@unique([projectId, name])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId  String?
  author    User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([taskId, createdAt])
}

model FileAsset {
  id           String   @id @default(cuid())
  publicId     String   @unique
  secureUrl    String
  fileName     String
  fileSize     Int
  fileType     String   // MIME type
  resourceType String   // Cloudinary resource_type: image | raw | video (needed to delete the asset)
  taskId       String
  task         Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  uploadedById String?
  uploadedBy   User?    @relation(fields: [uploadedById], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())

  @@index([taskId])
}

model Notification {
  id          String           @id @default(cuid())
  recipientId String
  recipient   User             @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  type        NotificationType
  title       String
  message     String
  linkUrl     String?
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())

  @@index([recipientId, isRead, createdAt])
}

model ActivityLog {
  id         String             @id @default(cuid())
  actorId    String?
  actor      User?              @relation(fields: [actorId], references: [id], onDelete: SetNull)
  projectId  String
  project    Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  entityType ActivityEntityType
  entityId   String?            // no FK on purpose: history must survive deleted entities
  action     String             // e.g. "task.created", "task.moved"
  details    Json?
  createdAt  DateTime           @default(now())

  @@index([projectId, createdAt])
  @@index([projectId, entityType, entityId])
}
```

---

## 5. API Conventions

### Response envelope (`@tickon/types`)

```ts
ApiResponse<T>       = { success: true;  data: T }
PaginatedResponse<T> = { success: true;  data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }
ApiErrorResponse     = { success: false; error: { code: string; message: string; details?: unknown } }
```

### Status codes

`200` OK, `201` created, `204` deleted with no body, `400` validation error, `401` not authenticated, `403` authenticated but role too low, `404` not found **or not a member of the project** (never reveal that a resource exists), `409` conflict (duplicate key/email/label, column not empty), `413` file too large, `415` unsupported file type, `429` throttled.

### Pagination

`?page=1&limit=20` (default limit 20, max 100). Applies to: `GET /api/projects`, `GET /api/clients`, `GET /api/notifications`, `GET /api/projects/:id/activity`, `GET /api/tasks/:id/comments`. The board endpoint `GET /api/projects/:id/tasks` is intentionally **not** paginated (a board needs all its tasks).

### Global server setup

- `app.setGlobalPrefix('api')`
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
- `helmet()`, `cookie-parser`, `@nestjs/throttler`, tracked per IP:
  - global default: 100 requests / minute
  - `POST /api/auth/login`: 5 / minute
  - `POST /api/auth/register`: 3 / minute
  - `POST /api/auth/refresh`: 20 / minute
  - `POST /api/tasks/:id/files`: 10 / minute
- CORS: `origin: CLIENT_URL` (explicit, never `*`), `credentials: true`
- IDs are `cuid` strings. All timestamps are UTC ISO-8601 strings.

### Authentication & cookies

| Item | Value |
| --- | --- |
| Access token | JWT, 15 minutes, cookie `tickon_at`, `Path=/` |
| Refresh token | Random 32-byte opaque string, 7 days, cookie `tickon_rt`, `Path=/api/auth`. Only its SHA-256 hash is stored in `RefreshToken`. |
| Cookie flags | `HttpOnly`, `SameSite=Lax`, `Secure` in production |
| Secrets | `JWT_ACCESS_SECRET` (the refresh token needs no JWT secret) |
| Families | Each login creates a new `familyId`. Rotation keeps the same `familyId`, so every device/session has its own family. |
| Rotation | Every `/refresh` sets `rotatedAt` and `revokedAt` on the used token and issues a new token in the same family. |
| Reuse detection | If a presented token is already revoked: (a) if it was rotated less than **10 seconds** ago, answer `401` only (a parallel tab or a network retry, no further action); (b) otherwise treat it as theft and revoke **only that family** (`revokedAt = now()` for all rows with the same `familyId`). Other devices stay logged in. |
| Client refresh | The client runs refresh as **single-flight**: one in-flight `/api/auth/refresh` call at a time, and all queued `401` requests wait for it and retry once. |
| Cleanup | A daily job deletes rows where `expiresAt` is older than 7 days. |
| Logout | Revokes the whole family of the current refresh token and clears both cookies |
| Email | Trimmed and lower-cased before storage and lookup |
| Password | 8 to 72 characters, hashed with `bcryptjs` (cost 12) |
| CSRF defense | `SameSite=Lax` + server rejects mutating requests (`POST/PATCH/PUT/DELETE`) whose `Origin` header is not `CLIENT_URL` |
| Dev note | Cookies are not port-isolated, so a cookie set for `localhost` is sent to both `:3000` and `:4000`. In production, host client and API on the same site (e.g. `app.example.com` and `api.example.com`) and set the cookie `Domain=example.com`. |

---

## 6. Authorization

### Role capabilities

| Capability | VIEWER | MEMBER | ADMIN | OWNER |
| --- | :-: | :-: | :-: | :-: |
| Read project, board, comments, files, labels, members, activity | Yes | Yes | Yes | Yes |
| Create / update / move tasks | No | Yes | Yes | Yes |
| Delete tasks | No | No | Yes | Yes |
| Post comments, edit **own** comments | No | Yes | Yes | Yes |
| Delete comments | No | Own only | Any | Any |
| Upload files | No | Yes | Yes | Yes |
| Delete files | No | Own only | Any | Any |
| Create / update labels | No | Yes | Yes | Yes |
| Delete labels | No | No | Yes | Yes |
| Create / update / reorder / delete columns | No | No | Yes | Yes |
| Update project details | No | No | Yes | Yes |
| Add / remove members, change roles of MEMBER and VIEWER | No | No | Yes | Yes |
| Change roles of ADMIN or OWNER, assign OWNER | No | No | No | Yes |
| Delete project | No | No | No | Yes |

### `ProjectRoleGuard`

1. Every project-scoped endpoint declares its minimum role with a decorator, e.g. `@MinRole(ProjectRole.MEMBER)`.
2. The guard resolves the `projectId` from the route:
   - `:id` under `/api/projects/...` is the project ID directly
   - `/api/tasks/:id`, `/api/tasks/:id/...` resolve through `Task.projectId`
   - `/api/columns/:id`, `/api/labels/:id` resolve through their `projectId`
   - `/api/comments/:id`, `/api/files/:id` resolve through `Task.projectId`
3. It loads the caller's `ProjectMember` row. No row means `404`. A role below the minimum means `403`.
4. "Own only" rules (comments, files) are enforced in the service layer after the guard passes.

### Membership invariants (service layer, inside a transaction)

- A project always keeps at least one `OWNER`. Demoting or removing the last OWNER is rejected with `409`.
- When a member is removed, every task in that project assigned to them gets `assigneeId = null` in the same transaction.
- `Task.assigneeId` must reference a project member whose role is MEMBER or higher.
- `Task.columnId` and every label on a task must belong to the task's project.
- `Project.clientId` must reference a client created by the caller.

---

## 7. Core API Endpoints

"Min Role" is the lowest project role allowed. `Auth` means any authenticated user. All routes require authentication unless noted.

### Authentication (`/api/auth`)

| Method  | Route                | Purpose                                              | Min Role |
| ------- | -------------------- | ---------------------------------------------------- | -------- |
| `POST`  | `/api/auth/register` | Create account and set auth cookies                  | Public   |
| `POST`  | `/api/auth/login`    | Authenticate and set auth cookies                    | Public   |
| `POST`  | `/api/auth/refresh`  | Rotate refresh token, issue a new access token       | Public (needs refresh cookie) |
| `POST`  | `/api/auth/logout`   | Revoke refresh token and clear cookies               | Auth     |
| `GET`   | `/api/auth/me`       | Get current user profile                             | Auth     |
| `PATCH` | `/api/auth/me`       | Update own `name` and `avatarUrl` (https URL only)   | Auth     |

### Clients (`/api/clients`)

Clients are private to their creator.

| Method   | Route              | Purpose                                              | Min Role |
| -------- | ------------------ | ---------------------------------------------------- | -------- |
| `GET`    | `/api/clients`     | List clients created by the caller (paginated)       | Auth     |
| `POST`   | `/api/clients`     | Create a client                                      | Auth     |
| `GET`    | `/api/clients/:id` | Get a client (creator only)                          | Auth     |
| `PATCH`  | `/api/clients/:id` | Update a client (creator only)                       | Auth     |
| `DELETE` | `/api/clients/:id` | Delete a client; linked projects get `clientId = null` | Auth   |

### Projects (`/api/projects`)

| Method   | Route                        | Purpose                                                                 | Min Role |
| -------- | ---------------------------- | ----------------------------------------------------------------------- | -------- |
| `GET`    | `/api/projects`              | List projects the caller is a member of (paginated)                     | Auth     |
| `POST`   | `/api/projects`              | Create project (see "Project creation" below)                           | Auth     |
| `GET`    | `/api/projects/:id`          | Project details, including columns and a read-only client summary       | VIEWER   |
| `PATCH`  | `/api/projects/:id`          | Update `name`, `description`, `clientId` (`key` is immutable)           | ADMIN    |
| `DELETE` | `/api/projects/:id`          | Delete project and everything under it                                  | OWNER    |
| `GET`    | `/api/projects/:id/activity` | Activity feed (paginated, newest first). Optional `entityType`, `entityId` filters | VIEWER |

**Project creation** runs in one transaction: create the project (the client sends `key` in the request body, the UI may suggest one from the project name; `key` must match `^[A-Z][A-Z0-9]{1,9}$` and be unique, otherwise `409`), add the caller as `OWNER`, create default columns `To Do`, `In Progress`, `Review`, `Done` (positions 0 to 3), and write an activity log entry.

**Client summary:** `GET /api/projects/:id` returns `client: { id, name, company } | null` (never email or phone), so members who did not create the client see only the minimum. When `clientId` is set or changed through `PATCH`, the client must have been created by the **caller** making the change. Existing links stay valid if the original creator later loses access.

**Project deletion:** before deleting, collect all `FileAsset.publicId` / `resourceType` values for the project. After the database transaction commits, delete those Cloudinary assets (best effort, log failures).

### Project Members (`/api/projects/:id/members`)

| Method   | Route                               | Purpose                                                        | Min Role |
| -------- | ----------------------------------- | -------------------------------------------------------------- | -------- |
| `GET`    | `/api/projects/:id/members`         | List project members                                           | VIEWER   |
| `POST`   | `/api/projects/:id/members`         | Add an existing user by `email` with a `role` (not OWNER)      | ADMIN    |
| `PATCH`  | `/api/projects/:id/members/:userId` | Update member role (see capability table for who may do what)  | ADMIN    |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove a member (a member may also remove themselves)         | ADMIN (or self) |

### Kanban Columns (`/api/projects/:id/columns`, `/api/columns`)

| Method   | Route                               | Purpose                                                     | Min Role |
| -------- | ----------------------------------- | ----------------------------------------------------------- | -------- |
| `GET`    | `/api/projects/:id/columns`         | List columns ordered by `position`                          | VIEWER   |
| `POST`   | `/api/projects/:id/columns`         | Create a column (appended at the end)                       | ADMIN    |
| `PATCH`  | `/api/projects/:id/columns/reorder` | Body `{ columnIds: string[] }` (complete ordered list); renumbers positions 0..n-1 in one transaction | ADMIN |
| `PATCH`  | `/api/columns/:id`                  | Update column `title`                                       | ADMIN    |
| `DELETE` | `/api/columns/:id`                  | Delete an empty column; `409` if it still contains tasks    | ADMIN    |

A Kanban column containing tasks must not be deleted until its tasks are moved to another column. The `NoAction` foreign key enforces this at the database level as well.

### Tasks & Kanban (`/api/projects/:id/tasks`, `/api/tasks`)

| Method   | Route                     | Purpose                                                                 | Min Role |
| -------- | ------------------------- | ----------------------------------------------------------------------- | -------- |
| `GET`    | `/api/projects/:id/tasks` | Fetch all tasks of the board (optional filters `assigneeId`, `priority`, `labelId`) | VIEWER |
| `POST`   | `/api/projects/:id/tasks` | Create a task in a column. Body: `title`, `columnId`, optional `description`, `priority`, `dueDate`, `assigneeId`, `labelIds` | MEMBER |
| `GET`    | `/api/tasks/:id`          | Get task details (labels, assignee, file list)                          | VIEWER   |
| `PATCH`  | `/api/tasks/:id`          | Update details (`title`, `description`, `priority`, `dueDate`, `assigneeId`, `labelIds`) | MEMBER |
| `PATCH`  | `/api/tasks/:id/move`     | Move for drag-and-drop. Body: `{ columnId, prevTaskId, nextTaskId }` (neighbours in the target column, `null` at an edge) | MEMBER |
| `DELETE` | `/api/tasks/:id`          | Delete a task (and its comments and files)                              | ADMIN    |

**Task creation** runs in one transaction: `UPDATE Project SET taskCounter = taskCounter + 1 RETURNING taskCounter` (atomic increment), then insert the task with `taskNumber = counter`, `taskKey = "<PROJECT_KEY>-<counter>"`, and `position = (max position in column) + 1000` (or `1000` for an empty column).

**Task move** is computed on the server inside a transaction: `position` is the midpoint of the two neighbours (`prev + 1000` if there is no next, `next / 2` if there is no prev, `1000` for an empty column). If the gap between neighbours drops below `0.000001`, the whole column is rebalanced to multiples of 1000 and the response includes the new positions.

**Move validation** (inside the same transaction, using fresh data from the database, never the client's view):
- `columnId` must belong to the task's project.
- `prevTaskId` and `nextTaskId`, when not `null`, must exist, be in the target column, and differ from the moved task.
- If both are given, `prev.position < next.position` must hold. Otherwise the client's view is stale: ignore the neighbours and append the task at the end of the target column.
- If a neighbour is missing (deleted by someone else in the meantime), fall back the same way (append at the end). The response and the `task.moved` event carry the final position, so every client converges to the same order.

**Task deletion:** collect the task's Cloudinary assets first and delete them after the transaction commits.

### Labels (`/api/projects/:id/labels`, `/api/labels`)

| Method   | Route                      | Purpose                                                  | Min Role |
| -------- | -------------------------- | -------------------------------------------------------- | -------- |
| `GET`    | `/api/projects/:id/labels` | List project labels                                      | VIEWER   |
| `POST`   | `/api/projects/:id/labels` | Create a label (`name` unique per project, `color` is `#RRGGBB`) | MEMBER |
| `PATCH`  | `/api/labels/:id`          | Update label details                                     | MEMBER   |
| `DELETE` | `/api/labels/:id`          | Delete a label (removed from all tasks automatically)    | ADMIN    |

### Collaboration (`/api/comments`, `/api/files`)

| Method   | Route                     | Purpose                                                       | Min Role |
| -------- | ------------------------- | ------------------------------------------------------------- | -------- |
| `GET`    | `/api/tasks/:id/comments` | Discussion thread for a task (paginated, oldest first)        | VIEWER   |
| `POST`   | `/api/tasks/:id/comments` | Add a comment                                                 | MEMBER   |
| `PATCH`  | `/api/comments/:id`       | Edit a comment (author only)                                  | MEMBER   |
| `DELETE` | `/api/comments/:id`       | Delete a comment (author, or ADMIN and above)                 | MEMBER   |
| `GET`    | `/api/tasks/:id/files`    | List files attached to a task                                 | VIEWER   |
| `POST`   | `/api/tasks/:id/files`    | Upload one file (`multipart/form-data`, field `file`) to Cloudinary and attach it | MEMBER |
| `DELETE` | `/api/files/:id`          | Remove file metadata and delete the Cloudinary asset (uploader, or ADMIN and above) | MEMBER |

**Upload rules:**
- Multer `memoryStorage`, `limits: { fileSize: 10 * 1024 * 1024, files: 1 }`
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `application/pdf`, `text/plain`, `application/zip`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Maximum 20 attachments per task
- Cloudinary folder: `tickon/<projectId>/<taskId>`; store `public_id`, `secure_url` and `resource_type` from the upload result
- Order of operations: upload to Cloudinary, then insert the `FileAsset` row. If the insert fails, immediately `destroy` the uploaded asset (no orphans).
- On delete: remove the DB row first, then destroy the Cloudinary asset using the stored `resourceType`; log a warning if Cloudinary fails.

### Notifications (`/api/notifications`)

Notifications are always private to `recipientId`.

| Method   | Route                         | Purpose                                              | Min Role |
| -------- | ----------------------------- | ---------------------------------------------------- | -------- |
| `GET`    | `/api/notifications`          | List own notifications (paginated, newest first, optional `?unread=true`) | Auth |
| `GET`    | `/api/notifications/unread-count` | Number of unread notifications                   | Auth     |
| `PATCH`  | `/api/notifications/read-all` | Mark all own notifications as read                   | Auth     |
| `PATCH`  | `/api/notifications/:id/read` | Mark one notification as read                        | Auth     |
| `DELETE` | `/api/notifications/:id`      | Delete one notification                              | Auth     |

**Notification triggers:** `TASK_ASSIGNED` (assignee changes to someone other than the actor), `COMMENT_ADDED` (task assignee, if not the commenter), `MEMBER_ADDED`, `MEMBER_ROLE_CHANGED`. Users never notify themselves. In v1 an unassigned task produces no `COMMENT_ADDED` notification (revisit if needed). `GET /api/notifications/unread-count` returns `ApiResponse<{ count: number }>`.

---

## 8. Real-Time Events

Socket.IO gateway on port `4000`, CORS `origin: CLIENT_URL`, `credentials: true`.

### Connection & rooms

1. The handshake middleware reads the `tickon_at` cookie, verifies the JWT, and attaches the user to the socket. Failure disconnects with an auth error.
2. On connect the server joins the socket to `user:{userId}` (used for notifications).
3. The client emits `project.join` with `{ projectId }`. The server checks `ProjectMember` and only then joins room `project:{projectId}`; otherwise it replies with an error acknowledgement. `project.leave` leaves the room.
4. When a member is removed, the server makes all of that user's sockets leave the project room, then emits `member.removed`.
5. **Token expiry (server):** at handshake the server reads the token's `exp` and schedules a timer. When it fires, the server emits `auth.expired` and disconnects the socket. The timer is cleared on disconnect. `project.join` also re-checks that the token is still valid.
6. **Token expiry (client):** about 60 seconds before the access token expires, the client runs the single-flight refresh and then reconnects the socket. On `auth.expired` or `connect_error` with an auth error, the client refreshes once and reconnects; if the refresh fails (`401`), it logs the user out.
7. **Reconnect (client):** on every `connect` event (first connect and every reconnect) the client emits `project.join` for each project it currently has open, then invalidates the react-query caches of those projects, because rooms are lost on disconnect and events during the gap are missed. This is implemented once in a shared `useSocket` hook.
8. Events are emitted **after** the database transaction commits, never before.

### Event envelope (all events)

```ts
interface RealtimeEvent<T> {
  eventId: string;     // unique per event, lets clients de-duplicate
  projectId: string;   // omitted for notification.created
  actorId: string | null;
  occurredAt: string;  // ISO-8601
  data: T;
}
```

### Events and `data` payloads

| Event | Room | `data` |
| --- | --- | --- |
| `task.created` | `project:{id}` | `{ task }` |
| `task.updated` | `project:{id}` | `{ task }` |
| `task.moved` | `project:{id}` | `{ task, fromColumnId, positions: { id, position }[] \| null }` (`positions` only when the column was rebalanced) |
| `task.deleted` | `project:{id}` | `{ taskId, columnId }` |
| `comment.created` | `project:{id}` | `{ comment }` |
| `comment.updated` | `project:{id}` | `{ comment }` |
| `comment.deleted` | `project:{id}` | `{ commentId, taskId }` |
| `member.added` | `project:{id}` | `{ member }` |
| `member.updated` | `project:{id}` | `{ member }` |
| `member.removed` | `project:{id}` | `{ userId }` |
| `column.created` | `project:{id}` | `{ column }` |
| `column.updated` | `project:{id}` | `{ column }` (also used for reorder: one event with the full ordered list `{ columns }`) |
| `column.deleted` | `project:{id}` | `{ columnId }` |
| `label.created` | `project:{id}` | `{ label }` |
| `label.updated` | `project:{id}` | `{ label }` |
| `label.deleted` | `project:{id}` | `{ labelId }` |
| `notification.created` | `user:{recipientId}` | `{ notification }` |

All real-time events must be scoped to the relevant project (or user) room and authorized against the authenticated user's project membership. Payload types live in `@tickon/types`.

### Activity actions

`ActivityLog.action` stays a `String` column in the database (adding an action never needs a migration), but valid values are defined once in `@tickon/types` and the server only accepts values from this list:

```ts
export const ActivityAction = {
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  MEMBER_ADDED: 'member.added',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  MEMBER_REMOVED: 'member.removed',
  COLUMN_CREATED: 'column.created',
  COLUMN_UPDATED: 'column.updated',
  COLUMN_REORDERED: 'column.reordered',
  COLUMN_DELETED: 'column.deleted',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_MOVED: 'task.moved',
  TASK_DELETED: 'task.deleted',
  LABEL_CREATED: 'label.created',
  LABEL_UPDATED: 'label.updated',
  LABEL_DELETED: 'label.deleted',
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  FILE_UPLOADED: 'file.uploaded',
  FILE_DELETED: 'file.deleted',
} as const;

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];
```

---

## 9. Core Data Rules

1. `TASK.columnId` is the source of truth for the task's current Kanban workflow state.
2. A separate `TASK.status` field is intentionally not used.
3. `TASK.position` (Float) determines ordering within a Kanban column; it is always computed by the server.
4. `KANBAN_COLUMN.position` (Int) determines ordering within a project.
5. `TASK.assigneeId` may be null when a task is unassigned.
6. `PROJECT.clientId` may be null when a project has no associated client.
7. `PROJECT.createdById` may be null when the original creator has been deleted.
8. `COMMENT.authorId` may be null when the original author has been deleted.
9. `FILE_ASSET.uploadedById` may be null when the uploader has been deleted.
10. `ACTIVITY_LOG.actorId` may be null when the original actor has been deleted.
11. A user must have appropriate project membership before accessing project resources; non-members receive `404`.
12. Only authorized project members can create, update, move, or delete project tasks, according to the role table in section 6.
13. Project roles (OWNER, ADMIN, MEMBER, VIEWER) determine permitted project actions. A project always has at least one OWNER.
14. A Kanban column containing tasks cannot be deleted directly.
15. Task-label relationships are managed through Prisma's implicit many-to-many relation. A task's labels must belong to the same project as the task.
16. `Project.key` is immutable after creation; `Task.taskKey` is generated once and never changes. Reason: task keys appear in URLs, commit messages, chats and activity history, so renaming them would break every external reference and the audit trail.
17. Files are stored in Cloudinary; PostgreSQL stores only file metadata and Cloudinary identifiers/URLs. Cloudinary assets are deleted whenever their `FileAsset`, task, or project is deleted.
18. Passwords are stored only as secure hashes using `bcryptjs`, never as plaintext.
19. Authentication uses HTTP-only cookies: a short-lived access token and a rotating refresh token (see section 5).
20. Clients are private to the user who created them.
21. Every multi-step write (task create, task move, column reorder, member removal, project create) runs inside a single Prisma `$transaction`.

---

## 10. Environment Variables

**Server (`apps/server/.env`)**

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/tickon
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=<long random string>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_DOMAIN=            # empty in development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Client (`apps/client/.env.local`)**

```
API_INTERNAL_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
