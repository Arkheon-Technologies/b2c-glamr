#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-preflight.sh <staging|production> [--strict]

Checks deployment command configuration.

Modes:
  default   Warns if deploy commands are missing.
  --strict  Fails if deploy commands are missing.

Expected environment variables:
  DEPLOY_API_COMMAND
  DEPLOY_WEB_COMMAND

Optional environment variables:
  DEPLOY_PLATFORM
  DEPLOY_API_PLATFORM
  DEPLOY_WEB_PLATFORM
  DEPLOY_API_MIGRATE_COMMAND
  APP_ENV

Vercel mode (DEPLOY_*_PLATFORM=vercel):
  If command variables are unset, the preflight accepts Vercel credentials instead:
    VERCEL_TOKEN
    VERCEL_ORG_ID
    VERCEL_API_PROJECT_ID
    VERCEL_WEB_PROJECT_ID

Render API mode (DEPLOY_API_PLATFORM=render):
  If DEPLOY_API_COMMAND is unset, the preflight accepts Render credentials instead:
    RENDER_API_KEY
    RENDER_API_SERVICE_ID
EOF
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

STRICT="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict)
      STRICT="true"
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

GLOBAL_PLATFORM_LOWER="$(printf '%s' "${DEPLOY_PLATFORM:-}" | tr '[:upper:]' '[:lower:]')"
API_PLATFORM_LOWER="$(printf '%s' "${DEPLOY_API_PLATFORM:-${DEPLOY_PLATFORM:-}}" | tr '[:upper:]' '[:lower:]')"
WEB_PLATFORM_LOWER="$(printf '%s' "${DEPLOY_WEB_PLATFORM:-${DEPLOY_PLATFORM:-}}" | tr '[:upper:]' '[:lower:]')"

IS_API_VERCEL="false"
IS_WEB_VERCEL="false"
IS_API_RENDER="false"

if [[ "$API_PLATFORM_LOWER" == "vercel" ]]; then
  IS_API_VERCEL="true"
fi

if [[ "$WEB_PLATFORM_LOWER" == "vercel" ]]; then
  IS_WEB_VERCEL="true"
fi

if [[ "$API_PLATFORM_LOWER" == "render" ]]; then
  IS_API_RENDER="true"
fi

api_ok="false"
web_ok="false"

if [[ -n "${DEPLOY_API_COMMAND:-}" ]]; then
  api_ok="true"
fi

if [[ -n "${DEPLOY_WEB_COMMAND:-}" ]]; then
  web_ok="true"
fi

if [[ "$IS_API_VERCEL" == "true" ]]; then
  if [[ -n "${VERCEL_TOKEN:-}" && -n "${VERCEL_ORG_ID:-}" && -n "${VERCEL_API_PROJECT_ID:-}" ]]; then
    api_ok="true"
  fi
fi

if [[ "$IS_API_RENDER" == "true" ]]; then
  if [[ -n "${RENDER_API_KEY:-}" && -n "${RENDER_API_SERVICE_ID:-}" ]]; then
    api_ok="true"
  fi
fi

if [[ "$IS_WEB_VERCEL" == "true" ]]; then
  if [[ -n "${VERCEL_TOKEN:-}" && -n "${VERCEL_ORG_ID:-}" && -n "${VERCEL_WEB_PROJECT_ID:-}" ]]; then
    web_ok="true"
  fi
fi

MISSING=()
if [[ "$api_ok" != "true" ]]; then
  if [[ "$IS_API_VERCEL" == "true" ]]; then
    MISSING+=("API: DEPLOY_API_COMMAND or (VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_API_PROJECT_ID)")
  elif [[ "$IS_API_RENDER" == "true" ]]; then
    MISSING+=("API: DEPLOY_API_COMMAND or (RENDER_API_KEY + RENDER_API_SERVICE_ID)")
  else
    MISSING+=("DEPLOY_API_COMMAND")
  fi
fi

if [[ "$web_ok" != "true" ]]; then
  if [[ "$IS_WEB_VERCEL" == "true" ]]; then
    MISSING+=("WEB: DEPLOY_WEB_COMMAND or (VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_WEB_PROJECT_ID)")
  else
    MISSING+=("DEPLOY_WEB_COMMAND")
  fi
fi

echo "Preflight environment: ${ENVIRONMENT}"
echo "Preflight mode: $( [[ "$STRICT" == "true" ]] && echo strict || echo warn-only )"
echo "Deploy platform (global): ${GLOBAL_PLATFORM_LOWER:-unset}"
echo "Deploy platform (api): ${API_PLATFORM_LOWER:-unset}"
echo "Deploy platform (web): ${WEB_PLATFORM_LOWER:-unset}"
echo "APP_ENV: ${APP_ENV:-$ENVIRONMENT}"

if [[ -n "${DEPLOY_API_MIGRATE_COMMAND:-}" ]]; then
  echo "DEPLOY_API_MIGRATE_COMMAND: configured"
else
  echo "DEPLOY_API_MIGRATE_COMMAND: not set (default migration command will be used)"
fi

if [[ "$IS_API_VERCEL" == "true" || "$IS_WEB_VERCEL" == "true" ]]; then
  echo "VERCEL_TOKEN: $( [[ -n "${VERCEL_TOKEN:-}" ]] && echo configured || echo missing )"
  echo "VERCEL_ORG_ID: $( [[ -n "${VERCEL_ORG_ID:-}" ]] && echo configured || echo missing )"
fi

if [[ "$IS_API_VERCEL" == "true" ]]; then
  echo "VERCEL_API_PROJECT_ID: $( [[ -n "${VERCEL_API_PROJECT_ID:-}" ]] && echo configured || echo missing )"
fi

if [[ "$IS_WEB_VERCEL" == "true" ]]; then
  echo "VERCEL_WEB_PROJECT_ID: $( [[ -n "${VERCEL_WEB_PROJECT_ID:-}" ]] && echo configured || echo missing )"
fi

if [[ "$IS_API_RENDER" == "true" ]]; then
  echo "RENDER_API_KEY: $( [[ -n "${RENDER_API_KEY:-}" ]] && echo configured || echo missing )"
  echo "RENDER_API_SERVICE_ID: $( [[ -n "${RENDER_API_SERVICE_ID:-}" ]] && echo configured || echo missing )"
fi

if [[ ${#MISSING[@]} -eq 0 ]]; then
  echo "Preflight result: OK"
  exit 0
fi

if [[ "$STRICT" == "true" ]]; then
  echo "Preflight result: FAILED (missing required variables: ${MISSING[*]})" >&2
  exit 1
fi

echo "Preflight result: WARNING (missing variables allowed in dry-run mode: ${MISSING[*]})"
