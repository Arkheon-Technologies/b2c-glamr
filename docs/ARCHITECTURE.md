# GLAMR — System Architecture & Technical Design

> **Status**: Active
> **Stack**: Node/TypeScript API (NestJS Modular Monolith), Next.js Frontend.

---

## 1. System Architecture Overview
GLAMR conforms tightly to the company engineering baseline defined in `company-docs/`.

### 1.1 Repositories and Placement
GLAMR is operated as a monorepo built using **Turborepo** but placed within the standard portfolio structure defined by the playbook (`~/dev/products/b2c/glamr`).
It is composed of:
- `apps/web`: Next.js 16 consumer/business dashboard Application.
- `apps/api`: NestJS 11 Backend API.
- `packages/db`: Prisma schema, migrations, auto-generated TypeScript DB client.
- `packages/shared-types`: Core enum logic and schemas shared across web and api. 

### 1.2 The "Modular Monolith" Component Architecture (ADR-001)
As defined in `docs/adr/001-modular-monolith-nestjs.md`, GLAMR operates as a single deployment codebase composed of explicitly bounded modules instead of dispersed microservices.

**NestJS Domain Modules:**
1. **Auth**: Adheres to the exact `AUTH-BASELINE-CONTRACT.md` rules (JWT, standard error responses).
2. **Users**: User CRUD, customer profiles.
3. **Business**: Business CRUD, locations, verticals, settings.
4. **Services**: Service catalog, addons, bundles, resources.
5. **Scheduling**: Custom slots calculation respecting "split phases" and overlapping bookings.
6. **Booking**: Creation, lifecycle, rescheduling.
7. **Pricing**: Discount engines, package logic, loyalty.
8. **Portfolio**: Photo tracking, watermark logic, S3 integrations.
9. **Queue**: Realtime waitlist logic.

---

## 2. Evolution Based on Company Standards

Our initial design ideations proposed various structures, but GLAMR was officially aligned with the broader company pipeline:

1. **Authentication Baseline**: GLAMR uses the standardized company payload envelopes:
   - Success: `{ ok: true, data: { ... } }`
   - Errors apply uniform string codes: `{ ok: false, error: { code: 'AUTH_INVALID_CREDENTIALS', ...} }`.
2. **Node/Typescript Primacy**: A previous thought had entertained a parallel stack context, but we verified the company's `API-STACK-DECISION.md` dictates Node/TypeScript. The NestJS backend cleanly satisfies this constraint.
3. **Git Branch Protection & Release Lifecycle**: CI checks run standard `npm run lint`, `type-check`, and `test` gating actions via GitHub Actions.
4. **Local Tools Integration**: Deploys a standard `docker-compose.yml` for Postgres/Redis, utilizes an initialized `.nvmrc` strictly pinning Node.js v20+, and relies on `scripts/setup.sh` and `scripts/seed.sh` matching the broader project scaffolding behaviors.

---

## 3. Database Layer (PostgreSQL + Prisma)

- **PostgreSQL 16**: Primary datastore configured under `glamr_dev`.
- **Prisma ORM**: All interactions route through nested models defined in `packages/db/prisma/schema.prisma`.
- Maintains strict relation mappings ensuring business integrity (e.g. tracking `processing` times distinctly from `active` times on Appointments).
- See schema definitions for specifics on Walk-in Queue support, Referrals, Consents, and Service dependencies.
