# Fori 技术方案（执行摘要）

> **版本**: 1.0 · 2026-07-02  
> **受众**: 开发、编排、Human 审阅  
> **详细架构**: 见 [ADR-009](../adr/ADR-009-prototype-to-production-migration.md)（不重复全文）

---

## 1. 架构总览

Fori 为 **Agent 原生房产交易中介平台**，六大模块 + OpenClaw Agent 底座：

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ apps/web    │────▶│ apps/api     │────▶│ services/agents │
│ Next.js 14  │     │ FastAPI      │     │ price-eval 等   │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │                      │
       └────────────────────┴──────────────────────┘
                    packages/shared + packages/ui
```

| 层 | 技术 | 状态 |
|----|------|------|
| 原型 | `prototype/` Next 14 + Mock | ✅ R3 完成，build PASS |
| 生产前端 | `apps/web/` | Wave 0 脚手架 |
| API | `apps/api/` FastAPI | `/health` 就绪 |
| Agent | `services/agents/*` | README 占位 |
| 编排 | `.ai/orchestration/` | 配额+认证+交叉换位 |

**迁移策略（ADR-009）**: 一次性 `prototype/` → `apps/web/`，Tailwind 3→4，完成后冻结原型。

---

## 2. Monorepo 布局

```
Fori/
├── prototype/          # 交互原型（当前演示 SSOT）
├── apps/web/           # 生产前端 [Wave 0+]
├── apps/api/           # FastAPI 后端
├── packages/shared/    # 类型、常量、API client
├── packages/ui/        # shadcn 组件库
├── services/agents/    # 6 域 Agent 微服务
└── tests/e2e/          # Playwright（待建）
```

Turbo + npm workspaces；详见 `docs/execution/REPO_LAYOUT.md`。

---

## 3. 迁移路径 prototype → apps/web

| Wave | 内容 | 任务 |
|------|------|------|
| 0 | 脚手架、layout、/health 联通 | FORI-042 ✅ |
| 1 | **定价模块** API + 页面迁移 | FORI-043~045 |
| 2 | 字典 explore/* | FORI-050~052 |
| 3 | 匹配/消息/交易 | FORI-053+ |
| 4 | KYC、公证、信用 | FORI-060+ |

**迁移步骤（每模块）**:
1. Codex 复制 `prototype/app/<strong>` 路由 → `apps/web/app/`
2. Mock → `packages/shared` 类型 + API client
3. FastAPI router + schema
4. Playwright 冒烟

---

## 4. Wave 1 API 契约 — 定价模块

### 4.1 `GET /api/v1/price/evaluate`

**Query**: `community_id`, `area_sqm`, `floor`, `orientation`

**Response 200**:
```json
{
  "community_id": "community-001",
  "tier": "B",
  "unit_price_cny": 68500,
  "calculated_total_cny": 2950000,
  "factors": [{"label": "楼层", "percent": 3, "amount_cny": 12000}],
  "confidence": "high",
  "viewer_role": "buyer"
}
```

### 4.2 `GET /api/v1/price/communities/{id}/trend`

**Response**: 24 个月 `{month, tier_price, compare_price}[]`

### 4.3 `POST /api/v1/price/reports`

**Body**: `{community_id, viewer_role, payment_ref?}`  
**Response**: `{report_id, pdf_url, unlocked: true}` — 付费墙 ¥29 对接点

### 4.4 Agent 契约

`services/agents/price-eval/` 实现 `PriceEvalAgent.evaluate(context) → PriceResult`；OpenClaw adapter 见 `apps/api/adapters/openclaw.py`。

---

## 5. Agent 集成点

| 页面 | Agent 能力 | 契约 |
|------|-----------|------|
| 全站 FAB | 语音/文字/拍摄三模态 | `docs/AGENT_PAGE_CONTRACTS.md` |
| `/price/*` | 估价解释、报告生成 | price-eval |
| `/match` | 撮合建议、4h 窗口 | listing-match |
| `/explore/dict/*` | 字典共建、纠错审核 | property-dict |
| `/transaction/*` | 分成核算 | trade-settlement |

原型阶段：`AgentAssistFab` UI Mock；Wave 1 起接 OpenClaw SSE。

---

## 6. 多 Agent 编排集成

| 机制 | 路径 |
|------|------|
| 配额门控 | `.ai/orchestration/scripts/quota-check.sh` |
| 认证持久化 | `.ai/orchestration/AUTH_PERSISTENCE.md` |
| 交叉换位 | `.ai/orchestration/CROSS_SWAP_PROTOCOL.md` |
| 文档 SSOT | `docs/CANON.md` |

派发：Claude 设计/评审 · Codex 实现 · Cursor 合并 · Hermes 长 Loop。

---

## 7. 构建与验证

```bash
# 原型（人类演示 SSOT）
cd prototype && rm -rf .next && npm run build

# Monorepo
npm install && npm run build --workspace=apps/web
cd apps/api && uvicorn main:app --port 8000  # GET /health
```

CI: `.github/workflows/ci.yml` — prototype build + lint 占位。

---

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Claude CLI auth 中断 | AUTH_PERSISTENCE + Cursor 后备 |
| 双库维护 | ADR-009 一次性迁移时间表 |
| Mock 拖延 API | Wave 1 强制 pricing 真实端点 |

---

*执行摘要 · 链接 ADR-009 获取完整 398 行迁移规范*
