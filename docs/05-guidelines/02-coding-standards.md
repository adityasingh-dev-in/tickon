# Coding Standards

> Project-wide coding conventions for ProjectOS. Following these standards keeps the codebase consistent, maintainable, and predictable.

---

# Core Principles

Every piece of code should be:

- Simple
- Readable
- Type-safe
- Reusable
- Testable
- Consistent

Prioritize clarity over cleverness.

---

# TypeScript

## Strict Mode

TypeScript strict mode is mandatory.

```json
{
  "strict": true
}
```

Never disable strict mode.

---

## Types vs Interfaces

| Use             | Recommendation |
| --------------- | -------------- |
| Object models   | interface      |
| Component props | interface      |
| API responses   | interface      |
| Union types     | type           |
| Utility types   | type           |
| Function types  | type           |

---

## Rules

- Never use `any`.
- Prefer `unknown` over `any`.
- Export shared types from `packages/shared`.
- Explicit return types for exported functions.
- Use `Readonly` where appropriate.
- Use `as const` for immutable values.

---

# Validation

ProjectOS uses **Zod** for runtime validation.

Validation happens:

- Request body
- Query parameters
- Route params
- Environment variables
- Forms

Never trust client input.

---

# Naming

## Files

| Type            | Convention          |
| --------------- | ------------------- |
| React Component | PascalCase          |
| Hook            | useSomething        |
| Utility         | camelCase           |
| Store           | somethingStore      |
| Validation      | somethingSchema     |
| Service         | somethingService    |
| Controller      | somethingController |
| Route           | somethingRoutes     |
| Model           | Something           |

Examples

```text
TaskCard.tsx

useProjects.ts

projectSchema.ts

taskService.ts

authController.ts
```

---

## Variables

Use camelCase.

```ts
project;

projectOwner;

currentUser;

isLoading;

hasPermission;
```

---

## Constants

Use UPPER_SNAKE_CASE.

```ts
MAX_FILE_SIZE;

API_TIMEOUT;

DEFAULT_PAGE_SIZE;
```

---

## Collections

Plural

```ts
tasks;

projects;

users;
```

Single item

```ts
task;

project;

user;
```

---

# Folder Structure

## Frontend

```text
app/

components/

hooks/

services/

stores/

lib/

types/

styles/
```

Feature folders contain:

```text
tasks/

components/

hooks/

services/

schemas/

types/

utils/
```

---

## Backend

```text
src/

modules/
  <feature>/
    <feature>.route.ts
    <feature>.controller.ts
    <feature>.model.ts

app.ts

index.ts
```

Business logic belongs in services.

Controllers remain thin.

---

# React Standards

- Functional components only.
- Server state belongs to TanStack Query.
- UI state belongs to Zustand.
- Avoid prop drilling.
- Prefer composition over inheritance.
- Keep components focused.

---

# State Management

## React Query

Owns:

- API data
- Caching
- Loading
- Mutations

Never copy React Query data into Zustand.

---

## Zustand

Owns only UI state.

Examples

- Sidebar
- Modal
- Selected task
- Theme
- Dragging state

---

# API Standards

Every endpoint returns consistent responses.

Success

```json
{
  "success": true,
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

Never expose stack traces.

---

# Database

## Mongoose

- One model per file.
- Use timestamps.
- Validate all fields.
- Use indexes intentionally.
- Avoid unnecessary populate.
- Prefer embedding for small bounded data.
- Reference large collections.

---

# Services

Services contain:

- Business logic
- Database operations
- External integrations

Controllers should only:

- Validate request
- Call service
- Return response

---

# Error Handling

Backend

- Throw typed AppError.
- Centralized error middleware.
- Proper HTTP status codes.

Frontend

- React Query handles API errors.
- Show toast notifications.
- Log unexpected errors.

Never swallow errors.

---

# Async Rules

Prefer:

```ts
await;
```

Avoid nested promises.

Always handle rejected promises.

Never ignore async results.

---

# Imports

Import order:

```text
Node modules

Third-party libraries

Shared packages

Absolute imports

Relative imports

Types
```

Separate groups with one blank line.

---

# Exports

Prefer named exports.

Use default exports only when required by Next.js routing.

---

# Functions

- Single responsibility.
- Keep under ~40 lines.
- Avoid deep nesting.
- Extract reusable logic.

---

# Components

One component per file.

Keep rendering logic simple.

Extract repeated UI.

---

# Comments

Use comments to explain **why**, not **what**.

Allowed

```ts
TODO;

FIXME;

HACK;
```

Each should reference an issue when possible.

---

# Performance

- Memoize expensive calculations.
- Lazy load large components.
- Avoid unnecessary renders.
- Use virtualization for long lists.
- Cache API responses.
- Debounce search inputs.

---

# Security

- Never trust user input.
- Validate everything.
- Sanitize uploads.
- Never expose secrets.
- Never log passwords or tokens.
- Check authorization in every protected endpoint.

---

# Formatting

Managed automatically by:

- Prettier
- ESLint
- Husky
- lint-staged
- Commitlint

Never manually format code to fight these tools.

---

# Testing

Every feature should include:

- Unit tests
- Integration tests (where applicable)

Test:

- Success paths
- Failure paths
- Edge cases

---

# Documentation

Documentation must be updated whenever changes affect:

- APIs
- Models
- Features
- Workflows
- Environment variables
- Architecture

Documentation is considered part of the implementation.

---

# Code Review Checklist

- Readable
- Type-safe
- Tested
- Documented
- Secure
- No duplicated logic
- No dead code
- No unnecessary dependencies
- Consistent with project architecture

---

# Related Documents

- Git Workflow
- Tech Stack
- Data Model
- Security & Authentication
- System Diagram
