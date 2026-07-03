# Claude CLI 认证持久化机制

> **版本**: 1.1 · 2026-07-03  
> **目的**: authenticate-once、长期可用；避免重复 `claude auth login` 导致账号锁定  
> **适用范围**: epix / woot 节点 Fori 及 CAMA 全项目

---

## 1. 核心原则

| 原则 | 说明 |
|------|------|
| **一次登录，长期刷新** | OAuth refresh token 由 CLI 自动续期，编排器不得每日探测 API |
| **本地 jq 优先** | 令牌健康仅读 `~/.claude.json`，不调用 API |
| **单次冒烟** | 仅当 `quota-ledger.json` 中 `layer_a.status == "auth_error"` 时，允许 **一次** `claude -p` 冒烟 |
| **禁止循环登录** | 不得在同一 session 内重复 `claude auth login` 或多次 `-p` 探活 |
| **Desktop ≠ CLI** | Claude Desktop 登录状态与 CLI OAuth **独立**；Desktop 已登录不代表 `-p` 可用 |

---

## 2. 令牌健康检查（无 API 调用）

### 2.1 jq 路径（可能假阴性）

```bash
# 推荐：每周 cron / Hermes 定时，非每日
check_claude_token() {
  jq -e '
    if .oauthAccount then
      (.oauthAccount.accessToken != null and .oauthAccount.accessToken != "")
    else
      false
    end
  ' ~/.claude.json >/dev/null 2>&1
}
```

### 2.2 macOS Keychain 门控（v1.1）

Claude CLI **可能**将 OAuth token 存入 **macOS Keychain** 而非 `~/.claude.json`：

| 信号 | 含义 | 下一步 |
|------|------|--------|
| jq `hasAccessToken: false` **且** `claude -p` 成功 | **jq 假阴性**（Keychain 路径） | ledger 保持 `available`；manifest 标 `keychain_ok_no_jq_token` |
| jq `hasAccessToken: false` **且** `claude -p` 401 | **真 auth 失效** | ledger → `auth_error`；通知 Human §4 |
| jq `hasAccessToken: true` **且** `claude -p` 401 | token 过期/吊销 | `claude auth logout` → Human login |

**Keychain 诊断（不泄露凭据）**：

```bash
# 检查 Keychain 是否存在 Claude OAuth 条目（epix）
security find-generic-password -s "Claude Code-credentials" 2>/dev/null && echo "KEYCHAIN:present" || echo "KEYCHAIN:absent"
```

**裁决优先级**：`claude -p` 冒烟 **>** Keychain 存在 **>** jq `accessToken`

**输出解读**:

| jq 结果 | `-p` 冒烟 | ledger 更新 | 动作 |
|---------|-----------|-------------|------|
| `true` | OK | `available` | 无需探测 |
| `false` | OK | `available` | Keychain 假阴性；不标 auth_error |
| `false` | 401 | `auth_error` | Human §4 |
| 文件不存在 | 401 | `auth_error` | Human 首次 login |

**辅助诊断（仍不泄露凭据）**:

```bash
claude auth status   # 仅读本地缓存，可能 stale
jq 'if .oauthAccount then {
  hasAccessToken: (.oauthAccount.accessToken != null and .oauthAccount.accessToken != ""),
  hasRefreshToken: (.oauthAccount.refreshToken != null and .oauthAccount.refreshToken != ""),
  email: .oauthAccount.emailAddress
} else { hasOAuthAccount: false } end' ~/.claude.json
```

---

## 3. 单次冒烟测试（仅 auth_error 时）

**触发条件**: `quota-ledger.json` → `agents.claude.layer_a.status == "auth_error"`

```bash
claude -p "Reply: OK" --max-turns 1 --allowedTools "" < /dev/null
```

| 结果 | 动作 |
|------|------|
| 成功回复 OK | 更新 ledger → `available`；**停止**，不再测试 |
| `Not logged in` / 401 | 保持 `auth_error`；通知 Human  custom login**（§4）；**禁止**自动 `claude auth login` |
| 429 配额 | 更新 `exhausted`，非 auth 问题 |

**历史记录（2026-07-02 20:29 PDT）**: 冒烟返回 `Not logged in`；jq 无 `oauthAccount`；ledger 维持 `auth_error`。

**审计复检（2026-07-03 08:15 PDT）**: jq `hasAccessToken: false`（email 存在）；`claude -p` → **401 Invalid authentication credentials**；Keychain 门控未通过 → **真 auth 失效**（非 jq 假阳性）。ledger 已更新 `auth_error`；需 Human 一次 `claude auth login`。

---

## 4. 恢复流程（Human 手动，无法 headless）

**触发**: jq 无 token **且** 单次冒烟失败

1. epix 终端执行一次：`claude auth login`（可选 `--email <claude.ai 邮箱>`）
2. 浏览器完成 OAuth；若提示粘贴 code，按终端指示操作
3. 验证（仅一次）:
   ```bash
   jq '.oauthAccount.accessToken != null' ~/.claude.json   # 应 true
   claude -p "Reply: OK" --max-turns 1 --allowedTools "" < /dev/null
   ```
4. 更新 `quota-ledger.json`: `layer_a.status → available`，追加 `entries` 事件 `auth_restored`

**若 status 与 `-p` 不一致**: `claude auth logout` → 重新 login（仍仅 Human 一次）

---

## 5. 调度策略

| 检查 | 频率 | 方式 |
|------|------|------|
| jq token | **每周** | Hermes cron / 合并前 gate |
| `claude -p` 冒烟 | **仅 auth_error 时一次** | quota-check 前置 |
| `claude auth login` | **仅 Human** | token null + 冒烟失败 |
| woot fallback | epix auth_error 时 | `ssh woot` jq 同样逻辑 |

---

## 6. Desktop vs CLI OAuth

```
Claude Desktop App          Claude CLI (claude -p)
      │                            │
      ├─ 独立 session              ├─ ~/.claude.json oauthAccount
      ├─ 不影响 CLI token          ├─ refreshToken 自动续期
      └─ 不能替代 CLI 登录         └─ headless 编排唯一通道
```

**常见误判**: `claude auth status` 显示 `loggedIn: true` 但 `accessToken` 为空 → API 401。以 **jq + 单次 -p** 为准。

---

## 7. 与 quota-ledger 集成

编排器读取/更新路径: `.ai/orchestration/quota-ledger.json`

```json
"layer_a": {
  "status": "available | auth_error | exhausted | paused"
}
```

`quota-check.sh` **不**调用 Claude API；auth 门控由 ledger status + 可选单次冒烟决定。

---

## 8. 参考

- `.ai/orchestration/ECC_SETUP.md` §3
- CAMA: `BestCfg/_shared/agent-engineering/verification/BC-20260626-official-auth-fix.md`
- Fori: `.ai/orchestration/QUOTA_ROUTING.md`
