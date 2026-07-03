#!/usr/bin/env bash
# Sync Fori orchestration paths to woot — NEVER sync .git
# Usage: sync-to-woot.sh [--dry-run]
set -euo pipefail

FORI_ROOT="${FORI_ROOT:-/Users/epix/Dev/Fori}"
WOOT_ROOT="${WOOT_ROOT:-/Users/woot/Dev/Fori}"
DRY="${1:-}"

RSYNC_OPTS=(-av --delete-excluded)
if [[ "$DRY" == "--dry-run" ]]; then
  RSYNC_OPTS+=(--dry-run)
fi

PATHS=(
  "docs/execution/"
  "docs/reviews/REVIEW-R2-*.md"
  "docs/CANON.md"
  ".ai/orchestration/"
  ".ai/prompts/"
  ".ai/handoffs/FORI-096-r3-design.md"
  ".ai/handoffs/FORI-097-r3-implement.md"
  ".ai/handoffs/FORI-050-round2-implement.md"
  "prototype/app/explore/dict/"
  "prototype/app/price/"
  "prototype/components/AgentAssistFab.tsx"
)

echo "Syncing Fori → woot (no .git)..."

for rel in "${PATHS[@]}"; do
  src="$FORI_ROOT/$rel"
  if [[ "$rel" == *"*"* ]]; then
    # glob — expand locally
    for f in $FORI_ROOT/$rel; do
      [[ -e "$f" ]] || continue
      dest_dir="$WOOT_ROOT/$(dirname "${f#$FORI_ROOT/}")"
      rsync "${RSYNC_OPTS[@]}" "$f" "$dest_dir/"
    done
  elif [[ -d "$src" ]]; then
    dest="$WOOT_ROOT/$rel"
    mkdir -p "$dest"
    rsync "${RSYNC_OPTS[@]}" --exclude='.git' "$src" "$WOOT_ROOT/$(dirname "$rel")/"
  elif [[ -f "$src" ]]; then
    dest_dir="$WOOT_ROOT/$(dirname "$rel")"
    mkdir -p "$dest_dir"
    rsync "${RSYNC_OPTS[@]}" "$src" "$dest_dir/"
  else
    echo "SKIP (missing): $rel" >&2
  fi
done

echo "Done."
