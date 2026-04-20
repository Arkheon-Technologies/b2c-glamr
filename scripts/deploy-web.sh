#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-web.sh <staging|production> [--apply|--dry-run]

Default mode is dry-run.
Use --apply to execute deployment commands.

Environment variables:
  DEPLOY_WEB_COMMAND  Provider-specific web deploy command.
  DEPLOY_WEB_PLATFORM Provider hint for web deploys (e.g. vercel).
  DEPLOY_PLATFORM     Fallback provider hint for both targets.
  APP_ENV             Defaults to the selected environment.
  DRY_RUN             true|false (overrides --apply/--dry-run).

Vercel mode (DEPLOY_PLATFORM=vercel):
  If DEPLOY_WEB_COMMAND is unset, an automatic command is built from:
    VERCEL_TOKEN
    VERCEL_ORG_ID
    VERCEL_WEB_PROJECT_ID
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

DEPLOY_COMMAND="${DEPLOY_WEB_COMMAND:-}"
PLATFORM_LOWER="$(printf '%s' "${DEPLOY_WEB_PLATFORM:-${DEPLOY_PLATFORM:-}}" | tr '[:upper:]' '[:lower:]')"

export APP_ENV="${APP_ENV:-$ENVIRONMENT}"

echo "Web deploy target: ${ENVIRONMENT}"
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
  if [[ -z "${VERCEL_WEB_PROJECT_ID:-}" ]]; then
    vercel_missing+=("VERCEL_WEB_PROJECT_ID")
  fi

  if [[ ${#vercel_missing[@]} -eq 0 ]]; then
    if [[ "$ENVIRONMENT" == "production" ]]; then
      DEPLOY_COMMAND='VERCEL_ORG_ID="$VERCEL_ORG_ID" VERCEL_PROJECT_ID="$VERCEL_WEB_PROJECT_ID" npx --yes vercel deploy --cwd apps/web --token "$VERCEL_TOKEN" --prod'
    else
      DEPLOY_COMMAND='VERCEL_ORG_ID="$VERCEL_ORG_ID" VERCEL_PROJECT_ID="$VERCEL_WEB_PROJECT_ID" npx --yes vercel deploy --cwd apps/web --token "$VERCEL_TOKEN"'
    fi
    echo "==> Using auto-generated Vercel web deploy command"
  elif [[ "$APPLY" == "true" ]]; then
    echo "Vercel web deploy requires: ${vercel_missing[*]}" >&2
    exit 1
  else
    echo "==> Vercel web auto-command unavailable in dry-run mode; missing: ${vercel_missing[*]}"
  fi
fi

if [[ -z "$DEPLOY_COMMAND" ]]; then
  if [[ "$APPLY" == "true" ]]; then
    echo "DEPLOY_WEB_COMMAND is required in apply mode." >&2
    exit 1
  fi

  echo "==> DEPLOY_WEB_COMMAND is not set; nothing to execute in dry-run mode."
  exit 0
fi

run_shell_command "Execute web deploy command" "$DEPLOY_COMMAND"

echo "Web deploy completed."
