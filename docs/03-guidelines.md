# 03 - Development Guidelines & Standards

## 🌱 Git Workflow & Branching

To maintain a clean and readable Git history, Tickon follows a standardized branching model.

### Branch Naming Convention
Branches should be created from `main` and follow this format: `<type>/<short-description>`

*   `feat/`: For new features (e.g., `feat/kanban-drag-drop`)
*   `fix/`: For bug fixes (e.g., `fix/auth-cookie-issue`)
*   `refactor/`: For code refactoring without behavior change (e.g., `refactor/task-service`)
*   `docs/`: For documentation updates (e.g., `docs/api-endpoints`)
*   `chore/`: For routine tasks, dependencies, or tooling (e.g., `chore/update-prisma`)

---

## 💬 Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). This helps in automatically generating changelogs and understanding the project history.

**Format:** `type(optional-scope): description`

**Examples:**
*   `feat(auth): implement JWT HTTP-only cookie login`
*   `fix(kanban): resolve fractional indexing float precision error`
*   `style(ui): update primary button hover state`

---

## 🛠️ Coding Standards

### General
*   **Monorepo Tooling:** Orchestrated by **Turborepo** with **pnpm** as the sole package manager. Never use `npm` or `yarn`.
*   **Package Manager Pinning (`pnpm@11.24.0`):** The repository pins `packageManager: "pnpm@11.24.0"` in root `package.json` to guarantee deterministic builds and lockfile reproducibility across CI and local environments. Bump this version deliberately, not casually, as workspace syntax and lockfile formats shift across pnpm versions.
*   **Root Commands:**
    *   `pnpm dev`: Boots Next.js (port 3000), NestJS (port 4000), and `@tickon/types` watch in parallel.
    *   `pnpm build`: Runs incremental Turborepo cached builds across all workspaces.
    *   `pnpm lint`: Lints all apps and packages.
    *   `pnpm test`: Runs test suites across workspaces.
*   **Targeted Commands:** Use pnpm `--filter` to run commands in specific workspaces:
    *   `pnpm --filter @tickon/server <script>`
    *   `pnpm --filter @tickon/client <script>`
    *   `pnpm --filter @tickon/types <script>`
*   **TypeScript:** Strict mode is enabled. Shared data types and contracts must be placed in `@tickon/types`.
*   **Formatting & Linting:** Handled by Prettier and ESLint/Oxlint. Always run `pnpm lint` and `pnpm format` before pushing.

### Frontend (`apps/client` / `@tickon/client`)
*   **Components:** Use functional components and hooks. Place reusable UI components in `components/ui`.
*   **State:** Use `Zustand` for global UI state (e.g., dark mode, sidebar toggle). Use `TanStack Query` for server state (data fetching, caching, and optimistic updates).
*   **Styling:** Use Tailwind CSS utility classes. Extract complex, repeatable patterns into Tailwind component classes (`@apply`) or separate React components.

### Backend (`apps/server` / `@tickon/server`)
*   **Architecture:** Follow the NestJS modular architecture (Module, Controller, Service).
*   **Port:** Runs on port 4000 by default (configured via `PORT` in `.env`).
*   **Validation:** Use `class-validator` and `class-transformer` in DTOs (Data Transfer Objects) to validate incoming requests.
*   **Database:** Never write raw SQL unless absolutely necessary for performance. Always use Prisma Client. Document schema changes with comments in `schema.prisma`. Generate types with `pnpm --filter @tickon/server prisma:generate`.

---

## 🚀 Pull Request (PR) Rules

If collaborating or reviewing your own work:
1.  Keep PRs small and focused on a single issue.
2.  Include a brief description of what was changed and why.
3.  Attach screenshots or screen recordings for UI changes.
4.  Ensure all linting and type checks pass locally before merging.
