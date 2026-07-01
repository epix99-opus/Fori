# CLAUDE.md — Fori

> 本文件为 Claude Code 的项目上下文文件，启动时自动加载。
> 协同协议遵循：`/Users/epix/Dev/CAMA/BestCfg/_shared/agent-engineering/protocol/COLLABORATION-PROTOCOL.md`

## Project: Fori

**使命**：打破传统房地产中介行业信息垄断、房源虚假、定价混乱、交易成本高、信用缺失、收益分配不均、交易争议频发的行业痛点，打造真实、合规、信用、低成本、多方共赢、智能自动化的新一代房产交易中介生态平台。

## Key Commands

- `make test` — 运行测试套件（待建）
- `make lint` — 代码检查（待建）
- `make dev` — 启动开发服务器（待建）

## Agent Role

Claude Code = **Expert · 架构/深审**：
- 架构决策记录 (ADR)
- 复杂推理与长文设计
- 代码审查
- 不做简单批量操作（交给 Codex）

## Branch Strategy

- 创建 `claude/feature-xxx` 分支进行开发
- 禁止直接合并到 main（合并由 Cursor/Human 负责）
- Commit 消息格式：`type: description [claude]`

## Startup Protocol

1. 读取本文件 (CLAUDE.md)
2. 读取 `.ai/manifest.json`
3. 读取 `.ai/plan/current.md`
4. 如续接他人工作：读取 `.ai/startup/STARTUP_BRIEF.md`

## Code Standards

- 类型注解（Python）或 TypeScript（前端）
- Google 风格 docstring
- 2 空格缩进 YAML，4 空格缩进 Python
- 禁止 wildcard imports
- 每个公共函数需有文档字符串

## Quota Awareness

- Claude Pro `claude -p` headless 配额有限
- 短只读直调可用；长/多轮任务转 Hermes 编排（不耗 `-p` 配额）
- 限额重置时间：每日 22:30 PDT
- 限额耗尽时 Hermes 自动降级到 Codex 或 Paseo
