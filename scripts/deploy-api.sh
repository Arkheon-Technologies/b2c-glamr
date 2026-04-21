#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-api.sh <staging|production> [--apply|--dry-run]

Default mode is dry-run.
Use --apply to execute deployment commands.

Environment variables:
  DEPLOY_API_COMMAND          Provider-specific API deploy command.
  DEPLOY_API_MIGRATE_COMMAND  API migration command.
  DEPLOY_API_PLATFORM         Provider hint for API deploys (e.g. render, vercel).
  DEPLOY_PLATFORM             Fallback provider hint for both targets.
  RUN_DB_MIGRATIONS           true|false (default: true).
  APP_ENV                     Defaults to the selected environment.
  DRY_RUN                     true|false (overrides --apply/--dry-run).

Vercel mode (DEPLOY_PLATFORM=vercel):
  If DEPLOY_API_COMMAND is unset, an automatic command is built from:
    VERCEL_TOKEN
    VERCEL_ORG_ID
    VERCEL_API_PROJECT_ID

Render mode (DEPLOY_PLATFORM=render):
  If DEPLOY_API_COMMAND is unset, an automatic command is built from:
    RENDER_API_KEY
    RENDER_API_SERVICE_ID
EOF
}

normalize_bool() {
  local raw="${1:-}"
  local lower

  lower="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"

  case "$lower" in
    1|true|yes|y|on)
      printf '%s' "true"
      ;;
    0|false|no|n|off)
      printf '%s' "false"
      ;;
    *)
      return 1
      ;;
  esac
}

run_shell_command() {
  local label="$1"
  local command="$2"

  echo "==> ${label}"
  if [[ "$APPLY" == "true" ]]; then
    /usr/bin/env bash -lc "$command"
  else
    echo "[dry-run] ${command}"
  fi
}

ENVIRONMENT="${1:-}"
if [[ -z "$ENVIRONMENT" ]]; then
  usage
  exit 1
fi
shift || true

case "$ENVIRONMENT" in
  staging|production)
    ;;
  *)
    echo "Invalid environment: ${ENVIRONMENT}" >&2
    usage
    exit 1
    ;;
esac

APPLY="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY="true"
      ;;
    --dry-run)
      APPLY="false"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown flag: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift

done

if [[ -n "${DRY_RUN:-}" ]]; then
  if dry_run_value="$(normalize_bool "$DRY_RUN")"; then
    if [[ "$dry_run_value" == "true" ]]; then
      APPLY="false"
    else
      APPLY="true"
    fi
  else
    echo "Invalid DRY_RUN value: ${DRY_RUN}" >&2
    exit 1
  fi
fi

MIGRATE_COMMAND="${DEPLOY_API_MIGRATE_COMMAND:-npm run migrate:prod --workspace=@glamr/db}"
DEPLOY_COMMAND="${DEPLOY_API_COMMAND:-}"
PLATFORM_LOWER="$(printf '%s' "${DEPLOY_API_PLATFORM:-${DEPLOY_PLATFORM:-}}" | tr '[:upper:]' '[:lower:]')"

if run_migrations="$(normalize_bool "${RUN_DB_MIGRATIONS:-true}")"; then
  :
else
  echo "Invalid RUN_DB_MIGRATIONS value: ${RUN_DB_MIGRATIONS:-}" >&2
  exit 1
fi

export APP_ENV="${APP_ENV:-$ENVIRONMENT}"

echo "API deploy target: ${ENVIRONMENT}"
echo "Deploy platform: ${PLATFORM_LOWER:-unset}"
echo "APP_ENV: ${APP_ENV}"
echo "Mode: $( [[ "$APPLY" == "true" ]] && echo apply || echo dry-run )"

if [[ -z "$DEPLOY_COMMAND" && "$PLATFORM_LOWER" == "vercel" ]]; then
  vercel_missing=()
  if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    vercel_missing+=("VERCEL_TOKEN")
  fi
  if [[ -z "${VERCEL_ORG_ID:-}" ]]; then
    vercel_missing+=("VERCEL_ORG_ID")
  fi
  if [[ -z "${VERCEL_API_PROJECT_ID:-}" ]]; then
    vercel_missing+=("VERCEL_API_PROJECT_ID")
  fi

  if [[ ${#vercel_missing[@]} -eq 0 ]]; then
    if [[ "$ENVIRONMENT" == "production" ]]; then
      DEPLOY_COMMAND='VERCEL_ORG_ID="$VERCEL_ORG_ID" VERCEL_PROJECT_ID="$VERCEL_API_PROJECT_ID" npx --yes vercel deploy --cwd apps/api --token "$VERCEL_TOKEN" --prod'
    else
      DEPLOY_COMMAND='VERCEL_ORG_ID="$VERCEL_ORG_ID" VERCEL_PROJECT_ID="$VERCEL_API_PROJECT_ID" npx --yes vercel deploy --cwd apps/api --token "$VERCEL_TOKEN"'
    fi
    echo "==> Using auto-generated Vercel API deploy command"
  elif [[ "$APPLY" == "true" ]]; then
    echo "Vercel API deploy requires: ${vercel_missing[*]}" >&2
    exit 1
  else
    echo "==> Vercel API auto-command unavailable in dry-run mode; missing: ${vercel_missing[*]}"
  fi
fi

if [[ -z "$DEPLOY_COMMAND" && "$PLATFORM_LOWER" == "render" ]]; then
  render_missing=()
  if [[ -z "${RENDER_API_KEY:-}" ]]; then
    render_missing+=("RENDER_API_KEY")
  fi
  if [[ -z "${RENDER_API_SERVICE_ID:-}" ]]; then
    render_missing+=("RENDER_API_SERVICE_ID")
  fi

  if [[ ${#render_missing[@]} -eq 0 ]]; then
    DEPLOY_COMMAND='curl --fail --silent --show-error --request POST --url "https://api.render.com/v1/services/${RENDER_API_SERVICE_ID}/deploys" --header "Authorization: Bearer ${RENDER_API_KEY}" --header "Accept: application/json"'
    echo "==> Using auto-generated Render API deploy command"
  elif [[ "$APPLY" == "true" ]]; then
    echo "Render API deploy requires: ${render_missing[*]}" >&2
    exit 1
  else
    echo "==> Render API auto-command unavailable in dry-run mode; missing: ${render_missing[*]}"
  fi
fi

if [[ "$run_migrations" == "true" && "$APPLY" == "true" && -z "${DATABASE_URL:-}" && -z "${DIRECT_URL:-}" ]]; then
  echo "DATABASE_URL or DIRECT_URL is required when RUN_DB_MIGRATIONS=true in apply mode." >&2
  echo "Set DATABASE_URL or DIRECT_URL, or disable migrations with RUN_DB_MIGRATIONS=false." >&2
  exit 1
fi

if [[ "$run_migrations" == "true" ]]; then
  run_shell_command "Run API database migrations" "$MIGRATE_COMMAND"
else
  echo "==> Skipping API database migrations (RUN_DB_MIGRATIONS=false)"
fi

if [[ -z "$DEPLOY_COMMAND" ]]; then
  if [[ "$APPLY" == "true" ]]; then
    echo "DEPLOY_API_COMMAND is required in apply mode." >&2
    exit 1
  fi

  echo "==> DEPLOY_API_COMMAND is not set; nothing to execute in dry-run mode."
  exit 0
fi

run_shell_command "Execute API deploy command" "$DEPLOY_COMMAND"

echo "API deploy completed."
