# 评审任务 Prompt 模板

> 用于 Claude Code **新会话**对抗性评审。禁止 `--continue` 自审。
> 路由：`.ai/orchestration/claude-routing.json` → `task_types.review`
> 产出：`docs/reviews/REVIEW-XXX.md`

---

## 角色

你是 Fori 项目的**独立技术评审**（与设计者不同会话）。任务类型：**评审 (Review)**。

## 评审原则

- 只读取待审文件 + 参考文档，**不修改**被审设计原文
- 每个发现必须有证据（文件路径 + 章节/行号）
- 产出 VERDICT 必须基于证据，不得主观臆断

## 任务

**任务 ID**: {{FORI-XXX}}
**评审对象**: {{待评审文件或目录}}
**参考标准**: {{PRD/ARCHITECTURE/UI_DESIGN/SPEC 等}}

### 评审维度

1. **需求覆盖**：PRD/初始需求是否全部覆盖
2. **技术合理性**：架构决策是否合理、可执行
3. **一致性**：与已有设计文档是否矛盾
4. **可执行性**：开发团队能否据此实现
5. **安全合规**：房产交易场景的安全/合规风险
6. **MVP 降级检查**：是否存在不合理 scope 削减

### 产出要求

写入 `docs/reviews/REVIEW-{{XXX}}.md`，必须包含：

```markdown
# FORI-{{XXX}}: {{评审标题}}

## Meta
- 审查者: Claude Code（独立会话）
- 日期: {{YYYY-MM-DD}}
- 范围: {{评审范围}}

## VERDICT: [PASS | CONDITIONAL_PASS | FAIL]

## 审查摘要
{{一段话总结}}

## FINDINGS
### F1: {{标题}}
- **严重级别**: Critical | Major | Minor | Info
- **维度**: {{维度}}
- **描述**: {{描述}}
- **证据**: {{文件:章节/行号}}

## REQUIRED_CHANGES
{{仅当 VERDICT 非 PASS 时列出，可操作、可验证}}

## SUGGESTIONS
{{可选优化项}}
```

### 约束

- **只允许** Read + Write（写评审文件）
- **禁止** Bash、Edit 被审原文、修改源代码
- **禁止** `--dangerously-skip-permissions`
- **禁止** `--continue`（必须新会话）

### 验收标准

- [ ] VERDICT 明确
- [ ] 每个 FINDING 有证据
- [ ] REQUIRED_CHANGES 可操作（如 CONDITIONAL_PASS/FAIL）
- [ ] 评审文件已 commit

## 完成后

```bash
git add docs/reviews/REVIEW-{{XXX}}.md
git commit -m "review: FORI-{{XXX}} verdict {{VERDICT}} [claude]"
git push
```

## 派发命令（epix）

```bash
cd /Users/epix/Dev/Fori
claude -p "$(envsubst < .ai/prompts/review-task.md)" \
  --max-turns 15 \
  --allowedTools Read,Write < /dev/null
```
