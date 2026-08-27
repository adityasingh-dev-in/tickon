# Feature: Notifications

> Real-time in-app notification system powered by Socket.IO, MongoDB, and TanStack Query.

---

# Status

| Property     | Value      |
| ------------ | ---------- |
| Status       | Planned    |
| Priority     | P1         |
| Last Updated | 2026-07-19 |

---

# Overview

Notifications keep users informed about important project activity without requiring page refreshes.

The system delivers notifications in real time using Socket.IO while persisting them in MongoDB so users never miss important updates.

Notifications include:

- Task assignments
- Comments
- Mentions
- Status changes
- File uploads
- Project membership
- System events

---

# User Stories

- Receive live notifications
- View unread count
- Open notification center
- Mark notifications as read
- Mark all as read
- Navigate directly to related content

---

# Functional Requirements

| ID      | Requirement                     | Priority | Status  |
| ------- | ------------------------------- | -------- | ------- |
| NTF-001 | Real-time delivery              | P0       | Planned |
| NTF-002 | Persistent notification storage | P0       | Planned |
| NTF-003 | Notification center             | P0       | Planned |
| NTF-004 | Unread badge                    | P0       | Planned |
| NTF-005 | Mark notification as read       | P1       | Planned |
| NTF-006 | Mark all as read                | P1       | Planned |
| NTF-007 | Delete notification             | P2       | Planned |
| NTF-008 | Navigate to related resource    | P1       | Planned |

---

# Notification Types

| Type          | Trigger               |
| ------------- | --------------------- |
| task.assigned | Task assigned         |
| task.comment  | New comment           |
| task.status   | Status changed        |
| task.created  | Task created          |
| task.deleted  | Task removed          |
| mention       | User mentioned        |
| file.uploaded | Attachment uploaded   |
| member.added  | User added to project |
| system        | System message        |

---

# Workflow

```text
User Action

↓

Server

↓

Determine Recipients

↓

Create Notification

↓

Save MongoDB

↓

Emit Socket.IO Event

↓

Recipient Receives Event

↓

React Query Cache Updated

↓

Unread Badge Updates

↓

Toast Notification
```

---

# Delivery Rules

Notifications are **never** sent to the user who triggered the event.

Each recipient receives one notification per event.

Offline users receive notifications on their next synchronization.

---

# Notification Center

Displays

- Newest first
- Infinite scrolling
- Read/unread indicator
- Timestamp
- Actor avatar
- Related project/task
- Navigation link

---

# API

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| GET    | `/api/notifications`              | Notification list |
| GET    | `/api/notifications/unread-count` | Badge count       |
| PATCH  | `/api/notifications/:id/read`     | Mark read         |
| PATCH  | `/api/notifications/read-all`     | Mark all read     |
| DELETE | `/api/notifications/:id`          | Delete            |

Cursor pagination:

```text
GET /notifications?cursor=abc123&limit=20
```

---

# Socket Events

| Event                | Purpose              |
| -------------------- | -------------------- |
| notification.created | New notification     |
| notification.read    | Notification read    |
| notification.deleted | Notification removed |

Users join:

```text
user:{userId}
```

Each notification is emitted only to the recipient's room.

---

# Notification Model

```text
Notification

_id

recipient

actor

type

category

project

task

comment

metadata

isRead

readAt

deletedAt

createdAt
```

The notification message is generated on the frontend using the notification type and metadata.

---

# Indexes

| Fields                | Purpose           |
| --------------------- | ----------------- |
| recipient + isRead    | Badge count       |
| recipient + createdAt | Notification feed |
| recipient + deletedAt | Cleanup           |

---

# State Management

## TanStack Query

Server state:

- Notification list
- Badge count

Queries

```text
notifications

notifications-count
```

Mutations

- Mark read
- Mark all read
- Delete notification

---

## Zustand

Stores UI only.

```text
Panel open

Selected notification

Toast queue
```

---

# Components

```text
Notification Bell

├── Badge

├── Notification Panel
│
├── Notification List
│
├── Notification Card
│
└── Empty State
```

---

# Edge Cases

| Scenario                   | Expected Behaviour                   |
| -------------------------- | ------------------------------------ |
| Offline user               | Load on reconnect                    |
| Duplicate socket event     | Ignore duplicate                     |
| Deleted task               | Show notification without navigation |
| Actor is recipient         | No notification                      |
| Large notification history | Cursor pagination                    |
| Socket disconnected        | Refresh via API                      |

---

# Retention

Unread notifications remain indefinitely.

Read notifications older than 90 days may be removed by a scheduled cleanup job.

---

# Security

- Authentication required
- Recipient validation
- Socket authentication
- User isolation using personal rooms
- Notification ownership enforced

---

# Future Improvements

- Email notifications
- Push notifications
- Notification preferences
- Digest emails
- Snoozing
- Categories
- Search
- Filters

---

# Testing Checklist

- Receive notification
- Badge update
- Read notification
- Read all
- Delete
- Navigation
- Offline recovery
- Socket reconnect
- Pagination
- Authorization

---

# Related Documents

- Authentication
- Task Management
- Projects
- Socket.IO Architecture
- System Diagram
