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
| D4 Wave1 定价 API | 🔄 **进行中** | FORI-043 设计完成，待评审 |
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
| 07-02~03 | D4-W1 FORI-043 | Claude | Hermes/Cursor | 定价 API 设计（本文档）→ 待评审 |
| 07-03~05 | D4-W1a | Hermes/Cursor | Claude | FORI-043 设计评审 |
| 07-06~08 | D4-W1b | Codex | Claude | FORI-044/045 实现 |
| 07-09~12 | D4-W2 | Claude | Codex | 字典 API Wave2 |

---

## 4. 配额感知派发日历

**Layer A 窗口**: 5h 滚动 · Claude 45 msg · Codex 300 min

| 时段 (PDT) | Agent | 任务类型 | 备注 |
|------------|-------|----------|------|
| 09:00–14:00 | Codex woot | 实现/测试 | 主节点 |
| 14:00–19:00 | Claude epix | 设计/ADR | **需 auth 恢复** |
| 19:00–22:30 | Cursor | 合并/评审后备 | 不限额 |
| 22:30 重置 | Claude | 日配额刷新 | |
| 00:29 重置 | Codex | 日配额刷新 | |

**门控**: 每次派发前 `quota-check.sh`；Claude auth 见 AUTH_PERSISTENCE.md。

---

## 5. D4 Wave 1 Agent Attribution（FORI-043~046）

| 任务 | 阶段 | Claude (epix) | Codex (woot) | SHA |
|------|------|:-------------:|:------------:|-----|
| FORI-043 | Design | ✅ 设计者 | — | 待填（commit SHA） |
| FORI-043 | Review | — | ✅ 评审者 | 待填 |
| FORI-044 | Design | ✅ 设计者 | — | 待填 |
| FORI-044 | Review | — | ✅ 评审者 | 待填 |
| FORI-045 | Execute | — | ✅ 实现者 | 待填 |
| FORI-045 | Review | ✅ 评审者 | — | 待填 |
| FORI-046 | Verify | Hermes | Hermes | 待填 |

> SHA 列在对应任务 commit 后由 Hermes 回填，格式：`git log --oneline -1 <branch>`

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

1. **Human**: `claude auth login`（epix 一次）→ 恢复 headless 编排
2. **Human**: 预览 `prototype` → `/home`、`/explore/dict`、`/price/community-001`
3. **Codex**: FORI-043 定价 API（woot）
4. **Cursor**: 合并 `cursor/fori-060-integration` → `main`

---

*PM 计划 · 2026-07-02*
