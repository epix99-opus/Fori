#!/bin/bash
# Hermes 调用的限额中断处理器
# 当 Codex/Claude Code 后台进程退出且报限额错误时，Hermes 调用此脚本保存任务状态
# 
# 用法: limit-interrupt-handler.sh <agent> <session_id> <workdir> <task_id>
#   agent: codex | claude
#   session_id: 后台进程 session_id
#   workdir: 工作目录
#   task_id: 当前任务 ID

set -euo pipefail

AGENT="${1:-unknown}"
SESSION_ID="${2:-unknown}"
WORKDIR="${3:-/Users/epix/Dev/Fori}"
TASK_ID="${4:-unknown}"
MANIFEST="$WORKDIR/.ai/manifest.json"
PLAN="$WORKDIR/.ai/plan/current.md"
BRIEF="$WORKDIR/.ai/startup/STARTUP_BRIEF.md"

echo "=== 限额中断处理: $AGENT (session=$SESSION_ID, task=$TASK_ID) ==="

# 1. 获取当前时间
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 2. 确定重置时间 (PDT)
if [ "$AGENT" = "codex" ]; then
    RESET_TIME="今日 00:29 PDT"
    RESET_UTC="07:29 UTC"
elif [ "$AGENT" = "claude" ]; then
    RESET_TIME="今日 22:30 PDT"
    RESET_UTC="05:30 UTC"
else
    RESET_TIME="unknown"
fi

echo "Agent: $AGENT"
echo "Quota reset time: $RESET_TIME ($RESET_UTC)"

# 3. 更新 manifest.json — 标记任务为 scheduled
python3 -c "
import json, sys

manifest_path = '$MANIFEST'
m = json.load(open(manifest_path))

# 更新限额状态
m['limits']['$AGENT']['status'] = 'limited'
m['limits']['$AGENT']['checkedAt'] = '$NOW'

# 更新任务状态
if m.get('currentTask', {}).get('id') == '$TASK_ID':
    m['currentTask']['status'] = 'scheduled'
    m['currentTask']['owner'] = '$AGENT'
    
    # 如果另一个 agent 可用，切换 owner
    other = 'claude' if '$AGENT' == 'codex' else 'codex'
    if m['limits'].get(other, {}).get('status') == 'available':
        m['currentTask']['status'] = 'in_progress'
        m['currentTask']['owner'] = other
        print(f'FALLBACK: switching task $TASK_ID from $AGENT to {other}')
    else:
        print(f'SCHEDULED: task $TASK_ID suspended, waiting for $AGENT quota reset at $RESET_TIME')

json.dump(m, open(manifest_path, 'w'), indent=2, ensure_ascii=False)
print(f'manifest.json updated')
"

# 4. 尝试从后台进程日志提取最后的工作状态
echo ""
echo "=== 最后的进程输出 (用于推断 breakpoint) ==="
if [ "$SESSION_ID" != "unknown" ]; then
    # Hermes 会在调用前将进程日志写入临时文件
    LOG_FILE="/tmp/hermes-agent-${SESSION_ID}-tail.log"
    if [ -f "$LOG_FILE" ]; then
        tail -20 "$LOG_FILE"
    else
        echo "(日志文件不存在，需 Hermes 先写入)"
    fi
fi

echo ""
echo "=== 限额中断处理完成 ==="
echo "下一步: fori-quota-watchdog cron 将在 $RESET_TIME 后检测恢复并重新派发"
