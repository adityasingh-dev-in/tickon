# 01 - Product Requirements Document (PRD) & Scope

## 📌 Product Vision
> **Make project management almost invisible, allowing teams to spend more time building and less time managing work.**

Tickon aims to solve the everyday workflow of freelancers and small development teams by combining essential project planning, kanban boards, client management, and real-time collaboration into one fast, lightweight application.

---

## 🎯 Target Audience
* **Freelancers:** Managing multiple client projects who need everything organized in one place.
* **Solo Developers:** Building products or managing personal work with a capable productivity system.
* **Small Engineering Teams (2-20 members):** Needing real-time collaboration without the steep learning curve of enterprise software.

---

## ✅ In Scope (Version 1 - MVP)

The initial release focuses strictly on features that deliver immediate value to individuals and small teams.

### 1. Authentication & Security
* User registration and login using email/password.
* Secure session management via JWT and HTTP-only cookies.
* Basic user profile management.

### 2. Core Workspace
* **Dashboard:** Centralized overview of active projects, pending tasks, and recent activity.
* **Client Management:** Lightweight CRM to create clients and associate them with specific projects.
* **Projects:** Create, edit, and archive projects.

### 3. Task Management & Kanban
* Create tasks with titles, descriptions, priorities, and due dates.
* **Kanban Board:** Visual drag-and-drop interface mapping to `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
* Smooth task reordering within columns (saving exact vertical placement).

### 4. Collaboration & Media
* **File Management:** Upload project and task attachments (handled via Cloudinary).
* **Comments:** Task-level discussion threads.
* **Real-time Sync:** Board updates and new comments reflect instantly for all active viewers without page refreshes.

---

## 🚫 Out of Scope (Version 1)

To maintain simplicity and speed, the following are intentionally excluded from MVP:
* Organization/Team workspaces (multi-tenant SaaS isolation).
* Invoicing and Payments.
* Time tracking and timesheets.
* Custom workflow automation.
* Public API access.
* Native Mobile or Desktop applications.

---

## 🔄 Core Workflows (Technical Details)

### 1. The Kanban Drag-and-Drop Flow
* **Frontend:** Built with a drag-and-drop toolkit (e.g., `dnd-kit`). When a user moves a card, **Zustand / TanStack Query** performs an *optimistic update* to instantly render the new position locally.
* **Backend:** Position is calculated using **Fractional Indexing** (an `orderIndex` float value). If a card is dropped between Card A (index 100) and Card B (index 200), the frontend calculates the new index as `150` and sends a `PATCH` request to the server.

### 2. Real-Time Board Synchronization
* When a task's status or position is updated, the NestJS API processes the database change via Prisma.
* The API then triggers the `EventsGateway` (Socket.IO).
* The Gateway broadcasts a `task:updated` event to the specific `project:{id}` room.
* Connected clients instantly update their TanStack Query cache to reflect the new board state.
