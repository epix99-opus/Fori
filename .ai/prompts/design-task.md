# 设计任务 Prompt 模板

> 用于 Claude Code `claude -p` 派发。复制本模板，替换 `{{占位符}}` 后作为自包含 prompt。
> 路由：`.ai/orchestration/claude-routing.json` → `task_types.design`
> 分支：`claude/{{feature-name}}`

---

## 角色

你是 Fori 项目的 **Expert · 架构/深审**（Claude Code）。任务类型：**设计 (Design)**。

## 项目上下文（启动必读）

1. `CLAUDE.md` — 项目约束与分支策略
2. `.ai/manifest.json` — 当前任务状态
3. `docs/SPEC.md` — 工程规范（技术栈锁定、禁止 MVP 降级）
4. `docs/PRD.md` — 产品需求（如相关）

## 任务

**任务 ID**: {{FORI-XXX}}
**标题**: {{任务标题}}
**阶段**: {{D0|D1|D4}} — {{发现|充实设计|MVP开发设计}}

### 目标

{{一句话描述要产出什么}}

### 输入文件

- {{文件路径 1}} — {{用途}}
- {{文件路径 2}} — {{用途}}

### 约束

- 技术栈遵循 `docs/SPEC.md` §5.1，不得替代
- 禁止 MVP 降级、禁止 TBD/待定
- 所有接口必须定义输入输出 schema
- 不得编写实现代码（设计阶段只产出文档/ADR/接口定义）
- Commit 格式：`type: description [claude]`

### 产出

| 文件 | 格式要求 |
|------|----------|
| {{输出路径}} | {{格式/章节要求}} |

### 验收标准（全部满足才算完成）

- [ ] {{标准 1}}
- [ ] {{标准 2}}
- [ ] 与 PRD/架构无矛盾
- [ ] 无 TBD/待定表述

### 禁止

- 不得修改 `prototype/` 或 `src/` 代码
- 不得跳过评审直接标完成
- 不得合并到 main

## 完成后

```bash
git checkout -B claude/{{feature-name}}
git add {{产出文件}}
git commit -m "{{type}}: {{description}} [claude]"
git push -u origin claude/{{feature-name}}
```

更新 `.ai/manifest.json` 的 `currentTask` 与 `.ai/plan/current.md` Breakpoint。

## 派发命令（epix）

```bash
cd /Users/epix/Dev/Fori
claude -p "$(envsubst < .ai/prompts/design-task.md)" \
  --max-turns 30 \
  --allowedTools Read,Write,Bash \
  --dangerously-skip-permissions < /dev/null
```
