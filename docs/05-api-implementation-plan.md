# 05 - API Implementation Plan & Specification

This document provides a comprehensive, step-by-step technical plan and specification for implementing all backend REST API endpoints and real-time Socket.IO integrations in `apps/api` (`@tickon/server`), leveraging the shared data contracts from `@tickon/types`.

---

## 1. Global Architecture & Foundational Setup

### 1.1 Technology Stack & Conventions
* **Framework:** NestJS 12 (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
* **Shared Types:** `@tickon/types` (`workspace:*`)
* **ORM:** Prisma Client with PostgreSQL
* **Security:** `@nestjs/jwt`, `passport-jwt`, `bcryptjs`, `cookie-parser`, `helmet`
* **Validation:** `class-validator`, `class-transformer` with strict DTO validation pipes
* **Real-time:** `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
* **File Storage:** `multer`, `cloudinary`

### 1.2 Global Request & Response Pipeline

```mermaid
graph TD
    Req["Incoming HTTP Request"] --> Helmet["Helmet<br/>(Security Headers)"]
    Helmet --> Cookie["Cookie Parser<br/>(Extract Cookies)"]
    Cookie --> Guard["JwtAuthGuard / RolesGuard"]
    Guard --> InterceptorPre["TransformResponseInterceptor<br/>(Pre-Handler)"]
    InterceptorPre --> Pipe["ValidationPipe<br/>(class-validator)"]
    Pipe --> Controller["NestJS Controller"]
    Controller --> Service["Domain Service"]
    Service --> DB[("PostgreSQL via Prisma")]
    DB --> Service
    Service -.-> Gateway["EventsGateway<br/>(Socket.IO)"]
    Service --> InterceptorPost["TransformResponseInterceptor<br/>(Post-Handler)"]
    InterceptorPost --> Res["HTTP Success Response<br/>(ApiResponse)"]

    Guard -.->|"401 / 403"| Filter["GlobalExceptionsFilter"]
    Pipe -.->|"400 Validation"| Filter
    Service -.->|"404 / 500"| Filter
    Filter --> ErrRes["HTTP Error Response<br/>(ApiErrorResponse)"]

    style Filter fill:#f8d7da,stroke:#c0392b
    style ErrRes fill:#f8d7da,stroke:#c0392b
    style Res fill:#d4edda,stroke:#27ae60
```

1. **Global Prefix:** All routes are prefixed with `/api` (configured in `main.ts`).
2. **Response Envelope (`TransformResponseInterceptor`):**
   Wraps all successful controller responses in the standard `@tickon/types` contract:
```json
   {
     "success": true,
     "data": { ... },
     "message": "Optional success message",
     "timestamp": "2026-09-20T14:30:00.000Z"
   }
```
3. **Exception Filter (`GlobalExceptionsFilter`):**
   Catches all HTTP and unexpected exceptions, formatting them into `ApiErrorResponse`:
```json
   {
     "success": false,
     "error": {
       "code": "BAD_REQUEST",
       "message": "Validation failed",
       "details": [
         { "field": "email", "message": "email must be an email" }
       ]
     },
     "timestamp": "2026-09-20T14:30:00.000Z"
   }
```
4. **Authentication & Authorization Guards:**
   * `JwtAuthGuard`: Extracts JWT from HTTP-only cookie (`tickon_token`), verifies signature, attaches `req.user: SafeUser`.
   * `ProjectRoleGuard`: Verifies that `req.user` has the required `ProjectRole` (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) for the specified `:projectId` or `:id`.
   * `@CurrentUser()`: Custom parameter decorator to inject authenticated user into controller methods.

---

## 2. API Implementation Matrix & Endpoint Details

### 2.1 Authentication Module (`/api/auth`)

| Method | Endpoint | Auth Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | No | `RegisterDto` | `ApiResponse<AuthResponse>` | — |
| `POST` | `/api/auth/login` | No | `LoginDto` | `ApiResponse<AuthResponse>` | — |
| `POST` | `/api/auth/logout` | Yes | — | `ApiResponse<{ message: string }>` | — |
| `GET` | `/api/auth/me` | Yes | — | `ApiResponse<SafeUser>` | — |

#### Implementation Details:
* **Register (`POST /api/auth/register`):**
  - Validates `name` (min 2), `email` (valid email), `password` (min 8).
  - Checks for duplicate email in PostgreSQL (`409 Conflict`).
  - Hashes password using `bcryptjs` (salt rounds: 10).
  - Creates `User` record, generates JWT, sets HTTP-only `tickon_token` cookie, returns `SafeUser`.
* **Login (`POST /api/auth/login`):**
  - Finds user by email; returns `401 Unauthorized` if not found or password mismatch.
  - Generates JWT and sets `Set-Cookie` with `httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000`.
* **Logout (`POST /api/auth/logout`):**
  - Clears `tickon_token` cookie via `res.clearCookie('tickon_token')`.
* **Me (`GET /api/auth/me`):**
  - Returns current user profile (`SafeUser`) from `req.user`.

---

### 2.2 Client Management CRM (`/api/clients`)

| Method | Endpoint | Auth Required | Request DTO | Response Contract |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/clients` | Yes | `PaginationQuery` (query params) | `PaginatedResponse<Client>` |
| `POST` | `/api/clients` | Yes | `CreateClientDto` | `ApiResponse<Client>` |
| `GET` | `/api/clients/:id` | Yes | — | `ApiResponse<Client>` |
| `PATCH` | `/api/clients/:id` | Yes | `UpdateClientDto` | `ApiResponse<Client>` |
| `DELETE` | `/api/clients/:id` | Yes | — | `ApiResponse<{ success: boolean }>` |

#### Implementation Details:
* **CRM Scoping:** Clients can be linked to projects (`Project.clientId`).
* **Cascade Rule:** When a `Client` is deleted, related `Project.clientId` is set to `null` (`SetNull` constraint).

---

### 2.3 Projects Module (`/api/projects`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/projects` | Yes | — | `PaginationQuery` | `PaginatedResponse<Project>` | — |
| `POST` | `/api/projects` | Yes | — | `CreateProjectDto` | `ApiResponse<ProjectWithDetails>` | — |
| `GET` | `/api/projects/:id` | Yes | `VIEWER+` | — | `ApiResponse<ProjectWithDetails>` | — |
| `PATCH` | `/api/projects/:id` | Yes | `ADMIN+` | `UpdateProjectDto` | `ApiResponse<Project>` | — |
| `DELETE` | `/api/projects/:id` | Yes | `OWNER` | — | `ApiResponse<{ success: boolean }>` | — |

#### Implementation Details:
* **Create Project (`POST /api/projects`):**
  - Validates `key` (unique project code, e.g. `PRJ`), `name`, optional `description` and `clientId`.
  - In a Prisma `$transaction`:
    1. Creates `Project` with `createdById = req.user.id`.
    2. Creates initial `ProjectMember` with `role = ProjectRole.OWNER`.
    3. Creates default Kanban columns (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) with positions `0, 1, 2, 3`.
    4. Records `ACTIVITY_LOG` entry (`PROJECT_CREATED`).
* **Get Project (`GET /api/projects/:id`):**
  - Includes `client`, `members.user`, `columns` (ordered by `position asc`), and task count metrics.

---

### 2.4 Project Members Module (`/api/projects/:id/members`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/members` | Yes | `VIEWER+` | — | `ApiResponse<ProjectMember[]>` | — |
| `POST` | `/api/projects/:id/members` | Yes | `ADMIN+` | `AddProjectMemberDto` | `ApiResponse<ProjectMember>` | `member.added` |
| `PATCH` | `/api/projects/:id/members/:userId` | Yes | `ADMIN+` | `UpdateProjectMemberRoleDto` | `ApiResponse<ProjectMember>` | `member.updated` |
| `DELETE` | `/api/projects/:id/members/:userId` | Yes | `ADMIN+` | — | `ApiResponse<{ success: boolean }>` | `member.removed` |

#### Implementation Details:
* **Role Hierarchy:** `OWNER` > `ADMIN` > `MEMBER` > `VIEWER`.
* **Constraints:**
  - An `ADMIN` cannot change or remove the `OWNER`.
  - The `OWNER` cannot be removed without transferring ownership first.
* **Real-time Broadcast:** Emits `member.added`, `member.updated`, or `member.removed` to the `project:{id}` room.

---

### 2.5 Kanban Columns Module (`/api/projects/:id/columns`, `/api/columns`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/columns` | Yes | `VIEWER+` | — | `ApiResponse<KanbanColumnWithTasks[]>` | — |
| `POST` | `/api/projects/:id/columns` | Yes | `ADMIN+` | `CreateColumnDto` | `ApiResponse<KanbanColumn>` | `column.created` |
| `PATCH` | `/api/columns/:id` | Yes | `ADMIN+` | `UpdateColumnDto` | `ApiResponse<KanbanColumn>` | `column.updated` |
| `DELETE` | `/api/columns/:id` | Yes | `ADMIN+` | — | `ApiResponse<{ success: boolean }>` | `column.deleted` |

#### Implementation Details:
* **Column Deletion Guard:** Columns containing tasks **cannot** be deleted directly (`400 Bad Request`). Tasks must be moved to another column first.
* **Ordering:** Columns ordered by `position ASC`.
* **Real-time Broadcast:** Emits `column.created`, `column.updated`, `column.deleted` to `project:{projectId}` room.

---

### 2.6 Tasks & Kanban Module (`/api/tasks`, `/api/projects/:id/tasks`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/tasks` | Yes | `VIEWER+` | `PaginationQuery` | `ApiResponse<TaskWithDetails[]>` | — |
| `POST` | `/api/tasks` | Yes | `MEMBER+` | `CreateTaskDto` | `ApiResponse<TaskWithDetails>` | `task.created` |
| `GET` | `/api/tasks/:id` | Yes | `VIEWER+` | — | `ApiResponse<TaskWithDetails>` | — |
| `PATCH` | `/api/tasks/:id` | Yes | `MEMBER+` | `UpdateTaskDto` | `ApiResponse<TaskWithDetails>` | `task.updated` |
| `PATCH` | `/api/tasks/:id/move` | Yes | `MEMBER+` | `MoveTaskDto` | `ApiResponse<TaskWithDetails>` | `task.moved` |
| `DELETE` | `/api/tasks/:id` | Yes | `MEMBER+` | — | `ApiResponse<{ success: boolean }>` | `task.deleted` |

#### Implementation Details:
* **Task Key Generation:** Automatically generated using project key prefix (e.g., `PRJ-1`, `PRJ-2`).
* **Source of Truth:** `TASK.columnId` represents the workflow state.
* **Drag-and-Drop Move (`PATCH /api/tasks/:id/move`):**
  - Updates `columnId` and `position`.
  - Real-time broadcast: Emits `task.moved` with `{ projectId, taskId, fromColumnId, toColumnId, position }` to `project:{id}` room.
* **Task Assignment Notification:** If `assigneeId` is set and different from `req.user.id`, automatically create a `NOTIFICATION` record (`TASK_ASSIGNED`) and emit `notification.created` to `user:{assigneeId}`.

---

### 2.7 Labels Module (`/api/projects/:id/labels`, `/api/labels`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/labels` | Yes | `VIEWER+` | — | `ApiResponse<Label[]>` | — |
| `POST` | `/api/projects/:id/labels` | Yes | `MEMBER+` | `CreateLabelDto` | `ApiResponse<Label>` | `label.created` |
| `PATCH` | `/api/labels/:id` | Yes | `MEMBER+` | `UpdateLabelDto` | `ApiResponse<Label>` | `label.updated` |
| `DELETE` | `/api/labels/:id` | Yes | `MEMBER+` | — | `ApiResponse<{ success: boolean }>` | `label.deleted` |

#### Implementation Details:
* Task-label association handled via Prisma implicit M:N relation.
* Color codes validated as valid hex strings (`#HEX`).

---

### 2.8 Comments Module (`/api/tasks/:id/comments`, `/api/comments`)

| Method | Endpoint | Auth Required | Role Required | Request DTO | Response Contract | Socket Event |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `GET` | `/api/tasks/:id/comments` | Yes | `VIEWER+` | — | `ApiResponse<CommentWithAuthor[]>` | — |
| `POST` | `/api/tasks/:id/comments` | Yes | `MEMBER+` | `CreateCommentDto` | `ApiResponse<CommentWithAuthor>` | `comment.created` |
| `PATCH` | `/api/comments/:id` | Yes | Author / `ADMIN+` | `UpdateCommentDto` | `ApiResponse<CommentWithAuthor>` | `comment.updated` |
| `DELETE` | `/api/comments/:id` | Yes | Author / `ADMIN+` | — | `ApiResponse<{ success: boolean }>` | `comment.deleted` |

#### Implementation Details:
* Author set to `req.user.id`.
* Emits `comment.created`, `comment.updated`, `comment.deleted` to `project:{id}` room.
* If author is not task assignee, creates `NOTIFICATION` (`COMMENT_ADDED`) for the assignee.

---

### 2.9 File Assets & Cloudinary Uploads (`/api/files`)

| Method | Endpoint | Auth Required | Role Required | Request Payload | Response Contract |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/api/files/upload` | Yes | `MEMBER+` | `multipart/form-data` (`file`, `taskId?`, `projectId?`) | `ApiResponse<UploadFileResponse>` |
| `DELETE` | `/api/files/:id` | Yes | Uploader / `ADMIN+` | — | `ApiResponse<{ success: boolean }>` |

#### Implementation Details:
* Uses `multer` buffer and Cloudinary upload stream.
* Stores `publicId`, `secureUrl`, `fileName`, `fileSize`, and `fileType` in PostgreSQL.
* On deletion, destroys asset in Cloudinary before deleting database record.

---

### 2.10 Notifications Module (`/api/notifications`)

| Method | Endpoint | Auth Required | Request DTO | Response Contract |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/notifications` | Yes | `PaginationQuery` | `PaginatedResponse<Notification>` |
| `PATCH` | `/api/notifications/:id/read` | Yes | `MarkNotificationReadDto` | `ApiResponse<Notification>` |
| `PATCH` | `/api/notifications/read-all` | Yes | — | `ApiResponse<{ success: boolean; count: number }>` |

#### Implementation Details:
* Filtered by `recipientId = req.user.id`.
* Ordered by `createdAt desc`.

---

## 3. Step-by-Step Implementation Roadmap

```mermaid
graph TD
    P1[Phase 1: Core Foundation] --> P2[Phase 2: Authentication & Users]
    P2 --> P3[Phase 3: Clients & Projects Workspace]
    P3 --> P4[Phase 4: Kanban Columns & Tasks]
    P4 --> P5[Phase 5: Labels, Comments & Attachments]
    P5 --> P6[Phase 6: Notifications & Real-Time Gateway]
```

### Phase 1: Core Foundation & Database Module
1. **Prisma Setup (`apps/api/src/database`):**
   - Create `PrismaService` extending `PrismaClient` with `onModuleInit` and `enableShutdownHooks`.
   - Create `DatabaseModule` exported globally (`@Global()`).
2. **Global Pipes, Interceptors & Filters:**
   - Implement `TransformResponseInterceptor` in `src/common/interceptors/transform-response.interceptor.ts`.
   - Implement `GlobalExceptionsFilter` in `src/common/filters/global-exceptions.filter.ts`.
   - Register both in `main.ts` or as providers via `APP_INTERCEPTOR` and `APP_FILTER`.

### Phase 2: Authentication & User Management
1. **JWT Strategy & Cookie Extraction:**
   - Configure `PassportModule` and `JwtModule` in `AuthModule`.
   - Create `JwtStrategy` with custom cookie extractor for `tickon_token`.
   - Implement `JwtAuthGuard` and `@CurrentUser()` decorator.
2. **Auth Service & Controller:**
   - Implement `register`, `login`, `logout`, and `me` methods.
   - Use `CreateUserDto` / `RegisterDto` and `LoginDto` from `@tickon/types`.

### Phase 3: Clients & Projects Workspace
1. **Clients Module (`apps/api/src/clients`):**
   - Generate `ClientsModule`, `ClientsController`, and `ClientsService`.
   - Implement CRUD endpoints with `CreateClientDto` and `UpdateClientDto`.
2. **Projects Module (`apps/api/src/projects`):**
   - Generate `ProjectsModule`, `ProjectsController`, and `ProjectsService`.
   - Implement project creation with automatic default columns (`TODO`, `IN_PROGRESS`, etc.).
   - Implement `ProjectRoleGuard` and `@Roles(ProjectRole.ADMIN)` decorator.
3. **Project Members Module (`apps/api/src/projects/members`):**
   - Manage memberships, invitations, and role assignments.

### Phase 4: Kanban Columns & Tasks
1. **Columns Module (`apps/api/src/columns`):**
   - Implement column management with task count validation before deletion.
2. **Tasks Module (`apps/api/src/tasks`):**
   - Implement task creation with auto-incrementing `taskKey` per project.
   - Implement `move` endpoint for drag-and-drop position and column updates.

### Phase 5: Collaboration, Labels & Files
1. **Labels Module (`apps/api/src/labels`):**
   - Implement label creation, updating, and many-to-many linking with tasks.
2. **Comments Module (`apps/api/src/comments`):**
   - Task discussion thread endpoints with author association.
3. **Files Module (`apps/api/src/files`):**
   - Cloudinary configuration (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
   - Multer file interceptor with secure upload and cleanup.

### Phase 6: Real-Time Collaboration & Notifications
1. **Events Gateway (`apps/api/src/events`):**
   - Create `EventsGateway` using `@WebSocketGateway({ cors: { credentials: true } })`.
   - Implement room subscriptions (`project:{id}` and `user:{id}`).
   - Inject `EventsGateway` into `TasksService`, `CommentsService`, `ColumnsService`, etc.
2. **Notifications Module (`apps/api/src/notifications`):**
   - Automatic notification dispatch on task assignment and comment mentions.
   - Real-time emission via `notification.created`.

---

## 4. Environment Variables Required (`apps/api/.env`)

```env
# Application
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tickon?schema=public"

# Authentication
JWT_SECRET="super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 5. Definition of Done Checklist for Each API
For an endpoint to be considered complete:
- [ ] Controller method accepts strongly-typed DTO validated by `class-validator`.
- [ ] Guard verifies JWT authentication and `ProjectRole` permissions.
- [ ] Service performs business logic and database queries via `PrismaService`.
- [ ] Real-time Socket.IO event is emitted if the entity is mutated.
- [ ] Response adheres to `ApiResponse<T>` or `PaginatedResponse<T>`.
- [ ] Errors return appropriate HTTP status codes (400, 401, 403, 404, 409).
- [ ] Unit/E2E test verifies happy path and failure scenarios.