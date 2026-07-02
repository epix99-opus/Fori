# Fori 多 Agent 最佳实践集成

> 基于 Claude Code 官方最佳实践 (code.claude.com/docs/en/best-practices) 
> + Codex 官方最佳实践 (developers.openai.com/codex/learn/best-practices)
> + CAMA 协作协议本地化应用

## 一、Claude Code 最佳实践（官方→本地化）

### 1.1 给 Claude 可验证的检查（核心原则）

**官方原则**: "Give Claude a way to verify its work"

**本地化应用**:
- 每个 Claude Code 设计任务的 prompt 必须包含验收标准（不只是"写文档"）
- 评审任务必须有 VERDICT + FINDINGS + REQUIRED_CHANGES 格式
- Hermes 验证时不信 Claude 自报"完成"，必须检查实际产出

```bash
# ❌ 不好的 prompt
claude -p "写 Fori 的架构设计文档"

# ✅ 好的 prompt  
claude -p "写 Fori 的架构设计文档，必须包含：
  1. 技术栈选型（每项有理由和备选）
  2. 三层解耦架构图（Mermaid）
  3. 六大 Agent 接口定义
  验收：每个章节 500+ 字，ADR 格式，ER 图用 Mermaid erDiagram
  完成后: git add && git commit && git push"
```

### 1.2 先探索，再计划，再编码

**官方原则**: "Explore first, then plan, then code" — 四阶段：Explore → Plan → Implement → Commit

**本地化应用**:
- Claude Code 设计任务用 `--max-turns 30`（给足探索和规划空间）
- 评审任务用 `--max-turns 15`（聚焦验证，不需要探索）
- 设计阶段不允许跳过 PRD/架构文档直接编码

### 1.3 管理上下文窗口（关键）

**官方原则**: "Claude's context window fills up fast, and performance degrades as it fills"

**本地化应用**:
- 每次 `claude -p` 是独立会话，不会积累上下文——prompt 必须自包含
- 长文档分章节生成，避免单次会话塞太多
- Hermes 每 10 轮交互检查上下文使用量

### 1.4 使用子 Agent 进行调查

**官方原则**: "Use subagents for investigation"

**本地化应用**:
- Claude Code 的 `--agents` 参数定义专项子 Agent（如 security-reviewer, architecture-reviewer）
- Hermes 的 `delegate_task` 用于并行子任务

### 1.5 添加对抗性审查步骤

**官方原则**: "Add an adversarial review step"

**本地化应用**:
- 设计者不得自审（禁止 `--continue` 用于自审）
- 评审用新会话，且评审者只能 Read + Write（不能改设计文档原文）
- 评审产出必须有 VERDICT (PASS/CONDITIONAL_PASS/FAIL)

### 1.6 CLAUDE.md 最佳实践

**官方原则**: "Write an effective CLAUDE.md"

**本地化应用**:
- 项目根目录 CLAUDE.md 已创建，包含：项目使命、角色定义、分支策略、限额策略
- 全局 ~/.claude/CLAUDE.md 指向 CAMA 协作协议

## 二、Codex 最佳实践（官方→本地化）

### 2.1 AGENTS.md 作为项目上下文

**官方原则**: Codex 自动加载项目根目录的 AGENTS.md

**本地化应用**:
- AGENTS.md 已创建，包含：项目身份、角色路由、分支策略、限额管理
- 全局 ~/.codex/AGENTS.md 指向 CAMA 协作协议

### 2.2 沙箱与信任

**官方原则**: `--yolo` 用于 trusted 项目，`--full-auto` 用于沙箱隔离

**本地化应用**:
- Fori 项目已在两节点 Codex config.toml 注册 trust_level = "trusted"
- 用 `--yolo` 模式（最快，无审批阻塞）
- 但 Hermes 必须通过 `git diff` 验证实际产出

### 2.3 Skills 系统

**官方原则**: Codex 自动加载 `<project>/.codex/skills/*/SKILL.md`

**本地化应用**:
- 可为 Fori 创建项目级 Codex skills（如 fori-prototype-task, fori-api-task）
- 轻量任务跳过重量级审查流程

### 2.4 自定义记忆

**官方原则**: Codex 持久化跨会话知识到 ~/.codex/memories/

**本地化应用**:
- Codex 犯重复错误时，检查并更新其记忆文件
- Hermes 不共享 Codex 记忆，需要通过 prompt 传递上下文

### 2.5 Subagents 和 Workflows

**官方原则**: Codex 支持 subagents 和 workflows

**本地化应用**:
- Codex 可在单个 exec 调用中使用 subagents（通过 AGENTS.md 配置）
- Workflows 适合多步骤任务（如"实现功能→写测试→跑 lint"）

## 三、限额管理优化策略（不替代，只续跑）

### 3.1 核心原则修正

**旧策略（错误）**: Claude Code 限额耗尽 → 让 Codex 替代做评审
**新策略（正确）**: Claude Code 限额耗尽 → 等待恢复，不替代

### 3.2 额度交替使用

```
时间段          Claude Code    Codex
00:29-14:08     可用           限额耗尽(00:29后恢复)
14:08-14:10     限额耗尽       可用
14:10-22:30     可用           可用  ← 最佳并行窗口
22:30-00:29     可用           可用(14:08后)  → 实际全天大部分可用
```

**策略**:
1. 任务派发前检测额度（轻量 probe，每 Agent 每小时最多 1 次）
2. 两 Agent 额度交替使用，避免同时耗尽
3. 限额耗尽时任务挂起（manifest.json status=scheduled），cron 在重置后自动续跑
4. 不让一个 Agent 替代另一个的专业任务

### 3.3 最强模型使用

| Agent | 最强模型 | 用途 |
|-------|----------|------|
| Claude Code | Opus (通过 --model opus) | 架构设计、深度审查 |
| Codex | gpt-5.5 (默认，不加 --model) | 代码实现、测试编写 |
| Hermes | glm-5.2 (当前配置) | 编排、验证、轻量任务 |

**规则**: 设计和评审任务必须用 Claude Code + Opus，代码实现必须用 Codex + gpt-5.5，Hermes 不替代编程 Agent。

## 四、多智能体协作优化

### 4.1 Agent 角色不替代原则

| Agent | 专长 | 禁止替代 |
|-------|------|----------|
| Claude Code | 架构设计、深度审查、ADR | Codex 不做架构设计 |
| Codex | 代码实现、测试、CI | Claude Code 不做批量编码 |
| Hermes | 编排、验证、状态管理 | 不替代任何编程 Agent 的专业任务 |
| OpenClaw | Agent 框架底座 | 作为 Fori 平台的技术底座，非开发工具 |

### 4.2 OpenClaw 集成

OpenClaw 作为 Fori 平台的 Agent 框架底座（PRD 模块六），不是开发工具而是产品架构的一部分。三层解耦架构：
- 框架适配层: 封装 OpenClaw 核心能力
- 平台内核层: 权限/缓存/监控/日志/存证/脱敏
- 业务 Agent 层: 六大业务智能体

### 4.3 设计评审进化机制

```
设计(Claude Code) → 评审(Claude Code新会话) → 修订(Claude Code) → 复审(Codex/woot)
     ↑                                                                    ↓
     ←────────── 不通过则返回设计 ←─────────────────────────────────────────
     ↓ 通过
执行(Codex) → 验证(Hermes) → 用户体验评审(Hermes+用户) → 迭代优化
```

### 4.4 用户视角产品体验评审

Hermes 在验证阶段增加用户视角评审维度：
1. 核心用户流程是否顺畅（买家购房、卖家发房、经纪人工作台）
2. 页面加载预期是否符合移动端习惯
3. 错误状态是否用户友好
4. 权限引导是否清晰
5. 信息密度是否适合移动端
