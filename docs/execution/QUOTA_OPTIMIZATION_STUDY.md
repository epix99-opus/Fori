# Fori 配额优化研究报告

> **版本**: 1.0 · 2026-07-03  
> **执行**: Cursor 编排  
> **关联**: `.ai/orchestration/QUOTA_ROUTING.md` v3 · `MODEL_ROUTING_MATRIX.json` · `RESUME_ORCHESTRATION.md`

---

## 1. 执行摘要

Fori 多 Agent 编排涉及 **三套独立订阅配额**，须分层建模、科学路由、自动续跑：

| 订阅 | 节点 | 编排角色 | 核心限额 |
|------|------|----------|----------|
| **Claude Code Pro** | epix | 设计、ADR、对抗性评审 | Session（5h 滚动）+ 5h 消息池 + 日硬地板 |
| **Codex Plus** | woot | 实现、测试、重构 | 5h 用量配额 + 周限额 + 日硬地板 |
| **Cursor Pro+** | epix | 编排、合并、文档、Gate | 月度 API 额度池（~$70） |

**关键结论**：Cursor **不得**替代 Claude 做设计/深审；Cursor 额度用于编排、合并、轻量文档与验证脚本，重 blade 任务委派 `claude -p` / `codex exec`。

---

## 2. 三层配额模型（per Agent）

### 2.1 Claude Code Pro（epix）

| 层级 | 名称 | 机制 | 检测信号 | 恢复 |
|------|------|------|----------|------|
| **Layer S** | Session limit | 交互式 5h 滚动窗口（与 claude.ai 共享池） | stderr: `session limit` + `resets Xm` | 滚动 5h 或 CLI 显示的 reset 时刻 |
| **Layer A** | Headless 消息池 | `claude -p` 约 10–45 msg/5h（经验值） | 429 rate limit；ledger `msgs_used` | `window_resets_at` 或 now+5h |
| **Layer B** | 日硬地板 | 全日多次耗尽后 | 持续 429 至日界 | **22:30 PDT** |

**2026 年观测**（来源：dispatch-log、Anthropic 社区、claude-usage-companion）：

- `claude -p` 与交互式 Claude Code **可能**共享 Session 池（FORI-043/044 实证：heavy 交互后 `-p` 返回 session limit）。
- 部分非交互用量（Agent SDK、GitHub Actions）可能走独立月度 credit 池——**以 `/usage` 与 stderr 文案为准**，编排器不做探测调用。
- Pro 另有 **7 天周限额**（独立滚动），warmup 技巧无效。

**ledger 状态**: `available` | `warning` | `exhausted` | `session_limited` | `auth_error` | `paused_quota`

### 2.2 Codex Plus（woot，epix+woot 共享账号）

| 层级 | 名称 | 机制 | 检测信号 | 恢复 |
|------|------|------|----------|------|
| **Layer A** | 5h usage quota | Local messages + cloud tasks 共享 5h 窗口 | 429 `AccountQuotaExceeded` + `resets_at` / `resets_in_seconds` | API 返回的 reset 时间 |
| **Layer W** | 周限额 | 额外 weekly cap | CLI: `Weekly XX%` | 7 天滚动 |
| **Layer B** | 日硬地板 | 多次 Layer A 耗尽 | 持续 429 至日界 | **00:29 PDT** |

**模型效率**（OpenAI 官方定价页，Plus 档 Local Messages/5h 范围）：

| 模型 | 任务量/5h（约） | 适用 |
|------|----------------|------|
| gpt-5.4-mini | 60–350 | 文档、简单修复、设计评审（只读） |
| gpt-5.5 / gpt-5.4 | 20–100 | 复杂实现、重构、原型批量 |

### 2.3 Cursor Pro+（epix 编排者）

| 维度 | 说明 |
|------|------|
| 计费 | 月度 **~$70 API 等效额度**（Pro+ $60/月），按 token 实际成本扣减 |
| 重置 | 账单周期日，非日历月 |
| Auto 模式 | 不消耗 included pool（官方 2025-06 后澄清） |
| 手动选模 | Sonnet/Opus/GPT 等 premium 模型消耗 pool |

**编排 vs 直调决策**：

| 场景 | 用 Cursor 直调 | 委派 Claude/Codex |
|------|----------------|-------------------|
| manifest 更新、合并 main、handoff 撰写 | ✅ | — |
| 文档整理、PM 计划、配额账本 | ✅（轻量模型） | — |
| PRD/ADR/架构设计 | ❌ 禁止替代 | ✅ `claude -p` design |
| 对抗性评审 VERDICT | ❌ | ✅ `claude -p` review（新会话） |
| 原型/生产代码 | ❌（除紧急 hotfix） | ✅ `codex exec` woot |
| Claude session_limited 时「代写设计」 | ❌ **反模式** | 排队 `pendingResume` |

---

## 3. 模型层级矩阵（质量/Token 比）

详见 `.ai/orchestration/MODEL_ROUTING_MATRIX.json`。摘要：

| task_type | agent | model / tier | max_turns | priority |
|-----------|-------|--------------|-----------|----------|
| design / adr | claude | opus-class (default) | 25–30 | P0 |
| review / security_review | claude | opus-class | 15–20 | P0 |
| readonly_audit | claude | default | 10 | P1 |
| implement / refactor | codex | gpt-5.5 | — | P0 |
| implement_simple / test / design_review_codex | codex | gpt-5.4-mini | — | P1 |
| orchestration / merge / docs | cursor | composer/fast | — | P2 |
| verify L0/L1 | hermes | scripts | — | P1 |

**原则**：blade 任务（设计、对抗评审、复杂实现）用最强模型；文档、格式化、只读评审用 mini。

---

## 4. Burst 并行调度

当 **Claude Layer S/A 可用** 且 **Codex Layer A 可用**：

```
epix:  claude -p design/review  (max_turns 硬上限)
woot:  codex exec implement     (gpt-5.5, 独立分支)
```

**禁止**：epix + woot 同时 heavy `codex exec`（共享 Codex 账号）。

**时段建议**（PDT）：

| 时段 | 策略 |
|------|------|
| 00:30–08:00 | Codex 优先（日重置后） |
| 08:00–22:00 | Claude ∥ Codex burst |
| 22:00–22:30 | 停 heavy Claude，完成 Codex |
| 22:30–00:29 | 双 Agent Layer B 挂起区 |
| session reset 后 | `resume-pending.sh` 优先 FORI-044 Wave1 |

---

## 5. 续跑协议（Cursor 拥有，无需 Human 触发）

### 5.1 Ledger / manifest 状态机

```
ready → running → completed
              ↘ session_limited / paused_quota / auth_error
                    → resume-pending.sh @ after 时刻
                    → quota-check → claude -p（最多 1 次/续跑周期）
```

### 5.2 文件契约

| 文件 | 用途 |
|------|------|
| `manifest.json` → `pendingResume[]` | `{task, wave, after, handoff}` |
| `.ai/handoffs/PENDING_CLAUDE_RESUME.md` | 人类可读续跑指令 |
| `quota-ledger.json` | 机器状态 + 审计 `entries[]` |
| `scripts/resume-pending.sh` | 门控 + 派发 + 更新 ledger |

### 5.3 自动触发

- Cursor 会话恢复时检查 `pendingResume`
- Hermes cron `fori-resume-pending`（建议每 15min，02:00–08:00 PDT 加密）
- **禁止**重复 `claude auth login`；`auth_error` 时仅 Human 一次 OAuth

---

## 6. 反模式清单

| # | 反模式 | 正确做法 |
|---|--------|----------|
| 1 | 重复 `claude auth login` 或多次 `-p` 探活 | jq 周检 + auth_error 时单次冒烟 |
| 2 | jq `oauthAccount` 假阳性判断 | 以 `-p` stderr 为准；keychain 路径单独标记 |
| 3 | Claude 限额时用 Cursor 代写设计/评审 | `pendingResume` + 等 session reset |
| 4 | 用 Claude 做批量页面实现 | Codex woot + gpt-5.5 |
| 5 | 探测性 CLI 调用测配额 | ledger 启发式 + 429 登记 |
| 6 | Codex 自验标 done | Hermes `git diff` 验证 |
| 7 | 忽略 Layer S session limit | ledger `session_limited` + manifest `session_reset` |

---

## 7. FORI-044 当前状态（2026-07-02 23:10 PDT）

| Wave | Agent | 状态 |
|------|-------|------|
| W1 设计 | Claude | **session_limited** → 续跑 2026-07-03 02:10 PDT |
| W2 设计评审 | Codex | FAIL (ee16b87) |
| W3 实现 | Codex | PASS build (8fca35e) |
| W4 实现评审 | Claude | 待 W1 完成后排队 |

**续跑命令**: `.ai/orchestration/scripts/resume-pending.sh --wave 1`

---

## 8. 参考来源

- Fori: `dispatch-log.jsonl`, `AUTH_PERSISTENCE.md`, `quota-ledger.json`
- CAMA: `QUOTA_ROUTING_PLAYBOOK.md`
- Anthropic: Claude Help — usage limits（5h rolling + weekly）
- OpenAI: [Codex Pricing](https://developers.openai.com/codex/pricing) — 5h + weekly
- Cursor: [Pricing](https://cursor.com/pricing) — Pro+ ~$70/mo API pool
- 社区: claude-usage-companion (2026-06 credit pool split)

---

*研究报告 · Cursor 编排 · 2026-07-03*
