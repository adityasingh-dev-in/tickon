# ADR-004: Authentication Strategy

**Date:** —
**Status:** Accepted

---

## Context

The system requires secure authentication for users. Since the frontend and backend are decoupled across different origins (or same origin in production but using an API layer), we must select a token delivery and validation mechanism that protects against XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery).

---

## Decision

We will use **JWTs stored in HTTP-Only, Secure cookies**. 

The strategy consists of:
1. **Access Token (Short-lived)**: E.g., 15 minutes. Stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
2. **Refresh Token (Long-lived)**: E.g., 7 days. Stored in a separate `Http.Only`, `Secure`, `SameSite=Strict` cookie.

### CSRF Considerations

Since we are using cookies for API authentication, we are vulnerable to CSRF attacks. To mitigate this, we will implement:
- **SameSite=Strict Cookie Attributes:** Ensures cookies are only sent in a first-party context. 
- **CSRF Tokens or Custom Header Checks:** The frontend will include a custom header (e.g., `X-Requested-With: XMLHttpRequest` or `X-Tickon-App: true`) on all mutating API requests. The NestJS backend will reject any mutating requests lacking this header, successfully thwarting CSRF attempts since cross-origin requests cannot set custom headers without triggering a preflight CORS check.
- **Strict CORS configuration:** The backend will only allow requests from the specific, verified frontend origin(s) without using wildcard `*`.

---

## Consequences

### Positive
- Immune to XSS attacks (unlike `localStorage` or `sessionStorage` token storage).
- Built-in browser mechanisms handle token delivery automatically.
- Refresh tokens provide seamless UX while minimizing the risk window of a compromised access token.

### Negative
- Requires careful handling of CORS and CSRF protections.
- Both Next.js and NestJS must be properly configured to handle cookies across potentially different ports in local development.
