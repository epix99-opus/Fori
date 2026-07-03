# Fori 产品开发 PM + 任务分配计划

> **版本**: 2.0 · 2026-07-03  
> **变更**: FORI-044 全量设计包发布；Wave 1-4 任务分配更新；诚实标注 GAP；Agent attribution 扩展

---

## 1. 当前 Sprint 目标

| 里程碑 | 状态 | 交付 |
|--------|------|------|
| 人类评审 R2 交叉换位 | ✅ | ROUND2_R1/R2_MERGED |
| R3 Minor 清零 | ✅ PASS | ROUND2_R3_MERGED |
| 集成合并 | ✅ | `cursor/fori-060-integration` |
| D4 Wave1 定价设计 (FORI-043) | ✅ | FORI-043_DESIGN.md CONDITIONAL_PASS |
| D4 FORI-044 全量设计包 | ✅ | **本轮交付** (本文件 v2.0) |
| Human 原型复审 Gate | 待 | prototype 演示 `/home` 等 6 路由 |
| FORI-045 价格 API 实现 | 🔜 | Wave 1 启动条件：FORI-044 设计包 PASS |

---

## 2. 任务看板 FORI-080~095

| ID | 标题 | Owner | P | 状态 | 备注 |
|----|------|-------|---|------|------|
| FORI-080 | 主功能清单 | Claude | P0 | ✅ done | `docs/FEATURE_INVENTORY.md` |
| FORI-081 | 全角色交互矩阵 | Claude | P0 | ✅ done | `docs/ROLE_UX_MATRIX.md` |
| FORI-082 | SUUMO 披露规范 | Claude | P0 | ✅ done | `docs/UI_DESIGN.md` + FORI-044_FULL_DESIGN §4 |
| FORI-083 | 字典三态切换 | Cursor | P0 | ✅ done | 地图/卡片/列表 ViewModeToggle |
| FORI-084 | 角色脱敏 | Cursor | P0 | ✅ done | viewer-role.ts |
| FORI-085 | 登录分级矩阵 | Cursor | P0 | ✅ done | 五级矩阵 `/auth/login` |
| FORI-086 | 共建裂变设计 | Claude | P1 | ✅ done | `docs/CO_CREATION_FISSION.md` |
| FORI-087 | 贡献账本 UI | Codex | P1 | ✅ done | `/explore/dict/community-001` |
| FORI-088 | 分成瀑布图 | Codex | P1 | ✅ done | 80/15/5 PRD 对齐 |
| FORI-089 | 定价撮合方案 | Claude | P1 | ✅ done | `docs/PRICING_MATCHING.md` |
| FORI-090 | 价格三角色 | Codex | P1 | ✅ done | `/price/[communityId]` |
| FORI-091 | 撮合状态机 | Codex | P1 | ✅ done | 4h 倒计时 `/match` |
| FORI-092 | Agent 页面契约 | Claude | P1 | ✅ done | `docs/AGENT_PAGE_CONTRACTS.md` |
| FORI-093 | Agent FAB | Cursor/Codex | P1 | ✅ done | 8+ 关键页 |
| FORI-094 | 文档治理 CANON | Cursor | P2 | ✅ done | `docs/CANON.md` |
| FORI-095 | R2 协作复盘 | Hermes | P2 | **done** | `docs/execution/FORI-095_COLLABORATION_RETROSPECTIVE.md` |

---

## 3. FORI-044 Wave 任务分配（详细）

### Wave 1 — 全量设计包（Claude epix，本轮）

| 子任务 | 文件 | 状态 |
|--------|------|------|
| FORI-044-D1 全量原型设计 | `docs/execution/FORI-044_FULL_DESIGN.md` | ✅ done |
| FORI-044-D2 技术方案 v2.0 | `docs/execution/TECHNICAL_SOLUTION.md` | ✅ done |
| FORI-044-D3 PM 计划 v2.0 | `docs/execution/PM_TASK_PLAN.md`（本文件）| ✅ done |
| FORI-044-D4 Codex 实现 handoff | `.ai/handoffs/FORI-044-full-implement.md` | ✅ done |
| FORI-044-D5 REVIEW_ROUND2 更新 | `docs/execution/REVIEW_HUMAN_ROUND2_TASKS.md` | ✅ done |
| FORI-044-D6 PROTOTYPE_COMPLETION 更新 | `docs/execution/PROTOTYPE_COMPLETION.md` | ✅ done |

### Wave 2 — 设计评审（Codex woot，可选）

| 子任务 | Owner | 模型 | 状态 |
|--------|-------|------|------|
| FORI-044-R1 设计包评审 | Codex | gpt-5.4-mini | 待派发（Wave 1 PASS 后）|

### Wave 2.5 — Wave 3 启动门控（HARD GATE）

**以下条件须全部满足，方可派发 Wave 3：**

| 验收条件 | Owner | 状态 |
|---------|-------|------|
| 设计包路由覆盖：全部 36+ 条原型路由均有 §3 UI 规格（含 §3.26–§3.30 新增 5 条）| Claude | ✅ 本次修订完成 |
| 每条规格页面须包含：可见内容 / 空状态 / 错误状态 / 角色门控 / Agent FAB（yes/no）| Claude | ✅ 本次修订完成 |
| §8.4 收益结算 IA 决策明确（无 TBD，无歧义）| Claude | ✅ 本次修订完成（内嵌卡片方案）|
| `/profile/transactions/[txId]` 与 `/transaction/[id]` 别名关系已在设计包中显式说明 | Claude | ✅ 本次修订完成 |
| `cd prototype && npm run build` PASS，0 TypeScript 错误 | Cursor/Codex | 待确认 |
| Human 预览关键路由通过：`/home` `/explore/dict/community-001` `/price/community-001` `/match` `/transaction/tx-001` `/auth/login` | Human | 待 |

**门控当前状态**：🔒 BLOCKED — 等待 prototype build 确认 + Human 预览

**未覆盖路由明确任务**（Wave 3 必须实现，不得遗漏）：

| 路由 | 任务描述 | Owner | 设计规格 |
|------|---------|-------|---------|
| `/` | 启动页 + 三步引导 onboarding | Codex | §3.26 |
| `/profile` | 个人中心（含收益结算内嵌卡）| Codex | §3.27 + §8.4 |
| `/profile/settings` | 设置（通知/隐私/账号/外观）| Codex | §3.28 |
| `/workspace/agent/listings` | 经纪人房源管理 | Codex | §3.29 |
| `/workspace/agent/stats` | 成交统计与转化漏斗 | Codex | §3.30 |

### Wave 3 — 原型补全实现（Codex woot）

| 子任务 | Owner | 依赖 | 状态 |
|--------|-------|------|------|
| 落实 FORI-044 handoff 指定 UI（含 §3.26–§3.30 新增路由）| Codex | Wave 2.5 Gate ✅ | 待派发 |
| 目标：build PASS + 全部路由内容完整（包含空/错误状态）| Codex | — | 待 |
| 收益结算内嵌卡片实现（BottomSheet，§8.4）| Codex | §3.27 | 待 |

### Wave 4 — 实现评审（Claude epix）

| 子任务 | Owner | 依赖 | 状态 |
|--------|-------|------|------|
| FORI-044-R2 实现评审 | Claude | W3 done | queued |

---

## 4. FORI-045+ 后续 API 实现计划

| ID | 任务 | Agent | 模型 | 依赖 | 预计 |
|----|------|-------|------|------|------|
| FORI-045 | 价格 API 端点（FastAPI） | Codex | gpt-5.5 | FORI-044 W1 PASS | 07-04+ |
| FORI-046 | 价格 Agent 单测 | Hermes + Codex | mini | FORI-045 | 07-05+ |
| FORI-047 | 字典 API Wave 2 设计 | Claude | blade | Human Gate | 07-09+ |
| FORI-048 | 字典 API 实现 | Codex | gpt-5.5 | FORI-047 | 07-10+ |
| FORI-049 | 字典 Playwright E2E | Hermes + Codex | mini | FORI-048 | 07-12+ |
| FORI-050 | 匹配 API 设计 | Claude | blade | FORI-047+ | 07-14+ |
| FORI-060 | KYC + 公证 API 设计 | Claude | blade | FORI-050+ | 07-21+ |

---

## 5. 交叉换位日程（FORI-044 + 近期）

### 5.1 dispatch-log 统计（截至 2026-07-03）

```
总条目: 31（.ai/orchestration/dispatch-log.jsonl）
├── Claude: 13（含 session limit 重试/SKIPPED）
├── Codex:  11（含 design-review-r2、P0 fixes）
└── Cursor:  7（merge、hotfix、cron、quota study、manual resume）

实质成功派发（去重）: Claude ~8 · Codex ~9
VERDICT 链: FAIL→PASS（FORI-044 设计）· CONDITIONAL_PASS→P0 PASS（实现）
```

完整复盘：`docs/execution/FORI-095_COLLABORATION_RETROSPECTIVE.md`

### 5.2 日程表

| 日期窗口 | 轮次 | 设计者 | 评审者 | 内容 | 状态 |
|----------|------|--------|--------|------|------|
| 07-02 ✅ | R1 | Claude/Cursor | Codex | 设计包 | done |
| 07-02 ✅ | R2 | Codex | Claude/Cursor | 实现 | done |
| 07-02 ✅ | R3 | Claude/Cursor | Cursor | 纠错+付费墙 | done |
| 07-02 ✅ | D4-W1 FORI-043 设计 | Claude epix | Codex woot | CONDITIONAL_PASS | done |
| 07-02 ✅ | D4-W1 FORI-043 原型 | Codex woot | Claude epix | CONDITIONAL_PASS | done |
| 07-03 ✅ | FORI-044 全量设计 | Claude epix | Codex woot | FAIL→R2 PASS | done |
| 07-03 ✅ | FORI-044 W3 原型 R2+P0 | Codex woot | Claude epix | P0 review **PASS** | done |
| 07-04~05 | FORI-045 价格 API | Codex | Claude | Wave 1 API 端点 | queued |
| 07-09~12 | FORI-047 字典 API 设计 | Claude | Codex | Wave 2 设计 | queued |

---

## 6. 配额感知派发日历

> **v3 三层模型** · 详见 `docs/execution/QUOTA_OPTIMIZATION_STUDY.md`

| 时段 (PDT) | Agent | 任务类型 | 模型 tier | 备注 |
|------------|-------|----------|-----------|------|
| 02:10+ | Claude epix | 设计/ADR | blade | FORI-044 W1 当前窗口 |
| 09:00–14:00 | Codex woot | 实现/测试 | gpt-5.5/mini | 主力实现节点 |
| 14:00–19:00 | Claude epix | 评审/设计 | blade | 并行 Codex |
| 19:00–22:30 | Cursor | 合并/编排 | lite | 不替代 Claude 设计 |
| 22:30 重置 | Claude | Layer B 刷新 | — | 等待 Hermes cron |
| 00:29 重置 | Codex | Layer B 刷新 | — | |

**门控脚本**:
```bash
.ai/orchestration/scripts/quota-check.sh claude   # 派发 Claude 前
.ai/orchestration/scripts/quota-check.sh codex    # 派发 Codex 前
```

---

## 7. D4 Wave 1 Agent Attribution（完整）

### FORI-043 定价模块

| 阶段 | Agent | 节点 | 分支 | SHA | VERDICT |
|------|-------|------|------|-----|---------|
| 设计 | Claude epix | epix | `claude/fori-043-pricing-design` | `02208ea` | CONDITIONAL_PASS |
| 设计评审 | Codex woot | woot | `codex/fori-043-design-review` | `5cc4411` | CONDITIONAL_PASS |
| 原型实现 | Codex woot | woot | `codex/fori-043-prototype-impl` | `c7415a5` | — |
| 实现评审 | Claude epix | epix | `claude/fori-043-impl-review` | `8f1133b` | CONDITIONAL_PASS |
| 集成合并 | Cursor epix | epix | `cursor/fori-043-integration` | `723db79` | build PASS |

### FORI-044 全量设计包

| 阶段 | Agent | 节点 | 分支 | SHA | VERDICT |
|------|-------|------|------|-----|---------|
| 全量设计 | Claude epix | epix | `claude/fori-044-full-design` | TBD | 本轮 |
| 设计评审 | Codex woot | woot | `codex/fori-044-design-review` | TBD | queued |
| 原型补全 | Codex woot | woot | `codex/fori-044-prototype` | TBD | queued |
| 实现评审 | Claude epix | epix | — | TBD | queued |
| 集成合并 | Cursor epix | epix | — | TBD | queued |

**派发日志**: `.ai/orchestration/dispatch-log.jsonl`

---

## 8. 协作模型总结（v2）

| 维度 | 多 Agent（本项目）| 单 Cursor |
|------|------------------|-----------|
| 设计深度 | Claude ADR-009 + 10+ 设计文档 | 文档质量不稳定 |
| 实现吞吐 | Codex 5 项 R2 并行 + Wave 原型 | 串行 |
| 对抗评审 | Codex 评 R1/D4，Claude 评 R2/R3 | 自审盲区 |
| 配额管理 | 分层路由，401 时 Cursor 后备 | 无编排 |
| 产出规模 | 105+ 文件，36 路由 build，CANON SSOT | 仅代码无治理 |
| 可复用性 | CAMA CROSS_SWAP_PLAYBOOK | 一次性 |

---

## 9. 下一步行动

**即时（本轮提交后）**:
1. `git commit -m "docs: FORI-044 full prototype design + tech solution v2 + PM plan v2 [claude]"`
2. Human 预览 `prototype` 关键路由（`/home`, `/explore/dict/community-001`, `/price/community-001`）
3. 等待 Human Gate 通过后派发 FORI-044 W3（Codex 原型补全）

**短期（07-04~07）**:
4. Codex FORI-045 价格 API 端点（woot，gpt-5.5）
5. Hermes FORI-046 单测验证
6. Claude FORI-047 字典 API Wave 2 设计（配额重置后）

---

*PM 计划 v2.0 · 2026-07-03 · Claude Code (epix)*
