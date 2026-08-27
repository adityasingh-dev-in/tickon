# Technology Stack

> A complete overview of the technologies, libraries, and tools used to build ProjectOS. Every technology is chosen to support scalability, maintainability, developer experience, and production readiness.

---

# Design Philosophy

ProjectOS follows a **modern TypeScript-first full-stack architecture** built around a monorepo.

The technology stack prioritizes:

- Type safety across the entire application
- Excellent developer experience
- High performance
- Clean architecture
- Scalability
- Maintainability
- Real-time capabilities
- Production-ready best practices

---

# Frontend

The frontend is built using the latest React ecosystem with Next.js App Router.

| Technology       | Version  | Purpose                                                                    |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| Next.js          | 16.2.10  | React framework with App Router, Server Components, routing, and rendering |
| React            | 19.2.4   | Component-based user interface library                                     |
| TypeScript       | ^5       | Static type checking across the application                                |
| Tailwind CSS     | ^4       | Utility-first CSS framework                                                |
| Zustand          | ^5.0.14  | Lightweight global client state management                                 |
| TanStack Query   | ^5.101.2 | Server state management, caching, and data synchronization                 |
| React Hook Form  | ^7.81.0  | High-performance form management                                           |
| Zod              | ^4.4.3   | Schema validation for forms and APIs                                       |
| Socket.IO Client | ^4.8.3   | Real-time communication with the backend                                   |
| Lucide React     | ^1.23.0  | Modern SVG icon library                                                    |
| Sonner           | ^2.0.7   | Toast notification system                                                  |
| Framer Motion    | ^12.42.2 | Animation library                                                          |
| dnd kit          | ^6.3.1   | Drag-and-drop toolkit                                                      |
| date-fns         | ^4.4.0   | Date utility library                                                       |
| Recharts         | ^3.9.2   | Charting library                                                           |

---

# Backend

The backend provides REST APIs, authentication, business logic, and real-time communication.

| Technology         | Version           | Purpose                                 |
| ------------------ | ----------------- | --------------------------------------- |
| NestJS             | ^11.0.0           | Node.js framework with dependency injection and modules |
| TypeScript         | ^5.9.3            | Backend type safety                     |
| Node.js            | 20.x LTS or later | JavaScript runtime                      |
| Prisma             | ^7.10.0           | PostgreSQL ORM                          |
| Socket.IO          | ^4.8.3            | Real-time WebSocket server              |
| jsonwebtoken       | ^9.0.3            | Authentication tokens                   |
| bcryptjs           | ^3.0.3            | Password hashing                        |
| class-validator    | ^0.14.0           | DTO validation                          |
| class-transformer  | ^0.5.1            | Object transformation                   |
| pg                 | ^8.11.0           | PostgreSQL driver                       |
| Zod                | ^4.4.3            | Request validation                      |
| Morgan             | ^1.11.0           | HTTP request logging                    |
| CORS               | ^2.8.6            | Cross-origin resource sharing           |
| Helmet             | ^8.2.0            | Secure HTTP headers                     |
| express-rate-limit | ^8.5.2            | API rate limiting                       |
| compression        | ^1.8.1            | HTTP compression                        |
| uuid               | ^14.0.1           | Unique ID generation                    |

---

# Database

ProjectOS uses PostgreSQL as its primary database.

| Technology    | Version  | Purpose                         |
| ------------- | -------- | ------------------------------- |
| PostgreSQL    | 16.x     | Primary relational database     |
| Prisma        | ^8.46.0  | Object-Relational Mapping (ORM) |

### Why PostgreSQL?

PostgreSQL was selected because it provides:

- Strong ACID guarantees and data integrity
- Native support for complex queries and joins
- Excellent TypeScript ecosystem
- Robust relational data modeling
- Efficient handling of structured project data with relationships

---

# Authentication & Security

| Technology             | Purpose                             |
| ---------------------- | ----------------------------------- |
| JWT                    | Stateless authentication            |
| HTTP-only Cookies      | Secure token storage                |
| bcryptjs               | Password hashing                    |
| Helmet                 | Secure HTTP headers                 |
| express-rate-limit     | API rate limiting                   |
| CORS                   | Cross-origin protection             |
| Zod                    | Input validation                    |
| hpp                    | HTTP parameter pollution prevention |

---

# File Storage

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| Cloudinary | Image and document storage     |
| Multer     | Multipart file upload handling |

Supported uploads include:

- Images
- Documents
- Project attachments
- User avatars

---

# Real-Time Communication

| Technology | Purpose                               |
| ---------- | ------------------------------------- |
| Socket.IO  | Bidirectional real-time communication |

Used for:

- Live notifications
- Task updates
- Comment updates
- Kanban synchronization
- Presence indicators (future)
- Collaborative features (future)

---

# State Management

ProjectOS separates client state from server state.

| Technology      | Responsibility                      |
| --------------- | ----------------------------------- |
| Zustand         | Global client state                 |
| TanStack Query  | API state, caching, synchronization |
| React Hook Form | Form state                          |

This separation keeps the application predictable and easy to maintain.

---

# Styling

| Technology        | Purpose                   |
| ----------------- | ------------------------- |
| Tailwind CSS      | Utility-first styling     |
| CSS Variables     | Theme management          |
| Responsive Design | Mobile-first layouts      |
| next-themes       | Dark/light mode switching |

Design priorities include:

- Clean UI
- Consistent spacing
- Accessibility
- Responsive layouts
- Dark mode support

---

# Development Tools

| Technology  | Version | Purpose                                     |
| ----------- | ------- | ------------------------------------------- |
| pnpm        | 11.10.0 | Fast package manager with workspace support |
| Turborepo   | ^2.10.4 | Monorepo management and task orchestration  |
| ESLint      | ^9      | Code quality and linting                    |
| Prettier    | ^3.9.4  | Automatic code formatting                   |
| Husky       | ^9.1.7  | Git hooks                                   |
| lint-staged | ^17.0.8 | Run linters before commits                  |
| Commitlint  | ^21.2.1 | Conventional commit validation              |
| Git         | —       | Version control                             |
| GitHub      | —       | Source code hosting                         |

---

# Testing

| Technology            | Purpose            |
| --------------------- | ------------------ |
| Vitest                | Unit testing       |
| React Testing Library | Component testing  |
| Supertest             | API testing        |
| Playwright            | End-to-end testing |

---

# Deployment

| Service                 | Purpose                             |
| ----------------------- | ----------------------------------- |
| Vercel                  | Frontend hosting                    |
| Render or Railway       | Backend hosting                     |
| Supabase / Neon         | Cloud PostgreSQL database           |
| Cloudinary              | Media storage                       |
| GitHub Actions (Future) | Continuous Integration & Deployment |

---

# Monorepo Structure

```text
tickon/

├── apps/
│   ├── client/          # Next.js Frontend (@tickon/client)
│   └── server/          # NestJS Backend (@tickon/server)
├── packages/
│   └── types/           # Shared TypeScript types (@tickon/types)
├── docs/                # Project documentation
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

# Technology Selection Principles

Every technology included in ProjectOS satisfies one or more of the following goals:

- Production readiness
- Strong TypeScript support
- Active ecosystem
- Excellent documentation
- Scalability
- Performance
- Maintainability
- Large community support
- Modern development practices

Technologies that do not provide a clear long-term benefit are intentionally excluded to keep the stack focused and maintainable.

---

# Current Technology Summary

| Layer              | Primary Technology      |
| ------------------ | ----------------------- |
| Frontend Framework | Next.js 16.2.10         |
| UI Library         | React 19.2.4            |
| Language           | TypeScript              |
| Styling            | Tailwind CSS 4.x        |
| Client State       | Zustand                 |
| Server State       | TanStack Query          |
| Forms              | React Hook Form         |
| Validation         | Zod                     |
| Backend            | NestJS                  |
| Database           | PostgreSQL              |
| ORM                | Prisma                  |
| Authentication     | JWT + HTTP-only Cookies |
| Real-Time          | Socket.IO               |
| File Storage       | Cloudinary              |
| Package Manager    | pnpm 11.10.0            |
| Version Control    | Git + GitHub            |
| Frontend Hosting   | Vercel                  |
| Backend Hosting    | Render / Railway        |
| Database Hosting   | Supabase / Neon          |

---

# Future Technologies

The following technologies may be introduced in future versions as the project grows:

| Technology  | Purpose                          |
| ----------- | -------------------------------- |
| Redis       | Caching and session storage      |
| BullMQ      | Background job processing        |
| Resend      | Transactional emails             |
| Sentry      | Error monitoring                 |
| OpenAI API  | AI-powered productivity features |
| Docker      | Containerized deployment         |
| Kubernetes  | Large-scale orchestration        |
| Meilisearch | Advanced full-text search        |

These technologies are intentionally excluded from Version 1 to keep the architecture simple while leaving room for future scalability.
