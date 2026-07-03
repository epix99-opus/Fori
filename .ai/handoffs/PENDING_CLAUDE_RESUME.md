# PENDING: Claude resume — FORI-044

**Blocked at:** 2026-07-02 ~22:43 PDT (session limit)  
**Resets:** **2:10 AM America/Los_Angeles** (PDT)  
**Do not substitute Cursor** for Claude design/review waves.

## Prerequisite

```bash
/Users/epix/Dev/Fori/.ai/orchestration/scripts/quota-check.sh claude
# Expect exit 0; if claude -p still prints session limit, wait until reset.
```

## Wave 1 ONLY (full design package)

```bash
cd /Users/epix/Dev/Fori && git pull origin main
git checkout -B claude/fori-044-full-design
claude -p "$(cat .ai/orchestration/prompts/fori-044-wave1-design.txt 2>/dev/null || echo 'Read Human review + produce FORI-044_FULL_DESIGN.md, TECHNICAL_SOLUTION v2, PM_TASK_PLAN v2, FORI-044-full-implement handoff')" \
  --max-turns 30 --allowedTools "Read,Write,Bash" --dangerously-skip-permissions < /dev/null 2>&1 | tee /tmp/claude-w1.log
git add docs/ .ai/handoffs/ && git commit -m "design: FORI-044 full design package [claude]" || true
git push origin claude/fori-044-full-design
```

**Success criteria:** No "session limit" in `/tmp/claude-w1.log`; new/updated docs under `docs/` and handoffs.

## Wave 4 ONE review (only after Wave 1 succeeds AND quota OK)

```bash
/Users/epix/Dev/Fori/.ai/orchestration/scripts/quota-check.sh claude
cd /Users/epix/Dev/Fori
claude -p "$(cat .ai/orchestration/prompts/fori-044-wave4-impl-review.txt 2>/dev/null || echo 'Review Wave3 prototype changes, write REVIEW-044-IMPL-CLAUDE.md VERDICT')" \
  --max-turns 15 --allowedTools "Read,Write" --dangerously-skip-permissions < /dev/null
```

**Max 2 `claude -p` invocations** for this resume task (Wave 1 + Wave 4).

## Post-run

- Append entry to `.ai/orchestration/dispatch-log.jsonl`
- Update `.ai/manifest.json` `currentTask` / `limits.claude`
- Remove or archive this file when both waves complete.
