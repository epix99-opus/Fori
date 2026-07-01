# AGENTS.md — Fori

> 本文件为 **Fori** 项目的 Agent 操作指南。冲突时以本文件为准。
> 协同遵循：`/Users/epix/Dev/CAMA/BestCfg/_shared/agent-engineering/protocol/COLLABORATION-PROTOCOL.md`

## Project Identity

| 项 | 值 |
|---|---|
| 名称 | **Fori** — 新一代房产交易中介生态平台 |
| GitHub | `epix99-opus/Fori` |
| 本地路径 | `/Users/epix/Dev/Fori` |
| 使命 | 打破传统房地产中介行业信息垄断、房源虚假、定价混乱、交易成本高、信用缺失、收益分配不均、交易争议频发的行业痛点，打造真实、合规、信用、低成本、多方共赢、智能自动化的新一代房产交易中介生态平台 |
| 非目标 | 非通用 Agent 框架；非工具配置归档；非信源研究 |

## 多 Agent 协同角色

| STORM 角色 | 工具 | 节点 | 职责 |
|------------|------|------|------|
| Moderator / 编排 | **Hermes** | epix | 7×24 调度、Kanban、Cron、限额续跑、长 Loop |
| Human I/O + 合并 | **Cursor** | epix | 人工审阅、代码合并、IDE 集成、kickoff |
| Expert · 架构/深审 | **Claude Code** | epix + woot | ADR、复杂推理、长文设计、代码审查 |
| Expert · 实现/验证 | **Codex** | epix + woot | 沙箱编码、测试、refactor、CI 友好 |

### 节点路由策略（固定主节点 + 交叉降级）

每个 Agent 固定在一个节点运行，避免同节点资源竞争：

| Agent | 主节点 | 原因 | 降级节点 | 降级触发条件 |
|-------|--------|------|----------|-------------|
| **Claude Code** | epix | 与 Hermes 同节点，架构/审查需与编排器紧密协作 | woot | epix Claude 限额耗尽 (22:30 PDT) |
| **Codex** | woot | 独立资源，长任务不阻塞 epix 上 Hermes+Claude | epix | woot Codex 限额耗尽 (00:29 PDT) 或 woot 不可达 |

**并行模式**：epix 跑 Claude Code + woot 跑 Codex，两者同时执行不阻塞。同文件修改通过 manifest.json owner lock 防冲突。

**调度命令模板**：
- Claude Code (epix): `claude -p "{prompt}" --max-turns N --allowedTools ... < /dev/null`
- Codex (woot): `ssh woot 'cd /Users/woot/Dev/Fori && codex exec "{prompt}" --model gpt-5.4-mini < /dev/null 2>&1'`

详细路由配置见 `.ai/agent-routes.json`。

### 限额重置时间（PDT, 两节点相同时区）

| Agent | 重置时间 (PDT) | 北京时间 |
|-------|----------------|----------|
| Codex CLI | 每日 00:29 | 当日 15:29 |
| Claude Code | 每日 22:30 | 次日 13:30 |
| 两者同时耗尽窗口 | 22:30-00:29 PDT | 13:30-15:29 CST |

## 分支策略

每个 Agent 以独立开发者角色创建并维护专属分支：

```
main ← 唯一合并点（由 Cursor/Human 负责合并）
├── codex/feature-xxx     # Codex 专属分支
├── claude/feature-xxx    # Claude Code 专属分支
├── hermes/feature-xxx    # Hermes 专属分支
└── cursor/feature-xxx    # Cursor 专属分支
```

**合并规则**：代码合并统一由 Cursor（Human）负责执行。其他 Agent 不得直接合并到 main。

分支命名使用描述性名称，工具前缀表示执行者：
- `codex/user-auth`
- `claude/listing-schema`
- `hermes/api-gateway`
- `cursor/ui-prototype`

## Startup Protocol

每个新会话按顺序读取：

1. **本文件 (AGENTS.md)**
2. **`.ai/manifest.json`** — 项目当前状态
3. **`.ai/plan/current.md`** — 当前任务 + 断点

跨 Agent 续写时额外读取：`.ai/startup/STARTUP_BRIEF.md`

## 6-Step Iteration Discipline

1. **Read** — AGENTS.md + manifest.json + 当前任务计划
2. **Plan** — 分解为可验证步骤，列出修改文件
3. **Code** — 执行，每步一个逻辑变更
4. **Review** — 自审正确性、安全性、风格
5. **Doc Sync** — 更新 TODO、架构文档、计划文档
6. **Update Plan** — 勾选完成项，记录决策，更新断点

## Handoff Protocol

任务切换到其他 Agent 时：

1. Git commit，消息含 Agent 标识（如 `[codex]`、`[claude]`、`[hermes]`）
2. 更新 `.ai/manifest.json` 的 `currentTask`
3. 填写 `.ai/plan/current.md` 的 **Breakpoint**
4. 更新 `.ai/startup/STARTUP_BRIEF.md`

## Concurrency Rules

| 场景 | 规则 |
|------|------|
| 不同文件 | 可并行（不同 Agent 在不同文件上） |
| 同文件不同函数 | 串行（manifest.json owner lock） |
| 同文件同区域 | 严格串行 + 交叉审查 |
| 架构级变更 | 单 Agent，受影响文件禁止并行 |

## Code Red Lines

- 禁止 `eval`、硬编码密钥、未说明的 `curl | bash`
- 破坏性操作须写明回滚步骤
- 配置脚本需非交互、可超时、失败可诊断
- `.env` 仅本地，禁止提交密钥

## Architecture Anchors

| 路径 | 用途 |
|------|------|
| `.ai/manifest.json` | 项目状态单一事实源 |
| `.ai/plan/current.md` | 当前任务 + 断点 |
| `.ai/startup/STARTUP_BRIEF.md` | 跨 Agent 续写摘要 |
| `docs/` | 架构文档、ADR |
| `src/` | 源代码 |
| `tests/` | 测试 |

## 关键约束

1. 合法合规：仅合法房产交易软件开发
2. 证据纪律：每个结论标注来源和验证状态
3. 秘密不进 Git：`.env` 仅本地
4. Git 安全：无用户明示，禁止 `push --force`、`reset --hard`
5. 框架复用：优先集成现有框架
