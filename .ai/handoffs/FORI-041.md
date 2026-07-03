# Handoff — FORI-041

> **状态**: ready（待 quota-check.sh claude 通过后可派发）  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-041-adr-migration`  
> **预估配额**: ~30 msgs（Layer A）  
> **前置**: FORI-040 `docs/execution/MVP_SLICE.md` 已完成

---

## 角色

你是 Fori 项目的 **Expert · 架构/深审**（Claude Code）。任务类型：**设计 (Design)** + **ADR**。

## 项目上下文（启动必读）

1. `CLAUDE.md` — 项目约束
2. `.ai/manifest.json` — 当前任务 FORI-041
3. `docs/SPEC.md` — 技术栈锁定
4. `docs/execution/MVP_SLICE.md` — D4 实施切片（Wave 0）
5. `docs/ARCHITECTURE.md` — 现有架构
6. `prototype/` — 待迁移原型

## 任务

**任务 ID**: FORI-041  
**标题**: 生产仓库结构 + ADR-007 原型→生产迁移策略  
**阶段**: D4 — MVP 开发设计  
**门禁**: L2

### 目标

产出 Fori 生产 monorepo 的目录结构定义与 ADR-007，明确 `prototype/` 如何一次性迁移到 `apps/web`，避免长期双维护。

### 必须产出

1. `docs/adr/ADR-007-prototype-to-production-migration.md`
   - 决策：迁移 vs 重写 vs 并存（推荐一次性迁移）
   - `prototype/` 各路由 → `apps/web` 映射表
   - 组件抽取到 `packages/ui` 的策略
   - 迁移验收 checklist
2. 更新 `docs/ARCHITECTURE.md` 增补 §「仓库布局」或指向 ADR-007
3. （可选）`docs/execution/REPO_LAYOUT.md` 机器可读目录树

### 约束

- 技术栈遵循 `docs/SPEC.md` §5.1（Next.js 14、FastAPI、PostgreSQL、Kafka）
- 禁止 MVP 降级、禁止 TBD
- **不得编写实现代码**（仅文档/ADR/接口定义）
- 考虑 `packages/shared` 类型与 API OpenAPI 契约位置

### 验收标准

- [ ] ADR-007 含 Context / Decision / Consequences / Migration Steps
- [ ] 覆盖 MVP_SLICE.md Wave 0 目标结构
- [ ] 明确 prototype 冻结时间点与归档策略
- [ ] 六个业务 Agent 在 `services/agents/` 的占位说明

### Git

```bash
cd /Users/epix/Dev/Fori
git checkout -B claude/fori-041-adr-migration
# 完成后
git add docs/adr/ docs/ARCHITECTURE.md docs/execution/
git commit -m "docs: ADR-007 prototype migration + repo layout [claude]"
```

### 完成后

更新 `.ai/manifest.json` nextTask → FORI-042；填写评审 handoff 或通知 Cursor 发起新会话评审。

---

## 派发命令（Cursor 门控后执行）

```bash
cd /Users/epix/Dev/Fori
.ai/orchestration/scripts/quota-check.sh claude || exit 1
claude -p "$(cat .ai/handoffs/FORI-041.md)" \
  --max-turns 30 --allowedTools Read,Write,Bash \
  --dangerously-skip-permissions < /dev/null
```
