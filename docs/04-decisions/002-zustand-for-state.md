# ADR-002: Zustand for State Management

**Date:** —
**Status:** Accepted

---

## Context

The frontend application needs a client-side state management solution for global state (auth, UI preferences, notification counts) and feature-specific state (board filters, active task). Server state (API data) is handled separately by TanStack Query, so the state management library only needs to handle client-owned state.

---

## Options Considered

### Option A — Zustand

- **Pros:** Minimal API (~2 KB), no boilerplate, no providers/context wrappers, works outside React components, TypeScript-friendly, easy to split into multiple stores.
- **Cons:** Smaller community than Redux, fewer middleware options, less opinionated (could lead to inconsistency without conventions).

### Option B — Redux Toolkit

- **Pros:** Established ecosystem, excellent devtools, large community, opinionated structure prevents chaos, middleware ecosystem (thunk, saga).
- **Cons:** Significant boilerplate (slices, reducers, actions, selectors), requires Provider wrapper, overkill for small-to-medium apps where server state is handled separately.

### Option C — Jotai / Recoil

- **Pros:** Atomic state model, fine-grained reactivity, minimal re-renders, React Suspense integration.
- **Cons:** Atomic model is harder to reason about for team-wide patterns, less intuitive for developers used to centralized stores, Recoil is experimental.

---

## Decision

Zustand was chosen because the client-owned state is small and focused (auth, UI, board filters). Zustand's minimal API eliminates boilerplate without sacrificing TypeScript support or testability. With TanStack Query handling server state, a full-featured solution like Redux is unnecessary overhead.

---

## Consequences

### Positive

- Near-zero boilerplate — stores are plain functions
- No Provider wrapper needed — simpler component tree
- Easy to split stores by domain (`useAuthStore`, `useBoardStore`, `useNotificationStore`)
- Can be used outside React (useful for interceptors, Socket.IO handlers)

### Negative

- Team must establish conventions for store structure and naming (not enforced by the library)
- DevTools are available but less polished than Redux DevTools
- Less community content / tutorials compared to Redux

---

## References

- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [TanStack Query](https://tanstack.com/query) (server state companion)
