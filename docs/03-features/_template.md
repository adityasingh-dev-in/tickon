# Feature: [Feature Name]

> One-line description of what this feature does.

---

## Status

**Status:** `planned` | `in-progress` | `shipped` | `deprecated`
**Owner:** @username
**Last Updated:** YYYY-MM-DD

---

## User Story

> As a [persona], I want to [action] so that [benefit].

---

## Requirements

| ID     | Requirement | Priority    | Status                                |
| ------ | ----------- | ----------- | ------------------------------------- |
| FR-001 | —           | P0/P1/P2/P3 | ⬜ Planned / 🔨 In Progress / ✅ Done |

---

## Behavior

Describe how the feature works from the user's perspective.

### Happy Path

1. Step one
2. Step two
3. Step three

### Edge Cases

| Scenario | Expected Behavior |
| -------- | ----------------- |
| —        | —                 |

### Error Handling

| Error | User-Facing Message | Technical Detail |
| ----- | ------------------- | ---------------- |
| —     | —                   | —                |

---

## UX Flow

Describe the UI flow or link to mockups.

```
Screen A → Action → Screen B → Result
```

---

## Data Model

> Reference the global data model or document feature-specific schema details here.

### Relevant Entities

| Entity | Role in This Feature |
| ------ | -------------------- |
| —      | —                    |

### Feature-Specific Fields

| Entity | Field | Type | Notes |
| ------ | ----- | ---- | ----- |
| —      | —     | —    | —     |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
| ------ | -------- | ----------- | ---- |
| —      | —        | —           | —    |

---

## State Management

> How client-side state is structured for this feature.

### Zustand Store

```typescript
// Example store structure
interface FeatureStore {
  // ...
}
```

### TanStack Query Keys

| Key | Purpose |
| --- | ------- |
| —   | —       |

---

## Component Hierarchy

```
FeaturePage
├── FeatureHeader
├── FeatureContent
│   ├── SubComponentA
│   └── SubComponentB
└── FeatureFooter
```

---

## Dependencies

| Dependency | Type                        | Notes |
| ---------- | --------------------------- | ----- |
| —          | Feature / Service / Package | —     |

---

## Out of Scope

- What this feature will **not** do in the current iteration.

---

## Implementation Notes

> Notes added during or after implementation that future developers should know.

---

## Related Documents

- [System Diagram](../02-architecture/01-system-diagram.md)
- [Data Model](../02-architecture/02-data-model.md)
