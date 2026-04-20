#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"

REPO=""
APPLY="false"
OVERWRITE="false"

set_count=0
skip_count=0
missing_required_count=0

EXISTING_VARS=""
EXISTING_SECRETS=""

required_vars=(
  "RENDER_API_SERVICE_ID_STAGING"
  "RENDER_API_SERVICE_ID_PRODUCTION"
  "VERCEL_ORG_ID"
  "VERCEL_WEB_PROJECT_ID"
)

required_secrets=(
  "RENDER_API_KEY"
  "VERCEL_TOKEN"
  "DATABASE_URL_STAGING"
  "DATABASE_URL_PRODUCTION"
)

optional_vars=(
  "DEPLOY_API_COMMAND_STAGING"
  "DEPLOY_API_COMMAND_PRODUCTION"
  "DEPLOY_WEB_COMMAND_STAGING"
  "DEPLOY_WEB_COMMAND_PRODUCTION"
  "DEPLOY_API_MIGRATE_COMMAND_STAGING"
  "DEPLOY_API_MIGRATE_COMMAND_PRODUCTION"
  "VERCEL_API_PROJECT_ID"
)

optional_secrets=(
  "DISCORD_WEBHOOK_URL"
)

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [--repo owner/repo] [--apply] [--overwrite]

Description:
  Bootstrap deploy variables and secrets for GitHub Actions workflows.
  Dry-run is the default mode. Use --apply to write changes.

Flags:
  --repo       Target repository in owner/repo format.
               If omitted, auto-detects from current git checkout.
  --apply      Apply changes to GitHub Actions variables/secrets.
  --overwrite  Overwrite existing variables/secrets in apply mode.
  -h, --help   Show this help text.

Required environment variables:
  VERCEL_ORG_ID
  VERCEL_WEB_PROJECT_ID
  RENDER_API_KEY
  VERCEL_TOKEN

Required deploy target values (choose one mode):
  Split mode:
    RENDER_API_SERVICE_ID_STAGING
    RENDER_API_SERVICE_ID_PRODUCTION
    DATABASE_URL_STAGING
    DATABASE_URL_PRODUCTION

  Single-service mode:
    RENDER_API_SERVICE_ID
    DATABASE_URL

Optional environment variables:
  DEPLOY_API_COMMAND_STAGING
  DEPLOY_API_COMMAND_PRODUCTION
  DEPLOY_WEB_COMMAND_STAGING
  DEPLOY_WEB_COMMAND_PRODUCTION
  DEPLOY_API_MIGRATE_COMMAND_STAGING
  DEPLOY_API_MIGRATE_COMMAND_PRODUCTION
  VERCEL_API_PROJECT_ID
  DISCORD_WEBHOOK_URL

Examples:
  $SCRIPT_NAME --repo my-org/glamr
  $SCRIPT_NAME --repo my-org/glamr --apply
  $SCRIPT_NAME --repo my-org/glamr --apply --overwrite
  RENDER_API_SERVICE_ID=srv-xxx DATABASE_URL=postgres://... $SCRIPT_NAME --repo my-org/glamr --apply
EOF
}

log_info() {
  printf "[INFO] %s\n" "$1"
}

log_warn() {
  printf "[WARN] %s\n" "$1"
}

log_error() {
  printf "[ERROR] %s\n" "$1" >&2
}

increment_set() {
  set_count=$((set_count + 1))
}

increment_skip() {
  skip_count=$((skip_count + 1))
}

increment_missing_required() {
  missing_required_count=$((missing_required_count + 1))
}

has_line() {
  local needle="$1"
  local haystack="$2"

  if [[ -z "$haystack" ]]; then
    return 1
  fi

  grep -Fxq "$needle" <<< "$haystack"
}

ensure_prereqs() {
  if ! command -v gh >/dev/null 2>&1; then
    log_error "GitHub CLI (gh) is required."
    exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    log_error "gh is not authenticated. Run: gh auth login"
    exit 1
  fi
}

auto_detect_repo() {
  if [[ -n "$REPO" ]]; then
    return
  fi

  REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
  if [[ -z "$REPO" ]]; then
    log_error "Unable to detect repository. Pass --repo owner/repo."
    exit 1
  fi
}

load_existing_names_if_needed() {
  if [[ "$APPLY" != "true" || "$OVERWRITE" == "true" ]]; then
    return
  fi

  if ! EXISTING_VARS="$(gh api "repos/$REPO/actions/variables" --jq '.variables[].name' 2>/dev/null || true)"; then
    log_error "Unable to list existing Actions variables for $REPO."
    log_error "Use --overwrite if intentional or fix repository permissions."
    exit 1
  fi

  if ! EXISTING_SECRETS="$(gh api "repos/$REPO/actions/secrets" --jq '.secrets[].name' 2>/dev/null || true)"; then
    log_error "Unable to list existing Actions secrets for $REPO."
    log_error "Use --overwrite if intentional or fix repository permissions."
    exit 1
  fi
}

hydrate_shared_defaults() {
  local shared_render_service_id="${RENDER_API_SERVICE_ID:-}"
  local shared_database_url="${DATABASE_URL:-}"

  if [[ -n "$shared_render_service_id" ]]; then
    : "${RENDER_API_SERVICE_ID_STAGING:=$shared_render_service_id}"
    : "${RENDER_API_SERVICE_ID_PRODUCTION:=$shared_render_service_id}"
    log_info "Using shared RENDER_API_SERVICE_ID for staging and production variables."
  fi

  if [[ -n "$shared_database_url" ]]; then
    : "${DATABASE_URL_STAGING:=$shared_database_url}"
    : "${DATABASE_URL_PRODUCTION:=$shared_database_url}"
    log_info "Using shared DATABASE_URL for staging and production secrets."
  fi
}

sync_variable() {
  local name="$1"
  local required="$2"
  local value="${!name:-}"

  if [[ -z "$value" ]]; then
    if [[ "$required" == "true" ]]; then
      log_error "Missing required env value: $name"
      increment_missing_required
    else
      log_info "Skipping optional variable $name (no value provided)."
      increment_skip
    fi
    return
  fi

  if [[ "$APPLY" != "true" ]]; then
    log_info "[DRY-RUN] Would set variable: $name"
    increment_set
    return
  fi

  if [[ "$OVERWRITE" != "true" ]] && has_line "$name" "$EXISTING_VARS"; then
    log_warn "Variable already exists, skipping: $name"
    increment_skip
    return
  fi

  gh variable set "$name" --repo "$REPO" --body "$value"
  log_info "Set variable: $name"
  increment_set
}

sync_secret() {
  local name="$1"
  local required="$2"
  local value="${!name:-}"

  if [[ -z "$value" ]]; then
    if [[ "$required" == "true" ]]; then
      log_error "Missing required env value: $name"
      increment_missing_required
    else
      log_info "Skipping optional secret $name (no value provided)."
      increment_skip
    fi
    return
  fi

  if [[ "$APPLY" != "true" ]]; then
    log_info "[DRY-RUN] Would set secret: $name"
    increment_set
    return
  fi

  if [[ "$OVERWRITE" != "true" ]] && has_line "$name" "$EXISTING_SECRETS"; then
    log_warn "Secret already exists, skipping: $name"
    increment_skip
    return
  fi

  gh secret set "$name" --repo "$REPO" --body "$value"
  log_info "Set secret: $name"
  increment_set
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo)
        if [[ $# -lt 2 ]]; then
          log_error "Missing value for --repo"
          exit 1
        fi
        REPO="$2"
        shift 2
        ;;
      --apply)
        APPLY="true"
        shift
        ;;
      --overwrite)
        OVERWRITE="true"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log_error "Unknown argument: $1"
        usage
        exit 1
        ;;
    esac
  done
}

main() {
  parse_args "$@"
  ensure_prereqs
  auto_detect_repo
  load_existing_names_if_needed
  hydrate_shared_defaults

  log_info "Target repo: $REPO"
  log_info "Mode: $([[ "$APPLY" == "true" ]] && echo apply || echo dry-run)"
  log_info "Overwrite existing values: $OVERWRITE"

  for name in "${required_vars[@]}"; do
    sync_variable "$name" "true"
  done

  for name in "${required_secrets[@]}"; do
    sync_secret "$name" "true"
  done

  for name in "${optional_vars[@]}"; do
    sync_variable "$name" "false"
  done

  for name in "${optional_secrets[@]}"; do
    sync_secret "$name" "false"
  done

  printf "\n"
  log_info "Summary:"
  log_info "  set-or-would-set: $set_count"
  log_info "  skipped: $skip_count"
  log_info "  missing-required: $missing_required_count"

  if [[ "$missing_required_count" -gt 0 && "$APPLY" == "true" ]]; then
    log_error "Missing required values in apply mode. Nothing should proceed until fixed."
    exit 1
  fi

  if [[ "$APPLY" != "true" ]]; then
    log_info "Dry-run complete. Re-run with --apply to persist changes."
  fi
}

main "$@"
