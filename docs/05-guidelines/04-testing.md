# Testing Guide

> Testing strategy, tools, conventions, and quality standards for ProjectOS.

---

# Goals

Testing exists to ensure the application remains:

- Reliable
- Maintainable
- Refactor-friendly
- Bug resistant

The objective is **confidence**, not simply increasing coverage numbers.

---

# Testing Philosophy

## Test Behavior, Not Implementation

Always verify **what the application does**, not how it does it.

Good examples:

- User can log in
- Task status changes correctly
- Permission is denied

Bad examples:

- Internal helper function called twice
- Specific hook implementation
- Private method execution

Implementation details change.

Behavior should not.

---

## Keep Tests Fast

Developers should be able to run tests frequently.

Prioritize:

- Fast unit tests
- Lightweight integration tests
- Minimal E2E tests

A slow test suite eventually gets ignored.

---

## Confidence Over Coverage

Coverage is a metric.

Confidence is the goal.

Better:

- 85% meaningful coverage

than

- 100% meaningless assertions.

---

## Test Public Contracts

Focus on:

- Inputs
- Outputs
- Side effects
- User-visible behavior

Avoid testing private implementation details.

---

# Testing Pyramid

```
            E2E
        Critical Flows
             10%

       Integration Tests
             20%

         Unit Tests
             70%
```

| Level       | Target | Speed     | Purpose                                    |
| ----------- | ------ | --------- | ------------------------------------------ |
| Unit        | ~70%   | Very Fast | Functions, stores, utilities, validators   |
| Integration | ~20%   | Medium    | API routes, middleware, services, database |
| E2E         | ~10%   | Slow      | Complete user journeys                     |

---

# Testing Stack

| Tool                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| Vitest                | Unit testing                             |
| React Testing Library | React components and hooks               |
| Supertest             | Express API testing                      |
| Playwright            | End-to-end testing                       |
| MongoDB Memory Server | Temporary database for integration tests |
| MSW (optional)        | Mock frontend API responses              |

---

# Project Test Structure

```
apps/
├── web/
│   ├── src/
│   ├── tests/
│   └── vitest.config.ts
│
├── server/
│   ├── src/
│   ├── tests/
│   └── vitest.config.ts

packages/
├── shared/
│   └── tests/

└── ui/
    └── tests/
```

---

# Test Naming

Test files should stay beside their source.

```
Button.tsx
Button.test.tsx

login.ts
login.test.ts

auth.service.ts
auth.service.test.ts
```

Avoid separate global test folders unless necessary.

---

# Unit Testing

Unit tests should cover isolated logic.

## Test

- Utility functions
- Validators
- Permission checks
- Business rules
- Zustand stores
- Custom hooks
- Shared packages
- Helper functions
- Formatters

## Avoid

- Framework behavior
- React internals
- External libraries

---

# Component Testing

React components should be tested through user interaction.

Test:

- Rendering
- User events
- Accessibility
- Visible state
- Loading state
- Error state

Avoid:

- Internal state
- Hook implementation
- CSS classes unless behavior depends on them

---

# Zustand Testing

Test store behavior.

Example:

- initial state
- actions
- optimistic updates
- rollback
- reset

Never test implementation details.

---

# Integration Testing

Integration tests verify multiple layers together.

Typical flow

```
Request

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Database

↓

Response
```

Integration tests should use a temporary MongoDB instance.

---

# API Tests

Every API endpoint should verify:

- Success response
- Validation failure
- Unauthorized access
- Forbidden access
- Not found
- Conflict
- Server error

Every endpoint should have happy path and failure path tests.

---

# Authentication Tests

Required scenarios

Registration

- valid registration
- duplicate email
- weak password

Login

- valid login
- invalid email
- invalid password
- locked account

Refresh

- valid refresh
- expired refresh
- invalid refresh

Logout

- clears cookie
- invalidates session

Me endpoint

- authenticated
- unauthenticated

---

# Project Tests

Minimum coverage

- create project
- update project
- delete project
- invite member
- remove member
- permission checks

---

# Task Tests

Minimum coverage

- create task
- edit task
- delete task
- assign member
- move status
- reorder
- archive

---

# Kanban Tests

Test

- move task
- reorder
- rollback
- optimistic updates
- socket synchronization
- filters
- search

---

# File Upload Tests

Verify

- valid upload
- invalid file type
- oversized file
- Cloudinary failure
- deletion
- unauthorized upload

---

# Notification Tests

Verify

- notification creation
- unread count
- mark read
- mark all
- delete
- socket delivery
- actor excluded
- offline fetch

---

# WebSocket Tests

Test

- connect
- disconnect
- reconnect
- room joining
- event broadcasting
- authorization
- duplicate events

---

# E2E Tests

Only critical business flows.

Required scenarios

## Authentication

- Register
- Login
- Logout
- Refresh token

---

## Projects

- Create project
- Edit project
- Delete project

---

## Members

- Invite member
- Accept invitation
- Remove member

---

## Tasks

- Create task
- Edit task
- Move task
- Delete task

---

## Kanban

- Drag task
- Reorder
- Refresh page
- Verify persistence

---

## Comments

- Create
- Edit
- Delete
- Mention user

---

## Attachments

- Upload
- Preview
- Delete

---

## Notifications

- Receive notification
- Open notification
- Mark read

---

# Arrange → Act → Assert

Use AAA everywhere.

```ts
it("creates a project", async () => {
  // Arrange
  // Act
  // Assert
});
```

---

# Mocking Rules

Mock only external boundaries.

Allowed

- HTTP APIs
- Email service
- Cloudinary
- Date/time
- File system
- Third-party services

Avoid mocking

- Business logic
- Services
- Utility functions

---

# Test Data

Prefer factories.

Example

```
createUser()

createProject()

createTask()

createComment()
```

Avoid large inline objects.

---

# Database Testing

Integration tests should

- create fresh database
- seed required data
- clean after every test

Never depend on previous tests.

Tests must run independently.

---

# Accessibility Testing

Every important component should verify

- keyboard navigation
- focus management
- labels
- ARIA attributes
- screen reader compatibility

---

# Performance Testing

Large datasets should be tested.

Examples

- 500 notifications

- 1000 tasks

- 100 projects

- 500 comments

Ensure acceptable rendering speed.

---

# Error Testing

Every feature should test

- invalid input
- permission denied
- missing resources
- server failures
- timeout
- malformed requests

---

# Snapshot Testing

Use snapshots sparingly.

Good

- Shared UI components

Avoid

- Large pages
- Frequently changing layouts

Explicit assertions are preferred.

---

# Coverage Targets

| Metric             | Target |
| ------------------ | ------ |
| Line Coverage      | ≥ 80%  |
| Branch Coverage    | ≥ 75%  |
| Function Coverage  | ≥ 85%  |
| Statement Coverage | ≥ 80%  |
| Critical Flows     | 100%   |

Coverage is measured in CI.

---

# CI Pipeline

Every Pull Request should run

```
Format Check

↓

Lint

↓

Type Check

↓

Unit Tests

↓

Integration Tests

↓

Build

↓

Coverage Report
```

Only after merging into the release branch

```
Playwright E2E Tests
```

---

# Testing Checklist

Before merging, verify:

- [ ] New code has tests
- [ ] Existing tests still pass
- [ ] No skipped tests (`.skip`)
- [ ] No focused tests (`.only`)
- [ ] Coverage maintained
- [ ] Edge cases tested
- [ ] Permission checks tested
- [ ] Error responses tested
- [ ] Accessibility verified
- [ ] No flaky tests

---

# Common Mistakes

| Avoid                         | Instead                       |
| ----------------------------- | ----------------------------- |
| Testing implementation        | Test behavior                 |
| Mocking everything            | Mock only external services   |
| Large snapshots               | Explicit assertions           |
| Shared mutable test data      | Fresh factories               |
| Long test chains              | Independent tests             |
| Ignoring edge cases           | Test both success and failure |
| Using production database     | Use MongoDB Memory Server     |
| Testing third-party libraries | Test your own code            |

---

# Future Improvements

Planned additions

- Visual regression testing
- Performance benchmarks
- Lighthouse CI
- Load testing
- Contract testing
- Mutation testing
- Automated accessibility audits
- Cross-browser Playwright testing

---

# Related Documents

- [Coding Standards](02-coding-standards.md)
- [Git Workflow](01-git-workflow.md)
- [Security & Authentication](../02-architecture/03-security-and-auth.md)
- [Authentication Feature](../03-features/authentication/README.md)
- [Kanban Board Feature](../03-features/kanban-board/README.md)
- [File Uploads Feature](../03-features/file-uploads/README.md)
- [Notifications Feature](../03-features/notifications/README.md)
