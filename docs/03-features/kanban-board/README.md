# Feature: Kanban Board

> Interactive task board for visualizing and managing project tasks using drag-and-drop, real-time updates, and optimistic UI.

---

# Status

| Property     | Value      |
| ------------ | ---------- |
| Status       | Planned    |
| Priority     | P0         |
| Last Updated | 2026-07-19 |

---

# Overview

The Kanban Board is the primary workspace for managing project tasks.

It allows users to:

- View project progress
- Create tasks
- Move tasks between workflow stages
- Reorder tasks
- Search and filter tasks
- Receive live updates
- Quickly edit task information

Every project has three protected system columns: **To Do**, **Review**, and **Done**.

Users may create additional custom columns between the system columns to model their workflow.

Example custom workflows:

```text
To Do → Design → Development → QA → Review → Done

To Do → Draft → Review → Revision → Review → Done
```

"Development" and "QA" are not default columns. They are examples of user-created custom columns.

---

# User Stories

- View project tasks
- Create tasks
- Move tasks
- Reorder tasks
- Filter tasks
- Search tasks
- Receive live updates

---

# Functional Requirements

| ID     | Requirement                | Priority | Status  |
| ------ | -------------------------- | -------- | ------- |
| KB-001 | Display board              | P0       | Planned |
| KB-002 | Drag tasks between columns | P0       | Planned |
| KB-003 | Reorder tasks              | P0       | Planned |
| KB-004 | Create task                | P0       | Planned |
| KB-005 | Edit task                  | P0       | Planned |
| KB-006 | Delete task                | P1       | Planned |
| KB-007 | Search tasks               | P1       | Planned |
| KB-008 | Filter tasks               | P1       | Planned |
| KB-009 | Real-time updates          | P1       | Planned |
| KB-010 | Optimistic updates         | P0       | Planned |

---

# Workflow

```text
User

↓

Open Project

↓

Load Tasks

↓

Group Tasks By Column

↓

Render Board

↓

User Drags Task

↓

Optimistic Update

↓

PATCH Task

↓

Server Validation

↓

MongoDB

↓

Socket.IO Broadcast

↓

Refresh Other Clients
```

---

# Columns

Every project has three protected system columns:

| Column | Purpose            |
| ------ | ------------------ |
| To Do  | Work not started   |
| Review | Waiting for review |
| Done   | Completed work     |

Users may create custom workflow columns between the system columns.

| Column      | Purpose            |
| ----------- | ------------------ |
| Design      | Design phase       |
| Development | Active development |
| Testing     | Quality assurance  |
| QA          | Quality assurance  |
| Deployment  | Release phase      |

Custom columns are optional and user-defined. They do not affect the system columns.

---

# Drag & Drop

## Successful Move

```text
User starts dragging

↓

Task moves visually

↓

Drop

↓

PATCH /tasks/:id

↓

Task column updated

↓

Socket event

↓

Other users updated
```

---

## Failed Move

```text
User drags task

↓

Optimistic update

↓

Request fails

↓

Rollback

↓

Show error

↓

Restore previous position
```

---

# Reordering

Tasks can also be reordered inside the same column.

Each task stores:

```text
columnId

position
```

Position values are updated after successful movement.

---

# Board Loading

```text
Open Project

↓

GET Project

↓

GET Tasks

↓

React Query Cache

↓

Group Tasks By Column

↓

Render Columns
```

---

# Search

Users can search by:

- Task title
- Description

Search updates instantly.

---

# Filters

Supported filters:

- Priority
- Assignee
- Labels
- Due Date
- Status

Filters are stored in URL parameters.

Example

```text
/projects/123

?priority=high

&status=todo
```

---

# API

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| GET    | `/api/projects/:id/tasks` | Project tasks |
| POST   | `/api/tasks`              | Create task   |
| PATCH  | `/api/tasks/:id`          | Update task   |
| DELETE | `/api/tasks/:id`          | Delete task   |

---

# Task Model Fields Used

```text
columnId

position

priority

assignee

dueDate

labels
```

---

# Real-Time Updates

Socket events

| Event        | Purpose        |
| ------------ | -------------- |
| task.created | New task       |
| task.updated | Update task    |
| task.deleted | Delete task    |
| task.moved   | Column changed |

---

# State Management

## TanStack Query

Queries

- Project
- Tasks

Mutations

- Create
- Update
- Delete
- Move

---

## Zustand

Stores only UI state.

Examples

- Active task
- Dragging task
- Selected filters
- Search text
- Sidebar state

Server data always belongs to React Query.

---

# Components

```text
Board Page

├── Toolbar
│
├── Search
│
├── Filters
│
├── Kanban Board
│      │
│      ├── To Do Column
│      ├── Review Column
│      ├── Done Column
│      └── Custom Columns (user-created)
│
├── Task Card
│
└── Task Details Drawer
```

---

# Edge Cases

| Scenario               | Expected Behaviour         |
| ---------------------- | -------------------------- |
| Network failure        | Rollback optimistic update |
| Invalid task           | Show error                 |
| Deleted task           | Remove card                |
| Deleted project        | Redirect                   |
| Offline                | Prevent update             |
| Duplicate socket event | Ignore duplicate           |
| Simultaneous edits     | Last write wins            |
| Empty column           | Show empty state           |
| Large projects         | Virtualized rendering      |

---

# Performance

To maintain smooth interaction:

- Virtualized lists
- Memoized task cards
- Optimistic updates
- React Query caching
- Lazy rendering
- Socket event batching

---

# Security

Only authenticated users may access boards.

The backend verifies:

- User authentication
- Project ownership
- Task ownership

Unauthorized operations return **403 Forbidden**.

---

# Dependencies

Backend

- Express
- Mongoose
- Socket.IO

Frontend

- React
- TanStack Query
- Zustand
- @dnd-kit

---

# Future Improvements

- Swimlanes
- WIP limits
- Sprint boards
- Automation rules
- Bulk editing
- Keyboard shortcuts
- Board templates
- Archive column

---

# Testing Checklist

- Load board
- Create task
- Edit task
- Delete task
- Drag task
- Reorder task
- Search
- Filter
- Socket updates
- Offline handling
- Rollback
- Large task lists

---

# Related Documents

- Task Feature
- Project Feature
- Data Model
- System Diagram
- Socket.IO Architecture
