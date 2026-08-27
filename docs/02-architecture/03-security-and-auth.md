# Security & Authentication

> Security architecture, authentication flow, authorization model, and application-wide security practices used throughout ProjectOS.

---

# Security Principles

ProjectOS follows several core security principles:

- Secure by default
- Least privilege access
- Fail fast on invalid configuration
- Never trust client input
- Validate everything
- Keep authentication stateless
- Protect sensitive data at every layer

---

# Authentication Strategy

ProjectOS uses **JWT authentication** with **HTTP-only cookies**.

Authentication is completely stateless.

| Component        | Technology         | Purpose                    |
| ---------------- | ------------------ | -------------------------- |
| Password Hashing | bcrypt             | Secure password storage    |
| Access Token     | JWT                | Authenticates API requests |
| Refresh Token    | JWT                | Issues new access tokens   |
| Cookie Storage   | HTTP-only Cookies  | Prevent JavaScript access  |
| Authentication   | Express Middleware | Protect private routes     |

---

# Authentication Flow

```text
User
 │
 ▼
Login Request
 │
 ▼
Express
 │
 ├── Validate credentials
 ├── Compare password using bcrypt
 ├── Generate Access Token
 └── Generate Refresh Token
 │
 ▼
HTTP-only Cookies
 │
 ▼
Browser

Future Requests

Browser
 │
 ├── Cookies automatically sent
 ▼
Authentication Middleware
 │
 ├── Verify JWT
 ├── Load User
 └── Continue request
```

---

# Login Process

1. User submits email and password.
2. Input is validated using Zod.
3. Password is compared using bcrypt.
4. Access and refresh tokens are generated.
5. Tokens are stored in secure HTTP-only cookies.
6. User information is returned.
7. Protected routes automatically receive authentication cookies.

---

# Logout Process

During logout:

- Authentication cookies are cleared.
- Client state is reset.
- Cached API data is removed.
- Socket connection is disconnected.

Since JWTs are stateless, logout removes the client's ability to authenticate by clearing the cookies.

---

# Route Protection

Every protected endpoint passes through authentication middleware.

```text
Incoming Request
        │
        ▼
Authentication Middleware
        │
        ▼
JWT Verification
        │
        ▼
User Lookup
        │
        ▼
Protected Controller
```

Public routes bypass authentication.

Examples:

- Register
- Login
- Forgot Password
- Reset Password

---

# Authorization

Version 1 is ownership-based.

Users can only access resources they own.

Example:

```text
User A

Projects
Tasks
Clients
Files

Cannot access

User B's Projects
User B's Tasks
User B's Clients
```

Future versions will introduce:

- Organizations
- Teams
- Roles
- Permissions

---

# Password Security

Passwords are never stored in plain text.

Passwords are:

- Hashed using bcrypt
- Salted automatically
- Compared securely

Minimum password requirements:

- Minimum length
- Mixed character types
- Validation on both client and server

---

# Cookie Security

Authentication cookies use:

| Setting   | Value           |
| --------- | --------------- |
| HTTP Only | Yes             |
| Secure    | Production only |
| SameSite  | Lax             |
| Path      | `/`             |

This protects against:

- XSS token theft
- Client-side JavaScript access
- Accidental exposure

---

# Request Validation

Every request is validated using Zod.

Validation occurs before business logic executes.

Typical validation includes:

- Required fields
- Email format
- Password rules
- Object IDs
- Query parameters
- File metadata

Invalid requests immediately return validation errors.

---

# File Upload Security

Every upload is validated.

Checks include:

- File type
- File size
- Allowed MIME types
- Maximum upload limit

Uploaded files are stored in Cloudinary instead of the application server.

Only file metadata is stored in MongoDB.

---

# Security Middleware

Global middleware includes:

| Middleware     | Purpose                 |
| -------------- | ----------------------- |
| Helmet         | Secure HTTP headers     |
| CORS           | Cross-origin protection |
| Cookie Parser  | Cookie handling         |
| Rate Limiter   | Prevent abuse           |
| Authentication | JWT verification        |
| Error Handler  | Safe error responses    |
| Request Logger | Request monitoring      |

---

# CORS Policy

Allowed origins are configured using environment variables.

Typical configuration:

```text
Allowed Origin

http://localhost:3000
```

Production:

```text
https://app.projectos.com
```

Credentials are enabled because authentication relies on cookies.

---

# Security Headers

Helmet automatically configures headers such as:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Strict Transport Security

---

# Rate Limiting

Rate limiting protects public endpoints.

| Route          | Limit               |
| -------------- | ------------------- |
| Login          | 5 requests/minute   |
| Register       | 5 requests/minute   |
| Password Reset | 5 requests/minute   |
| General API    | 100 requests/minute |
| File Upload    | 10 requests/minute  |

---

# Common Threats

| Threat              | Protection                             |
| ------------------- | -------------------------------------- |
| XSS                 | HTTP-only cookies, React escaping, CSP |
| CSRF                | SameSite cookies, CORS                 |
| Brute Force         | Rate limiting                          |
| NoSQL Injection     | Zod validation, Mongoose validation    |
| Invalid Input       | Server-side validation                 |
| Unauthorized Access | Authentication middleware              |
| File Upload Abuse   | MIME type and size validation          |

---

# Environment Security

Sensitive information is never stored in source code.

Secrets are loaded from environment variables.

Examples:

- JWT secrets
- Database connection string
- Cloudinary credentials

The application validates required environment variables during startup and exits immediately if any are missing.

---

# Security Responsibilities

| Layer      | Responsibility                        |
| ---------- | ------------------------------------- |
| Frontend   | Input validation, secure requests     |
| Middleware | Authentication and request validation |
| Services   | Authorization and business rules      |
| Database   | Schema validation and data integrity  |
| Cloudinary | Secure file storage                   |

---

# Future Security Improvements

As ProjectOS evolves, additional security features may include:

- Multi-factor authentication (MFA)
- Email verification
- Device/session management
- Login history
- Refresh token rotation
- Organization-level permissions
- Audit logs
- Security notifications
- Single Sign-On (SSO)

These features are intentionally deferred until after Version 1 to keep the authentication system simple while maintaining production-grade security.
