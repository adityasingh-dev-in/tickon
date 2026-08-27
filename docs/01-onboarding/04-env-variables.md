# Environment Variables

> This document explains every environment variable used by ProjectOS, where it is used, how to obtain its value, and recommended settings for local development, staging, and production.

---

# Overview

ProjectOS uses separate environment files for the frontend and backend.

```text
apps/
├── web/
│   ├── .env.local
│   └── .env.example
│
└── server/
    ├── .env
    └── .env.example
```

Only `.env.example` files should be committed to Git.

Actual `.env` and `.env.local` files must never be committed.

---

# Backend Environment Variables

**Location**

```text
apps/server/.env
```

---

## Application

| Variable   | Required | Default       | Description                     |
| ---------- | -------- | ------------- | ------------------------------- |
| `NODE_ENV` | No       | `development` | Current application environment |
| `PORT`     | No       | `5000`        | Express server port             |

---

## Database

| Variable      | Required | Default | Description               |
| ------------- | -------- | ------- | ------------------------- |
| `DATABASE_URL` | Yes      | —       | PostgreSQL connection string |

### Example

Local PostgreSQL

```env
DATABASE_URL=postgresql://tickon:tickon123@localhost:5432/tickon
```

Supabase / Neon

```env
DATABASE_URL=postgresql://username:password@host:5432/tickon
```

---

## Authentication

| Variable                 | Required | Default | Description                        |
| ------------------------ | -------- | ------- | ---------------------------------- |
| `JWT_SECRET`             | Yes      | —       | Secret used to sign access tokens  |
| `JWT_REFRESH_SECRET`     | Yes      | —       | Secret used to sign refresh tokens |
| `JWT_EXPIRES_IN`         | No       | `7d`    | Access token expiration time       |
| `JWT_REFRESH_EXPIRES_IN` | No       | `30d`   | Refresh token expiration time      |

Generate secure secrets using:

```bash
openssl rand -hex 32
```

Example:

```env
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

---

## Cookies

| Variable        | Required | Default | Description                 |
| --------------- | -------- | ------- | --------------------------- |
| `COOKIE_SECRET` | Yes      | —       | Secret used to sign cookies |

---

## Cloudinary

| Variable                | Required | Description           |
| ----------------------- | -------- | --------------------- |
| `CLOUDINARY_CLOUD_NAME` | Yes      | Cloudinary cloud name |
| `CLOUDINARY_API_KEY`    | Yes      | Cloudinary API key    |
| `CLOUDINARY_API_SECRET` | Yes      | Cloudinary API secret |

Example:

```env
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-api-secret
```

---

## CORS

| Variable     | Required | Default                 | Description             |
| ------------ | -------- | ----------------------- | ----------------------- |
| `CLIENT_URL` | No       | `http://localhost:3000` | Allowed frontend origin |

Example

```env
CLIENT_URL=http://localhost:3000
```

---

## Rate Limiting

| Variable                  | Required | Default  | Description                                    |
| ------------------------- | -------- | -------- | ---------------------------------------------- |
| `RATE_LIMIT_WINDOW_MS`    | No       | `900000` | Rate limit window in milliseconds (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | No       | `100`    | Maximum requests per window                    |

---

# Frontend Environment Variables

**Location**

```text
apps/client/.env
```

---

## API

| Variable                 | Required | Default | Description                   |
| ------------------------ | -------- | ------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`    | Yes      | —       | Base URL for backend REST API |
| `NEXT_PUBLIC_SOCKET_URL` | Yes      | —       | Socket.IO server URL          |
| `NEXT_PUBLIC_CLIENT_URL` | No       | —       | Frontend base URL             |

Example

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

---

## Future Variables

These are not required for Version 1 but may be introduced later.

| Variable                   | Purpose                  |
| -------------------------- | ------------------------ |
| `NEXT_PUBLIC_APP_NAME`     | Application display name |
| `NEXT_PUBLIC_APP_VERSION`  | Display current version  |
| `NEXT_PUBLIC_SENTRY_DSN`   | Error monitoring         |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics integration    |

---

# Example Backend Environment File

```env
NODE_ENV=development

PORT=4000

DATABASE_URL=postgresql://tickon:tickon123@localhost:5432/tickon

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

COOKIE_SECRET=your-cookie-secret

CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

# Example Frontend Environment File

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

---

# Environment Variable Rules

## Never Commit Secrets

The following files must remain in `.gitignore`.

```text
apps/server/.env
apps/client/.env
```

Only commit:

```text
.env.example
```

---

## Keep `.env.example` Updated

Whenever a new environment variable is introduced:

1. Add it to `.env.example`.
2. Update this documentation.
3. Document whether it is required.
4. Explain its purpose.

---

## Fail Fast

Required environment variables should be validated during application startup.

If any required variable is missing:

- Display a clear error message.
- Stop application startup immediately.
- Do not continue with invalid configuration.

---

## Never Store Secrets in Code

Sensitive values must never appear in:

- Source code
- Git history
- Documentation
- Screenshots
- Pull requests
- Example files

Always use placeholder values.

Example:

```env
JWT_SECRET=your-secret-key
```

Never:

```env
JWT_SECRET=f8d91bc4ae18e5...
```

---

## `NEXT_PUBLIC_` Prefix

Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser code.

Everything else remains server-only.

Never place secrets inside variables beginning with `NEXT_PUBLIC_`.

---

# Environment Configuration

| Variable                  | Development                | Production              |
| ------------------------- | -------------------------- | ----------------------- |
| `NODE_ENV`                | `development`              | `production`            |
| `DATABASE_URL`            | Local PostgreSQL           | Supabase / Neon          |
| `CLIENT_URL`              | `http://localhost:3000`    | Production frontend URL |
| `RATE_LIMIT_WINDOW_MS`    | `900000`                   | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | `100`                      | `100`                   |

---

# Security Checklist

Before deploying ProjectOS:

- All secrets are stored in environment variables.
- `.env` files are excluded from Git.
- `.env.example` files are complete.
- No secret values appear in documentation.
- Production uses strong randomly generated secrets.
- HTTPS is enabled.
- Environment validation passes on startup.

Meeting these requirements ensures ProjectOS has a secure and maintainable configuration across development and production environments.
