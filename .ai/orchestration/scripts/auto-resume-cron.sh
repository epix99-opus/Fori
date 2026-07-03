#!/usr/bin/env bash
# Fori auto-resume cron — run every 15min via Cursor/Hermes
# Checks manifest pendingResume[].after vs now(), then dispatches waves.
# Usage: auto-resume-cron.sh [--dry-run]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MANIFEST="$REPO_ROOT/.ai/manifest.json"
DISPATCH_LOG="$REPO_ROOT/.ai/orchestration/dispatch-log.jsonl"
RESUME_SCRIPT="$SCRIPT_DIR/resume-pending.sh"
QUOTA_CHECK="$SCRIPT_DIR/quota-check.sh"
LOG_FILE="${FORI_AUTO_RESUME_LOG:-/tmp/fori-auto-resume.log}"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

log() {
  local msg="[auto-resume-cron $(date '+%Y-%m-%d %H:%M:%S %Z')] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

cd "$REPO_ROOT"

# Pull latest manifest state
git pull origin main --ff-only 2>/dev/null || true

# Check if any pendingResume items exist
pending_count="$(python3 - "$MANIFEST" <<'PY'
import json, sys
from datetime import datetime, timezone

with open(sys.argv[1]) as f:
    m = json.load(f)
pending = m.get("pendingResume") or []
if not pending:
    print("0")
    sys.exit(0)
now = datetime.now(timezone.utc)
ready = []
for p in pending:
    after = p.get("after")
    if not after:
        ready.append(p)
        continue
    t = datetime.fromisoformat(after.replace("Z", "+00:00"))
    if now >= t.astimezone(timezone.utc):
        ready.append(p)
print(len(ready))
PY
)"

if [[ "$pending_count" == "0" ]]; then
  log "No pendingResume items ready — exit 0"
  exit 0
fi

log "Found $pending_count ready pendingResume item(s)"

# Quota gate
gate_msg=""
gate_rc=0
gate_msg="$("$QUOTA_CHECK" claude 2>&1)" || gate_rc=$?
log "quota-check: $gate_msg (rc=$gate_rc)"

if [[ $gate_rc -ne 0 ]]; then
  log "Quota not ready (rc=$gate_rc) — will retry next cron"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"cursor\",\"task\":\"auto-resume-cron\",\"exit_code\":$gate_rc,\"status\":\"quota_blocked\",\"detail\":\"$gate_msg\"}" >> "$DISPATCH_LOG"
  exit 0
fi

if [[ "$DRY_RUN" == true ]]; then
  log "DRY-RUN: would dispatch wave 1 then wave 4"
  exit 0
fi

# Wave 1 first
log "Dispatching Wave 1..."
if "$RESUME_SCRIPT" --wave 1 >> "$LOG_FILE" 2>&1; then
  w1_rc=0
  log "Wave 1 SUCCESS"
else
  w1_rc=$?
  log "Wave 1 FAILED (rc=$w1_rc)"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"cursor\",\"task\":\"auto-resume-cron\",\"wave\":1,\"exit_code\":$w1_rc,\"status\":\"wave1_failed\"}" >> "$DISPATCH_LOG"
  exit "$w1_rc"
fi

# Re-check quota before Wave 4
gate_msg="$("$QUOTA_CHECK" claude 2>&1)" || gate_rc=$?
if [[ $gate_rc -ne 0 ]]; then
  log "Quota blocked after Wave 1 — Wave 4 deferred (rc=$gate_rc)"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"cursor\",\"task\":\"auto-resume-cron\",\"wave\":4,\"status\":\"deferred\",\"detail\":\"quota_blocked_after_w1\"}" >> "$DISPATCH_LOG"
  exit 0
fi

log "Dispatching Wave 4..."
if "$RESUME_SCRIPT" --wave 4 >> "$LOG_FILE" 2>&1; then
  log "Wave 4 SUCCESS"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"cursor\",\"task\":\"auto-resume-cron\",\"waves\":[1,4],\"exit_code\":0,\"status\":\"complete\"}" >> "$DISPATCH_LOG"
else
  w4_rc=$?
  log "Wave 4 FAILED (rc=$w4_rc)"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"cursor\",\"task\":\"auto-resume-cron\",\"wave\":4,\"exit_code\":$w4_rc,\"status\":\"wave4_failed\"}" >> "$DISPATCH_LOG"
  exit "$w4_rc"
fi

log "Auto-resume complete (Wave 1 + Wave 4)"
exit 0
