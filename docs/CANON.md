# Fori 文档有效性治理（CANON）

> **任务**: FORI-094 · **版本**: 1.0 · 2026-07-02  
> **目的**: 单一事实源（SSOT），消除 ADR/handoff/routing 并行矛盾

---

## 1. 权威层级（高 → 低）

| 层级 | 路径 | 说明 |
|------|------|------|
| L0 产品 | `docs/PRD.md` | 需求基准 |
| L1 架构 | `docs/ARCHITECTURE.md`, `docs/adr/ADR-*.md` | ADR-009 为原型→生产迁移 |
| L2 执行 | `docs/execution/*.md` | 轮次合并定稿（ROUND2_R*_MERGED） |
| L3 编排 | `.ai/manifest.json`, `.ai/plan/current.md` | 机器可读状态 |
| L4 Handoff | `.ai/handoffs/FORI-*.md` | 任务派发快照（完成即归档） |
| L5 评审 | `docs/reviews/REVIEW-*.md` | 只读评审记录 |

**冲突规则**: 高层覆盖低层；同层以 **最新合并定稿** 为准。

---

## 2. 当前有效 vs 已 supersede

| 文档 | 状态 | 取代者 |
|------|------|--------|
| ADR-007（handoff 旧引用） | superseded | `docs/adr/ADR-009-prototype-to-production-migration.md` |
| `.ai/agent-routes.json` v1 | active | 与 `.ai/orchestration/*-routing.json` 并存，manifest 指向 orchestration |
| `ROUND2_R1_DESIGN.md` | archived | `ROUND2_R1_MERGED.md` |
| R2 实现 handoff | archived | `ROUND2_R2_MERGED.md` |

---

## 3. 编排配置 SSOT

| 用途 | 权威路径 |
|------|----------|
| Claude 路由 | `.ai/orchestration/claude-routing.json` |
| Codex 路由 | `.ai/orchestration/codex-routing.json` |
| 配额账本 | `.ai/orchestration/quota-ledger.json` |
| 认证持久化 | `.ai/orchestration/AUTH_PERSISTENCE.md` |
| 交叉换位 | `.ai/orchestration/CROSS_SWAP_PROTOCOL.md` |
| Prompt 模板 | `.ai/prompts/design-task.md`, `review-task.md`, `implement-task.md` |

---

## 4. 版本标记约定

- 执行文档首行：`> **版本**: x.y · ISO 日期`
- 合并定稿文件名含轮次：`ROUND2_R2_MERGED.md`
- manifest `currentTask.updatedAt` 与 git commit 对齐

---

## 5. 维护流程

1. 新 ADR → `docs/adr/`，更新本表
2. 轮次完成 → 写 `docs/execution/*_MERGED.md`，更新 manifest
3. Handoff 完成 → 状态改为 `completed`，不删除
4. 季度审查 → Cursor + Human 核对本 CANON

*FORI-094 · 文档有效性 SSOT*
