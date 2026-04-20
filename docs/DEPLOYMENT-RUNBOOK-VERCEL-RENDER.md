# GLAMR Deployment Runbook

This runbook is the source of truth for the current no-cost starter topology:

- Web: Vercel
- API: Render
- Database: free managed Postgres provider (Neon or Supabase)
- CI/CD orchestration: GitHub Actions

Use this for first-time setup. It is optimized for zero-cost setup and one Render API service.

## 1. Deployment Model

Environments:

1. local: developer machine only
2. cloud-shared: one online environment used by staging and production workflows until you upgrade

Rules:

1. Local Postgres is only for local development.
2. Cloud deploy uses one shared Postgres instance in free mode.
3. Database migrations run before API deploy in apply mode.
4. Deploy workflows run dry-run first, then apply.

## 2. Accounts You Need

Create or verify access to:

1. GitHub account with admin access to the repository
2. Render account on a free plan
3. Vercel account on Hobby (free)
4. Neon or Supabase account on free tier for Postgres

Recommended org-level pattern:

1. Keep API in one Render team/project boundary.
2. Keep Web in one Vercel team/project boundary.
3. Keep all deploy secrets and IDs in GitHub Actions, not in code.

## 3. GitHub Setup Steps

1. Open GitHub and confirm you can access repo settings.
2. Open Settings -> Secrets and variables -> Actions.
3. Confirm both sections are available:
   - Variables
   - Secrets
4. Do not enter values yet. You will collect them from Render and Vercel first.

## 4. Render Setup Steps

### 4.1 Create Account and Team

1. Go to Render and create account.
2. Verify email.
3. Create or select your team/workspace.
4. Stay on free plan for now.

### 4.2 Create One API Service

Create one Render Web Service from this repository:

1. glamr-api

Configuration:

1. Runtime: Node
2. Root Directory: leave empty (repository root)
3. Build command:
   npm ci && npm run db:generate && npm run build --workspace=@glamr/api
4. Start command:
   npm run start:prod --workspace=@glamr/api
5. Auto-Deploy: On Commit (or Off if you want only GitHub workflow-driven deploys)

Optional build filters for monorepo efficiency:

1. Included paths: apps/api/**
2. Included paths: packages/db/**
3. Included paths: packages/shared-types/**

After service creation:

1. Copy Service ID from Render dashboard.
2. Save it as your single service ID.

### 4.3 Set API Runtime Environment Variables in Render

Set these in Render service environment:

Required:

1. DATABASE_URL
2. JWT_SECRET
3. FRONTEND_URL
4. APP_ENV

Value notes:

1. Set FRONTEND_URL without trailing slash (example: https://glamr-web.vercel.app).
2. For Supabase, use DATABASE_URL with sslmode=require.
   Example format: postgresql://postgres:<password>@<host>:5432/postgres?sslmode=require

Recommended value for APP_ENV in free mode:

1. staging

Recommended optional:

1. JWT_ACCESS_TTL_SECONDS (default 900)
2. JWT_REFRESH_TTL_DAYS (default 7)
3. AUTH_RESET_TOKEN_TTL_MINUTES (default 30)

Optional email:

1. SENDGRID_API_KEY
2. SENDGRID_FROM_EMAIL

Optional storage (if portfolio uploads are needed):

1. STORAGE_BUCKET
2. STORAGE_REGION
3. STORAGE_ENDPOINT
4. STORAGE_PUBLIC_BASE_URL
5. STORAGE_ACCESS_KEY_ID
6. STORAGE_SECRET_ACCESS_KEY
7. STORAGE_FORCE_PATH_STYLE

Legacy fallback storage keys supported by code:

1. AWS_S3_BUCKET
2. AWS_REGION
3. AWS_S3_PUBLIC_BASE_URL
4. AWS_ACCESS_KEY_ID
5. AWS_SECRET_ACCESS_KEY

### 4.4 Free Postgres Setup (Neon or Supabase)

Render Postgres is not used in zero-cost mode.

Create one free Postgres project:

1. neon-glamr or supabase-glamr

Then:

1. Copy the connection string with SSL enabled.
2. Use this same DATABASE_URL in Render API service.
3. Use this same DATABASE_URL in GitHub Actions secret for now.

### 4.5 Create Render API Key (for GitHub Actions)

You need this key so GitHub Actions can trigger Render deploys.

1. Open Render dashboard.
2. Open Account Settings (top-right profile menu).
3. Open API Keys.
4. Click Create API Key.
5. Name it: glamr-github-actions.
6. Copy the key immediately and store it securely (Render shows it once).

Use this value for GitHub secret:

1. RENDER_API_KEY

### 4.6 Find Render Public API URL (for Vercel)

Use the service URL shown in Render service details under Domains.

Example:

1. https://glamr-api.onrender.com

Your web app API base URL should be:

1. https://glamr-api.onrender.com/api/v1

Important:

1. Outbound IP addresses in Render are egress IP ranges for traffic leaving your service.
2. They are not your public API URL and should not be used in NEXT_PUBLIC_API_URL.

## 5. Vercel Setup Steps

### 5.1 Create Account and Team

1. Go to Vercel and create account.
2. Verify email.
3. Create or select your team/workspace.
4. Stay on Hobby (free) for now.

### 5.2 Import Web Project

1. Import the repository.
2. Framework should auto-detect Next.js.
3. Set Root Directory to apps/web.
4. Keep default build command for Next.js unless custom override is needed.

### 5.3 Set Web Environment Variables in Vercel

Required in both Preview and Production scopes:

1. NEXT_PUBLIC_API_URL

Value pattern:

1. In free mode, Preview and Production can both point to the same API URL with /api/v1.
2. After environment split, set Preview to staging API URL and Production to production API URL.

### 5.4 Capture Vercel IDs/Tokens

Collect these for GitHub Actions:

1. VERCEL_ORG_ID
2. VERCEL_WEB_PROJECT_ID
3. VERCEL_TOKEN (create via Vercel account token page)

If you deploy from a personal Vercel account:

1. VERCEL_ORG_ID is your personal account/team ID.
2. You can verify in Project Settings -> General (Project ID and Team/Org ID).

Note: VERCEL_API_PROJECT_ID is optional in this topology. It is only needed if API is deployed to Vercel.

## 6. GitHub Actions Variables and Secrets

After collecting Render and Vercel values, set these in GitHub:

Variables (required):

1. VERCEL_ORG_ID
2. VERCEL_WEB_PROJECT_ID

API service ID (choose one mode):

1. Single-service mode: RENDER_API_SERVICE_ID
2. Split mode: RENDER_API_SERVICE_ID_STAGING and RENDER_API_SERVICE_ID_PRODUCTION

Secrets (required):

1. RENDER_API_KEY
2. VERCEL_TOKEN

Database URL (choose one mode):

1. Single-db mode: DATABASE_URL
2. Split mode: DATABASE_URL_STAGING and DATABASE_URL_PRODUCTION

Optional variables:

1. DEPLOY_API_COMMAND_STAGING
2. DEPLOY_API_COMMAND_PRODUCTION
3. DEPLOY_WEB_COMMAND_STAGING
4. DEPLOY_WEB_COMMAND_PRODUCTION
5. DEPLOY_API_MIGRATE_COMMAND_STAGING
6. DEPLOY_API_MIGRATE_COMMAND_PRODUCTION
7. VERCEL_API_PROJECT_ID

Optional secret:

1. DISCORD_WEBHOOK_URL

## 7. First Deployment Sequence

First-time database bootstrap (one-time):

1. If this is the first cloud deploy and no migration history exists yet, run:
   DATABASE_URL="<your_database_url>" npm run db:push
2. After schema exists in cloud DB, continue with deploy workflow steps below.

Detailed first-time bootstrap steps:

1. On your machine, open terminal in repository root.
2. Export cloud DB URL with SSL mode.
   Example: export DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres?sslmode=require"
3. Run Prisma schema push once:
   npm run db:push
4. Verify tables were created in Supabase Table Editor.
5. Keep deploy migrations enabled in workflows for future migration files.

1. Trigger Deploy Staging workflow with dry_run=true.
2. Confirm preflight result and dry-run command wiring.
3. Fix any missing vars/secrets until strict preflight passes.
4. Trigger Deploy Staging with dry_run=false.
5. Validate smoke checks.
6. Optional: Trigger Deploy Production with dry_run=true. In free mode it can point to the same API service and DB.

Smoke checks:

1. API health endpoint responds: /api/v1/health
2. Web homepage loads
3. Auth register/login flow works
4. Explore and booking pages load without runtime errors

## 8. Migration Meaning and Process

Migration definition:

1. A migration is a versioned database schema change tracked in repository code.

Local migration workflow:

1. Change Prisma schema
2. Run migration creation in development
3. Commit migration files

Deployed migration workflow:

1. CI/deploy job runs migrate deploy before API rollout
2. If migration fails, API deploy must not proceed

Safety rule:

1. Do not do manual production schema edits in DB console.

## 9. Standardization Across Future Projects

Use this exact baseline while projects are in free mode:

1. Web on Vercel
2. API on Render
3. DB on Neon or Supabase free tier
4. Same variable names and workflow names
5. Same preflight dry-run then strict apply process

Scale-up upgrade path later:

1. Split API into separate staging and production Render services.
2. Split DB into separate staging and production managed Postgres instances.
3. Replace shared secrets with environment-specific secrets.

Governance standard:

1. Protected branches
2. PR-only merges
3. Required CI checks
4. Secrets in provider/GitHub only

## 10. Handoff Template: Send These Back To Copilot

When platform setup is complete, provide values for:

1. RENDER_API_SERVICE_ID
2. RENDER_API_KEY
3. DATABASE_URL
4. VERCEL_ORG_ID
5. VERCEL_WEB_PROJECT_ID
6. VERCEL_TOKEN
7. API base URL
8. Web URL

Optional if you already split environments:

1. RENDER_API_SERVICE_ID_STAGING
2. RENDER_API_SERVICE_ID_PRODUCTION
3. DATABASE_URL_STAGING
4. DATABASE_URL_PRODUCTION
5. Staging API base URL
6. Production API base URL
7. Staging web URL
8. Production web URL

Optional if already prepared:

1. DISCORD_WEBHOOK_URL
2. SENDGRID_API_KEY
3. SENDGRID_FROM_EMAIL
4. STORAGE_* values

Once you send these, the remaining configuration and validation can be automated from this repo.