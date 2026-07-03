# Fori 交叉换位协作协议 (Cross-Swap Protocol)

> **版本**: 1.0 · 2026-07-02  
> **触发**: 人类评审 Round 2（`.ai/handoffs/Human/Fori平台原型评审意见.md`）  
> **编排者**: Cursor · **配额门控**: `scripts/quota-check.sh`

---

## 1. 原则

Claude Code 与 Codex **每轮互换角色**：

| 轮次 | 设计者/研究者 | 评审者/修订者 | Cursor |
|------|--------------|--------------|--------|
| **R1** | Claude (epix) | Codex (woot) | 合并 R1 定稿 |
| **R2** | Codex (woot) | Claude (epix) | 合并 R2 定稿 |
| **R3** | Claude (epix) | Codex (woot) | 最终整合 |

- 设计者产出 spec / 设计文档 / 实现
- 评审者产出对抗性评审：`VERDICT` + `FINDINGS` + `REQUIRED_CHANGES`
- Cursor 合并 accepted changes，更新 manifest / plan / Obsidian

---

## 2. 评审产出格式（强制）

```markdown
## VERDICT: [PASS | CONDITIONAL_PASS | FAIL]

## FINDINGS
### F1: ...
- **严重级别**: Critical | Major | Minor | Info
- **证据**: path:section

## REQUIRED_CHANGES
（VERDICT 非 PASS 时必填，可操作、可验证）
```

---

## 3. Round 2 人类评审 — 分支与产出

### R1 — 设计（Claude）→ 评审（Codex）

| 步骤 | Agent | 分支 | 产出 |
|------|-------|------|------|
| 1a | Claude epix | `claude/fori-050-round2-r1-design` | `docs/execution/ROUND2_R1_DESIGN.md`, PRD/UI patches, `.ai/handoffs/FORI-050-round2-implement.md` |
| 1b | Codex woot | `codex/fori-051-round2-r1-review` | `docs/reviews/REVIEW-R2-R1-CODEX.md` |
| 1c | Cursor | `cursor/fori-054-round2-r1-merge` | `docs/execution/ROUND2_R1_MERGED.md` |

### R2 — 实现（Codex）→ 评审（Claude）

| 步骤 | Agent | 分支 | 产出 |
|------|-------|------|------|
| 2a | Codex woot | `codex/fori-052-round2-r2-implement` | `prototype/` 变更 |
| 2b | Claude epix | `claude/fori-053-round2-r2-review` | `docs/reviews/REVIEW-R2-R2-CLAUDE.md` |
| 2c | Cursor | `cursor/fori-055-round2-r2-merge` | `docs/execution/ROUND2_R2_MERGED.md` + fixes |

### R3 — 条件触发（R2 CONDITIONAL_PASS）

| 步骤 | Agent | 分支 | 产出 |
|------|-------|------|------|
| 3a | Claude epix | `claude/fori-056-round2-r3-design` | 设计修订 |
| 3b | Codex woot | `codex/fori-057-round2-r3-implement` | 实现修订 |

---

## 4. 配额门控

```bash
.ai/orchestration/scripts/quota-check.sh claude   # R1 设计、R2 评审前
.ai/orchestration/scripts/quota-check.sh codex    # R1 评审、R2 实现前
```

429 时更新 `quota-ledger.json`，记录 `resume_at`，暂停并文档化。

---

## 5. woot 同步规则

**禁止** rsync 整个 repo（含 `.git`）。仅同步本轮变更文件：

```bash
rsync -av --exclude='.git' /Users/epix/Dev/Fori/docs/execution/ROUND2_R1_DESIGN.md woot:/Users/woot/Dev/Fori/docs/execution/
# 按需追加 PRD.md, UI_DESIGN.md, handoffs 等
```

---

## 6. 构建验证

R2 实现后：

```bash
cd prototype && npm run build
```

---

## 7. 状态更新清单

每轮完成后更新：

- `.ai/manifest.json`
- `.ai/plan/current.md`
- `.ai/startup/STARTUP_BRIEF.md`
- `.ai/orchestration/quota-ledger.json`
- Obsidian: `/Users/epix/Obsidian/HermesEpix/Dev-Projects/Fori/交叉换位协作-Round2.md`

---

## 8. Git 约定

- Commit 标识：`[claude]`、`[codex]`、`[cursor]`
- **禁止**合并到 `main`（由 Human/Cursor Gate 单独执行）
- 每 Agent 独立分支，Cursor 合并轮次定稿
