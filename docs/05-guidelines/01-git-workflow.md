# Git Workflow

> Branch strategy, commit conventions, pull request process, and release workflow for ProjectOS.

---

# Workflow Overview

Every change follows the same lifecycle:

```text
Issue / Task

↓

Create Branch

↓

Develop Feature

↓

Run Checks

↓

Commit Changes

↓

Push Branch

↓

Open Pull Request

↓

Code Review

↓

Merge

↓

Delete Branch
```

---

# Branch Strategy

ProjectOS follows a Git Flow inspired workflow.

```text
main
│
├── Production-ready code
│
develop
│
├── Integration branch
│
├── feature/*
├── fix/*
├── chore/*
├── docs/*
└── hotfix/*
```

---

# Branch Types

| Type    | Format           | Base Branch | Example                 |
| ------- | ---------------- | ----------- | ----------------------- |
| Feature | `feature/<name>` | develop     | `feature/task-comments` |
| Fix     | `fix/<name>`     | develop     | `fix/socket-reconnect`  |
| Hotfix  | `hotfix/<name>`  | main        | `hotfix/login-crash`    |
| Chore   | `chore/<name>`   | develop     | `chore/update-eslint`   |
| Docs    | `docs/<name>`    | develop     | `docs/auth-workflow`    |

---

# Branch Naming Rules

- Use lowercase.
- Use kebab-case.
- Keep names short.
- Describe one feature only.
- Delete merged branches.

Examples

```text
feature/task-labels

feature/project-members

fix/upload-validation

docs/kanban-board

chore/update-dependencies
```

---

# Development Workflow

## 1. Sync

```bash
git checkout develop
git pull origin develop
```

---

## 2. Create Branch

```bash
git checkout -b feature/task-comments
```

---

## 3. Develop

While developing:

- Write code.
- Write tests.
- Update documentation.
- Keep commits focused.

---

## 4. Run Checks

Before committing:

```bash
pnpm format

pnpm lint

pnpm test

pnpm build
```

All commands must pass.

---

## 5. Commit

ProjectOS uses Conventional Commits.

Format

```text
type(scope): description
```

---

# Commit Types

| Type     | Purpose               |
| -------- | --------------------- |
| feat     | New feature           |
| fix      | Bug fix               |
| docs     | Documentation         |
| refactor | Internal improvements |
| style    | Formatting only       |
| perf     | Performance           |
| test     | Tests                 |
| chore    | Tooling               |

---

# Common Scopes

| Scope        | Example        |
| ------------ | -------------- |
| auth         | Authentication |
| project      | Projects       |
| task         | Tasks          |
| comment      | Comments       |
| attachment   | Attachments    |
| notification | Notifications  |
| websocket    | Socket.IO      |
| api          | Backend        |
| ui           | UI Components  |
| shared       | Shared Package |
| db           | Database       |
| docs         | Documentation  |
| config       | Configuration  |

---

# Commit Examples

```text
feat(task): add task comments

feat(notification): implement unread badge

fix(auth): refresh expired access token

fix(api): validate project membership

docs(task): update kanban workflow

refactor(shared): simplify validation helpers

test(auth): add login integration tests

chore(config): update eslint configuration
```

---

# Commit Rules

- One logical change per commit.
- Never mix unrelated changes.
- Keep commits small.
- Write meaningful descriptions.
- Use lowercase.
- Explain **what** changed, not how.

---

# Pull Request Workflow

Before opening a PR:

- Pull latest changes.
- Resolve conflicts.
- Run all checks.
- Update documentation.
- Verify application manually.

---

# Pull Request Checklist

- [ ] Branch is up to date.
- [ ] Build passes.
- [ ] Lint passes.
- [ ] Tests pass.
- [ ] Documentation updated.
- [ ] No debugging code.
- [ ] No unused imports.
- [ ] No commented code.
- [ ] No secrets committed.

---

# Code Review Checklist

Reviewers verify:

- Architecture follows project conventions.
- No duplicated logic.
- Error handling exists.
- Type safety maintained.
- No unnecessary dependencies.
- Naming is clear.
- Performance is acceptable.
- Security considered.
- Documentation updated.

---

# Merge Strategy

ProjectOS uses **Squash Merge**.

Benefits:

- Cleaner history.
- One commit per feature.
- Easier rollback.
- Simpler release notes.

---

# Protected Branches

## main

- Pull Request required
- CI required
- Approval required
- No force push
- No direct commits

---

## develop

- Pull Request required
- CI required
- Approval required

---

# Documentation Rules

Documentation must be updated whenever changes affect:

- Features
- APIs
- Data models
- Environment variables
- Authentication
- User workflows
- Architecture
- Project structure

Documentation is considered part of the feature.

---

# Versioning

ProjectOS follows Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Example

```text
v1.0.0

v1.1.0

v1.1.1

v2.0.0
```

---

# Release Workflow

```text
Feature Branch

↓

Merge → develop

↓

Testing

↓

Merge → main

↓

Create Tag

↓

Deploy Production
```

---

# Release Steps

1. Merge `develop` into `main`.
2. Create a version tag.

```bash
git tag v1.0.0

git push origin v1.0.0
```

3. CI builds the application.
4. Deploy production.
5. Verify deployment.
6. Publish release notes.

---

# Emergency Hotfix Workflow

```text
main

↓

hotfix/login-crash

↓

Fix

↓

Test

↓

Merge main

↓

Merge develop

↓

Deploy
```

Always merge hotfixes back into `develop` to keep branches synchronized.

---

# Related Documents

- Coding Standards
- Infrastructure
- Local Setup
- Tech Stack
