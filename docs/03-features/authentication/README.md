# Feature: Authentication

> Complete authentication and account management system for ProjectOS, including registration, login, session management, password recovery, profile management, and security.

---

# Status

| Property     | Value       |
| ------------ | ----------- |
| Status       | In Progress |
| Priority     | P0          |
| Last Updated | 2026-07-19  |

---

# Overview

The authentication system provides secure access to ProjectOS using **JWT authentication with HTTP-only cookies**.

It is responsible for:

- User registration
- Login
- Logout
- Session management
- Password recovery
- Account management
- Route protection
- Authentication middleware

Authentication is completely stateless.

---

# User Stories

## Registration

- As a new user, I want to create an account so I can use ProjectOS.

## Login

- As a registered user, I want to securely log in.

## Logout

- As a logged-in user, I want to securely end my session.

## Password Recovery

- As a user who forgot my password, I want to reset it securely.

## Profile

- As a user, I want to update my account information.

---

# Functional Requirements

| ID       | Requirement            | Priority | Status  |
| -------- | ---------------------- | -------- | ------- |
| AUTH-001 | Register account       | P0       | Planned |
| AUTH-002 | Login                  | P0       | Planned |
| AUTH-003 | Logout                 | P0       | Planned |
| AUTH-004 | Get current user       | P0       | Planned |
| AUTH-005 | Refresh authentication | P0       | Planned |
| AUTH-006 | Forgot password        | P1       | Planned |
| AUTH-007 | Reset password         | P1       | Planned |
| AUTH-008 | Update profile         | P1       | Planned |
| AUTH-009 | Upload avatar          | P2       | Planned |
| AUTH-010 | Change password        | P2       | Planned |
| AUTH-011 | Delete account         | Future   | Planned |
| AUTH-012 | Email verification     | Future   | Planned |

---

# Authentication Flow

```text
Register/Login

        │
        ▼

Validate Request

        │
        ▼

Controller

        │
        ▼

Authentication Service

        │
        ▼

MongoDB

        │
        ▼

Generate JWT Cookies

        │
        ▼

Browser

        │
        ▼

Authenticated Session
```

---

# Registration Workflow

```text
1. User opens Register page.

2. User submits:
   • Name
   • Email
   • Password

3. Client validates input.

4. POST /api/auth/register

5. Server validates request.

6. Email uniqueness checked.

7. Password hashed using bcrypt.

8. User created.

9. JWT cookies generated.

10. Cookies sent.

11. User profile returned.

12. Redirect Dashboard.
```

### Edge Cases

- Email already exists
- Invalid email
- Weak password
- Invalid request
- Database unavailable
- Duplicate submission

---

# Login Workflow

```text
1. User opens Login page.

2. User submits credentials.

3. Client validation.

4. POST /api/auth/login

5. Server validates request.

6. Find user.

7. Compare bcrypt hash.

8. Generate JWT cookies.

9. Return authenticated user.

10. Redirect Dashboard.
```

### Edge Cases

- Invalid email
- Wrong password
- User deleted
- User inactive
- Too many attempts
- Server unavailable

---

# Logout Workflow

```text
User clicks Logout

↓

POST /logout

↓

Clear Authentication Cookies

↓

Clear React Query Cache

↓

Reset Client State

↓

Disconnect Socket

↓

Redirect Login
```

---

# Session Refresh

Authentication cookies are automatically sent with every request.

```text
Browser

↓

Request

↓

Access Token Valid?

↓

Yes
↓

Continue

No

↓

Refresh Token Valid?

↓

Issue New Cookies

↓

Continue

Else

↓

Redirect Login
```

---

# Forgot Password

```text
1. User submits email.

2. Server generates reset token.

3. Token expires in 1 hour.

4. Email sent.

5. User opens reset link.

6. User enters new password.

7. Password updated.

8. Existing sessions invalidated.

9. Redirect Login.
```

### Edge Cases

- Invalid email
- Expired token
- Invalid token
- Used token
- Weak password

---

# Profile Management

Supported operations:

- View profile
- Update profile
- Upload avatar
- Change password

Future:

- Delete account
- Email verification

---

# API Endpoints

| Method | Endpoint                    | Auth    | Description     |
| ------ | --------------------------- | ------- | --------------- |
| POST   | `/api/auth/register`        | Public  | Register        |
| POST   | `/api/auth/login`           | Public  | Login           |
| POST   | `/api/auth/logout`          | Private | Logout          |
| POST   | `/api/auth/refresh`         | Cookie  | Refresh session |
| GET    | `/api/auth/me`              | Private | Current user    |
| POST   | `/api/auth/forgot-password` | Public  | Forgot password |
| POST   | `/api/auth/reset-password`  | Public  | Reset password  |
| PATCH  | `/api/auth/profile`         | Private | Update profile  |
| PATCH  | `/api/auth/avatar`          | Private | Upload avatar   |
| PATCH  | `/api/auth/change-password` | Private | Change password |

---

# User Model

| Field                | Type     | Notes               |
| -------------------- | -------- | ------------------- |
| _id                  | ObjectId | Primary key         |
| name                 | String   | Display name        |
| email                | String   | Unique              |
| password             | String   | bcrypt hash         |
| avatar               | Object   | Cloudinary metadata |
| bio                  | String   | Optional            |
| role                 | String   | User role           |
| preferences          | Object   | User settings       |
| isActive             | Boolean  | Soft delete         |
| isEmailVerified      | Boolean  | Future              |
| lastLoginAt          | Date     | Last login          |
| passwordChangedAt    | Date     | Security            |
| resetPasswordToken   | String   | Hashed              |
| resetPasswordExpires | Date     | Expiration          |
| createdAt            | Date     | Timestamp           |
| updatedAt            | Date     | Timestamp           |

---

# Validation Rules

## Name

- Required
- 2–50 characters

## Email

- Required
- Valid email format
- Unique

## Password

- Required
- Minimum 8 characters
- Uppercase
- Lowercase
- Number
- Special character

## Avatar

- Image only
- Maximum upload size
- Allowed MIME types only

---

# State Management

## Zustand

Stores only client UI state.

Examples:

- Loading state
- Authentication modal
- Preferences

## TanStack Query

Server state includes:

- Current user
- Session
- Profile
- Authentication status

---

# Security

## Password Security

- bcrypt hashing
- Never stored in plain text

## Cookie Security

- HTTP-only
- Secure (production)
- SameSite=Lax

## Request Validation

- Zod
- Server-side validation
- Client-side validation

## Middleware

- Authentication
- Authorization
- Rate limiting
- Error handling
- Helmet
- CORS

---

# Authorization

Version 1 uses ownership-based authorization.

A user may only access resources they own.

Future versions will support:

- Organizations
- Teams
- Roles
- Permissions

---

# Error Responses

| Status | Meaning               |
| ------ | --------------------- |
| 400    | Validation failed     |
| 401    | Authentication failed |
| 403    | Access denied         |
| 404    | User not found        |
| 409    | Email already exists  |
| 422    | Invalid request       |
| 429    | Too many requests     |
| 500    | Internal server error |

---

# Dependencies

### Backend

- Express
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- zod

### Frontend

- React Hook Form
- Zod
- TanStack Query
- Zustand

---

# Testing Checklist

- Register
- Login
- Logout
- Refresh session
- Forgot password
- Reset password
- Update profile
- Upload avatar
- Change password
- Route protection
- Cookie expiration
- Invalid JWT
- Expired JWT
- Rate limiting
- Validation errors

---

# Related Documents

- Security & Authentication
- Data Model
- Environment Variables
- System Diagram
- API Documentation
- User Model
- Project Overview
