#!/usr/bin/env bash
# setup.sh — First-time local setup for GLAMR
# Usage: ./scripts/setup.sh
set -euo pipefail

echo "=> GLAMR Local Setup"

# 1. Check Node version
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | tr -d 'v' | cut -d. -f1)
  REQUIRED=$(cat .nvmrc | tr -d '[:space:]')
  if [ "$NODE_VERSION" -lt "$REQUIRED" ]; then
    echo "❌ Node $REQUIRED+ required (found $NODE_VERSION). Run: nvm use"
    exit 1
  fi
  echo "✓ Node $(node -v)"
else
  echo "❌ Node not found. Install via nvm."
  exit 1
fi

# 2. Install dependencies
echo "=> Installing dependencies..."
npm install

# 3. Create .env.local from .env.example if missing
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "✓ Created .env.local from .env.example — fill in secret values"
else
  echo "✓ .env.local already exists"
fi

# 4. Symlink env for sub-packages that need it
if [ ! -f "packages/db/.env" ]; then
  echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/glamr_dev?schema=public\"" > packages/db/.env
  echo "✓ Created packages/db/.env for Prisma"
fi

if [ ! -f "apps/api/.env" ]; then
  cp .env.local apps/api/.env
  echo "✓ Created apps/api/.env"
fi

# 5. Generate Prisma client
echo "=> Generating Prisma client..."
npm run db:generate

# 6. Start Docker services
if command -v docker &>/dev/null; then
  echo "=> Starting Postgres + Redis..."
  docker compose up -d
  echo "✓ Docker services started"
else
  echo "⚠  Docker not found — start Postgres and Redis manually"
fi

# 7. Push schema to dev database
echo "=> Pushing schema to database..."
npm run db:push

echo ""
echo "✅ Setup complete! Run: npm run dev"
