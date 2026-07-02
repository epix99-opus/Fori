# Startup Brief — Fori

> Last updated: 2026-07-02 by @cursor
> 状态: **D4 Wave 0 完成** — 原型设计 97%，准备 Wave 1 定价切片

## 项目状态

- 当前阶段: **D4 MVP 开发**（Wave 0 基础设施 ✅）
- 原型设计: **97% 完成** — 见 `docs/execution/PROTOTYPE_COMPLETION.md`
- 下一步: **FORI-043** 定价 API + 数据模型

## Wave 0 产出

| 任务 | 分支 | 产出 |
|------|------|------|
| FORI-041 | `claude/fori-041-adr-migration` | ADR-009, REPO_LAYOUT.md |
| FORI-042 | `codex/fori-042-monorepo-init` | apps/web, apps/api, packages/* |

## 构建验证（2026-07-02）

- `prototype && npm run build` → ✅ 33 页
- `apps/web && npm run build` → ✅
- `apps/api` GET `/health` → ✅ 200

## 配额

Layer A 可用；派发前运行 `quota-check.sh`。本次会话 Claude FORI-041+评审、Codex FORI-042 已执行，ledger 未记录 429。

## woot 待办（阻塞）

- [ ] **修复 git 仓库** — rsync 损坏了 `.git/objects`（bad object HEAD）
- [ ] 建议: `mv Fori Fori.bak && git clone ...` 后 pull 各 feature 分支
- [ ] Codex trust 配置

## 关键决策

1. 原型→生产：一次性迁移（ADR-009 Option A）
2. 首垂直切片：模块五定价（FORI-043+）
3. prototype 冻结点：FORI-042 build PASS 后仅 bugfix
