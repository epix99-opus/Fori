# Startup Brief — Fori
> Last updated: 2026-07-01 by @hermes

## Project State
- Current phase: 项目初始化
- Recently completed: GitHub 仓库创建、AGENTS.md/CLAUDE.md/.ai/ 结构搭建
- Next step: 初始提交、Kanban board 配置、cron job 配置、冒烟测试

## Key Decisions
1. 仓库: epix99-opus/Fori (public) — 新一代房产交易中介生态平台
2. 双节点协同: epix(本机) + woot(远程)，两节点均为 PDT 时区
3. 角色分配: Hermes=编排, Claude Code=架构/深审, Codex=实现/验证, Cursor=人工/合并
4. 分支策略: 各 Agent 专属分支 (codex/*, claude/*, hermes/*, cursor/*)，合并由 Cursor 负责
5. 限额机制: Codex 00:29 PDT 重置, Claude 22:30 PDT 重置, Hermes cron 自动续跑

## Known Issues
- woot gh CLI token 失效，需人工执行 `gh auth login -h github.com` (在 woot 上)
- woot tmux 编译中 (brew install tmux)，不阻塞 CLI 模式

## Architecture Anchors
- `/Users/epix/Dev/Fori` — 项目本地路径
- `.ai/manifest.json` — 项目状态单一事实源
- `AGENTS.md` — Agent 操作指南
- `CLAUDE.md` — Claude Code 上下文
- 协同协议: `/Users/epix/Dev/CAMA/BestCfg/_shared/agent-engineering/protocol/COLLABORATION-PROTOCOL.md`
