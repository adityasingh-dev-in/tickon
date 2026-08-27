# Tickon Monorepo

A scalable project management web application built with Turborepo, pnpm workspaces, Next.js, NestJS, and TypeScript.

## Structure

```text
tickon/
├── apps/
│   ├── client/          # Next.js frontend (@tickon/client)
│   └── server/          # NestJS backend (@tickon/server)
├── packages/
│   └── types/           # Shared TypeScript types (@tickon/types)
├── docs/                # Architecture and domain documentation
├── turbo.json           # Turborepo task pipeline configuration
├── pnpm-workspace.yaml  # pnpm workspace definition
└── package.json         # Root configuration and scripts
```

## Prerequisites

- Node.js >= 18.x
- pnpm >= 9.x / 11.x
- PostgreSQL (for local backend development)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development servers:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start all workspace applications in development mode via Turborepo
- `pnpm build` - Build all packages and applications (`@tickon/types` -> `@tickon/server` & `@tickon/client`)
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests across packages
- `pnpm clean` - Clean all build artifacts across all workspaces
