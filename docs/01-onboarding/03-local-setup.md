# Local Development Setup

> This guide explains how to set up the ProjectOS development environment from scratch. Follow the steps in order to clone the repository, install dependencies, configure environment variables, and start the application locally.

---

# System Requirements

Before setting up ProjectOS, make sure your system meets the following requirements.

| Requirement        | Recommended Version            | Check Command      |
| ------------------ | ------------------------------ | ------------------ |
| Node.js            | 22.x LTS (Minimum 20.x)        | `node --version`   |
| pnpm               | 11.x or later                  | `pnpm --version`   |
| Git                | Latest                         | `git --version`    |
| PostgreSQL         | 16.x                           | `postgres --version` |
| Cloudinary Account | Required                       | Dashboard          |
| Modern Browser     | Latest Chrome / Edge / Firefox | —                  |

---

# Required Accounts

Create the following accounts before starting development.

| Service       | Purpose                |
| ------------- | ---------------------- |
| GitHub        | Source code hosting    |
| Supabase / Neon | Cloud database       |
| Cloudinary    | File and image storage |

---

# Clone the Repository

Clone the project from GitHub.

```bash
git clone <repository-url>
```

Move into the project directory.

```bash
cd ProjectOS
```

---

# Install Dependencies

ProjectOS uses **pnpm workspaces** inside a **Turborepo** monorepo.

Install all dependencies with a single command.

```bash
pnpm install
```

This installs dependencies for every workspace including:

- Frontend
- Backend
- Shared packages
- UI library

---

# Project Structure

After installation your project should look similar to:

```text
tickon/
├── apps/
│   ├── client/
│   └── server/
├── packages/
│   └── types/
├── docs/
├── package.json
└── pnpm-workspace.yaml
```

---

# Configure Environment Variables

Each application has its own environment file.

Create them from the provided examples.

```bash
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
```

Fill in all required environment variables before starting the application.

Typical values include:

- PostgreSQL connection string
- JWT secrets
- Cloudinary credentials
- Frontend URL
- Backend URL
- Cookie configuration

See [Environment Variables](04-env-variables.md) for a complete reference.

---

# Install Git Hooks

Git hooks help maintain code quality by running checks before commits.

Install them once after cloning.

```bash
pnpm prepare
```

---

# Start Development Mode

Run both frontend and backend simultaneously.

```bash
pnpm dev
```

Turborepo will automatically start every development server.

---

# Development Servers

| Application      | URL                   | Default Port |
| ---------------- | --------------------- | ------------ |
| Next.js Frontend | http://localhost:3000 | 3000         |
| NestJS API       | http://localhost:4000 | 4000         |

If everything is configured correctly, opening the frontend in your browser should automatically communicate with the backend API.

---

# Running Individual Applications

Sometimes you only need one application.

## Frontend

```bash
pnpm --filter @tickon/client dev
```

## Backend

```bash
pnpm --filter @tickon/server dev
```

---

# Build the Project

Build every workspace.

```bash
pnpm build
```

This command builds all workspaces using Turborepo. Note: Linting and formatting must be run separately using `pnpm lint` and `pnpm format`.

---

# Lint the Code

Run ESLint across the entire monorepo.

```bash
pnpm lint
```

---

# Format the Code

Format the entire repository.

```bash
pnpm format
```

Check formatting without changing files.

```bash
pnpm format:check
```

---

# Generate Documentation

Regenerate API and database documentation from source files.

```bash
pnpm docs:generate
```

Run the documentation watcher during development to regenerate automatically on file changes.

```bash
pnpm docs:watch
```

---

# Common Commands

| Task                 | Command                    |
| -------------------- | -------------------------- |
| Install dependencies | `pnpm install`             |
| Start all apps       | `pnpm dev`                 |
| Start frontend       | `pnpm --filter @tickon/client dev` |
| Start backend        | `pnpm --filter @tickon/server dev` |
| Build project        | `pnpm build`               |
| Lint                 | `pnpm lint`                |
| Format code          | `pnpm format`              |
| Check formatting     | `pnpm format:check`        |
| Generate docs        | `pnpm docs:generate`       |
| Watch docs           | `pnpm docs:watch`          |

---

# Troubleshooting

| Problem                                 | Possible Solution                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm` command not found                | Install pnpm or run `corepack enable`.                                                    |
| Node version mismatch                   | Install the recommended LTS version of Node.js.                                           |
| PostgreSQL connection failed            | Verify the connection string and ensure the local server or cloud instance is running.    |
| JWT authentication fails                | Confirm all JWT secrets are configured correctly.                                         |
| Cloudinary uploads fail                 | Verify Cloudinary credentials in `.env`.                                                  |
| Port 3000 already in use                | Stop the conflicting process or change the frontend port.                                 |
| Port 4000 already in use                | Stop the conflicting process or change the backend port.                                  |
| TypeScript errors after pulling changes | Run `pnpm install` and rebuild the project.                                               |
| Dependency conflicts                    | Delete `node_modules`, remove the lockfile only if necessary, and reinstall dependencies. |

---

# Recommended Development Workflow

1. Pull the latest changes.
2. Install new dependencies if required.
3. Start the development server.
4. Create a new Git branch.
5. Implement the feature.
6. Run linting.
7. Run formatting check.
8. Commit using Conventional Commits.
9. Push the branch.

---

# Verifying the Setup

Your local environment is configured correctly if:

- Dependencies install without errors.
- `pnpm dev` starts successfully.
- The frontend opens at `http://localhost:3000`.
- The backend API responds at `http://localhost:4000`.
- PostgreSQL connects successfully.
- File uploads work through Cloudinary.
- No TypeScript errors are reported.
- Linting completes successfully.

Once these checks pass, your development environment is ready for building ProjectOS.
