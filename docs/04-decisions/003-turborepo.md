# ADR-003: Turborepo for Monorepo Management

**Date:** —
**Status:** Accepted

---

## Context

The project consists of multiple packages that share code: a Next.js frontend (`apps/web`), an Express backend (`apps/server`), shared TypeScript types (`packages/shared`), and a UI component library (`packages/ui`). These packages need to be developed, built, and tested together efficiently, with shared dependencies and coordinated builds.

---

## Options Considered

### Option A — Turborepo

- **Pros:** Fast incremental builds with caching, minimal configuration, works with pnpm workspaces out of the box, simple `turbo.json` task graph, remote caching support for CI.
- **Cons:** Fewer built-in code generators than Nx, less opinionated (no enforce structure), smaller plugin ecosystem.

### Option B — Nx

- **Pros:** Full-featured monorepo toolkit, dependency graph visualization, code generators, plugins for most frameworks, affected commands for partial CI.
- **Cons:** Steeper learning curve, heavier configuration, can feel overkill for a 4-package monorepo, opinionated folder structure.

### Option C — Separate Repositories

- **Pros:** Independent deployment, simpler CI per repo, no monorepo tooling needed.
- **Cons:** No shared code without publishing to npm, version synchronization pain, harder to enforce consistent tooling, breaking changes discovered late.

---

## Decision

Turborepo was chosen because the monorepo is small (4 packages) and the primary need is fast, cached builds with pnpm workspaces. Turborepo's minimal configuration (`turbo.json`) is sufficient, and its caching significantly speeds up CI. Nx's additional features (generators, plugins) are unnecessary at this scale.

---

## Consequences

### Positive

- Single `pnpm install` for all packages
- Shared TypeScript types between frontend and backend (`packages/shared`)
- Turborepo caches build artifacts — subsequent builds skip unchanged packages
- Simple task orchestration via `turbo.json`

### Negative

- CI must install all dependencies even for single-package changes (mitigated by caching)
- Team must understand workspace dependency graph (`dependsOn` in `turbo.json`)
- No built-in code generators — scaffolding is manual

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [turbo.json](../../turbo.json) — project configuration
