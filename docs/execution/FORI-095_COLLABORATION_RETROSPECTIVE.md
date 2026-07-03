# FORI-095 · Round 2 多智能体协作复盘

> **版本**: 1.0 · 2026-07-03  
> **作者**: Cursor（基于真实 `dispatch-log.jsonl`；Claude auth 401 期间 Codex/Cursor 代起草，**待 Claude 深审**）  
> **来源**: 人类评审 Round 2（`.ai/handoffs/Human/Fori平台原型评审意见.md`）  
> **证据**: `.ai/orchestration/dispatch-log.jsonl`（31 条）· `docs/execution/CONVERSATION_GOAL_AUDIT.md`

---

## 1. 执行摘要

FORI-043/044 证明了 **真实 cross-swap dispatch** 可跑通：Claude 设计 → Codex 对抗评审 → Codex 实现 → Claude 实现评审，VERDICT 链含 FAIL→修订→PASS。但 **Claude auth 未持久**、**02:10 自动续跑首次失败**、**定价页 blank hotfix**、**Cursor session limit 期间补位** 削弱了「从一开始就纯 Agent」叙事。总体：**协作机制有效，运维与 auth 门禁需 Human 一次介入**。

---

## 2. 什么有效（What Worked）

| 维度 | 证据 | 结论 |
|------|------|------|
| **对抗性评审** | FORI-044 design-review **FAIL** → R2 **PASS** | Codex 评审迫使设计修订，非 Cursor 自审 |
| **真实 dispatch** | 31 条 log：Claude 13 · Codex 11 · Cursor 7 | 非纯 Cursor 模拟 |
| **分支指纹** | `claude/fori-043-*` ↔ `codex/fori-043-*` 成对存在 | cross-swap 协议落地 |
| **配额门控** | `quota-check.sh` + `pendingResume` + Layer S | 429 时正确 PENDING，非盲目重试 |
| **原型交付** | 37 路由 build PASS；P0 review PASS | FORI-044 pipeline 闭环 |
| **文档 SSOT** | FORI-044_FULL_DESIGN 1160+ 行 + TECH/PM v2.0 | 设计→实现 handoff 可追踪 |

### 2.1 dispatch-log 统计（2026-07-03）

```
总条目: 31
├── Claude: 13（含 wave1/wave4 重试、session limit SKIPPED）
├── Codex:  11（含 design-review-r2、P0 fixes）
└── Cursor:  7（merge、hotfix、cron、quota study、manual resume）

实质成功派发（去重）: Claude ~8 · Codex ~9
```

### 2.2 VERDICT 链

| 任务 | 评审文档 | VERDICT |
|------|----------|---------|
| FORI-043 设计 | REVIEW-043-DESIGN-CODEX | CONDITIONAL_PASS |
| FORI-043 实现 | REVIEW-043-IMPL-CLAUDE | CONDITIONAL_PASS |
| FORI-044 设计 R1 | REVIEW-044-DESIGN-CODEX | **FAIL** |
| FORI-044 设计 R2 | REVIEW-044-DESIGN-R2-CODEX | **PASS** |
| FORI-044 实现 | REVIEW-044-IMPL-CLAUDE | CONDITIONAL_PASS |
| FORI-044 P0 | REVIEW-044-P0-FIXES-CLAUDE | **PASS** |

---

## 3. Cursor 后备失败模式

| 场景 | 发生 | 影响 | 原则 |
|------|------|------|------|
| Session limit 期间跳过 Claude hotfix-review | FORI-043 price hotfix | 评审链断裂 | 应 queue，非 SKIPPED |
| 手动 resume 替代 cron | 02:39 PDT Human 催促 | 用户愤怒点 #12 | cron 已补，待长期验证 |
| 合并/hotfix 合理介入 | price blank curl 200 验证 | **合理** Cursor 场景 | merge + 冒烟属编排职责 |
| 早期 Round2 部分 Cursor 兼设计者 | R1/R3 部分步骤 | 削弱 #5 叙事 | 后期 FORI-043/044 已委派 |

**教训**：`QUOTA_ROUTING.md` v3 反模式已写明 — session_limited 时 **queue**，不得 Cursor 代设计/跳过评审。

---

## 4. Session Limit（Layer S）

| 时间 (PDT) | 事件 |
|------------|------|
| ~22:15–23:30 | FORI-044 wave1/4 遇 session limit → 429 PENDING |
| **02:10** | `resume-pending.sh --wave 1` → **exit 1**（cron 未注册） |
| **02:39** | Human 手动催促 → Cursor resume |
| 02:40+ | wave1 design 成功 `caa83da` |
| 03:35 | `auto-resume-cron.sh` 创建 + crontab `*/15` |

**根因**：交互式 Claude Code 与 `claude -p` **共享 Session 池**；`resume-pending.sh` 存在 ≠ cron 已装。

**修复**：`auto-resume-cron.sh` + epix crontab 已验证；dry-run 2026-07-03 PASS。

---

## 5. 定价页 Blank 事件

| 项 | 内容 |
|----|------|
| **现象** | `/price/[communityId]` 空白（用户愤怒 #10） |
| **根因** | 450ms fake loading gate + client params 不可靠 |
| **修复** | Codex hotfix `4cddabf` → merge `01c22ab`；curl 200 验证 |
| **教训** | 实现评审未做 HTTP/浏览器冒烟；build PASS ≠ 页面有内容 |

---

## 6. 自动续跑 Gap

| 检查项 | 状态 |
|--------|------|
| `resume-pending.sh` | ✅ 存在 |
| `auto-resume-cron.sh` | ✅ 2026-07-03 创建 |
| epix crontab `*/15` | ✅ 已注册 |
| dry-run 2026-07-03 | ✅ `No pendingResume items ready — exit 0` |
| 02:10 首次无提示续跑 | ❌ 首次失败（已事后修复） |

---

## 7. Claude Auth

| 检查 | 2026-07-03 结果 |
|------|-----------------|
| jq `hasAccessToken` | false（email 存在） |
| `claude -p` 冒烟 | **401** — 真 auth 失效 |
| Keychain 假阳性？ | **否**（-p 失败） |
| 所需动作 | Human 一次 `claude auth login` |

见 `.ai/orchestration/AUTH_PERSISTENCE.md` v1.1 Keychain 门控。

---

## 8. 协作 vs 单 Agent（量化）

| 指标 | 多 Agent（FORI-043/044） | 单 Cursor 估算 |
|------|--------------------------|----------------|
| 设计文档 | 10+ spec（FORI-044 1160 行） | 质量/深度不稳定 |
| 对抗评审 | 6 份 REVIEW + FAIL→PASS 闭环 | 自审盲区 |
| 实现波次 | Codex 9+ 次真实 exec | 串行、无交叉换位 |
| 分支隔离 | claude/* + codex/* 成对 | 单分支混杂 |
| 证据链 | dispatch-log + VERDICT | 无结构化 log |
| 配额感知 | Layer S/A/B + cron 续跑 | 无编排 |

**结论**：协作在 **对抗评审、并行吞吐、证据链** 上优于单 Agent；**auth/cron 运维** 需 Human 一次 + Cursor 编排补齐。

---

## 9. 待 Claude 深审（若 auth 恢复）

- [ ] 本节 §3 Cursor 后备分类是否完整
- [ ] §8 量化对比是否需 A/B 同任务基线
- [ ] 是否追加 FORI-045+ pipeline 预测

---

## 10. 交叉引用

- 审计：`docs/execution/CONVERSATION_GOAL_AUDIT.md`
- 协议：`.ai/orchestration/CROSS_SWAP_PROTOCOL.md`
- Obsidian：`HermesEpix/Dev-Projects/Fori/协作机制交付证明.md` §6
- PM：`docs/execution/PM_TASK_PLAN.md` §5

---

*FORI-095 · Cursor 起草 · 待 Claude review · 2026-07-03*
