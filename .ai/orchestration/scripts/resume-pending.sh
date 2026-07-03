#!/usr/bin/env bash
# Fori auto-resume — Cursor-owned, reads pendingResume + PENDING_CLAUDE_RESUME.md
# Usage: resume-pending.sh [--dry-run] [--wave 1|4]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LEDGER="$REPO_ROOT/.ai/orchestration/quota-ledger.json"
MANIFEST="$REPO_ROOT/.ai/manifest.json"
DISPATCH_LOG="$REPO_ROOT/.ai/orchestration/dispatch-log.jsonl"
QUOTA_CHECK="$SCRIPT_DIR/quota-check.sh"
PROMPTS="$REPO_ROOT/.ai/orchestration/prompts"
LOG_DIR="${FORI_RESUME_LOG_DIR:-/tmp}"

DRY_RUN=false
WAVE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --wave) WAVE="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Usage: resume-pending.sh [--dry-run] [--wave 1|4]"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

WAVE="${WAVE:-1}"

now_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() { echo "[resume-pending] $*"; }

# Check pendingResume.after from manifest
check_after_time() {
  python3 - "$MANIFEST" <<'PY'
import json, sys
from datetime import datetime, timezone

with open(sys.argv[1]) as f:
    m = json.load(f)

pending = m.get("pendingResume") or []
if not pending:
    # fallback: limits.claude.session_reset
    lim = m.get("limits", {}).get("claude", {})
    sr = lim.get("session_reset_at")
    if sr:
        print(f"WAIT:{sr}")
        sys.exit(1)
    print("OK:no_pending")
    sys.exit(0)

now = datetime.now(timezone.utc)
for p in pending:
    after = p.get("after")
    if not after:
        continue
    t = datetime.fromisoformat(after.replace("Z", "+00:00"))
    if now < t.astimezone(timezone.utc):
        print(f"WAIT:{after}")
        sys.exit(1)
print("OK:ready")
sys.exit(0)
PY
}

gate_msg=""
gate_rc=0
gate_msg="$( "$QUOTA_CHECK" claude 2>&1 )" || gate_rc=$?

log "quota-check: $gate_msg (rc=$gate_rc)"

if [[ $gate_rc -eq 3 ]]; then
  log "AUTH_ERROR — notify Human for one-time claude auth login; no auto retry"
  exit 3
fi

if [[ $gate_rc -eq 1 ]]; then
  log "PAUSED/session_limited per ledger — not dispatching"
  exit 1
fi

if [[ $gate_rc -eq 2 ]]; then
  log "DAILY_RESET — wait for Layer B"
  exit 2
fi

after_result="$(check_after_time)" || after_rc=$?
log "pendingResume: $after_result"
if [[ "${after_rc:-0}" -ne 0 ]]; then
  log "Not yet time to resume"
  exit 0
fi

PROMPT_FILE=""
BRANCH=""
MAX_TURNS=""
TOOLS=""
TASK_ID=""

case "$WAVE" in
  1)
    PROMPT_FILE="$PROMPTS/fori-044-wave1-design.txt"
    BRANCH="claude/fori-044-full-design"
    MAX_TURNS=30
    TOOLS="Read,Write,Bash"
    TASK_ID="FORI-044-wave1-design"
    ;;
  4)
    PROMPT_FILE="$PROMPTS/fori-044-wave4-impl-review.txt"
    BRANCH="claude/fori-044-impl-review"
    MAX_TURNS=15
    TOOLS="Read,Write"
    TASK_ID="FORI-044-wave4-impl-review"
    ;;
  *)
    log "Unknown wave: $WAVE"
    exit 2
    ;;
esac

if [[ ! -f "$PROMPT_FILE" ]]; then
  log "Missing prompt: $PROMPT_FILE"
  exit 2
fi

if [[ "$DRY_RUN" == true ]]; then
  log "DRY-RUN would run: claude -p ($PROMPT_FILE) --max-turns $MAX_TURNS on $BRANCH"
  exit 0
fi

cd "$REPO_ROOT"
git pull origin main --ff-only 2>/dev/null || true
git checkout -B "$BRANCH"

LOG_FILE="$LOG_DIR/claude-w${WAVE}-$(date +%Y%m%d-%H%M%S).log"
log "Dispatching Wave $WAVE → $LOG_FILE"

set +e
claude -p "$(cat "$PROMPT_FILE")" \
  --max-turns "$MAX_TURNS" \
  --allowedTools "$TOOLS" \
  --dangerously-skip-permissions < /dev/null 2>&1 | tee "$LOG_FILE"
claude_rc=${PIPESTATUS[0]}
set -e

if grep -qi "session limit" "$LOG_FILE" 2>/dev/null; then
  reset_line="$(grep -i "session limit" "$LOG_FILE" | tail -1)"
  log "SESSION_LIMITED: $reset_line"
  python3 - "$LEDGER" "$reset_line" <<'PY'
import json, sys, re
from datetime import datetime, timezone, timedelta

ledger_path, snippet = sys.argv[1], sys.argv[2]
with open(ledger_path) as f:
    data = json.load(f)

# Try parse reset time from message
reset_at = None
m = re.search(r"resets?\s+(\d{1,2}:\d{2}\s*(?:am|pm)?)", snippet, re.I)
if m:
    # fallback: +3h from now if unparseable
    reset_at = (datetime.now(timezone(timedelta(hours=-7))) + timedelta(hours=3)).isoformat()
else:
    reset_at = (datetime.now(timezone(timedelta(hours=-7))) + timedelta(hours=5)).isoformat()

data["agents"]["claude"]["layer_a"]["status"] = "session_limited"
data["agents"]["claude"]["layer_s"] = data["agents"]["claude"].get("layer_s", {})
data["agents"]["claude"]["layer_s"]["session_resets_at"] = reset_at
data["agents"]["claude"]["last_error_snippet"] = snippet[:200]
data["updatedAt"] = datetime.now(timezone(timedelta(hours=-7))).isoformat()
data["entries"].append({
    "at": data["updatedAt"],
    "agent": "claude",
    "event": "session_limited",
    "detail": f"resume-pending wave {sys.argv[3] if len(sys.argv)>3 else '?'}"
})
with open(ledger_path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"claude\",\"task\":\"$TASK_ID\",\"exit_code\":429,\"status\":\"PENDING_CLAUDE\",\"reason\":\"session limit\",\"log\":\"$LOG_FILE\"}" >> "$DISPATCH_LOG"
  exit 1
fi

if [[ $claude_rc -ne 0 ]]; then
  log "claude exit $claude_rc — see $LOG_FILE"
  echo "{\"ts\":\"$(now_iso)\",\"agent\":\"claude\",\"task\":\"$TASK_ID\",\"exit_code\":$claude_rc,\"log\":\"$LOG_FILE\"}" >> "$DISPATCH_LOG"
  exit "$claude_rc"
fi

git add docs/ .ai/handoffs/ 2>/dev/null || true
git commit -m "design: FORI-044 wave${WAVE} [claude]" 2>/dev/null || true
git push origin "$BRANCH" 2>/dev/null || true

echo "{\"ts\":\"$(now_iso)\",\"agent\":\"claude\",\"task\":\"$TASK_ID\",\"exit_code\":0,\"branch\":\"$BRANCH\",\"log\":\"$LOG_FILE\",\"via\":\"resume-pending.sh\"}" >> "$DISPATCH_LOG"

# Update ledger on success
python3 - "$LEDGER" "$MAX_TURNS" <<'PY'
import json, sys
from datetime import datetime, timezone, timedelta

with open(sys.argv[1]) as f:
    data = json.load(f)
msgs = int(sys.argv[2])
la = data["agents"]["claude"]["layer_a"]
la["msgs_used_in_window"] = la.get("msgs_used_in_window", 0) + min(msgs, 10)
la["status"] = "available"
data["updatedAt"] = datetime.now(timezone(timedelta(hours=-7))).isoformat()
data["entries"].append({
    "at": data["updatedAt"],
    "agent": "claude",
    "event": "resume_success",
    "detail": "resume-pending.sh"
})
with open(sys.argv[1], "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY

log "Wave $WAVE complete"
exit 0
