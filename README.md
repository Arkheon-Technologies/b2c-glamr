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
| `STORAGE_BUCKET` | No | Primary S3-compatible bucket name (preferred over AWS keys) |
| `STORAGE_REGION` | No | Primary storage region (or `auto` for providers that support it) |
| `STORAGE_ENDPOINT` | No | Custom S3-compatible endpoint (e.g. Cloudflare R2 endpoint) |
| `STORAGE_PUBLIC_BASE_URL` | No | Public base URL used to build asset URLs |
| `NEXT_PUBLIC_API_URL` | Yes | API URL for frontend |

See `.env.example` for complete list.

## Deployment

See `.github/workflows/` for CI/CD pipelines.

- `ci.yml` — Runs on pull requests and pushes: lint, type-check, test, build
- `deploy-staging.yml` — Runs on pushes to `staging` (and supports manual dispatch)
- `deploy-production.yml` — Runs on pushes to `main` (and supports manual dispatch)

Deployment scripts are provider-agnostic and default to dry-run mode.

```bash
npm run deploy:staging                  # Dry-run API + web deploy
npm run deploy:staging -- --apply       # Execute API + web deploy
npm run deploy:staging:api -- --apply   # Execute API deploy only
npm run deploy:staging:web -- --apply   # Execute web deploy only

npm run deploy:production               # Dry-run API + web deploy
npm run deploy:production -- --apply    # Execute API + web deploy
npm run deploy:production:api -- --apply
npm run deploy:production:web -- --apply
```

Default deployment topology for this repo:

- API: Render
- Web: Vercel
- Database: Neon/Supabase free-tier Postgres in free mode (single shared DB URL)

Free mode supports one Render API service for now. Workflows accept shared values and can be split later without code changes.

For full first-time account/project setup steps, see:

- `docs/DEPLOYMENT-RUNBOOK-VERCEL-RENDER.md`

See runbook details for:

- Render API key creation (for `RENDER_API_KEY`)
- Render public API URL vs outbound IP clarification
- First-time cloud DB bootstrap (`db:push` one-time)

Configure repository settings in GitHub Actions.

Required variables:

- `VERCEL_ORG_ID`
- `VERCEL_WEB_PROJECT_ID`

Required API service ID values (choose one mode):

- Single-service: `RENDER_API_SERVICE_ID`
- Split environments: `RENDER_API_SERVICE_ID_STAGING` and `RENDER_API_SERVICE_ID_PRODUCTION`

Required secrets:

- `RENDER_API_KEY`
- `VERCEL_TOKEN`

Required database URL values (choose one mode):

- Single-db: `DATABASE_URL`
- Split environments: `DATABASE_URL_STAGING` and `DATABASE_URL_PRODUCTION`

Optional variables:

- `DEPLOY_API_COMMAND_STAGING`
- `DEPLOY_WEB_COMMAND_STAGING`
- `DEPLOY_API_COMMAND_PRODUCTION`
- `DEPLOY_WEB_COMMAND_PRODUCTION`
- `DEPLOY_API_MIGRATE_COMMAND_STAGING` (default: `npm run migrate:prod --workspace=@glamr/db`)
- `DEPLOY_API_MIGRATE_COMMAND_PRODUCTION` (default: `npm run migrate:prod --workspace=@glamr/db`)
- `VERCEL_API_PROJECT_ID` (only needed if API deploys to Vercel)

Manual workflow dispatch includes a `dry_run` toggle so command wiring can be validated safely.

Manual setup checklist (Render + Vercel):

1. Create one Render API service and copy its service ID.
	Keep Render Root Directory empty (repository root) so monorepo workspace commands resolve correctly.
	Set Render Health Check Path to `/api/v1/health`.
2. Create one free Postgres database in Neon or Supabase and copy its connection string.
	If using Supabase, append `?sslmode=require` to DATABASE_URL.
	The database must allow inbound connections from Render; otherwise Prisma will fail with `P1001`.
3. Open repository settings: `Settings -> Secrets and variables -> Actions`.
4. Add variables:
	`RENDER_API_SERVICE_ID` (or env-specific IDs), `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID`.
5. Add secrets:
	`RENDER_API_KEY`, `VERCEL_TOKEN`, `DATABASE_URL` (or env-specific DB URLs).
6. In Render service env, set `FRONTEND_URL` without trailing slash (example: `https://glamr-web.vercel.app`).
7. Optionally add custom deploy command overrides:
	`DEPLOY_API_COMMAND_STAGING`, `DEPLOY_WEB_COMMAND_STAGING`,
	`DEPLOY_API_COMMAND_PRODUCTION`, `DEPLOY_WEB_COMMAND_PRODUCTION`.
8. Trigger `Deploy Staging` manually with `dry_run=true`.
9. Optional: Trigger `Deploy Production` manually with `dry_run=true`.
10. After verification, run staging with `dry_run=false` (and production if you are using it).

If cloud DB is brand-new and migrations are not yet established, run a one-time schema bootstrap first:

```bash
DATABASE_URL="<postgres_connection_url>" npm run db:push
```

If you use GitHub CLI, you can set values manually with placeholders like this:

```bash
gh variable set RENDER_API_SERVICE_ID --body "<render_api_service_id>"
gh variable set VERCEL_ORG_ID --body "<vercel_org_id>"
gh variable set VERCEL_WEB_PROJECT_ID --body "<vercel_web_project_id>"

gh secret set RENDER_API_KEY --body "<render_api_key>"
gh secret set VERCEL_TOKEN --body "<vercel_token>"
gh secret set DATABASE_URL --body "<postgres_connection_url>"
```

Or use the repository helper script (dry-run by default, non-destructive unless `--overwrite` is passed):

```bash
chmod +x scripts/bootstrap-github-deploy-config.sh

RENDER_API_SERVICE_ID="<render_api_service_id>" \
VERCEL_ORG_ID="<vercel_org_id>" \
VERCEL_WEB_PROJECT_ID="<vercel_web_project_id>" \
RENDER_API_KEY="<render_api_key>" \
VERCEL_TOKEN="<vercel_token>" \
DATABASE_URL="<postgres_connection_url>" \
./scripts/bootstrap-github-deploy-config.sh --repo "<owner>/<repo>"

# Apply after reviewing dry-run output:
RENDER_API_SERVICE_ID="<render_api_service_id>" \
VERCEL_ORG_ID="<vercel_org_id>" \
VERCEL_WEB_PROJECT_ID="<vercel_web_project_id>" \
RENDER_API_KEY="<render_api_key>" \
VERCEL_TOKEN="<vercel_token>" \
DATABASE_URL="<postgres_connection_url>" \
./scripts/bootstrap-github-deploy-config.sh --repo "<owner>/<repo>" --apply
```

## Contributing

See [PR template](.github/PULL_REQUEST_TEMPLATE.md). Follow [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(auth): add Google OAuth login
fix(booking): prevent double-charge on retry
chore(deps): upgrade Next.js to 16.3
```
