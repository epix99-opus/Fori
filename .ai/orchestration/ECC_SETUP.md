# ECC — Enhanced Claude Configuration 设置指南

> **ECC** = CAMA **Enhanced Claude Configuration**（增强型 Claude 配置），**不是**独立 CLI。  
> 本环境无 `ecc` 命令；配置通过项目级 `.claude/` + `CLAUDE.md` + 路由 JSON 实现。  
> 模板来源：`/Users/epix/Dev/CAMA/BestCfg/claude-code/config/settings.json.template`

---

## 1. 配置层次

| 层级 | 路径 | 作用域 | Fori 状态 |
|------|------|--------|-----------|
| 用户全局 | `~/.claude/settings.json` | 所有项目 | ✅ 已配置（epix） |
| 项目级 | `.claude/settings.json` | Fori only | ✅ 已创建 |
| 项目记忆 | `CLAUDE.md` | Claude 启动自动加载 | ✅ 已存在 |
| 协同指南 | `AGENTS.md` | 全 Agent | ✅ 已存在 |
| 机器路由 | `.ai/orchestration/claude-routing.json` | 调度器读取 | ✅ 已创建 |
| 配置索引 | `.ai/claude-config.json` | 快速引用 | ✅ 已创建 |

### 作用域优先级（官方）

**Managed > CLI > Local > Project > User**；权限/数组类为**合并**而非覆盖。

---

## 2. Fori 项目级文件

### 2.1 `.claude/settings.json`

从 CAMA 模板 fork，包含：

- `permissions.defaultMode: auto`
- `skipAutoPermissionPrompt: true`
- 官方插件：frontend-design、superpowers、understand-anything 等

**不宜入库**：`settings.local.json`（含机器本地覆盖）

### 2.2 `CLAUDE.md` 增强项

已在项目 `CLAUDE.md` 中包含：

- 协同协议指针（CAMA COLLABORATION-PROTOCOL）
- Agent 角色（架构/深审，不做批量实现）
- Startup Protocol（manifest → plan → STARTUP_BRIEF）
- Quota Awareness（22:30 PDT 重置）

**建议追加**（编排配置完成后）：

```markdown
## Orchestration

- 路由：`.ai/orchestration/claude-routing.json`
- Prompt 模板：`.ai/prompts/design-task.md`、`review-task.md`
- 主指南：`.ai/orchestration/QUOTA_ROUTING.md`
```

### 2.3 可选：子代理 `.claude/agents/`

参考 BestGen 模式，可为 Fori 创建专项 reviewer：

```
.claude/agents/
├── architecture-reviewer.md   # 架构一致性评审
└── compliance-reviewer.md     # 合规专项评审
```

当前未创建（FORI-040 前可按需添加）。

---

## 3. 认证（epix 官方 Pro）

| 项 | 值 |
|----|-----|
| 通道 | claude.ai Pro OAuth |
| 配置目录 | `~/.claude` |
| headless | `claude -p` |
| 重置 | 每日 22:30 PDT |

### 冒烟测试

```bash
claude -p "Reply: CLAUDE_OFFICIAL_OK" < /dev/null
```

### 401 恢复

**根因（2026-07-02 epix）**：`~/.claude.json` 中 `oauthAccount` 仅保留账号元数据，`accessToken` / `refreshToken` 均为空时 API 返回 401；`claude auth status` 仍可能显示 `loggedIn: true`（陈旧缓存），**以 `claude -p` 为准**。

**诊断（不泄露凭据）**：

```bash
claude auth status
claude -p "Reply only: CLAUDE_AUTH_OK" --max-turns 1 --allowedTools "" < /dev/null
jq 'if .oauthAccount then {hasAccessToken: (.oauthAccount.accessToken != null), hasRefreshToken: (.oauthAccount.refreshToken != null)} else empty end' ~/.claude.json
```

**恢复（需 Human 浏览器 OAuth，无法 headless 代登）**：

1. 在 epix 终端执行：`claude auth login`（可选 `--email <你的 claude.ai 邮箱>`）
2. 在打开的浏览器完成 claude.ai 登录；若终端提示粘贴 code，按提示操作
3. 验证：

```bash
claude auth status   # loggedIn: true
claude -p "Reply only: CLAUDE_AUTH_OK" --max-turns 1 --allowedTools "" < /dev/null
```

若 `status` 与 `-p` 不一致，先 `claude auth logout` 再重新 `claude auth login`。

**非根因**：Pro 日配额耗尽通常非 401；`~/.claude/settings.json` 与项目 `.claude/settings.json` 不影响 OAuth。

---

## 4. 节点路由

| 节点 | 角色 | 命令 |
|------|------|------|
| **epix（主）** | 设计/评审/ADR | `cd /Users/epix/Dev/Fori && claude -p "..." < /dev/null` |
| **woot（备）** | epix 限额耗尽 | `ssh woot 'cd /Users/woot/Dev/Fori && claude -p "..." < /dev/null'` |

woot 上 Fori **尚无** `.claude/settings.json`；fallback 时使用 woot 全局 `~/.claude`。

---

## 5. 任务类型默认参数

| 类型 | max_turns | allowed_tools | skip_permissions |
|------|-----------|---------------|------------------|
| design | 30 | Read,Write,Bash | ✅ |
| review | 15 | Read,Write | ❌ |
| readonly_audit | 10 | Read,Grep,Glob | ❌ |
| adr | 25 | Read,Write,Bash | ✅ |
| security_review | 20 | Read,Write | ❌ |

详见 `.ai/orchestration/claude-routing.json`。

---

## 6. 配额节约

| 场景 | 路由 |
|------|------|
| 短只读评审 <15min | Cursor 直调 `claude -p` |
| 长设计/多轮 | Hermes 编排（不耗 headless 配额） |
| 批量实现 | **Codex**（不用 Claude） |
| 限额耗尽 | `manifest.status=scheduled`，等 22:30 PDT |

---

## 7. 跨产品复用（新产品 Checklist）

1. 复制 `CLAUDE.md` 模板，改项目名与使命
2. fork `.claude/settings.json` 从 `BestCfg/claude-code/config/settings.json.template`
3. 创建 `.ai/orchestration/claude-routing.json`（改 workdir/branch_prefix）
4. 创建 `.ai/prompts/design-task.md` + `review-task.md`
5. `AGENTS.md` 顶部引用 CAMA `COLLABORATION-PROTOCOL.md`
6. epix 执行 `claude auth login` 验证

---

## 8. woot 待办（手动）

woot 上 Fori Claude fallback 需确认：

```bash
ssh woot 'which claude && claude -p "Reply: CLAUDE_WOOT_OK" < /dev/null'
```

若未安装或 401，在 woot 执行 `claude auth login`（与 epix 同账号）。

---

## 9. 参考

| 文档 | 路径 |
|------|------|
| CAMA Claude hub | `BestCfg/_shared/agent-engineering/config-hub/02-claude-code.md` |
| Claude Code README | `BestCfg/claude-code/README.md` |
| 协同协议 | `BestCfg/_shared/agent-engineering/protocol/COLLABORATION-PROTOCOL.md` |
| BestGen 范例 | `BestCfg/_shared/agent-engineering/products/bestgen/agent-config-record.yaml` |
