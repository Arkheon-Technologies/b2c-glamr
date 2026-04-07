# GLAMR

> The operating system for beauty professionals — a multi-sided booking marketplace purpose-built for the beauty and aesthetics industry.

## Architecture Overview

GLAMR is a **modular monolith** (designed for future microservice extraction):

- **Frontend**: Next.js 16 (App Router, Tailwind v4) — `apps/web`
- **Backend**: NestJS 11 (TypeScript, modular DI) — `apps/api`
- **Database**: PostgreSQL 16 with Prisma ORM — `packages/db`
- **Cache/Locks**: Redis 7 — slot locking, session cache
- **Shared Types**: Cross-app TypeScript types — `packages/shared-types`

See [ADR-001](docs/adr/001-modular-monolith-nestjs.md) for architecture decision rationale.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.x |
| Styling | Tailwind CSS | 4.x |
| Backend | NestJS | 11.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 6.x |
| Cache | Redis | 7.x |
| Auth | JWT + bcrypt | Custom |
| Payments | Stripe Connect | (planned) |
| Monorepo | Turborepo | 2.x |
| Runtime | Node.js | 20+ |

## Prerequisites

- Node v20+ (see `.nvmrc`)
- npm 10+ (will migrate to pnpm)
- Docker / OrbStack (for local Postgres + Redis)
- Required env vars: see `.env.example`

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url>
cd glamr
cp .env.example .env.local

# 2. Start infrastructure
docker compose up -d

# 3. Install + setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Run development servers
npm run dev
```

The web app runs at `http://localhost:3000`, the API at `http://localhost:4000/api/v1`.

## Development

```bash
npm run dev           # Start all apps (web + api)
npm run dev:web       # Start web only
npm run dev:api       # Start api only
npm run build         # Build all packages
npm run lint          # Lint all packages
npm run db:generate   # Regenerate Prisma client
npm run db:push       # Push schema to dev database
npm run db:migrate    # Create migration
npm run db:studio     # Open Prisma Studio
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `API_PORT` | No | API port (default: 4000) |
| `FRONTEND_URL` | No | CORS origin (default: http://localhost:3000) |
| `STRIPE_SECRET_KEY` | No | Stripe test secret key |
| `SENDGRID_API_KEY` | No | Email delivery |
| `NEXT_PUBLIC_API_URL` | Yes | API URL for frontend |

See `.env.example` for complete list.

## Deployment

See `.github/workflows/` for CI/CD pipelines.

- `ci.yml` — Runs on every push: lint, type-check, build
- Staging and production workflows forthcoming

## Contributing

See [PR template](.github/PULL_REQUEST_TEMPLATE.md). Follow [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(auth): add Google OAuth login
fix(booking): prevent double-charge on retry
chore(deps): upgrade Next.js to 16.3
```
