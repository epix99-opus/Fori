# Handoff — FORI-042

> **状态**: blocked（待 FORI-041 设计评审 PASS + quota-check.sh codex 通过）  
> **目标 Agent**: Codex @ woot  
> **分支**: `codex/fori-042-monorepo-init`  
> **预估配额**: ~60 min（Layer A）  
> **worktree**: 推荐 `git worktree add ../Fori-fori-042 codex/fori-042-monorepo-init`

---

## 角色

你是 Fori 项目的**开发者**（Codex on woot）。任务类型：**执行 (Execute)**。  
**禁止自验标 done** — Hermes 将 `git diff` 验证。

## 项目上下文（启动必读）

1. `AGENTS.md` — 协同与分支策略
2. `docs/SPEC.md` — 技术栈
3. `docs/execution/MVP_SLICE.md` — Wave 0 目标结构
4. `docs/adr/ADR-007-prototype-to-production-migration.md` — **必须先存在**（FORI-041 产出）
5. `prototype/` — 迁移参考

## 任务

**任务 ID**: FORI-042  
**标题**: Monorepo 初始化（apps + packages 脚手架）  
**阶段**: D4  
**门禁**: L1

### 目标

按 ADR-007 与 MVP_SLICE 创建生产 monorepo 骨架，**不迁移业务页面**（留给 FORI-045+）。

### 必须产出

```
apps/
  web/          # Next.js 14 App Router 空壳 + Tailwind + shadcn 配置
  api/          # FastAPI 空壳 + /health
packages/
  shared/       # package.json + tsconfig 占位
  ui/           # 空组件库导出
```

附加：
- 根 `package.json` workspace 配置（pnpm 或 npm workspaces，与 SPEC 一致）
- `Makefile` 或 `turbo.json` 最小 dev 入口：`make dev` 占位
- `.github/workflows/ci.yml` 骨架（lint + build，允许 initially skip）
- `apps/api/pyproject.toml` 或 `requirements.txt`（FastAPI）

### 约束

- 遵循 ADR-007 目录命名
- **不要**删除或大幅修改 `prototype/`
- 单测占位即可；须有 `apps/web` 与 `apps/api` 可启动
- commit 消息：`feat: monorepo scaffold for D4 [codex]`

### 验收标准

- [ ] `cd apps/web && npm run build` PASS
- [ ] `cd apps/api &&` 启动后 `/health` 返回 200
- [ ] workspace 依赖 `packages/shared` 可被 web import
- [ ] 无硬编码密钥

### Git / Worktree

```bash
cd /Users/woot/Dev/Fori
git fetch origin
git worktree add ../Fori-fori-042 -B codex/fori-042-monorepo-init
cd ../Fori-fori-042
# 实现后
git add -A && git commit -m "feat: monorepo scaffold for D4 [codex]"
```

### 429 续跑

若 Layer A 耗尽：commit 断点 → `codex-quota-record.sh --task-id FORI-042 --prompt-file .ai/handoffs/FORI-042.md`

---

## 派发命令（Cursor 门控后执行）

```bash
.ai/orchestration/scripts/quota-check.sh codex || exit 1
ssh woot 'cd /Users/woot/Dev/Fori && git fetch && git worktree add ../Fori-fori-042 -B codex/fori-042-monorepo-init 2>/dev/null || true && \
  cd ../Fori-fori-042 && codex exec "$(cat .ai/handoffs/FORI-042.md)" --model gpt-5.5 --yolo < /dev/null 2>&1'
```
