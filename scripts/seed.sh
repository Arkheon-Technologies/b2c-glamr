#!/usr/bin/env bash
# seed.sh — Seed the database with beauty verticals and demo data
# Usage: ./scripts/seed.sh
set -euo pipefail

echo "=> Seeding GLAMR database..."

npx tsx scripts/seed-verticals.ts

echo "✅ Seed complete"
