#!/usr/bin/env bash
set -euo pipefail

EVENT="${1:-ci}"
PLATFORM="${2:-n/a}"
RESULT="${3:-unknown}"
VERSION="${4:-}"
MESSAGE="${5:-}"

if ! command -v jq >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1; then
  echo "jq and curl are required for Discord notifications"
  exit 0
fi

resolve_webhook() {
  if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
    printf '%s' "$DISCORD_WEBHOOK_URL"
    return 0
  fi

  local cfg="${HOME}/dev/tools/.secrets/bootstrap-secrets.json"
  if [[ -f "$cfg" ]]; then
    local from_cfg
    from_cfg="$(jq -r '.global.DISCORD_WEBHOOK_URL // empty' "$cfg")"
    if [[ -n "$from_cfg" ]]; then
      printf '%s' "$from_cfg"
      return 0
    fi
  fi

  printf '%s' ""
}

resolve_repo() {
  if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
    printf '%s' "$GITHUB_REPOSITORY"
    return 0
  fi

  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    local remote
    remote="$(git remote get-url origin 2>/dev/null || true)"
    if [[ -n "$remote" ]]; then
      local slug
      slug="$(sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##' <<< "$remote")"
      if [[ -n "$slug" ]]; then
        printf '%s' "$slug"
        return 0
      fi
    fi
  fi

  printf '%s' "unknown-repo"
}

resolve_app_id() {
  local repo_slug="$1"
  local repo_name="${repo_slug##*/}"

  case "$repo_name" in
    b2b-*|b2c-*|b2e-*)
      printf '%s' "${repo_name#*-}"
      ;;
    *)
      printf '%s' "$repo_name"
      ;;
  esac
}

WEBHOOK_URL="$(resolve_webhook)"
if [[ -z "$WEBHOOK_URL" ]]; then
  echo "DISCORD_WEBHOOK_URL not resolved; skipping notification"
  exit 0
fi

REPO_SLUG="$(resolve_repo)"
APP_ID="$(resolve_app_id "$REPO_SLUG")"
ACTOR="${GITHUB_ACTOR:-${USER:-unknown}}"
RUN_URL=""

if [[ -n "${GITHUB_RUN_ID:-}" && -n "${GITHUB_REPOSITORY:-}" ]]; then
  RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
elif [[ -n "${HOSTNAME:-}" ]]; then
  RUN_URL="local://${HOSTNAME}"
fi

if [[ -z "$MESSAGE" ]]; then
  MESSAGE="${EVENT} pipeline update for ${APP_ID}"
fi

RESULT_UPPER="$(tr '[:lower:]' '[:upper:]' <<< "$RESULT")"

case "$RESULT" in
  success)
    COLOR=3066993
    ;;
  failed|failure|cancelled)
    COLOR=15158332
    ;;
  *)
    COLOR=3447003
    ;;
esac

TITLE="App ${EVENT} ${RESULT_UPPER}"
TIMESTAMP_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

PAYLOAD=$(jq -n \
  --arg title "$TITLE" \
  --arg message "$MESSAGE" \
  --arg app "$APP_ID" \
  --arg repo "$REPO_SLUG" \
  --arg event "$EVENT" \
  --arg status "$RESULT_UPPER" \
  --arg platform "$PLATFORM" \
  --arg version "${VERSION:-n/a}" \
  --arg actor "$ACTOR" \
  --arg run_url "${RUN_URL:-n/a}" \
  --arg ts "$TIMESTAMP_UTC" \
  --argjson color "$COLOR" \
  '{
    username: "Arkheon Ops Bot",
    allowed_mentions: {parse: []},
    embeds: [
      {
        title: $title,
        description: $message,
        color: $color,
        fields: [
          {name: "App", value: $app, inline: true},
          {name: "Repo", value: $repo, inline: true},
          {name: "Event", value: $event, inline: true},
          {name: "Status", value: $status, inline: true},
          {name: "Platform", value: $platform, inline: true},
          {name: "Version", value: $version, inline: true},
          {name: "Actor", value: $actor, inline: true},
          {name: "Run", value: $run_url, inline: false},
          {name: "Time (UTC)", value: $ts, inline: false}
        ],
        footer: {text: "Arkheon engineering notification"}
      }
    ]
  }')

HTTP_CODE=$(curl -sS -o /tmp/discord_notify_response.json -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "$PAYLOAD" \
  "$WEBHOOK_URL")

if [[ "$HTTP_CODE" != "204" ]]; then
  echo "Discord notification failed: HTTP $HTTP_CODE"
  cat /tmp/discord_notify_response.json || true
  exit 1
fi

echo "Discord notification sent (${EVENT}/${RESULT_UPPER}) for app ${APP_ID}"
