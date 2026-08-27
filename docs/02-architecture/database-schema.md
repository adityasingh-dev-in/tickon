# ProjectOS — Database Schema Documentation

> **Single Source of Truth** for the ProjectOS production database architecture, data models, field-level rationale, relationships, access query patterns, indexing strategies, scaling, and schema evolution guidelines.

---

# 1. Introduction

## 1.1 Executive Summary

ProjectOS is an enterprise-grade multi-tenant Project Management and Workspace Operations Platform. This document serves as the authoritative technical specification and single source of truth for the application's MongoDB database schema layer using Mongoose ODM.

## 1.2 Purpose & Scope

This documentation defines every entity, schema field, relationship constraint, index specification, operational rule, and architectural design decision across the entire application ecosystem. It provides back-end engineers, database administrators, and system architects with the exact knowledge required to implement, maintain, query, and evolve the database without ambiguity or missing context.

## 1.3 Target Audience

- **Backend Software Engineers**: Implementing Mongoose models, controllers, services, and queries.
- **Database Administrators (DBAs)**: Configuring MongoDB Atlas, managing indexes, sharding keys, and monitoring query execution plans.
- **Security & QA Engineers**: Verifying data isolation, ownership rules, schema validation, and RBAC permissions.

---

# 2. Database Philosophy

ProjectOS utilizes **MongoDB** (v7.0+) coupled with **Mongoose ODM** (v8.0+). The database architecture adheres to six foundational principles:

1. **Document-Oriented Domain Modeling**: Related data that is always accessed together and bounded in growth is embedded inside parent documents; unbound collections are stored independently and linked via foreign `ObjectId` references.
2. **Schema Rigor with Application Flexibility**: Data structure is strictly validated at the application layer via Mongoose Schemas and Zod request contracts, avoiding relational migration overhead while guaranteeing document consistency.
3. **Soft Deletion by Default**: Business entities are soft-deleted using flag markers (`isDeleted: boolean`, `deletedAt: Date`, `deletedBy: ObjectId`) to preserve audit history and prevent irreversible data loss.
4. **Storage Offloading for Binary Assets**: Files, media attachments, and user avatars are uploaded directly to external cloud storage (Cloudinary), storing only lightweight metadata documents in MongoDB.
5. **Auditing & Traceability**: All state mutations generate asynchronous background entries in an immutable `activityLogs` audit stream.
6. **Query-Driven Index Design**: Index strategies are explicitly derived from product access patterns (Kanban rendering, dashboard metrics, notification feeds) to guarantee sub-millisecond query execution at scale.

---

# 3. Database Overview

```text
                               ┌─────────────────┐
                               │      Role       │
                               └────────┬────────┘
                                        │ 1:N
                                        ▼
                               ┌─────────────────┐
                               │      User       │◄────────┐
                               └────────┬────────┘         │
             ┌──────────────────────────┼──────────────────┼─────────────────┐
             │ 1:1                      │ 1:N              │ 1:N             │ 1:N
             ▼                          ▼                  ▼                 ▼
   ┌──────────────────┐       ┌──────────────────┐  ┌──────────────┐ ┌──────────────┐
   │   UserSetting    │       │      Client      │  │   Session    │ │PasswordReset │
   └──────────────────┘       └────────┬─────────┘  └──────────────┘ └──────────────┘
                                       │ 1:N
                                       ▼
                              ┌──────────────────┐
                              │     Project      │
                              └────────┬─────────┘
             ┌─────────────────────────┼────────────────────────┐
             │ 1:N                     │ 1:N                    │ 1:N
             ▼                         ▼                        ▼
   ┌──────────────────┐      ┌──────────────────┐     ┌──────────────────┐
   │   KanbanColumn   │      │       Task       │     │       File       │
   └──────────────────┘      └────────┬─────────┘     └──────────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │ 1:N            │ M:N (Array)    │ 1:N
                     ▼                ▼                ▼
           ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
           │     Comment      │ │    Label     │ │ Notification │
           └──────────────────┘ └──────────────┘ └──────────────┘
                                      │
                                      ▼ 1:N
                             ┌──────────────────┐
                             │   ActivityLog    │
                             └──────────────────┘
```

---

# 4. Collection Summary

| Collection           | Model Name          | Primary Purpose                                        | Growth Rate         | Access Pattern               |
| -------------------- | ------------------- | ------------------------------------------------------ | ------------------- | ---------------------------- |
| `roles`              | `Role`              | System RBAC permissions and access masks               | Static (<100)       | Read-heavy (Cached)          |
| `users`              | `User`              | User accounts, credentials, and profile identity       | Moderate (10k+)     | High Read/Write              |
| `userSettings`       | `UserSetting`       | User preferences, theme, and notification configs      | 1:1 with User       | Read-heavy                   |
| `clients`            | `Client`            | External client accounts linked to projects            | Moderate (50k+)     | Medium Read/Write            |
| `projects`           | `Project`           | Workspaces, project settings, and budgets              | Moderate (100k+)    | High Read/Write              |
| `kanbanColumns`      | `KanbanColumn`      | Board workflow states and column ordering              | Moderate            | High Read / Medium Write     |
| `tasks`              | `Task`              | Individual work items, state, assignees, and due dates | Rapid (Millions)    | Intensive Read/Write         |
| `labels`             | `Label`             | Categorization tags for tasks and projects             | Low/Medium          | Read-heavy                   |
| `files`              | `File`              | Cloudinary file attachment metadata                    | Rapid (Millions)    | Medium Read / High Write     |
| `comments`           | `Comment`           | Discussion threads on tasks                            | Rapid (Millions)    | High Read/Write              |
| `notifications`      | `Notification`      | Real-time user notifications and unread badges         | High (Millions)     | Intensive Read/Write         |
| `activityLogs`       | `ActivityLog`       | Immutable security audit trail of all platform events  | Massive (10M+)      | Write-heavy / Selective Read |
| `sessions`           | `Session`           | JWT refresh tokens and active user login sessions      | Dynamic / Ephemeral | Intensive Read/Write         |
| `passwordResets`     | `PasswordReset`     | Single-use password reset tokens with TTL              | Ephemeral           | Low Read/Write               |
| `emailVerifications` | `EmailVerification` | Single-use email verification tokens with TTL          | Ephemeral           | Low Read/Write               |

---

# 5. Base Fields

Every document across all collections in ProjectOS derives from a standardized base metadata layout.

## 5.1 Common Base Schema

```typescript
interface BaseDocument {
  _id: Types.ObjectId; // Unique BSON ObjectId primary key
  createdAt: Date; // Automatic Mongoose timestamp (ISO-8601)
  updatedAt: Date; // Automatic Mongoose timestamp (ISO-8601)
  createdBy?: Types.ObjectId; // User who instantiated the document
  updatedBy?: Types.ObjectId; // User who last mutated the document
  isDeleted: boolean; // Soft deletion flag (Default: false)
  deletedAt?: Date; // Timestamp when soft deleted
  deletedBy?: Types.ObjectId; // User who initiated soft deletion
}
```

## 5.2 Model Base Field Inclusion Matrix

| Model               | `_id` | `createdAt` / `updatedAt` | `createdBy` / `updatedBy` | `isDeleted` / `deletedAt` / `deletedBy` |
| ------------------- | :---: | :-----------------------: | :-----------------------: | :-------------------------------------: |
| `Role`              |  Yes  |            Yes            |        Admin Only         |                   No                    |
| `User`              |  Yes  |            Yes            |       System / Self       |                   Yes                   |
| `UserSetting`       |  Yes  |            Yes            |           Self            |         No (Cascades with User)         |
| `Client`            |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `Project`           |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `KanbanColumn`      |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `Task`              |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `Label`             |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `File`              |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `Comment`           |  Yes  |            Yes            |            Yes            |                   Yes                   |
| `Notification`      |  Yes  |            Yes            |          System           |                   Yes                   |
| `ActivityLog`       |  Yes  |      Yes (Immutable)      |           Actor           |            No (Append-Only)             |
| `Session`           |  Yes  |            Yes            |           Self            |             No (TTL Purged)             |
| `PasswordReset`     |  Yes  |            Yes            |          System           |             No (TTL Purged)             |
| `EmailVerification` |  Yes  |            Yes            |          System           |             No (TTL Purged)             |

---

# 6. Naming Conventions

To guarantee consistency across MongoDB collections, Mongoose models, Zod validation schemas, and REST API payloads, ProjectOS enforces strict naming rules:

1. **Collections**: Plural `camelCase` (e.g., `userSettings`, `kanbanColumns`, `activityLogs`).
2. **Models & Interfaces**: Singular `PascalCase` (e.g., `UserSetting`, `KanbanColumn`, `ActivityLog`).
3. **Fields**: Singular `camelCase` (e.g., `firstName`, `assignedTo`, `lastLoginAt`).
4. **Reference Keys**: Singular target model name appended with `Id` or `Ids` for arrays (e.g., `projectId`, `userId`, `labelIds`).
5. **Boolean Fields**: Prefix with `is`, `has`, `can`, or `should` (e.g., `isActive`, `hasCompletedOnboarding`, `isDeleted`).
6. **Date & Time Fields**: Suffix with `At` or `On` (e.g., `createdAt`, `dueDate`, `lastLoginAt`, `completedAt`).
7. **No Abbreviations**: Use full descriptive terms (`description` not `desc`, `specification` not `spec`, `quantity` not `qty`).

---

# 7. Data Types

MongoDB native BSON types are chosen based on structural efficiency, indexing capability, and Mongoose ODM integration:

| Type       | Suitable Use Cases                                 | Unsuitable Use Cases                                | Rationale                                                                          |
| ---------- | -------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ObjectId` | Foreign keys, primary keys, user references        | Freeform strings, names, emails                     | 12-byte binary format optimized for index compression and fast B-tree comparisons. |
| `String`   | Text content, emails, tokens, titles               | Large binary blobs, dynamic arrays                  | Standard UTF-8 string encoding. Standardized validation regexes applied.           |
| `Boolean`  | Flags, switches, states (`isDeleted`, `isActive`)  | Multi-state variables                               | 1-byte storage footprint for binary logical toggles.                               |
| `Date`     | Timestamps (`createdAt`, `dueDate`)                | Formatted display strings                           | UTC 64-bit integer timestamp allowing range queries and native sorting.            |
| `Number`   | Counts, order positions (`position`), file sizes   | Currency without cents formatting                   | Double precision IEEE 754 float. Monetary values stored in integer cents.          |
| `Array`    | Bounded references (`labelIds`), tags              | Unbounded child entity lists                        | Excellent for small arrays. Anti-pattern when array size exceeds ~1,000 items.     |
| `Object`   | Embedded configuration (`UserSetting.preferences`) | Entities requiring independent filtering/pagination | Atomically retrieved with parent document. Reduces database roundtrips.            |

---

# 8. Relationship Overview

## 8.1 High-Level Entity Tree

```text
User
├── UserSetting (1:1)
├── Sessions (1:N)
├── PasswordResets (1:N)
├── EmailVerifications (1:N)
├── Clients (1:N)
├── Projects (1:N)
│   ├── KanbanColumns (1:N)
│   ├── Tasks (1:N)
│   │   ├── Comments (1:N)
│   │   └── Files (1:N embedded/referenced)
│   └── Files (1:N)
├── Notifications (1:N)
└── ActivityLogs (1:N as actor)
```

## 8.2 Cardinality Matrix

| Parent Model       | Child Model    | Cardinality | Link Strategy                            | CASCADE Delete Rule                    |
| ------------------ | -------------- | ----------- | ---------------------------------------- | -------------------------------------- |
| `Role`             | `User`         | 1:N         | `User.roleId` → `Role._id`               | Restrict (Cannot delete assigned role) |
| `User`             | `UserSetting`  | 1:1         | `UserSetting.userId` → `User._id`        | Soft Delete Cascade                    |
| `User`             | `Project`      | 1:N         | `Project.ownerId` → `User._id`           | Soft Delete Cascade                    |
| `User`             | `Client`       | 1:N         | `Client.ownerId` → `User._id`            | Soft Delete Cascade                    |
| `Project`          | `KanbanColumn` | 1:N         | `KanbanColumn.projectId` → `Project._id` | Soft Delete Cascade                    |
| `Project`          | `Task`         | 1:N         | `Task.projectId` → `Project._id`         | Soft Delete Cascade                    |
| `Task`             | `Comment`      | 1:N         | `Comment.taskId` → `Task._id`            | Soft Delete Cascade                    |
| `Task`             | `Label`        | M:N         | `Task.labelIds` → `Label._id[]`          | Nullify reference array                |
| `Project` / `Task` | `File`         | 1:N         | `File.projectId` / `File.taskId`         | Mark orphaned / Soft Delete            |

## 8.3 Reference Flow & Ownership Rules

> [!IMPORTANT]
> **Security Invariants & Data Isolation**:
>
> 1. **Tenant Isolation**: Every `Project`, `Client`, `Task`, `File`, and `KanbanColumn` MUST directly or transitively trace ownership back to a valid `ownerId` (`User`).
> 2. **Task Ownership Inheritance**: A `Task` inherits project ownership via `projectId`. A user cannot read or mutate a task unless they have read/write access to the parent `Project`.
> 3. **Comment Ownership Inheritance**: A `Comment` inherits task and project ownership via `taskId`.
> 4. **Immutability of Audit Logs**: `ActivityLog` documents can NEVER be modified or soft-deleted by any application role once created.
> 5. **Notification Recipient Isolation**: `Notification` documents belong to exactly one `recipientId` (`User`) and can never be read across user boundaries.

---

# 9. Model Dependency Order

When bootstrapping database seeds, initializing modules, or executing integration tests, entities MUST be instantiated according to their dependency chain:

```text
1. Role
   ↓
2. User
   ↓
3. UserSetting
   ↓
4. Client
   ↓
5. Project
   ↓
6. KanbanColumn
   ↓
7. Task
   ↓
8. Label
   ↓
9. File
   ↓
10. Comment
   ↓
11. Notification
   ↓
12. ActivityLog
   ↓
13. Session
   ↓
14. PasswordReset
   ↓
15. EmailVerification
```

---

# 10. Detailed Model Documentation

---

## 10.1 Role (`roles`)

### 10.1.1 Overview

Defines system-wide Role-Based Access Control (RBAC) privilege sets and authorization masks.

### 10.1.2 Responsibilities

- Maps user accounts to permission matrices (`admin`, `manager`, `member`, `guest`).
- Controls access to administrative APIs and organization settings.

### 10.1.3 Basic Information

| Field         | Type       | Required | Default        |
| ------------- | ---------- | -------- | -------------- |
| `_id`         | `ObjectId` | Yes      | Auto-generated |
| `name`        | `String`   | Yes      | N/A            |
| `slug`        | `String`   | Yes      | N/A            |
| `permissions` | `[String]` | Yes      | `[]`           |
| `description` | `String`   | No       | `""`           |
| `isSystem`    | `Boolean`  | Yes      | `false`        |
| `createdAt`   | `Date`     | Yes      | `Date.now`     |
| `updatedAt`   | `Date`     | Yes      | `Date.now`     |

### 10.1.4 Detailed Explanation

| Field         | Description                 | Why It Exists                                                      | Related Logic               |
| ------------- | --------------------------- | ------------------------------------------------------------------ | --------------------------- |
| `_id`         | Unique BSON primary key     | Standard entity identification                                     | Referenced by `User.roleId` |
| `name`        | Human-readable role label   | Displayed in UI settings (e.g. "Project Administrator")            | UI display                  |
| `slug`        | Immutable system slug       | Code-level authorization matching (e.g. `admin`, `member`)         | Auth middleware guards      |
| `permissions` | Array of permission strings | Fine-grained permission checks (`projects:create`, `users:delete`) | RBAC evaluate policy        |
| `description` | Summary of role scope       | Explains role privileges to organization admins                    | Role management UI          |
| `isSystem`    | System role flag            | Prevents deletion or modification of core built-in roles           | Admin controller guards     |

### 10.1.5 Relationships

- **Referenced By**: `User.roleId` (1:N).

### 10.1.6 Business Rules

- Built-in system roles (`isSystem: true`) cannot be deleted or renamed.
- Role slugs must be unique across the application.

### 10.1.7 Permissions

- **Create / Update / Delete**: System Administrator (`admin`) only.
- **Read**: All authenticated users.

### 10.1.8 Used By APIs

- `GET /api/v1/roles` (List system roles)
- `POST /api/v1/roles` (Create custom role)
- `PATCH /api/v1/roles/:id` (Update permission mask)

### 10.1.9 Indexes

| Index Fields | Type   | Purpose / Reason                                                    |
| ------------ | ------ | ------------------------------------------------------------------- |
| `slug`       | Unique | Enforces unique role identification during auth payload evaluation. |

### 10.1.10 Validation Rules

- `slug`: Lowercase alphanumeric with hyphens (`/^[a-z0-9-]+$/`).
- `name`: String length 2–50 characters.

### 10.1.11 Visual Lifecycle

```text
System Seed / Admin Creates Role ──► Assigned to Users ──► Permission Mask Updated ──► Read-Only Protected (if isSystem)
```

### 10.1.12 Typical Queries

```typescript
// Lookup role by slug during JWT validation
const role = await Role.findOne({ slug: "admin" }).lean();
```

### 10.1.13 Performance Notes & Estimated Scale

- **Expected Scale**: < 50 documents total.
- **Caching**: Cached indefinitely in server memory (Redis/Node-cache); database lookups rarely executed after startup.

### 10.1.14 Future Expansion

- **Likely Fields**: `inheritsFromRoleId: ObjectId` (Hierarchical permissions).
- **Likely Relationships**: Role-to-Team custom mappings.
- **Likely Indexes**: None needed beyond unique slug.

---

## 10.2 User (`users`)

### 10.2.1 Overview

Represents a user account, authentication profile, system identity, and security credentials.

### 10.2.2 Responsibilities

- Stores primary user identity, hashed credentials, and profile info.
- Manages security flags (`isActive`, `isEmailVerified`, `passwordChangedAt`).

### 10.2.3 Basic Information

| Field               | Type       | Required | Default               |
| ------------------- | ---------- | -------- | --------------------- |
| `_id`               | `ObjectId` | Yes      | Auto-generated        |
| `name`              | `String`   | Yes      | N/A                   |
| `email`             | `String`   | Yes      | N/A                   |
| `password`          | `String`   | Yes      | N/A                   |
| `roleId`            | `ObjectId` | Yes      | Standard User Role ID |
| `avatar`            | `Object`   | No       | `null`                |
| `bio`               | `String`   | No       | `""`                  |
| `isActive`          | `Boolean`  | Yes      | `true`                |
| `isEmailVerified`   | `Boolean`  | Yes      | `false`               |
| `lastLoginAt`       | `Date`     | No       | `null`                |
| `passwordChangedAt` | `Date`     | Yes      | `Date.now`            |
| `isDeleted`         | `Boolean`  | Yes      | `false`               |
| `createdAt`         | `Date`     | Yes      | `Date.now`            |
| `updatedAt`         | `Date`     | Yes      | `Date.now`            |

### 10.2.4 Detailed Explanation

| Field               | Description                       | Why It Exists                                          | Related Logic               |
| ------------------- | --------------------------------- | ------------------------------------------------------ | --------------------------- |
| `email`             | Standardized user email address   | Primary authentication identifier and contact          | Auth login, unique lookup   |
| `password`          | Argon2id / bcrypt password hash   | Secure authentication storage                          | Password validation service |
| `roleId`            | Foreign key referencing `Role`    | Determines permission capabilities                     | Auth guards                 |
| `avatar`            | Embedded Cloudinary media object  | User profile image representation                      | UI header & comment avatars |
| `isActive`          | Account status toggle             | Allows admins to suspend accounts without deletion     | Auth middleware check       |
| `isEmailVerified`   | Verification status flag          | Ensures valid email ownership before sensitive actions | Feature access check        |
| `passwordChangedAt` | Timestamp of last password change | Invalidates issued JWTs prior to this timestamp        | JWT verification guard      |

### 10.2.5 Relationships

- **References**: `Role` (`roleId`).
- **Referenced By**: `UserSetting`, `Project`, `Client`, `Task`, `Comment`, `Notification`, `ActivityLog`, `Session`.

### 10.2.6 Business Rules

- Emails must be lowercase and unique.
- Soft-deleted users (`isDeleted: true`) cannot authenticate.

### 10.2.7 Permissions

- **Create**: Public registration API.
- **Read**: Self or project collaborators.
- **Update**: Self (profile) or System Admin.
- **Delete**: System Admin or self account closure.

### 10.2.8 Used By APIs

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/profile`

### 10.2.9 Indexes

| Index Fields | Type   | Purpose / Reason                                            |
| ------------ | ------ | ----------------------------------------------------------- |
| `email`      | Unique | Prevents duplicate user accounts and optimizes auth lookup. |
| `roleId`     | Single | Optimizes admin queries filtering users by role.            |

### 10.2.10 Validation Rules

- `email`: Valid RFC 5322 regex format, normalized lowercase.
- `name`: 2 to 100 characters.

### 10.2.11 Visual Lifecycle

```text
Register ──► Email Verification ──► Active User ──► Profile Updates ──► Password Rotations ──► Soft Deletion
```

### 10.2.12 Typical Queries

```typescript
// Find active user by email during login
const user = await User.findOne({ email: normalizedEmail, isDeleted: false });
```

### 10.2.13 Performance Notes & Estimated Scale

- **Expected Scale**: 10,000+ users.
- **Population Cost**: Populate `roleId` selectively (`.select("name permissions")`).

### 10.2.14 Future Expansion

- **Likely Fields**: `twoFactorEnabled: Boolean`, `mfaSecret: String`.
- **Likely Relationships**: `organizationId: ObjectId`.
- **Likely Indexes**: `organizationId + isDeleted` compound index.

---

## 10.3 UserSetting (`userSettings`)

### 10.3.1 Overview

Stores non-critical personal configurations, theme settings, UI behavior, and notification preferences.

### 10.3.2 Responsibilities

- Decouples user UI configuration settings from core authentication identity.

### 10.3.3 Basic Information

| Field                | Type       | Required | Default                                      |
| -------------------- | ---------- | -------- | -------------------------------------------- |
| `_id`                | `ObjectId` | Yes      | Auto-generated                               |
| `userId`             | `ObjectId` | Yes      | N/A                                          |
| `theme`              | `String`   | Yes      | `"system"`                                   |
| `emailNotifications` | `Object`   | Yes      | `{ taskAssigned: true, commentAdded: true }` |
| `inAppNotifications` | `Object`   | Yes      | `{ taskAssigned: true, commentAdded: true }` |
| `timezone`           | `String`   | Yes      | `"UTC"`                                      |
| `createdAt`          | `Date`     | Yes      | `Date.now`                                   |
| `updatedAt`          | `Date`     | Yes      | `Date.now`                                   |

### 10.3.4 Detailed Explanation

| Field                | Description                    | Why It Exists                                       | Related Logic                  |
| -------------------- | ------------------------------ | --------------------------------------------------- | ------------------------------ |
| `userId`             | References parent `User`       | 1:1 relationship binding                            | User settings lookup           |
| `theme`              | UI visual theme preference     | Controls client display (`light`, `dark`, `system`) | Web app preference sync        |
| `emailNotifications` | Email dispatch preferences     | Controls email notification triggers                | Notification background worker |
| `timezone`           | Preferred IANA timezone string | Displays localized dates in UI                      | Date formatting utilities      |

### 10.3.5 Relationships

- **References**: `User` (`userId`).

### 10.3.6 Business Rules

- Exactly one `UserSetting` document per `User`. Created automatically on user registration via hook.

### 10.3.7 Permissions

- **Read / Update**: Account owner (`userId === currentUser._id`).

### 10.3.8 Used By APIs

- `GET /api/v1/users/settings`
- `PATCH /api/v1/users/settings`

### 10.3.9 Indexes

| Index Fields | Type   | Purpose / Reason                                          |
| ------------ | ------ | --------------------------------------------------------- |
| `userId`     | Unique | Guarantees strict 1:1 relation with User and fast lookup. |

### 10.3.10 Validation Rules

- `theme`: Enum `["light", "dark", "system"]`.
- `timezone`: Valid IANA timezone string identifier.

### 10.3.11 Visual Lifecycle

```text
Auto-created on User Register ──► Synced to Client App ──► Mutated in Settings UI ──► Purged on User Hard Delete
```

### 10.3.12 Typical Queries

```typescript
const settings = await UserSetting.findOne({ userId });
```

### 10.3.13 Performance Notes & Estimated Scale

- **Expected Scale**: 10,000+ documents (1:1 with User). Always fetched on app startup.

### 10.3.14 Future Expansion

- **Likely Fields**: `compactView: Boolean`, `defaultProjectId: ObjectId`.
- **Likely Relationships**: None.
- **Likely Indexes**: None needed beyond `userId`.

---

## 10.4 Client (`clients`)

### 10.4.1 Overview

Represents external client accounts, companies, or stakeholders associated with projects.

### 10.4.2 Responsibilities

- Stores client contact info, billing details, and ownership mapping.

### 10.4.3 Basic Information

| Field       | Type       | Required | Default        |
| ----------- | ---------- | -------- | -------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated |
| `ownerId`   | `ObjectId` | Yes      | N/A            |
| `name`      | `String`   | Yes      | N/A            |
| `company`   | `String`   | No       | `""`           |
| `email`     | `String`   | Yes      | N/A            |
| `phone`     | `String`   | No       | `""`           |
| `address`   | `String`   | No       | `""`           |
| `status`    | `String`   | Yes      | `"active"`     |
| `isDeleted` | `Boolean`  | Yes      | `false`        |
| `createdAt` | `Date`     | Yes      | `Date.now`     |
| `updatedAt` | `Date`     | Yes      | `Date.now`     |

### 10.4.4 Detailed Explanation

| Field     | Description                      | Why It Exists                           | Related Logic               |
| --------- | -------------------------------- | --------------------------------------- | --------------------------- |
| `ownerId` | Account owner referencing `User` | Tenant isolation rule                   | Client list scoping         |
| `name`    | Client primary contact name      | Human-readable identity                 | Client directory UI         |
| `company` | Client company name              | Business organization grouping          | Invoicing & project headers |
| `status`  | Operational status indicator     | Filters active vs lead/archived clients | Client list filtering       |

### 10.4.5 Relationships

- **References**: `User` (`ownerId`).
- **Referenced By**: `Project.clientId`.

### 10.4.6 Business Rules

- Clients belong to a user account. Cannot access projects directly in V1.

### 10.4.7 Permissions

- **All Actions**: Client owner (`ownerId === currentUser._id`).

### 10.4.8 Used By APIs

- `GET /api/v1/clients`
- `POST /api/v1/clients`
- `PATCH /api/v1/clients/:id`
- `DELETE /api/v1/clients/:id`

### 10.4.9 Indexes

| Index Fields       | Type     | Purpose / Reason                          |
| ------------------ | -------- | ----------------------------------------- |
| `ownerId + status` | Compound | Fast retrieval of user's active clients.  |
| `email`            | Single   | Quick lookup for existing client records. |

### 10.4.10 Validation Rules

- `email`: Standard email format.
- `status`: Enum `["lead", "active", "inactive", "archived"]`.

### 10.4.11 Visual Lifecycle

```text
Lead Created ──► Promoted to Active Client ──► Linked to Projects ──► Inactivated / Soft Deleted
```

### 10.4.12 Typical Queries

```typescript
const clients = await Client.find({
  ownerId: userId,
  status: "active",
  isDeleted: false,
});
```

### 10.4.13 Performance Notes & Estimated Scale

- **Expected Scale**: 50,000+ documents.

### 10.4.14 Future Expansion

- **Likely Fields**: `billingCurrency: String`, `vatNumber: String`.
- **Likely Relationships**: `Project` (1:N).

---

## 10.5 Project (`projects`)

### 10.5.1 Overview

The primary workspace container for tasks, Kanban columns, discussions, and project files.

### 10.5.2 Responsibilities

- Houses workspace configuration, member access lists, client linking, and progress state.

### 10.5.3 Basic Information

| Field         | Type         | Required | Default        |
| ------------- | ------------ | -------- | -------------- |
| `_id`         | `ObjectId`   | Yes      | Auto-generated |
| `ownerId`     | `ObjectId`   | Yes      | N/A            |
| `clientId`    | `ObjectId`   | No       | `null`         |
| `name`        | `String`     | Yes      | N/A            |
| `key`         | `String`     | Yes      | N/A            |
| `description` | `String`     | No       | `""`           |
| `status`      | `String`     | Yes      | `"planning"`   |
| `members`     | `[ObjectId]` | Yes      | `[ownerId]`    |
| `startDate`   | `Date`       | No       | `null`         |
| `endDate`     | `Date`       | No       | `null`         |
| `isDeleted`   | `Boolean`    | Yes      | `false`        |
| `createdAt`   | `Date`       | Yes      | `Date.now`     |
| `updatedAt`   | `Date`       | Yes      | `Date.now`     |

### 10.5.4 Detailed Explanation

| Field      | Description                                 | Why It Exists                                                      | Related Logic               |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| `ownerId`  | Project creator referencing `User`          | Ultimate project administrator                                     | Project authorization       |
| `clientId` | References external `Client`                | Associates project with billing client                             | Client detail view          |
| `name`     | Workspace title                             | Primary identifier                                                 | UI headers                  |
| `key`      | Unique uppercase short prefix (e.g. `PROJ`) | Generates task identifier codes (`PROJ-101`)                       | Task key generator service  |
| `status`   | Lifecycle status of project                 | Workflow filtering (`planning`, `active`, `completed`, `archived`) | Dashboard filters           |
| `members`  | Array of collaborator `User` IDs            | Grants project access to collaborators                             | Project authorization guard |

### 10.5.5 Relationships

- **References**: `User` (`ownerId`, `members`), `Client` (`clientId`).
- **Referenced By**: `KanbanColumn`, `Task`, `File`.

### 10.5.6 Business Rules

- `key` must be uppercase, 2-10 characters, and unique per owner account.
- Archived or deleted projects cannot accept new tasks.

### 10.5.7 Permissions

- **Owner**: Full administrative control.
- **Members**: Read/Write access to tasks and columns.

### 10.5.8 Used By APIs

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `PATCH /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`

### 10.5.9 Indexes

| Index Fields       | Type            | Purpose / Reason                                               |
| ------------------ | --------------- | -------------------------------------------------------------- |
| `ownerId + status` | Compound        | Fast query for user dashboard projects by status.              |
| `members`          | Single          | Allows efficient lookup of all projects a user is a member of. |
| `ownerId + key`    | Compound Unique | Prevents duplicate project keys for the same owner.            |

### 10.5.10 Validation Rules

- `key`: Uppercase regex `/^[A-Z0-9]{2,10}$/`.
- `status`: Enum `["planning", "active", "on_hold", "completed", "archived"]`.

### 10.5.11 Visual Lifecycle

```text
Project Created ──► System Columns Seeded ──► Active Execution ──► Completed ──► Archived ──► Soft Deleted
```

### 10.5.12 Typical Queries

```typescript
// Fetch active projects where user is owner or member
const userProjects = await Project.find({
  $or: [{ ownerId: userId }, { members: userId }],
  isDeleted: false,
}).sort({ updatedAt: -1 });
```

### 10.5.13 Performance Notes & Estimated Scale

- **Expected Scale**: 100,000+ documents.

### 10.5.14 Future Expansion

- **Likely Fields**: `budget: Number`, `category: String`.
- **Likely Relationships**: `organizationId: ObjectId`.
- **Likely Indexes**: `organizationId + status`.

---

## 10.6 KanbanColumn (`kanbanColumns`)

### 10.6.1 Overview

Defines board workflow columns for a project. Every project has three protected system columns (To Do, Review, Done). Users may create custom columns between the system columns.

### 10.6.2 Responsibilities

- Stores column display titles, color coding, workflow positions, and WIP (Work-In-Progress) limits.

### 10.6.3 Basic Information

| Field       | Type       | Required | Default         |
| ----------- | ---------- | -------- | --------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated  |
| `projectId` | `ObjectId` | Yes      | N/A             |
| `title`     | `String`   | Yes      | N/A             |
| `position`  | `Number`   | Yes      | `0`             |
| `color`     | `String`   | No       | `"#64748B"`     |
| `wipLimit`  | `Number`   | No       | `0` (Unlimited) |
| `isSystem`  | `Boolean`  | Yes      | `false`         |
| `isDeleted` | `Boolean`  | Yes      | `false`         |
| `createdAt` | `Date`     | Yes      | `Date.now`      |
| `updatedAt` | `Date`     | Yes      | `Date.now`      |

### 10.6.4 Detailed Explanation

| Field       | Description                 | Why It Exists                       | Related Logic                |
| ----------- | --------------------------- | ----------------------------------- | ---------------------------- |
| `projectId` | References parent `Project` | Binds column to workspace board     | Kanban board query           |
| `title`     | Column header title         | Display name on board               | Board UI                     |
| `position`  | Numerical display ordering  | Controls horizontal column sequence | Drag-and-drop reordering     |
| `wipLimit`  | Max allowed tasks in column | Prevents team bottlenecks           | Task move validation service |

### 10.6.5 Relationships

- **References**: `Project` (`projectId`).
- **Referenced By**: `Task.columnId`.

### 10.6.6 Business Rules

- Every project must have three protected system columns: To Do, Review, and Done. Users may create custom columns between these system columns.
- Columns with existing tasks cannot be hard deleted without migrating tasks.

### 10.6.7 Permissions

- **Project Members**: Read, Move tasks.
- **Project Owner**: Create, Edit, Reorder, Delete columns.

### 10.6.8 Used By APIs

- `GET /api/v1/projects/:projectId/columns`
- `POST /api/v1/projects/:projectId/columns`
- `PATCH /api/v1/columns/:id/reorder`

### 10.6.9 Indexes

| Index Fields           | Type     | Purpose / Reason                                            |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `projectId + position` | Compound | Fetches project board columns sorted instantly by position. |

### 10.6.10 Validation Rules

- `position`: Non-negative integer.
- `color`: Hex color regex `/^#([A-Fa-f0-9]{6})$/`.

### 10.6.11 Visual Lifecycle

```text
System Columns Seeded on Project Create ──► Custom Columns Created ──► Reordered by Owner ──► Tasks Transition Through ──► Soft Deleted
```

### 10.6.12 Typical Queries

```typescript
const columns = await KanbanColumn.find({ projectId, isDeleted: false }).sort({
  position: 1,
});
```

### 10.6.13 Performance Notes & Estimated Scale

- **Expected Scale**: ~4 to 8 columns per project (~500k documents).

### 10.6.14 Future Expansion

- **Likely Fields**: `autoArchiveDays: Number`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

## 10.7 Task (`tasks`)

### 10.7.1 Overview

The central work item unit representing bugs, features, stories, and action items.

### 10.7.2 Responsibilities

- Maintains task summary, execution status, assigned user, priority, due dates, and tag references.

### 10.7.3 Basic Information

| Field         | Type         | Required | Default        |
| ------------- | ------------ | -------- | -------------- |
| `_id`         | `ObjectId`   | Yes      | Auto-generated |
| `taskKey`     | `String`     | Yes      | N/A            |
| `projectId`   | `ObjectId`   | Yes      | N/A            |
| `columnId`    | `ObjectId`   | Yes      | N/A            |
| `title`       | `String`     | Yes      | N/A            |
| `description` | `String`     | No       | `""`           |
| `assigneeId`  | `ObjectId`   | No       | `null`         |
| `reporterId`  | `ObjectId`   | Yes      | N/A            |
| `priority`    | `String`     | Yes      | `"medium"`     |
| `status`      | `String`     | Yes      | `"todo"`       |
| `position`    | `Number`     | Yes      | `0`            |
| `labelIds`    | `[ObjectId]` | Yes      | `[]`           |
| `dueDate`     | `Date`       | No       | `null`         |
| `completedAt` | `Date`       | No       | `null`         |
| `isDeleted`   | `Boolean`    | Yes      | `false`        |
| `createdAt`   | `Date`       | Yes      | `Date.now`     |
| `updatedAt`   | `Date`       | Yes      | `Date.now`     |

### 10.7.4 Detailed Explanation

| Field         | Description                           | Why It Exists                          | Related Logic               |
| ------------- | ------------------------------------- | -------------------------------------- | --------------------------- |
| `taskKey`     | Formatted identifier (e.g. `PROJ-42`) | Human reference code for tickets       | Task search and URL routes  |
| `projectId`   | Parent `Project` reference            | Binds task to project context          | Authorization and filtering |
| `columnId`    | Current `KanbanColumn` reference      | Tracks task board column state         | Kanban view rendering       |
| `status`      | Task execution status                 | Independent from column workflow       | Dashboard filters           |
| `assigneeId`  | Assigned `User` reference             | Designates responsible engineer        | User task dashboard         |
| `labelIds`    | Array of referenced `Label` ObjectIds | Idiomatic M:N task categorization tags | Multi-tag filtering         |
| `position`    | Vertical ordering rank within column  | Persists custom drag-and-drop ordering | Board drag-and-drop         |
| `completedAt` | Completion timestamp                  | Tracks cycle time metrics              | Analytics calculation       |

### 10.7.5 Relationships

- **References**: `Project` (`projectId`), `KanbanColumn` (`columnId`), `User` (`assigneeId`, `reporterId`), `Label` (`labelIds`).
- **Referenced By**: `Comment`, `File`.

### 10.7.6 Business Rules

- Moving to the Done column automatically populates `completedAt`.
- `taskKey` must be unique per project.

### 10.7.7 Permissions

- **Project Members**: Create, Read, Update, Move, Comment.
- **Reporter / Assignee / Owner**: Delete, Reassign.

### 10.7.8 Used By APIs

- `GET /api/v1/projects/:projectId/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/move`

### 10.7.9 Indexes

| Index Fields                      | Type            | Purpose / Reason                                                     |
| --------------------------------- | --------------- | -------------------------------------------------------------------- |
| `projectId + columnId + position` | Compound        | Critical index for rendering Kanban column task lists in rank order. |
| `assigneeId + status`             | Compound        | Fast retrieval for "My Assigned Tasks" dashboard views.              |
| `projectId + taskKey`             | Compound Unique | Fast direct task resolution by ticket key.                           |
| `dueDate`                         | Single          | Background cron job lookup for overdue tasks.                        |
| `title`                           | Text            | Text search capabilities across task titles.                         |

### 10.7.10 Validation Rules

- `priority`: Enum `["low", "medium", "high", "urgent"]`.
- `status`: Enum `["backlog", "todo", "in_progress", "in_review", "done"]`.

### 10.7.11 Visual Lifecycle

```text
Task Created ──► Assigned ──► Progressed Through Board ──► Completed (completedAt Set) ──► Soft Deleted
```

### 10.7.12 Typical Queries

```typescript
// Fetch tasks for Kanban board rendering
const tasks = await Task.find({ projectId, isDeleted: false })
  .populate("assigneeId", "name avatar")
  .sort({ position: 1 });
```

### 10.7.13 Performance Notes & Estimated Scale

- **Expected Scale**: Millions of documents.
- **Optimization**: Use `.select("-description")` for Kanban board overview cards to minimize payload bandwidth.

### 10.7.14 Future Expansion

- **Likely Fields**: `estimatedHours: Number`, `loggedHours: Number`, `parentTaskId: ObjectId`.
- **Likely Relationships**: Subtasks (Self-reference `parentTaskId`).
- **Likely Indexes**: `projectId + parentTaskId`.

---

## 10.8 Label (`labels`)

### 10.8.1 Overview

Color-coded tags used to categorize tasks across projects.

### 10.8.2 Responsibilities

- Stores global or project-specific label titles and badge colors.

### 10.8.3 Basic Information

| Field       | Type       | Required | Default         |
| ----------- | ---------- | -------- | --------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated  |
| `projectId` | `ObjectId` | No       | `null` (Global) |
| `name`      | `String`   | Yes      | N/A             |
| `color`     | `String`   | Yes      | `"#3B82F6"`     |
| `isDeleted` | `Boolean`  | Yes      | `false`         |
| `createdAt` | `Date`     | Yes      | `Date.now`      |
| `updatedAt` | `Date`     | Yes      | `Date.now`      |

### 10.8.4 Detailed Explanation

| Field       | Description                              | Why It Exists                                              | Related Logic            |
| ----------- | ---------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| `projectId` | Optional `Project` reference             | If null, label is global system tag; else project specific | Label selection dropdown |
| `name`      | Tag text string (e.g. `Bug`, `Frontend`) | Categorization identifier                                  | Task filter chips        |
| `color`     | Hex code badge color                     | Visual indication in UI                                    | Tag component rendering  |

### 10.8.5 Relationships

- **References**: `Project` (`projectId`).
- **Referenced By**: `Task.labelIds`.

### 10.8.6 Business Rules

- Label names must be unique within the scope of a project.

### 10.8.7 Permissions

- **Read**: All project members.
- **Create / Manage**: Project members.

### 10.8.8 Used By APIs

- `GET /api/v1/projects/:projectId/labels`
- `POST /api/v1/labels`

### 10.8.9 Indexes

| Index Fields       | Type     | Purpose / Reason                                       |
| ------------------ | -------- | ------------------------------------------------------ |
| `projectId + name` | Compound | Fast lookup and uniqueness check within project scope. |

### 10.8.10 Validation Rules

- `color`: Valid Hex string (`/^#([A-Fa-f0-9]{6})$/`).

### 10.8.11 Visual Lifecycle

```text
Label Defined ──► Associated with Tasks via labelIds ──► Filtered in UI ──► Soft Deleted
```

### 10.8.12 Typical Queries

```typescript
const labels = await Label.find({
  $or: [{ projectId }, { projectId: null }],
  isDeleted: false,
});
```

### 10.8.13 Performance Notes & Estimated Scale

- **Expected Scale**: ~10,000 documents.

### 10.8.14 Future Expansion

- **Likely Fields**: `description: String`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

## 10.9 File (`files`)

### 10.9.1 Overview

Metadata repository for file attachments stored in Cloudinary.

### 10.9.2 Responsibilities

- Stores Cloudinary `publicId`, secure download URLs, file metadata, and parent links.

### 10.9.3 Basic Information

| Field        | Type       | Required | Default        |
| ------------ | ---------- | -------- | -------------- |
| `_id`        | `ObjectId` | Yes      | Auto-generated |
| `publicId`   | `String`   | Yes      | N/A            |
| `secureUrl`  | `String`   | Yes      | N/A            |
| `fileName`   | `String`   | Yes      | N/A            |
| `fileType`   | `String`   | Yes      | N/A            |
| `fileSize`   | `Number`   | Yes      | N/A            |
| `projectId`  | `ObjectId` | Yes      | N/A            |
| `taskId`     | `ObjectId` | No       | `null`         |
| `uploadedBy` | `ObjectId` | Yes      | N/A            |
| `isDeleted`  | `Boolean`  | Yes      | `false`        |
| `createdAt`  | `Date`     | Yes      | `Date.now`     |
| `updatedAt`  | `Date`     | Yes      | `Date.now`     |

### 10.9.4 Detailed Explanation

| Field       | Description                      | Why It Exists                               | Related Logic                   |
| ----------- | -------------------------------- | ------------------------------------------- | ------------------------------- |
| `publicId`  | Cloudinary asset identifier      | Allows external asset management & deletion | Cloudinary SDK deletion API     |
| `secureUrl` | HTTPS download URL               | Provides CDN file delivery link             | UI attachment links             |
| `fileSize`  | File size in bytes               | Audit metrics and storage usage caps        | Usage storage quota calculation |
| `taskId`    | Optional parent `Task` reference | Associates file with specific task ticket   | Task attachment tab             |

### 10.9.5 Relationships

- **References**: `Project` (`projectId`), `Task` (`taskId`), `User` (`uploadedBy`).

### 10.9.6 Business Rules

- Soft deleting a `File` document schedules background Cloudinary asset removal.

### 10.9.7 Permissions

- **Read**: Project members.
- **Upload / Delete**: File uploader or Project Owner.

### 10.9.8 Used By APIs

- `POST /api/v1/files/upload`
- `GET /api/v1/tasks/:taskId/files`
- `DELETE /api/v1/files/:id`

### 10.9.9 Indexes

| Index Fields | Type   | Purpose / Reason                                      |
| ------------ | ------ | ----------------------------------------------------- |
| `taskId`     | Single | Fast retrieval of attachments associated with a task. |
| `projectId`  | Single | Aggregates all project storage assets.                |

### 10.9.10 Validation Rules

- `fileSize`: Maximum 25MB per asset limit.

### 10.9.11 Visual Lifecycle

```text
Upload to Cloudinary ──► Metadata Saved to DB ──► Attached to Task ──► Purged on Delete
```

### 10.9.12 Typical Queries

```typescript
const files = await File.find({ taskId, isDeleted: false });
```

### 10.9.13 Performance Notes & Estimated Scale

- **Expected Scale**: Millions of records. Lightweight metadata keeps MongoDB size minimal.

### 10.9.14 Future Expansion

- **Likely Fields**: `thumbnailUrl: String`, `dimensions: Object`.
- **Likely Relationships**: `commentId: ObjectId`.
- **Likely Indexes**: None.

---

## 10.10 Comment (`comments`)

### 10.10.1 Overview

Discussion thread entry posted by users under a specific task.

### 10.10.2 Responsibilities

- Stores rich text comment content, author attribution, and edit history flags.

### 10.10.3 Basic Information

| Field       | Type       | Required | Default        |
| ----------- | ---------- | -------- | -------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated |
| `taskId`    | `ObjectId` | Yes      | N/A            |
| `authorId`  | `ObjectId` | Yes      | N/A            |
| `content`   | `String`   | Yes      | N/A            |
| `isEdited`  | `Boolean`  | Yes      | `false`        |
| `isDeleted` | `Boolean`  | Yes      | `false`        |
| `createdAt` | `Date`     | Yes      | `Date.now`     |
| `updatedAt` | `Date`     | Yes      | `Date.now`     |

### 10.10.4 Detailed Explanation

| Field      | Description                       | Why It Exists                                   | Related Logic              |
| ---------- | --------------------------------- | ----------------------------------------------- | -------------------------- |
| `taskId`   | References parent `Task`          | Binds comment to discussion thread              | Task activity stream       |
| `authorId` | References comment creator `User` | Attribution identity                            | Comment UI avatar and name |
| `content`  | Markdown comment text             | Conversation message body                       | Task discussion panel      |
| `isEdited` | Edit history indicator flag       | Shows "(edited)" badge in UI if content changed | Update comment service     |

### 10.10.5 Relationships

- **References**: `Task` (`taskId`), `User` (`authorId`).

### 10.10.6 Business Rules

- Users can edit/delete only their own comments unless they hold Project Owner privileges.

### 10.10.7 Permissions

- **Create / Read**: Project members.
- **Update / Delete**: Comment Author or Project Owner.

### 10.10.8 Used By APIs

- `GET /api/v1/tasks/:taskId/comments`
- `POST /api/v1/tasks/:taskId/comments`
- `PATCH /api/v1/comments/:id`
- `DELETE /api/v1/comments/:id`

### 10.10.9 Indexes

| Index Fields         | Type     | Purpose / Reason                                       |
| -------------------- | -------- | ------------------------------------------------------ |
| `taskId + createdAt` | Compound | Retrieves task comment thread ordered chronologically. |

### 10.10.10 Validation Rules

- `content`: Non-empty string, maximum 5,000 characters.

### 10.10.11 Visual Lifecycle

```text
Comment Posted ──► Notifications Triggered ──► Edited (isEdited=true) ──► Soft Deleted
```

### 10.10.12 Typical Queries

```typescript
const comments = await Comment.find({ taskId, isDeleted: false })
  .populate("authorId", "name avatar")
  .sort({ createdAt: 1 });
```

### 10.10.13 Performance Notes & Estimated Scale

- **Expected Scale**: Millions of documents. Support cursor pagination for long threads.

### 10.10.14 Future Expansion

- **Likely Fields**: `reactions: Object`, `mentionedUserIds: [ObjectId]`.
- **Likely Relationships**: Self reference `parentCommentId` for nested replies.
- **Likely Indexes**: `taskId + parentCommentId`.

---

## 10.11 Notification (`notifications`)

### 10.11.1 Overview

In-app notification message delivered to a specific recipient user.

### 10.11.2 Responsibilities

- Tracks alert type, title, link target, and read/unread status.

### 10.11.3 Basic Information

| Field         | Type       | Required | Default         |
| ------------- | ---------- | -------- | --------------- |
| `_id`         | `ObjectId` | Yes      | Auto-generated  |
| `recipientId` | `ObjectId` | Yes      | N/A             |
| `senderId`    | `ObjectId` | No       | `null` (System) |
| `type`        | `String`   | Yes      | N/A             |
| `title`       | `String`   | Yes      | N/A             |
| `message`     | `String`   | Yes      | N/A             |
| `linkUrl`     | `String`   | No       | `""`            |
| `isRead`      | `Boolean`  | Yes      | `false`         |
| `readAt`      | `Date`     | No       | `null`          |
| `createdAt`   | `Date`     | Yes      | `Date.now`      |

### 10.11.4 Detailed Explanation

| Field         | Description                                      | Why It Exists                            | Related Logic              |
| ------------- | ------------------------------------------------ | ---------------------------------------- | -------------------------- |
| `recipientId` | Targeted `User` foreign key                      | Strict recipient security boundary       | User bell icon badge query |
| `type`        | Category slug (`task_assigned`, `comment_added`) | Renders notification category icon       | Notification center filter |
| `linkUrl`     | Relative web app navigation link                 | Enables direct click-through action      | Notification click handler |
| `isRead`      | Unread badge indicator                           | Toggles red dot counter in UI navigation | Mark-as-read service       |

### 10.11.5 Relationships

- **References**: `User` (`recipientId`, `senderId`).

### 10.11.6 Business Rules

- Notifications are private to the recipient. Users cannot read notifications of other users.

### 10.11.7 Permissions

- **Read / Mark as Read**: Recipient (`recipientId === currentUser._id`).

### 10.11.8 Used By APIs

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`

### 10.11.9 Indexes

| Index Fields           | Type      | Purpose / Reason                                       |
| ---------------------- | --------- | ------------------------------------------------------ |
| `recipientId + isRead` | Compound  | Ultra-fast fetch for unread counter and unread list.   |
| `createdAt`            | TTL Index | Automatically purges notifications older than 90 days. |

### 10.11.10 Validation Rules

- `type`: Enum `["task_assigned", "task_updated", "comment_added", "project_invite", "system_alert"]`.

### 10.11.11 Visual Lifecycle

```text
System Event ──► Notification Created (isRead=false) ──► Unread Badge Increment ──► User Reads (isRead=true) ──► Expired TTL Purge
```

### 10.11.12 Typical Queries

```typescript
// Unread badge count
const unreadCount = await Notification.countDocuments({
  recipientId: userId,
  isRead: false,
});
```

### 10.11.13 Performance Notes & Estimated Scale

- **Expected Scale**: Millions of records. Controlled by 90-day TTL index.

### 10.11.14 Future Expansion

- **Likely Fields**: `actionData: Object`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

## 10.12 ActivityLog (`activityLogs`)

### 10.12.1 Overview

Immutable background audit trail documenting all critical system mutations and security events.

### 10.12.2 Responsibilities

- Records actor identity, action type, entity references, and IP metadata.

### 10.12.3 Basic Information

| Field        | Type       | Required | Default        |
| ------------ | ---------- | -------- | -------------- |
| `_id`        | `ObjectId` | Yes      | Auto-generated |
| `actorId`    | `ObjectId` | Yes      | N/A            |
| `action`     | `String`   | Yes      | N/A            |
| `entityType` | `String`   | Yes      | N/A            |
| `entityId`   | `ObjectId` | Yes      | N/A            |
| `projectId`  | `ObjectId` | No       | `null`         |
| `metadata`   | `Object`   | No       | `{}`           |
| `ipAddress`  | `String`   | No       | `""`           |
| `createdAt`  | `Date`     | Yes      | `Date.now`     |

### 10.12.4 Detailed Explanation

| Field        | Description                                    | Why It Exists                                  | Related Logic         |
| ------------ | ---------------------------------------------- | ---------------------------------------------- | --------------------- |
| `actorId`    | Performing `User` reference                    | Identifies who performed the action            | Audit log view        |
| `action`     | Event action type string (e.g. `task.created`) | Defines exact operation                        | Audit filter          |
| `entityType` | Entity collection type (`Task`, `Project`)     | Allows polymorphic entity reference resolution | Audit trail rendering |
| `metadata`   | Flexible key-value snapshot of changes         | Stores payload state before and after change   | Activity diff modal   |

### 10.12.5 Relationships

- **References**: `User` (`actorId`), `Project` (`projectId`). Polymorphic reference to `entityId`.

### 10.12.6 Business Rules

- Append-only collection. No updates or deletions allowed.

### 10.12.7 Permissions

- **Read**: Project members (project audit stream) or System Admin (system audit log).

### 10.12.8 Used By APIs

- `GET /api/v1/projects/:projectId/activity`
- `GET /api/v1/admin/activity-logs`

### 10.12.9 Indexes

| Index Fields            | Type     | Purpose / Reason                                                 |
| ----------------------- | -------- | ---------------------------------------------------------------- |
| `projectId + createdAt` | Compound | Fast retrieval of chronological activity streams per project.    |
| `entityType + entityId` | Compound | Finds all historical audit entries for a specific entity ticket. |

### 10.12.10 Validation Rules

- Immutability enforced via Mongoose pre-update hooks throwing errors.

### 10.12.11 Visual Lifecycle

```text
System Action Occurs ──► Activity Log Appended ──► Retained Immutably ──► Archived to Cold Storage
```

### 10.12.12 Typical Queries

```typescript
const stream = await ActivityLog.find({ projectId })
  .sort({ createdAt: -1 })
  .limit(20)
  .populate("actorId", "name avatar");
```

### 10.12.13 Performance Notes & Estimated Scale

- **Expected Scale**: Tens of Millions (Massive growth). Highly candidate for collection capping or time-series sharding.

### 10.12.14 Future Expansion

- **Likely Fields**: `userAgent: String`.
- **Likely Relationships**: `organizationId: ObjectId`.
- **Likely Indexes**: `actorId + createdAt`.

---

## 10.13 Session (`sessions`)

### 10.13.1 Overview

Persists active user refresh token sessions and device login state.

### 10.13.2 Responsibilities

- Validates JWT refresh token rotation and allows remote session revocation.

### 10.13.3 Basic Information

| Field          | Type       | Required | Default        |
| -------------- | ---------- | -------- | -------------- |
| `_id`          | `ObjectId` | Yes      | Auto-generated |
| `userId`       | `ObjectId` | Yes      | N/A            |
| `refreshToken` | `String`   | Yes      | N/A            |
| `ipAddress`    | `String`   | No       | `""`           |
| `userAgent`    | `String`   | No       | `""`           |
| `isRevoked`    | `Boolean`  | Yes      | `false`        |
| `expiresAt`    | `Date`     | Yes      | N/A            |
| `createdAt`    | `Date`     | Yes      | `Date.now`     |
| `updatedAt`    | `Date`     | Yes      | `Date.now`     |

### 10.13.4 Detailed Explanation

| Field          | Description                 | Why It Exists                        | Related Logic         |
| -------------- | --------------------------- | ------------------------------------ | --------------------- |
| `userId`       | Owning `User` reference     | Binds session to account identity    | Session management UI |
| `refreshToken` | Hashed refresh token string | Validates token refresh endpoint     | Auth refresh service  |
| `isRevoked`    | Revocation toggle           | Allows instant logout across devices | Session guard check   |
| `expiresAt`    | Expiration date             | TTL cleanup threshold                | MongoDB auto-purge    |

### 10.13.5 Relationships

- **References**: `User` (`userId`).

### 10.13.6 Business Rules

- Revoked or expired sessions cannot issue new access tokens.

### 10.13.7 Permissions

- **Read / Revoke**: Account owner or System Admin.

### 10.13.8 Used By APIs

- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/sessions`

### 10.13.9 Indexes

| Index Fields   | Type      | Purpose / Reason                                 |
| -------------- | --------- | ------------------------------------------------ |
| `refreshToken` | Unique    | Fast lookup during refresh requests.             |
| `expiresAt`    | TTL Index | Automatically deletes expired session documents. |

### 10.13.10 Validation Rules

- `refreshToken`: Cryptographically secure random hash.

### 10.13.11 Visual Lifecycle

```text
User Logins ──► Session Created ──► Tokens Refreshed Periodically ──► User Logouts / Revokes ──► Expired TTL Purge
```

### 10.13.12 Typical Queries

```typescript
const session = await Session.findOne({ refreshToken, isRevoked: false });
```

### 10.13.13 Performance Notes & Estimated Scale

- **Expected Scale**: Dynamic ephemeral size (10k-50k active sessions).

### 10.13.14 Future Expansion

- **Likely Fields**: `deviceType: String`, `location: String`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

## 10.14 PasswordReset (`passwordResets`)

### 10.14.1 Overview

Temporary single-use token collection for handling secure password resets.

### 10.14.2 Responsibilities

- Verifies password reset requests and enforces expiration deadlines.

### 10.14.3 Basic Information

| Field       | Type       | Required | Default        |
| ----------- | ---------- | -------- | -------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated |
| `userId`    | `ObjectId` | Yes      | N/A            |
| `token`     | `String`   | Yes      | N/A            |
| `isUsed`    | `Boolean`  | Yes      | `false`        |
| `expiresAt` | `Date`     | Yes      | N/A            |
| `createdAt` | `Date`     | Yes      | `Date.now`     |

### 10.14.4 Detailed Explanation

| Field       | Description              | Why It Exists                        | Related Logic               |
| ----------- | ------------------------ | ------------------------------------ | --------------------------- |
| `token`     | Hashed token string      | Sent via email for verification link | Password reset verification |
| `isUsed`    | Single-use flag          | Prevents token replay attacks        | Password reset consume      |
| `expiresAt` | TTL Expiration timestamp | Enforces 15-minute token lifetime    | Security expiration         |

### 10.14.5 Relationships

- **References**: `User` (`userId`).

### 10.14.6 Business Rules

- Token expires after 15 minutes or upon first use.

### 10.14.7 Permissions

- System internal access.

### 10.14.8 Used By APIs

- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### 10.14.9 Indexes

| Index Fields | Type      | Purpose / Reason                             |
| ------------ | --------- | -------------------------------------------- |
| `token`      | Unique    | Fast lookup and collision avoidance.         |
| `expiresAt`  | TTL Index | Deletes expired reset records automatically. |

### 10.14.10 Validation Rules

- Single-use validation in controller transaction.

### 10.14.11 Visual Lifecycle

```text
Forgot Password Requested ──► Token Emailed ──► Password Reset Submitted ──► Token Marked Used ──► Auto-purged by TTL
```

### 10.14.12 Typical Queries

```typescript
const resetDoc = await PasswordReset.findOne({
  token,
  isUsed: false,
  expiresAt: { $gt: new Date() },
});
```

### 10.14.13 Performance Notes & Estimated Scale

- **Expected Scale**: Small ephemeral (<1,000 documents at any given time).

### 10.14.14 Future Expansion

- **Likely Fields**: `requestIp: String`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

## 10.15 EmailVerification (`emailVerifications`)

### 10.15.1 Overview

Manages single-use email verification tokens issued during registration or email address updates.

### 10.15.2 Responsibilities

- Validates user email address ownership before activating account privileges.

### 10.15.3 Basic Information

| Field       | Type       | Required | Default        |
| ----------- | ---------- | -------- | -------------- |
| `_id`       | `ObjectId` | Yes      | Auto-generated |
| `userId`    | `ObjectId` | Yes      | N/A            |
| `token`     | `String`   | Yes      | N/A            |
| `email`     | `String`   | Yes      | N/A            |
| `expiresAt` | `Date`     | Yes      | N/A            |
| `createdAt` | `Date`     | Yes      | `Date.now`     |

### 10.15.4 Detailed Explanation

| Field   | Description                    | Why It Exists                                | Related Logic           |
| ------- | ------------------------------ | -------------------------------------------- | ----------------------- |
| `email` | Target email address to verify | Supports verification of new email on change | Verification controller |
| `token` | Random verification hash       | Sent via link to user inbox                  | Link validation service |

### 10.15.5 Relationships

- **References**: `User` (`userId`).

### 10.15.6 Business Rules

- Expire after 24 hours. Mutates `User.isEmailVerified` to `true` upon success.

### 10.15.7 Permissions

- System internal access.

### 10.15.8 Used By APIs

- `POST /api/v1/auth/resend-verification`
- `GET /api/v1/auth/verify-email`

### 10.15.9 Indexes

| Index Fields | Type      | Purpose / Reason                                   |
| ------------ | --------- | -------------------------------------------------- |
| `token`      | Unique    | Direct token verification lookups.                 |
| `expiresAt`  | TTL Index | Deletes expired verification tokens automatically. |

### 10.15.10 Validation Rules

- 24-hour expiration threshold.

### 10.15.11 Visual Lifecycle

```text
Issued on Register ──► Verification Link Clicked ──► User.isEmailVerified Set True ──► Token Deleted
```

### 10.15.12 Typical Queries

```typescript
const verification = await EmailVerification.findOne({
  token,
  expiresAt: { $gt: new Date() },
});
```

### 10.15.13 Performance Notes & Estimated Scale

- **Expected Scale**: Small ephemeral footprint.

### 10.15.14 Future Expansion

- **Likely Fields**: `attempts: Number`.
- **Likely Relationships**: None.
- **Likely Indexes**: None.

---

# 11. Query Patterns

The ProjectOS backend implements five primary query access patterns that drive UI performance:

## 11.1 Pattern 1: User App Bootstrap & Auth Context

```text
1. Fetch User by ID (from JWT Payload)
2. Fetch UserSetting by userId
3. Fetch Unread Notifications Count by recipientId
```

- **Optimized Indexes**: `User._id`, `UserSetting.userId`, `Notification.recipientId + isRead`.

## 11.2 Pattern 2: Project Workspace Dashboard

```text
1. Fetch Projects where ownerId == userId OR members CONTAINS userId
2. Sort by updatedAt DESC
3. Limit 20 (Paginated)
```

- **Optimized Indexes**: `Project.ownerId + status`, `Project.members`.

## 11.3 Pattern 3: Interactive Kanban Board Rendering

```text
1. Fetch KanbanColumns for projectId sorted by position ASC
2. Fetch Tasks for projectId where isDeleted == false
3. Populate Task assignees (name, avatar)
```

- **Optimized Indexes**: `KanbanColumn.projectId + position`, `Task.projectId + columnId + position`.

## 11.4 Pattern 4: Task Detail & Discussion View

```text
1. Fetch Task by projectId + taskKey
2. Fetch Files for taskId
3. Fetch Comments for taskId sorted by createdAt ASC with author profile
```

- **Optimized Indexes**: `Task.projectId + taskKey`, `File.taskId`, `Comment.taskId + createdAt`.

## 11.5 Pattern 5: User Activity Stream

```text
1. Fetch ActivityLogs for projectId sorted by createdAt DESC
2. Limit 50 (Cursor paginated)
```

- **Optimized Indexes**: `ActivityLog.projectId + createdAt`.

---

# 12. File Storage Strategy

ProjectOS delegates binary file content storage to **Cloudinary CDN**, maintaining only lightweight document metadata inside MongoDB (`files` collection).

```text
    ┌──────────┐              ┌──────────────┐              ┌──────────────┐
    │          │ 1. Direct    │              │              │              │
    │  Client  ├─────────────►│  Cloudinary  │              │   MongoDB    │
    │  Browser │              │  CDN Media   │              │  Database    │
    │          │              │   Storage    │              │              │
    │          │ 2. Save Meta │              │              │              │
    │          ├──────────────┼──────────────┼─────────────►│ Stores:      │
    │          │              │              │              │ • publicId   │
    │          │              │              │              │ • secureUrl  │
    │          │              │              │              │ • fileSize   │
    │          │              │              │              │ • uploadedBy │
    └──────────┘              └──────────────┘              └──────────────┘
```

### Benefits:

- Keeps MongoDB document sizes small and memory footprints minimal.
- Allows Cloudinary to perform automatic image compression, thumbnail generation, and global CDN caching.
- Eliminates database backup overhead associated with storing binary BLOBs.

---

# 13. Embedding vs. Referencing Decision Matrix

| Data Subject   | Design Decision                          | Rationale & Architectural Rule                                                      |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| User Settings  | Embedded in `userSettings`               | 1:1 relationship, bounded size, accessed together.                                  |
| User Avatar    | Embedded Object in `User`                | Small, fixed-size structure (`publicId`, `secureUrl`).                              |
| Task Labels    | Array of ObjectIds in `Task`             | Small array (<10 items), fast inline lookup without SQL join collection.            |
| Kanban Columns | Independent Collection (`kanbanColumns`) | Requires individual drag-and-drop position sorting and WIP limits.                  |
| Tasks          | Independent Collection (`tasks`)         | Unbound collection (thousands per project), complex filtering, sorting, pagination. |
| Comments       | Independent Collection (`comments`)      | Unbound growth, cursor-paginated thread loading.                                    |
| Activity Logs  | Independent Collection (`activityLogs`)  | Massive append-only audit stream. Must not bloat project/task documents.            |

---

# 14. Collection Design Principles

1. **Unbounded Array Protection**: Never store arrays of child ObjectIds inside parent documents if the child count can grow without bound (e.g., Do NOT store `taskIds: []` on `Project`).
2. **16MB Document Limit Safeguard**: Structure embedded objects to ensure no single MongoDB document ever exceeds 2MB (well below MongoDB's 16MB hard limit).
3. **Immutable Auditing**: Audit trails (`activityLogs`) are strictly append-only.
4. **Denormalization Guardrails**: Store normalized `ObjectId` references by default. Denormalize scalar values (such as `taskKey` or `author.name`) only when rendering performance requires eliminating excessive `$lookup` aggregation joins.

---

# 15. Global Indexing Strategy

1. **Single-Field Unique Indexes**: Applied to natural key strings (`users.email`, `roles.slug`, `sessions.refreshToken`).
2. **Compound Filter + Sort Indexes**: Multi-field indexes follow the **ESR Rule** (Equality, Sort, Range):
   - `Task`: `{ projectId: 1, columnId: 1, position: 1 }`
   - `Comment`: `{ taskId: 1, createdAt: 1 }`
3. **Sparse & Partial Indexes**: Applied to optional unique fields to avoid index errors on null values:
   ```typescript
   // Index only non-deleted tasks
   TaskSchema.index(
     { projectId: 1, taskKey: 1 },
     { unique: true, partialFilterExpression: { isDeleted: false } },
   );
   ```
4. **Time-To-Live (TTL) Indexes**: Managed by MongoDB background threads for auto-purging ephemeral documents:
   - `sessions.expiresAt`
   - `notifications.createdAt` (90-day retention)
   - `passwordResets.expiresAt`
   - `emailVerifications.expiresAt`

---

# 16. Performance Considerations

- **Lean Queries**: Use `.lean()` on read-only queries (e.g., API lists) to bypass Mongoose hydration overhead, yielding 3x-5x faster query performance and reduced CPU memory.
- **Field Projection**: Use `.select("name email avatar")` to retrieve only required document fields.
- **Cursor-Based Pagination**: Avoid `.skip(1000).limit(20)` on large collections (`tasks`, `activityLogs`). Use cursor-based range filtering on indexed fields:
  ```typescript
  ActivityLog.find({ projectId, createdAt: { $lt: lastSeenCreatedAt } })
    .sort({ createdAt: -1 })
    .limit(20);
  ```
- **Population Cost Control**: Limit nested `.populate()` depth to 1 level maximum.

---

# 17. Data Integrity & Constraints

1. **Application-Level Referential Integrity**: Foreign keys are enforced in Mongoose service handlers and Zod validation layers.
2. **Cascade Soft-Deletion Rules**:
   - Soft deleting a `Project` triggers asynchronous background soft deletion of its child `KanbanColumns` and `Tasks`.
   - Soft deleting a `Task` soft deletes its child `Comments` and `Files`.
3. **Orphan Cleanup Workers**: Scheduled background cron jobs detect and purge orphaned media files from Cloudinary when parent entities are deleted.

---

# 18. Transactions & Multi-Document Operations

ProjectOS utilizes **MongoDB Multi-Document ACID Transactions** (`ClientSession`) for operations spanning multiple collections:

### Transaction Scenarios:

1. **User Registration**:
   - Save `User` document.
   - Save `UserSetting` document.
   - Issue `EmailVerification` token.
   - Commit transaction; rollback all if any step fails.
2. **Project Hard Deletion**:
   - Delete `Project`.
   - Delete `KanbanColumn` documents.
   - Delete `Task` documents.
   - Commit transaction.

```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  const user = await User.create([userData], { session });
  await UserSetting.create([{ userId: user[0]._id }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

# 19. Scaling Strategy

1. **Read/Write Splitting**: Deploy MongoDB Atlas Replica Sets. Route read-heavy dashboard queries to Secondary nodes (`readPreference: 'secondaryPreferred'`) while executing writes on the Primary node.
2. **Sharding Key Selection**: For future horizontal cluster expansion, collections will be sharded using compound tenant keys:
   - `tasks` sharded by `{ projectId: "hashed" }`
   - `activityLogs` sharded by `{ projectId: "hashed", createdAt: 1 }`
3. **Redis Caching Tier**: Cache static entities (`roles`, `userSettings`, active `User` profiles) in Redis with 15-minute TTL to relieve database read pressure.

---

# 20. Schema Evolution & Migration Guidelines

To evolve the production database schema without downtime or breaking changes:

1. **Non-Breaking Changes (Safe)**:
   - Adding a new optional field with a default value.
   - Adding a new index.
   - Adding a new collection.
2. **Breaking Changes (Requires Migration Script)**:
   - Renaming an existing field.
   - Changing a field data type (e.g. String to ObjectId).
   - Moving embedded data to a separate collection.
3. **Migration Workflow**:
   - Step 1: Deploy code supporting BOTH old and new schema fields.
   - Step 2: Run asynchronous background migration script using bulk write operations (`bulkWrite()`).
   - Step 3: Deprecate and remove support for the old schema field in a subsequent release.

---

# 21. Future Database Expansion (V2+ Roadmap)

- **Organizations Collection (`organizations`)**: Multi-tenant enterprise account container encapsulating multiple projects and users under shared billing.
- **Team Workspaces (`teams`)**: Sub-groupings of users within an organization for department-level RBAC.
- **Time Tracking Collection (`timeEntries`)**: Granular time logs attached to tasks with hourly billing rates.
- **Custom Task Fields (`customFields`)**: Schema-less dynamic key-value metadata arrays on tasks.
- **Webhooks & Integrations (`webhooks`)**: Event subscriptions for external system integrations (Slack, GitHub, Jira).

---

# 22. Complete ASCII Entity-Relationship (ER) Diagram

```text
========================================================================================================
                                     PROJECTOS DATABASE ER DIAGRAM
========================================================================================================

 ┌────────────────────────────────┐                 ┌────────────────────────────────┐
 │ Role                           │                 │ User                           │
 ├────────────────────────────────┤                 ├────────────────────────────────┤
 │ _id : ObjectId        [PK]     │1               N│ _id : ObjectId        [PK]     │
 │ name : String                  ├────────────────◄│ roleId : ObjectId     [FK]     │
 │ slug : String         [UQ]     │                 │ email : String        [UQ]     │
 │ permissions : String[]         │                 │ password : String              │
 │ isSystem : Boolean             │                 │ name : String                  │
 └────────────────────────────────┘                 │ isActive : Boolean             │
                                                    │ isEmailVerified : Boolean      │
                                                    │ isDeleted : Boolean            │
                                                    └───────────────┬────────────────┘
                                                                    │
         ┌──────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┐
         │ 1                                                        │ 1                                                        │ 1
         ▼ 1                                                        ▼ N                                                        ▼ N
 ┌────────────────────────────────┐                         ┌────────────────────────────────┐                         ┌────────────────────────────────┐
 │ UserSetting                    │                         │ Client                         │                         │ Session                        │
 ├────────────────────────────────┤                         ├────────────────────────────────┤                         ├────────────────────────────────┤
 │ _id : ObjectId        [PK]     │                         │ _id : ObjectId        [PK]     │                         │ _id : ObjectId        [PK]     │
 │ userId : ObjectId     [FK, UQ] │                         │ ownerId : ObjectId    [FK]     │                         │ userId : ObjectId     [FK]     │
 │ theme : String                 │                         │ name : String                  │                         │ refreshToken : String [UQ]     │
 │ timezone : String              │                         │ company : String               │                         │ isRevoked : Boolean            │
 └────────────────────────────────┘                         │ email : String                 │                         │ expiresAt : Date      [TTL]    │
                                                            │ isDeleted : Boolean            │                         └────────────────────────────────┘
                                                            └───────────────┬────────────────┘
                                                                            │ 1
                                                                            ▼ N
 ┌────────────────────────────────┐                         ┌────────────────────────────────┐
 │ Label                          │                         │ Project                        │
 ├────────────────────────────────┤                         ├────────────────────────────────┤
 │ _id : ObjectId        [PK]     │N                       1│ _id : ObjectId        [PK]     │
 │ projectId : ObjectId  [FK, Opt]├─────────────────────────◄│ ownerId : ObjectId    [FK]     │
 │ name : String                  │                         │ clientId : ObjectId   [FK, Opt]│
 │ color : String                 │                         │ key : String                   │
 └───────────────┬────────────────┘                         │ name : String                  │
                 │                                          │ members : ObjectId[]  [FK]     │
                 │                                          │ isDeleted : Boolean            │
                 │                                          └───────────────┬────────────────┘
                 │                                                          │
                 │                                ┌─────────────────────────┼────────────────────────┐
                 │                                │ 1                       │ 1                      │ 1
                 │                                ▼ N                       ▼ N                      ▼ N
                 │                        ┌────────────────┐        ┌────────────────┐       ┌────────────────┐
                 │                        │ KanbanColumn   │        │ Task           │       │ File           │
                 │                        ├────────────────┤        ├────────────────┤       ├────────────────┤
                 │                        │ _id : ObjId [PK]│        │ _id : ObjId [PK]│       │ _id : ObjId [PK]│
                 │                        │ projectId [FK] │        │ taskKey: String│       │ publicId: String│
                 │                        │ title : String │        │ projectId [FK] │       │ secureUrl: String│
                 │                        │ position: Num  │        │ columnId [FK]  │       │ projectId [FK] │
                 │                        └────────────────┘        │ assigneeId[FK] │       │ taskId [FK,Opt]│
                 │                                                  │ labelIds:ObjId[]───────► uploadedBy[FK] │
                 │                                                  │ isDeleted: Bool│       └────────────────┘
                 │                                                  └───────┬────────┘
                 │                                                          │
                 │                                ┌─────────────────────────┴────────────────────────┐
                 │                                │ 1                                                │ 1
                 │                                ▼ N                                                ▼ N
                 │                        ┌────────────────┐                                 ┌────────────────┐
                 │                        │ Comment        │                                 │ ActivityLog    │
                 │                        ├────────────────┤                                 ├────────────────┤
                 │                        │ _id : ObjId [PK]│                                 │ _id : ObjId [PK]│
                 │                        │ taskId : ObjId │                                 │ actorId : ObjId│
                 │                        │ authorId: ObjId│                                 │ action : String│
                 │                        │ content: String│                                 │ entityId: ObjId│
                 │                        └────────────────┘                                 │ projectId:ObjId│
                 │                                                                           └────────────────┘
                 └───────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================
```

---

# 23. Appendix

## 23.1 Naming Standards Quick Reference

- **Collections**: Plural `camelCase` (`userSettings`, `activityLogs`).
- **Models**: Singular `PascalCase` (`UserSetting`, `ActivityLog`).
- **Foreign Keys**: Target entity + `Id` (`projectId`, `userId`).
- **Foreign Key Arrays**: Target entity + `Ids` (`labelIds`, `memberIds`).
- **Booleans**: Prefix `is` or `has` (`isDeleted`, `isActive`, `hasCompletedOnboarding`).
- **Dates**: Suffix `At` (`createdAt`, `updatedAt`, `deletedAt`, `lastLoginAt`).

## 23.2 Reserved System Field Names

Do NOT use the following reserved words for domain fields:
`__v`, `schema`, `collection`, `model`, `db`, `id`, `_doc`, `isNew`, `errors`, `events`.

## 23.3 Common Mongoose Validation Helpers

```typescript
// Shared Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6})$/,
  PROJECT_KEY: /^[A-Z0-9]{2,10}$/,
  SLUG: /^[a-z0-9-]+$/,
};

// Common Schema Types
export const SCHEMA_TYPES = {
  REQUIRED_STRING: { type: String, required: true, trim: true },
  OPTIONAL_STRING: { type: String, default: "", trim: true },
  BOOLEAN_FALSE: { type: Boolean, default: false },
  BOOLEAN_TRUE: { type: Boolean, default: true },
};
```

---

_End of ProjectOS Database Schema Documentation._
