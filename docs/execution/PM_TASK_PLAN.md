# Fori 产品开发 PM + 任务分配计划

> **版本**: 1.0 · 2026-07-02  
> **Sprint**: Round2 完成 + R3 PASS + D4 Wave1 启动

---

## 1. 当前 Sprint 目标

| 里程碑 | 状态 | 交付 |
|--------|------|------|
| 人类评审 R2 交叉换位 | ✅ | ROUND2_R1/R2_MERGED |
| R3 Minor 清零 | ✅ PASS | ROUND2_R3_MERGED |
| 集成合并 | ✅ | `cursor/fori-060-integration` |
| D4 Wave1 定价原型 | ✅ | FORI-043 设计+原型 CONDITIONAL_PASS |
| Human 原型复审 | 待 | `/home` 演示 |

---

## 2. 任务看板 FORI-080~095

| ID | 标题 | Owner | P | 状态 | 依赖 |
|----|------|-------|---|------|------|
| FORI-080 | 主功能清单 | Claude | P0 | ✅ done | — |
| FORI-081 | 全角色交互矩阵 | Claude | P0 | ✅ done | — |
| FORI-082 | SUUMO 披露规范 | Claude | P0 | ✅ done | — |
| FORI-083 | 字典三态切换 | Cursor | P0 | ✅ done | 082 |
| FORI-084 | 角色脱敏 | Cursor | P0 | ✅ done | 081 |
| FORI-085 | 登录分级矩阵 | Cursor | P0 | ✅ done | 081 |
| FORI-086 | 共建单位裂变设计 | Claude | P1 | ✅ done | 082 |
| FORI-087 | 贡献账本 UI | Codex | P1 | ✅ done | 086 |
| FORI-088 | 分成瀑布图 | Codex | P1 | ✅ done | 086 |
| FORI-089 | 定价撮合方案 | Claude | P1 | ✅ done | — |
| FORI-090 | 价格三角色 | Codex | P1 | ✅ done | 089 |
| FORI-091 | 撮合状态机 | Codex | P1 | ✅ done | 089 |
| FORI-092 | Agent 页面契约 | Claude | P1 | ✅ done | — |
| FORI-093 | Agent FAB | Cursor/Codex | P1 | ✅ done | 092 |
| FORI-094 | 文档治理 CANON | Cursor | P2 | ✅ done | — |
| FORI-095 | R2 协作复盘 | Hermes | P2 | queued | 094 |

---

## 3. 交叉换位日程（未来 2 周）

| 日期窗口 | 轮次 | 设计者 | 评审者 | 内容 |
|----------|------|--------|--------|------|
| 07-02 ✅ | R1 | Claude/Cursor | Codex | 设计包 |
| 07-02 ✅ | R2 | Codex | Claude/Cursor | 实现 |
| 07-02 ✅ | R3 | Claude/Cursor | Cursor | 纠错+付费墙 |
| 07-02 ✅ | D4-W1 FORI-043 设计 | Claude epix | Codex woot | CONDITIONAL_PASS |
| 07-02 ✅ | D4-W1 FORI-043 原型 | Codex woot | Claude epix | CONDITIONAL_PASS |
| 07-03~05 | D4-W1b | Codex | Claude | FORI-044 Agent 契约 + API |
| 07-09~12 | D4-W2 | Claude | Codex | 字典 API Wave2 |

---

## 4. 配额感知派发日历

**Layer A 窗口**: 5h 滚动 · Claude 45 msg · Codex 300 min

| 时段 (PDT) | Agent | 任务类型 | 备注 |
|------------|-------|----------|------|
| 09:00–14:00 | Codex woot | 实现/测试 | 主节点 |
| 14:00–19:00 | Claude epix | 设计/ADR | ✅ Keychain auth |
| 19:00–22:30 | Cursor | 合并/评审后备 | 不限额 |
| 22:30 重置 | Claude | 日配额刷新 | |
| 00:29 重置 | Codex | 日配额刷新 | |

**门控**: 每次派发前 `quota-check.sh`；Claude auth 见 AUTH_PERSISTENCE.md。

---

## 5. D4 Wave 1 Agent Attribution（FORI-043）

| 阶段 | Agent | 节点 | 命令 | 分支 | SHA | VERDICT | 退出码 |
|------|-------|------|------|------|-----|---------|--------|
| 设计 | **Claude** | epix | `claude -p FORI-043-design --max-turns 30` | `claude/fori-043-pricing-design` | `02208ea` | — | 0 |
| 设计评审 | **Codex** | woot | `codex exec review --model gpt-5.4-mini --yolo` | `codex/fori-043-design-review` | `5cc4411` | CONDITIONAL_PASS | 0 |
| 原型实现 | **Codex** | woot | `codex exec impl --model gpt-5.5 --yolo` | `codex/fori-043-prototype-impl` | `c7415a5` | — | 0 |
| 实现评审 | **Claude** | epix | `claude -p FORI-043-impl-review --max-turns 15` | `claude/fori-043-impl-review` | `8f1133b` | CONDITIONAL_PASS | 0 |
| 集成合并 | **Cursor** | epix | merge 4 branches + build | `cursor/fori-043-integration` | `723db79` | build PASS | 0 |

**派发日志**: `.ai/orchestration/dispatch-log.jsonl`（4 条 claude/codex 真实 invocation）

**非 Cursor 后备证明**: 本轮 4 次派发均为真实 `claude -p` / `codex exec`；无 401/429 失败记录。

---

## 5b. 协作 vs 单 Agent 证明（历史）

| 维度 | 多 Agent（本 Sprint） | 单 Cursor |
|------|----------------------|-----------|
| 设计深度 | Claude ADR-009 + 4 份 R2 设计 doc | 文档质量不稳定 |
| 实现吞吐 | Codex woot 5 项 R2 并行不阻塞 epix | Cursor 串行 |
| 对抗评审 | Codex 评 R1、Claude/Cursor 评 R2/R3 | 自审盲区 |
| 配额 | 分层路由，Claude 401 时 Cursor 后备 | 无编排 |
| 产出 | 105 文件合并、33 路由 build、CANON SSOT | 仅代码无治理 |
| 可复用 | CAMA CROSS_SWAP_PLAYBOOK | 一次性 |

**量化**: R2 实现 5 任务（FORI-087~093）Codex ~12min；设计 4 文档 Claude/Cursor；3 轮 VERDICT 可追溯。

---

## 6. 下一步行动

1. **Human**: 预览 `prototype` → `/price`、`/price/community-001`、`/price/community-004`（D-tier）
2. **Codex**: FORI-044 定价 Agent 契约 + FORI-043 API 端点（woot）
3. **Claude**: FORI-044 设计（epix）
4. **Hermes**: FORI-046 单测验证

---

*PM 计划 · 2026-07-02*
