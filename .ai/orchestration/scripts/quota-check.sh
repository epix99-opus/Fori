#!/usr/bin/env bash
# Fori quota gate — read ledger + optional manifest, no probe CLI calls.
# Usage: quota-check.sh [claude|codex|all]
# Exit: 0=ok, 1=paused_quota|session_limited, 2=scheduled_daily_reset, 3=auth_error
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEDGER="${FORI_QUOTA_LEDGER:-$SCRIPT_DIR/../quota-ledger.json}"
MANIFEST="${FORI_MANIFEST:-$SCRIPT_DIR/../../manifest.json}"
TARGET="${1:-all}"

if [[ ! -f "$LEDGER" ]]; then
  echo "WARN: ledger missing at $LEDGER — assuming available" >&2
  exit 0
fi

PY="${PYTHON:-python3}"
now_epoch="$("$PY" -c 'import time; print(int(time.time()))')"

check_agent() {
  local agent="$1"
  local result
  result="$("$PY" - "$LEDGER" "$MANIFEST" "$agent" "$now_epoch" <<'PY'
import json, sys
from datetime import datetime, timezone

ledger_path, manifest_path, agent, now_epoch = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
with open(ledger_path) as f:
    data = json.load(f)

manifest = {}
if manifest_path:
    try:
        with open(manifest_path) as f:
            manifest = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        pass

a = data.get("agents", {}).get(agent, {})
layer_a = a.get("layer_a", {})
layer_b = a.get("layer_b", {})
layer_s = a.get("layer_s", {})

def parse_iso(s):
    if not s:
        return None
    s = s.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None

now = datetime.now(timezone.utc)
status = layer_a.get("status", "available")
resets_at = parse_iso(layer_a.get("window_resets_at"))
session_resets = parse_iso(layer_s.get("session_resets_at"))
daily_exhausted = layer_b.get("daily_exhausted", False)
next_daily = parse_iso(layer_b.get("next_daily_reset_at"))

# Auth error — highest priority for claude
if agent == "claude" and status == "auth_error":
    print(f"AUTH:{agent}:oauth_required")
    sys.exit(3)

# Session limit (Layer S) — from ledger or manifest
if agent == "claude":
    if status == "session_limited":
        sr = session_resets or parse_iso(
            manifest.get("limits", {}).get("claude", {}).get("session_reset_at")
        )
        if sr and now < sr.astimezone(timezone.utc):
            print(f"SESSION:{agent}:until={sr.isoformat()}")
            sys.exit(1)
        # past reset — clear session_limited in output hint only; caller may roll
    lim = manifest.get("limits", {}).get("claude", {})
    if lim.get("status") == "session_limited":
        sr = parse_iso(lim.get("session_reset_at"))
        if sr and now < sr.astimezone(timezone.utc):
            print(f"SESSION:{agent}:until={lim.get('session_reset_at')}")
            sys.exit(1)

# Auto-roll Layer A window if past reset and not daily exhausted
if resets_at and now >= resets_at.astimezone(timezone.utc) and not daily_exhausted:
    if status in ("exhausted", "paused_quota"):
        print(f"OK:{agent}:window_rolled")
        sys.exit(0)

if daily_exhausted and next_daily and now < next_daily.astimezone(timezone.utc):
    print(f"DAILY:{agent}:until={layer_b.get('next_daily_reset_at')}")
    sys.exit(2)

if status in ("exhausted", "paused_quota") and resets_at and now < resets_at.astimezone(timezone.utc):
    print(f"PAUSED:{agent}:until={layer_a.get('window_resets_at')}")
    sys.exit(1)

# Budget warnings
if agent == "claude":
    used = layer_a.get("msgs_used_in_window", 0)
    budget = layer_a.get("budget_msgs_per_window", 45)
elif agent == "codex":
    used = layer_a.get("minutes_used_in_window", 0)
    budget = layer_a.get("budget_minutes_per_window", 300)
else:
    used, budget = 0, 1

if budget and used / budget >= 0.8:
    print(f"WARN:{agent}:usage={used}/{budget}")
else:
    print(f"OK:{agent}:usage={used}/{budget}")
sys.exit(0)
PY
)"
  local rc=$?
  echo "$result"
  return "$rc"
}

worst=0
for ag in claude codex; do
  if [[ "$TARGET" != "all" && "$TARGET" != "$ag" ]]; then
    continue
  fi
  ag_rc=0
  check_agent "$ag" || ag_rc=$?
  if [[ $ag_rc -ne 0 ]]; then
    if [[ $ag_rc -eq 3 ]]; then
      worst=3
      break
    fi
    if [[ $ag_rc -gt $worst ]]; then
      worst=$ag_rc
    fi
  fi
done

exit "$worst"
