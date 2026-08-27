# ProjectOS Documentation

> **The documentation map for ProjectOS.** Start here to understand the project structure, navigate the documentation, and follow the team's documentation workflow.

---

## Documentation Structure

This project follows **Domain-Driven Documentation**.

Documentation is organized by **what the system does**, not by where the code lives. Each topic has a single source of truth.

| Folder                                 | Purpose                                               | When to Use                                             |
| -------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| [`01-onboarding/`](01-onboarding/)     | Environment setup, installation, development workflow | Getting started with the project                        |
| [`02-architecture/`](02-architecture/) | System-wide architecture and cross-cutting concerns   | Understanding how the application works                 |
| [`03-features/`](03-features/)         | Feature specifications and implementation details     | Building, debugging, or extending features              |
| [`04-decisions/`](04-decisions/)       | Architecture Decision Records (ADRs)                  | Understanding why architectural decisions were made     |
| [`05-guidelines/`](05-guidelines/)     | Team conventions and development standards            | Git workflow, coding standards, testing, design         |
| [`06-generated/`](06-generated/)       | 🤖 Automatically generated reference documentation    | OpenAPI, database schemas, coverage reports (read-only) |

---

# Quick Start

1. **New to the project?** → Read [`01-onboarding/`](01-onboarding/)
2. **Working on a feature?** → Open [`03-features/`](03-features/)
3. **Changing architecture?** → Create an ADR in [`04-decisions/`](04-decisions/)
4. **Need project conventions?** → Check [`05-guidelines/`](05-guidelines/)
5. **Looking for generated API or schema docs?** → Browse [`06-generated/`](06-generated/)

---

# Running the Development Environment

Run the application and documentation watcher in separate terminals.

```bash
# Terminal 1 — Development server
pnpm dev

# Terminal 2 — Documentation watcher
pnpm docs:watch
```

The documentation watcher monitors:

```
src/modules/**/*.{route,controller,model}.ts
```

Whenever a supported file changes, it automatically regenerates:

- OpenAPI documentation
- Database schema documentation

If the watcher is not running, the Husky pre-commit hook automatically executes `docs:generate` before every commit to keep generated documentation synchronized with the source code.

---

# Developer Workflow

Documentation is part of the implementation.

Every significant code change should update its documentation in the **same commit**.

## 1. Plan the Feature

Before writing code:

- Create a new feature folder from `03-features/_template.md`
- Define user stories
- Define workflows
- Outline API endpoints
- Capture business rules

This becomes the feature specification.

---

## 2. Record Architectural Decisions (When Needed)

Only create an ADR if the change affects the application's long-term architecture.

Examples:

- Switching storage providers
- Changing authentication strategy
- Replacing the database
- Introducing a major framework

Do **not** create ADRs for:

- New API endpoints
- UI changes
- Feature implementation
- Bug fixes
- Refactoring

---

## 3. Keep Feature Documentation Current

As implementation evolves, update the feature documentation.

Feature documentation should always describe the current implementation, including:

- Workflows
- Edge cases
- Permissions
- Validation rules
- API behavior
- Known limitations

Documentation should never lag behind the code.

---

## 4. Update Global Documentation

If a change affects the application as a whole, update the appropriate architecture documents.

Examples:

- Environment variables
- System architecture
- Security
- Data model
- Infrastructure
- Coding guidelines
- Design system

Update only the documents affected by your change.

---

## 5. Generated Documentation

Generated documentation requires no manual editing.

The watcher regenerates documentation automatically during development, and the pre-commit hook runs the generators before every commit.

If you ever need to regenerate manually:

```bash
pnpm docs:generate
```

Never edit anything inside `06-generated/`.

If generated output is incorrect, fix the source code or annotations instead.

---

## 6. Pull Request Checklist

Every pull request should include:

- Application code
- Updated feature documentation (if applicable)
- Updated architecture documentation (if applicable)
- Updated generated documentation

A feature is **not complete** until its documentation reflects the implementation.

---

# Feature Folder Convention

Each feature owns its documentation.

Small features may use a single `README.md`.

Larger features may split documentation into multiple files.

Example:

```
03-features/
└── tasks/
    ├── README.md
    ├── api.md
    ├── workflows.md
    ├── permissions.md
    └── edge-cases.md
```

Split documentation only when a single file becomes difficult to navigate.

---

# Documentation Ownership

Each topic has one owner.

| Document                | Owns                                |
| ----------------------- | ----------------------------------- |
| Architecture            | Global system design                |
| Feature documentation   | Feature behavior and implementation |
| ADRs                    | Architectural decisions             |
| Guidelines              | Team conventions                    |
| Generated documentation | Machine-generated reference         |

Avoid duplicating information across documents.

---

# Cross References

Link to the document that owns a topic instead of copying information.

Examples:

- Authentication → Security & Authentication
- Database relationships → Data Model
- Deployment → Infrastructure
- Team conventions → Guidelines

Every topic should have exactly one source of truth.

---

# Documentation Principles

- One document = one responsibility.
- One feature = one folder.
- One source of truth for every topic.
- Link instead of duplicate.
- Keep documentation implementation-focused.
- Update documentation in the same commit as code changes.
- Remove outdated information instead of leaving historical notes.
- Documentation evolves with the codebase.

---

# Contributing to Documentation

## Update Documentation When

| Event                        | Action                                 |
| ---------------------------- | -------------------------------------- |
| New feature                  | Create a folder in `03-features/`      |
| Feature behavior changes     | Update that feature's documentation    |
| Architectural decision       | Create an ADR                          |
| Environment variable changes | Update onboarding documentation        |
| Architecture changes         | Update affected architecture documents |
| Team conventions change      | Update the relevant guideline          |

---

## Do Not Update Documentation For

- Variable renaming
- Import reordering
- Code formatting
- Internal refactoring without behavior changes
- Other implementation details that do not affect the system's behavior

---

# Documentation Commit Convention

Use Conventional Commits.

```text
docs(scope): description
```

Examples:

```text
docs(auth): document refresh token rotation
docs(tasks): add kanban edge cases
docs(infrastructure): update deployment strategy
docs(onboarding): add MongoDB Atlas setup
docs(adr): add ADR-006 for storage abstraction
```
