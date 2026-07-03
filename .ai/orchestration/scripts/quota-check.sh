#!/usr/bin/env bash
# Fori quota gate — read ledger, no probe CLI calls.
# Usage: quota-check.sh [claude|codex|all]
# Exit: 0=ok, 1=paused_quota (Layer A), 2=scheduled_daily_reset (Layer B)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEDGER="${FORI_QUOTA_LEDGER:-$SCRIPT_DIR/../quota-ledger.json}"
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
  result="$("$PY" - "$LEDGER" "$agent" "$now_epoch" <<'PY'
import json, sys
from datetime import datetime, timezone

ledger_path, agent, now_epoch = sys.argv[1], sys.argv[2], int(sys.argv[3])
with open(ledger_path) as f:
    data = json.load(f)

a = data.get("agents", {}).get(agent, {})
layer_a = a.get("layer_a", {})
layer_b = a.get("layer_b", {})

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
daily_exhausted = layer_b.get("daily_exhausted", False)
next_daily = parse_iso(layer_b.get("next_daily_reset_at"))

# Auto-roll Layer A window if past reset and not daily exhausted
if resets_at and now >= resets_at.astimezone(timezone.utc) and not daily_exhausted:
    print(f"OK:{agent}:window_rolled")
    sys.exit(0)

if daily_exhausted and next_daily and now < next_daily.astimezone(timezone.utc):
    print(f"DAILY:{agent}:until={layer_b.get('next_daily_reset_at')}")
    sys.exit(2)

if status == "exhausted" and resets_at and now < resets_at.astimezone(timezone.utc):
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
  if ! check_agent "$ag"; then
    rc=$?
    if [[ $rc -gt $worst ]]; then
      worst=$rc
    fi
  fi
done

exit "$worst"
