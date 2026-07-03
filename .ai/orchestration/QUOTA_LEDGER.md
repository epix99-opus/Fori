# Fori 配额账本（Quota Ledger）

> 机器可读：`.ai/orchestration/quota-ledger.json`  
> 门控脚本：`.ai/orchestration/scripts/quota-check.sh`  
> 主编排指南：`.ai/orchestration/QUOTA_ROUTING.md` v2.0

## 1. 目的

CLI **不提供**可靠的 quota status 命令。本账本由 Cursor/Hermes **在每次派发前后**维护，实现：

- Layer A（5h 滚动窗口）余量估算
- Layer B（日重置）耗尽标记
- 任务 `paused_quota` / `scheduled_daily_reset` 续跑时间
- 跨 Agent 会话的配额审计链

## 2. 双层模型速查

| 层级 | Claude Pro | Codex Plus | 检测方式 |
|------|------------|------------|----------|
| **Layer A** | ~45 msg / 5h（`-p` 经验值） | ~300 min heavy / 5h | 429 + `resets_in_seconds`；账本扣减 |
| **Layer B** | 22:30 PDT 日重置 | 00:29 PDT 日重置 | 多次 Layer A 耗尽；`daily_exhausted=true` |

## 3. Schema 字段

### 3.1 `agents.<name>.layer_a`

| 字段 | 类型 | 说明 |
|------|------|------|
| `window_hours` | number | 固定 5 |
| `budget_*_per_window` | number | Claude: msgs；Codex: minutes |
| `*_used_in_window` | number | 本窗口已消耗 |
| `window_started_at` | ISO8601 \| null | 本窗口首次调用时刻 |
| `window_resets_at` | ISO8601 \| null | 窗口结束（优先用 429 返回值） |
| `status` | enum | `available` \| `warning` \| `exhausted` |

### 3.2 `agents.<name>.layer_b`

| 字段 | 类型 | 说明 |
|------|------|------|
| `daily_exhausted` | boolean | 当日配额是否触顶 |
| `next_daily_reset_at` | ISO8601 | 下一日界重置时刻 |

### 3.3 `task_queue[]`

```json
{
  "task_id": "FORI-042",
  "agent": "codex",
  "status": "paused_quota",
  "paused_at": "2026-07-02T18:00:00-07:00",
  "resume_at": "2026-07-02T23:00:00-07:00",
  "layer": "A",
  "branch": "codex/fori-042-monorepo-init",
  "handoff": ".ai/handoffs/FORI-042.md",
  "breakpoint": "monorepo apps/ 目录已创建，待 packages/shared"
}
```

### 3.4 `entries[]`（审计日志）

```json
{
  "ts": "2026-07-02T10:00:00-07:00",
  "task_id": "FORI-041",
  "agent": "claude",
  "kind": "dispatch",
  "estimated_cost": { "msgs": 30 },
  "node": "epix",
  "result": "started"
}
```

## 4. 操作流程

### 4.1 派发前（Cursor / Hermes）

```bash
.ai/orchestration/scripts/quota-check.sh all
# exit 0 = 可派发；exit 1 = paused_quota；exit 2 = scheduled_daily_reset
```

### 4.2 派发时

1. 追加 `entries[]`：`kind=dispatch`，写入 `estimated_cost`
2. 若 `window_started_at` 为空，设为 `now`
3. 累加 `msgs_used_in_window` 或 `minutes_used_in_window`
4. 余量 < 20% → `status=warning`

### 4.3 429 / 限额耗尽时

**Codex**（优先用 CAMA 脚本）：

```bash
# 在 woot 或 epix
/path/to/codex-quota-record.sh --task-id FORI-042 \
  --error-file /tmp/codex-stderr.log \
  --repo /Users/woot/Dev/Fori \
  --prompt-file .ai/handoffs/FORI-042.md
```

**Claude**（手写 ledger）：

1. 从 stderr 提取 reset 时间；无则 `now + 5h`
2. 设 `layer_a.status=exhausted`，`window_resets_at=<提取值>`
3. 若 reset 跨过日界 → `layer_b.daily_exhausted=true`，`task.status=scheduled_daily_reset`
4. 否则 `task.status=paused_quota`
5. 追加 `entries[]`：`kind=exhausted`

### 4.4 续跑时

1. `quota-check.sh` 返回可派发
2. 新会话启动（非 `--continue` 自审）
3. 读 handoff + Breakpoint
4. 清除 `task_queue` 对应项或改 `running`
5. `layer_a.status=available`（新窗口由首次调用重计）

### 4.5 窗口滚动（无新调用时）

Hermes cron `fori-quota-watchdog` 每 15–30min：

- 若 `now >= window_resets_at` 且非 `daily_exhausted` → 重置 Layer A 计数
- 若 `now >= next_daily_reset_at` → 清除 `daily_exhausted`

## 5. 启发式规则（无 API 时）

| 信号 | 动作 |
|------|------|
| 429 含 `5-hour` / `resets_in_seconds` | 信任 API 返回的 `resume_at` |
| 429 无时间 | `resume_at = now + 5h` |
| 同日第 3+ 次 Layer A 耗尽 | 考虑 `daily_exhausted=true` |
| Claude 401 | **非配额**；人工 `claude auth login` |
| 探测调用 | **禁止** |

## 6. 与 manifest.json 同步

`manifest.limits.<agent>` 应为 ledger 的只读摘要：

```json
"limits": {
  "claude": {
    "status": "available",
    "layer": "A",
    "resumeAt": null,
    "msgsRemaining": 45
  }
}
```

## 7. 跨项目参考

- CAMA：`hermes-codex/docs/codex-quota-auto-resume.md`
- CAMA：`QUOTA_ROUTING_PLAYBOOK.md`
- Obsidian：`HermesEpix/Dev-Projects/Fori/多Agent协作与配额路由.md`
