# Fori 技术方案（执行摘要）

> **版本**: 1.1 · 2026-07-02  
> **变更**: §4 定价 API 契约对齐 FORI-043_DESIGN；§5 补充 price-eval Agent 细节  
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

> **SSOT**: `docs/execution/FORI-043_DESIGN.md §3`（完整 schema 在此，本节仅摘要）

### 4.1 `GET /api/v1/price/evaluate`

**Query 必填**: `community_id: string`, `viewer_role: "buyer"|"seller"|"agent"`  
**Query 可选**: `area_sqm`, `floor`, `total_floors`, `orientation`, `renovation`, `ownership_years`, `tax_bearer`

**Response 200 摘要**:
```json
{
  "success": true,
  "data": {
    "communityId": "community-001",
    "unitId": null,
    "tier": "B",
    "basePricePerSqm": 35000,
    "adjustedPricePerSqm": 38500,
    "totalRange": { "low": 3311000, "mid": 3580500, "high": 3773200 },
    "factors": [
      { "name": "楼层修正", "impactPercent": 3.0, "explanation": "8/18 层位于舒适区" }
    ],
    "confidence": "medium",
    "sampleCount": 23,
    "generatedAt": "2026-07-02T10:00:00Z",
    "expiresAt": "2026-07-03T10:00:00Z",
    "viewerRole": "buyer",
    "roleView": { "fairRangeLow": 3152000, "fairRangeHigh": 3723200, "valueIndex": 82,
                  "negotiationSuggestion": "建议出价 295 万 ±5%", "hiddenFields": ["sellerFloorPrice"] }
  }
}
```

字段名遵循 `camelCase`，与 `PRICING_MATCHING.md PriceAssessment` interface 对齐。  
缓存：Redis key `price:eval:{community_id}:{hash(params)}`, TTL 24h，按 `viewer_role` 独立缓存。

### 4.2 `GET /api/v1/price/communities/{id}/trend`

**Query 可选**: `months: integer`（默认 24，最大 60），`compare_tier: "A"|"B"|"C"|"D"`

**Response 200 摘要**:
```json
{
  "success": true,
  "data": {
    "communityId": "community-001",
    "tier": "B",
    "trendDirection": "up",
    "changePercent3m": 4.1,
    "changePercent12m": 11.8,
    "points": [{ "month": "2024-07", "tierPrice": 34200, "comparePrice": 30800 }]
  }
}
```

### 4.3 `POST /api/v1/price/reports`

**Body**: `{ communityId, viewerRole, areaSqm?, unitId?, paymentRef }` — paymentRef Wave 1 可传 `"mock-payment"`  
**Response 200**: `{ success: true, data: { reportId, pdfUrl, unlocked: true, generatedAt, expiresAt, priceWan: 29 } }`  
**Error 402**: `{ success: false, error: "payment required", data: { amountFen: 2900 } }`

### 4.4 `GET /api/v1/price/communities`

**Query 可选**: `city`, `district`, `tier`, `keyword`, `page`（默认 1），`limit`（默认 20，最大 100）

**Response 200**: 分页小区列表，每条含 `id, name, district, zone, tier, tierConfidence, refPriceLow, refPriceHigh, sampleCount`

### 4.5 统一错误格式

所有端点遵循 `{ "success": false, "error": "<message>", "data": null }` 格式。  
HTTP 状态码：400 参数错误、402 付费墙、404 资源不存在、422 验证失败、500 内部错误。

---

## 5. Agent 集成点

| 页面 | Agent 能力 | 契约 |
|------|-----------|------|
| 全站 FAB | 语音/文字/拍摄三模态 | `docs/AGENT_PAGE_CONTRACTS.md` |
| `/price/*` | 估价解释、报告生成 | price-eval（见下方详情） |
| `/match` | 撮合建议、4h 窗口 | listing-match |
| `/explore/dict/*` | 字典共建、纠错审核 | property-dict |
| `/transaction/*` | 分成核算 | trade-settlement |

### 5.1 price-eval Agent 详情（Wave 1 核心）

> **SSOT**: `docs/execution/FORI-043_DESIGN.md §6`

**位置**: `services/agents/price-eval/`  
**框架**: OpenClaw（主）+ Hermes（兜底）

**输入**: `PriceEvalContext`（`community_id`, `viewer_role`, 可选个体参数）  
**输出**: `PriceResult`（含 `adjusted_price_per_sqm`, `factors[]`, `confidence`, `role_view`）  
**适配层**: `apps/api/adapters/openclaw.py` — 将 Agent 输出转为 SSE 流 + REST 响应

**SSE 端点**: `GET /api/v1/price/evaluate/stream`（Content-Type: text/event-stream）

**五个 SSE 事件**:

| 事件 | 触发时机 |
|------|---------|
| `price:eval:start` | Agent 开始计算 |
| `price:eval:data_fetched` | 成交样本获取完成（含 sampleCount） |
| `price:eval:factor` | 单个因子计算完成（实时进度） |
| `price:eval:complete` | 估价完成（推送完整 PriceResult） |
| `price:eval:error` | 计算失败（含错误码和建议） |

**缓存层**: Redis `price:eval:{community_id}:{hash(params)}` TTL 24h，命中时跳过 Agent 调用直接返回

**原型阶段**: `AgentAssistFab` UI Mock；Wave 1 接 OpenClaw SSE，`suggestedPrompts` 按 `viewer_role` 动态生成（见 FORI-043_DESIGN §7.2 E13）。

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
