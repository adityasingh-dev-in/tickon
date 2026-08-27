# ADR-001: Use PostgreSQL

**Date:** —
**Status:** Accepted

---

## Context

The project needs a primary data store for user accounts, projects, tasks, comments, notifications, and file metadata. The data is highly relational — entities like projects contain many tasks, tasks belong to columns, and users have many roles and settings. The team needs strong data integrity, complex query support, and mature tooling for a production application.

---

## Options Considered

### Option A — PostgreSQL

- **Pros:** Strong ACID guarantees, native joins and complex queries, mature ecosystem, excellent TypeScript support via Prisma, robust relational modeling.
- **Cons:** Requires schema migrations for structural changes, slightly steeper learning curve for schema design.

### Option B — MongoDB

- **Pros:** Flexible document model, natural fit for nested/hierarchical data, horizontal scaling, schemaless iteration speed.
- **Cons:** Weaker ACID guarantees for multi-document transactions, no native joins, less mature tooling for complex relational queries.

---

## Decision

PostgreSQL was chosen because the data model is inherently relational (projects contain tasks, tasks belong to columns, users have roles and settings) and the team prioritizes data integrity, complex query support, and mature tooling. Prisma provides robust schema definition, migration support, and excellent type-safe integration.

---

## Consequences

### Positive

- Strong data integrity with foreign keys and transactions
- Native support for complex queries, joins, and reporting
- Prisma provides excellent TypeScript integration and type-safety
- Mature ecosystem with strong tooling and community support

### Negative

- Schema changes require migrations — slightly slower iteration
- Object-relational impedance mismatch requires careful entity design
- More operational overhead for complex schema evolution

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
