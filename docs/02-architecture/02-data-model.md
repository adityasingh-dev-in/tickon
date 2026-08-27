# Data Model

> Overview of the ProjectOS database architecture. For the complete, detailed field-level specification, query patterns, and indexing guide across all 15 core collections, see the authoritative [Database Schema Documentation](file:///d:/web/ProjectOS/docs/02-architecture/database-schema.md).

---

# Database Philosophy

ProjectOS uses **PostgreSQL** with **Prisma** to provide a robust, scalable, and developer-friendly data model.

The database follows these principles:

- Entities are validated using Prisma schema definitions and Zod/class-validator.
- Related data is referenced via foreign keys.
- Frequently accessed configuration is denormalized where appropriate.
- Large tables are queried independently with proper indexing.
- Every table includes timestamps.
- Soft deletes are preferred over permanent deletion.
- Indexes are designed for efficient filtering, pagination, and relational joins.

---

# Database Overview

```text
                           User
                             │
                 owns        │
                             ▼
                        Project
                    ┌──────┼──────┐
                    │      │      │
                    │      │      │
                    ▼      ▼      ▼
                 Client   Task   Activity
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
         Comment                 Attachments
                                       │
                                       ▼
                                 Cloudinary

User
 │
 ├────────► Notifications
 │
 └────────► Activity
```

---

# Core Tables

| Table           | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `users`         | User accounts, authentication, profile, preferences |
| `projects`      | Project workspace and settings                      |
| `tasks`         | Individual work items                               |
| `clients`       | Client information linked to projects               |
| `comments`      | Task discussions                                    |
| `notifications` | User notifications                                  |
| `activities`    | Audit trail of important actions                    |

---

# Entity Relationships

| Parent   | Relationship | Child                                |
| -------- | ------------ | ------------------------------------ |
| User     | One-to-Many  | Projects                             |
| User     | One-to-Many  | Notifications                        |
| User     | One-to-Many  | Activities                           |
| Project  | One-to-Many  | Tasks                                |
| Project  | Many-to-One  | Client                               |
| Task     | One-to-Many  | Comments                             |
| Task     | One-to-Many  | Attachments (embedded metadata)      |
| Activity | References   | User, Project, Task, Client, Comment |

---

# Attachment Strategy

ProjectOS does **not** store files inside PostgreSQL.

Instead:

```text
Browser
    │
    ▼
NestJS
    │
    ▼
Cloudinary
    │
    ▼
PostgreSQL

Stores only:

• publicId
• secureUrl
• fileName
• fileType
• fileSize
• uploadedBy
• uploadedAt
```

This keeps database records lightweight while allowing Cloudinary to handle storage and delivery.

---

# JSON vs Relational Structuring

| Data             | Strategy          | Reason                               |
| ---------------- | ----------------- | ------------------------------------ |
| User Preferences | JSON Column       | Small and always loaded with user    |
| Project Settings | JSON Column       | Always needed with project           |
| Project Members  | Join Table        | Supports future scaling              |
| Client Reference | Foreign Key       | Independent table                    |
| Tasks            | Foreign Key       | Large table requiring filtering      |
| Comments         | Foreign Key       | Supports pagination                  |
| Notifications    | Foreign Key       | Queried independently                |
| Activities       | Foreign Key       | Large audit log                      |
| Attachments      | JSON Metadata     | Files stored in Cloudinary           |

---

# Common Fields

Every table includes:

```text
id
createdAt
updatedAt
isDeleted
```

Most tables also include:

```text
createdBy
updatedBy
```

where appropriate.

---

# Indexing Strategy

## Users

| Field | Type   | Purpose        |
| ----- | ------ | -------------- |
| email | Unique | Authentication |

---

## Projects

| Field  | Type  |
| ------ | ----- |
| owner  | Index |
| status | Index |

---

## Tasks

| Field            | Type     |
| ---------------- | -------- |
| project          | Index    |
| assignee         | Index    |
| status           | Index    |
| priority         | Index    |
| dueDate          | Index    |
| project + status | Compound |

---

## Clients

| Field | Type  |
| ----- | ----- |
| owner | Index |
| email | Index |

---

## Notifications

| Field            | Type     |
| ---------------- | -------- |
| recipient        | Index    |
| read             | Index    |
| recipient + read | Compound |

---

## Activities

| Field      | Type       |
| ---------- | ---------- |
| entityType | Index      |
| entityId   | Index      |
| createdAt  | Descending |

---

# Data Integrity

ProjectOS maintains consistency through:

- Prisma schema validation and generated types
- Zod request validation
- Foreign key constraints at the database level
- Soft deletion
- Automatic timestamps
- Centralized business logic inside services

---

# Scaling Strategy

The schema is designed to support future features without major restructuring.

Future additions include:

- Organizations
- Team workspaces
- Role-based permissions
- Time tracking
- Automation
- Email integrations
- Public API
- Mobile applications

The current Version 1 schema intentionally avoids unnecessary complexity while remaining extensible.
