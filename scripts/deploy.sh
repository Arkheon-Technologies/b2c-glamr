#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy.sh <staging|production> [api|web|all] [--apply|--dry-run]

Default component is all.
Default mode is dry-run.
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

TARGET="all"
if [[ $# -gt 0 && "$1" != --* ]]; then
  TARGET="$1"
  shift
fi

case "$TARGET" in
  api|web|all)
    ;;
  *)
    echo "Invalid deployment target: ${TARGET}" >&2
    usage
    exit 1
    ;;
esac

EXTRA_ARGS=("$@")

echo "Deploy target: ${TARGET}"
echo "Environment: ${ENVIRONMENT}"

case "$TARGET" in
  api)
    ./scripts/deploy-api.sh "$ENVIRONMENT" "${EXTRA_ARGS[@]}"
    ;;
  web)
    ./scripts/deploy-web.sh "$ENVIRONMENT" "${EXTRA_ARGS[@]}"
    ;;
  all)
    ./scripts/deploy-api.sh "$ENVIRONMENT" "${EXTRA_ARGS[@]}"
    ./scripts/deploy-web.sh "$ENVIRONMENT" "${EXTRA_ARGS[@]}"
    ;;
esac

echo "Deploy orchestration completed."
