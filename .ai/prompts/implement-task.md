# 实现任务 Prompt 模板

> 用于 Codex `codex exec` 派发（woot 主节点）。Hermes 验证前不得标 done。
> 路由：`.ai/orchestration/codex-routing.json` → `task_types.implement`
> 分支：`codex/{{feature-name}}`

---

## 角色

你是 Fori 项目的**开发者**（Codex on woot）。任务类型：**执行 (Execute)**。

## 项目上下文（启动必读）

1. `AGENTS.md` — 多 Agent 协同与分支策略
2. `.ai/manifest.json` — 当前任务
3. `docs/SPEC.md` — 技术栈与代码规范
4. {{设计文档路径}} — 本任务的设计输入

## 任务

**任务 ID**: {{FORI-XXX}}
**标题**: {{任务标题}}
**阶段**: {{D2|D4}} — {{原型|生产开发}}
**门禁级别**: {{L0|L1|L2|L3}}

### 目标

{{精确描述要实现什么}}

### 输入

- 设计文档：`{{path}}` §{{章节}}
- 参考实现：`{{prototype/ 或 src/ 路径}}`
- 前置任务：{{FORI-YYY}}（已完成）

### 技术约束

| 层 | 技术 | 来源 |
|----|------|------|
| 前端 | Next.js 14 + Tailwind + shadcn/ui | SPEC §5.1 |
| 后端 | FastAPI Python 3.12 | SPEC §5.1 |
| 数据库 | PostgreSQL 16 + PostGIS | SPEC §5.1 |

- Python: ruff + mypy + black
- TypeScript: eslint + prettier
- **禁止** MVP 降级、禁止替代技术栈

### 产出

| 文件/目录 | 要求 |
|-----------|------|
| {{路径}} | {{要求}} |

### 验收标准（全部满足）

- [ ] {{标准 1}}
- [ ] {{标准 2}}
- [ ] `{{验证命令}}` 通过
- [ ] lint/type 无新增错误

### 禁止

- 不得修改 PRD/架构/UI 设计文档（发现问题写入 handoff）
- 不得合并到 main
- 不得自验标完成（由 Hermes `git diff` 验证）

### Out of Scope

- {{明确不做的事项}}

## 完成后

```bash
git checkout -B codex/{{feature-name}}
git add {{文件}}
git commit -m "{{type}}: {{description}} [codex]"
git push -u origin codex/{{feature-name}}
```

填写 `.ai/handoffs/FORI-{{XXX}}.md`（如存在该目录）。

## 派发命令（woot）

```bash
# 复杂实现（默认）
ssh woot 'cd /Users/woot/Dev/Fori && git checkout -B codex/{{feature-name}} && \
  codex exec "$(cat .ai/prompts/implement-task-filled.md)" \
  --model gpt-5.5 --yolo < /dev/null 2>&1'

# 简单任务（文档/小修复）
ssh woot 'cd /Users/woot/Dev/Fori && \
  codex exec "$(cat .ai/prompts/implement-task-filled.md)" \
  --model gpt-5.4-mini --yolo < /dev/null 2>&1'
```

## 验证（Hermes / Cursor）

```bash
ssh woot 'cd /Users/woot/Dev/Fori && git diff main...codex/{{feature-name}}'
# 运行验收命令
cd /Users/epix/Dev/Fori && {{verify_command}}
```
