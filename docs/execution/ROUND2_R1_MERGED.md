# Fori Round 2 · R1 合并定稿

> **版本**: 1.0 · 2026-07-02  
> **编排**: Cursor  
> **分支**: `cursor/fori-054-round2-r1-merge`  
> **评审**: `docs/reviews/REVIEW-R2-R1-CODEX.md` — 原 VERDICT **FAIL**，合并后 **CONDITIONAL_PASS**

---

## 1. 交叉换位 R1 追踪

| 角色 | Agent | 分支 | 产出 |
|------|-------|------|------|
| 设计者 | Claude（401）/ Cursor 后备 | `claude/fori-050-round2-r1-design` | ROUND2_R1_DESIGN + 6 子文档 |
| 评审者 | Codex (woot) | `codex/fori-051-round2-r1-review` | REVIEW-R2-R1-CODEX.md |
| 合并者 | Cursor | `cursor/fori-054-round2-r1-merge` | 本文件 + 修订 |

---

## 2. Codex 评审结论与处置

| Finding | 严重级别 | 处置 | 状态 |
|---------|---------|------|------|
| F1 分成模型与 PRD 不一致 | High | 重写 `CO_CREATION_FISSION.md` §5 对齐 PRD §5.3（80/15/5） | ✅ 已合并 |
| F2 评审项5 未覆盖却标 8/8 | Medium | 改为 7/8，评审项5 标 out-of-scope R2-5 | ✅ 已合并 |
| F3 公证机构缺 API 契约 | Medium | `ROLE_UX_MATRIX.md` 新增 notary API-only 5 端点 | ✅ 已合并 |
| F4 FEATURE_INVENTORY 残留未决状态 | Medium | 统一为 ✅/R2/out-of-scope 标签 | ✅ 已合并 |

**合并后 VERDICT**: **CONDITIONAL_PASS** — R2 实现可启动；评审项5 治理留 Wave R2-5。

---

## 3. 接受的 R1 设计包（Canonical）

| 文档 | 路径 | 用途 |
|------|------|------|
| R1 总览 | `docs/execution/ROUND2_R1_DESIGN.md` | 8 条评审响应 |
| 功能清单 | `docs/FEATURE_INVENTORY.md` | FORI-080 |
| 角色交互 | `docs/ROLE_UX_MATRIX.md` | FORI-081 + notary API |
| 共建裂变 | `docs/CO_CREATION_FISSION.md` | FORI-086（PRD 对齐版） |
| 定价撮合 | `docs/PRICING_MATCHING.md` | FORI-089 |
| Agent 契约 | `docs/AGENT_PAGE_CONTRACTS.md` | FORI-092 |
| PRD/UI 补丁 | `docs/PRD.md`, `docs/UI_DESIGN.md` | §六字典、§七付费 |
| Codex handoff | `.ai/handoffs/FORI-050-round2-implement.md` | R2 实现 |

---

## 4. R2 实现范围（Codex）

按 `FORI-050-round2-implement.md`：

- FORI-087 贡献账本 + 首建者标签
- FORI-088 分成瀑布图（**PRD 口径**：80/15/5）
- FORI-090 价格三角色 Tab
- FORI-091 撮合状态机 + 4h 倒计时
- FORI-093 Agent FAB 关键页铺开

---

## 5. 构建门禁

```bash
cd prototype && npm run build  # R2 完成后
```

---

*R1 合并定稿 · Cursor · 2026-07-02*
