# ADR-001: Modular Monolith with NestJS

Date: 2026-04-06
Status: Accepted

## Context

GLAMR needs a backend architecture that supports complex beauty-industry domain logic
(split-phase scheduling, multi-resource booking, portfolio management) while remaining
manageable for a small team during MVP. We evaluated three options:

1. **Microservices** — Full isolation, independent deployment per domain.
2. **Monolith** — Single codebase, single deployment unit.
3. **Modular Monolith** — Single deployment unit with enforced module boundaries, designed for future extraction.

## Decision

Use a **Modular Monolith** built with **NestJS** (Node/TypeScript).

- Each domain (auth, business, services, scheduling, booking, portfolio, reviews, queue) is a self-contained NestJS module.
- Modules communicate through injected services, not direct database access across boundaries.
- Prisma is accessed through a global `DatabaseModule` providing `PrismaService`.
- The architecture aligns with the company API stack decision (Node/TypeScript primary).

## Consequences

**Benefits:**
- Single deployment simplifies ops during MVP phase.
- Module boundaries prevent spaghetti — each module has controller/service/DTOs.
- NestJS DI system enforces module encapsulation.
- Future extraction to microservices follows module boundaries naturally.

**Trade-offs:**
- NestJS adds framework overhead vs. bare Express/Fastify.
- All modules share the same Prisma schema — no per-module schema isolation.
- Must be disciplined about not importing across module boundaries.
