# Fori 技术方案（执行摘要）

> **版本**: 2.0 · 2026-07-03  
> **变更**: 全模块 API 契约、六大业务 Agent 规格、跨换位编排集成、原型迁移完整路径  
> **前版**: v1.1 (2026-07-02) — §4 定价 API 契约；§5 price-eval Agent  
> **受众**: 开发、编排、Human 审阅  
> **详细设计**: `docs/execution/FORI-043_DESIGN.md`（定价模块 SSOT）, `docs/execution/FORI-044_FULL_DESIGN.md`（原型完整规格）

---

## 1. 架构总览

Fori 为 **Agent 原生房产交易中介平台**，六大模块 + OpenClaw Agent 底座：

```
┌──────────────────────────────────────────────────────────────┐
│                    prototype/                                 │
│        Next.js 14 (App Router) · 交互原型 SSOT               │
└──────────────────────────┬───────────────────────────────────┘
                           │ ADR-009 一次性迁移（Wave 1 启动）
┌──────────────────────────▼───────────────────────────────────┐
│                apps/web (生产前端)                            │
│           Next.js 14 · Tailwind 4 · shadcn/ui               │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST + SSE
┌──────────────────────────▼───────────────────────────────────┐
│                 apps/api (FastAPI Python 3.12)               │
│     /api/v1/price  /api/v1/dict  /api/v1/match              │
│     /api/v1/auth   /api/v1/transaction  /api/v1/media       │
└──────────────────────────┬───────────────────────────────────┘
                           │ OpenClaw Agent Protocol
┌──────────────────────────▼───────────────────────────────────┐
│              services/agents/ (6 业务 Agent)                  │
│  price-eval · property-dict · listing-match                  │
│  credit-auth · trade-settlement · media-gen                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│       数据层：PostgreSQL 16 · Redis 7 · S3-compatible        │
└──────────────────────────────────────────────────────────────┘
                    packages/shared + packages/ui
```

| 层 | 技术 | 状态 |
|----|------|------|
| 原型 | `prototype/` Next 14 + Mock | ✅ Wave 3 完成，build PASS，36 路由 |
| 生产前端 | `apps/web/` Next 14 + Tailwind 4 | Wave 0 脚手架就绪 |
| API | `apps/api/` FastAPI | `/health` 就绪；Wave 1 价格模块启动 |
| Agent | `services/agents/*` | README 占位；Wave 1 price-eval 实现 |
| 编排 | `.ai/orchestration/` | 配额+认证+跨换位就绪 |

**迁移策略（ADR-009）**: 一次性 `prototype/` → `apps/web/`，Tailwind 3→4，完成后冻结原型。

---

## 2. Monorepo 布局

```
Fori/
├── prototype/              # 交互原型（当前演示 SSOT）
│   └── app/                # 36 路由
├── apps/web/               # 生产前端 [Wave 1+]
│   └── app/                # 迁移后路由
├── apps/api/               # FastAPI 后端
│   ├── routers/            # price, dict, match, auth, transaction, media
│   ├── adapters/           # openclaw.py, notary.py
│   └── schemas/            # Pydantic schemas
├── packages/shared/        # 类型、常量、API client
│   └── types/
│       ├── api.ts          # ApiResponse<T>
│       ├── price.ts        # PriceAssessment + RoleView
│       ├── dict.ts         # Community, Building, Unit
│       ├── match.ts        # MatchRecord
│       ├── transaction.ts  # Transaction, CommissionSplit
│       └── auth.ts         # UserTier
├── packages/ui/            # shadcn 组件库（Wave 迁移时激活）
├── services/agents/        # 6 域 Agent 微服务
│   ├── price-eval/         # FORI-043 Wave 1 核心
│   ├── property-dict/      # Wave 2
│   ├── listing-match/      # Wave 3
│   ├── credit-auth/        # Wave 4
│   ├── trade-settlement/   # Wave 4
│   └── media-gen/          # Wave 5
├── tests/e2e/              # Playwright（Wave 3+ 建立）
└── docs/                   # 设计文档 SSOT
```

Turbo + npm workspaces；详见 `docs/execution/REPO_LAYOUT.md`。

---

## 3. 迁移路径 prototype → apps/web

| Wave | 内容 | 任务 | 状态 |
|------|------|------|------|
| 0 | 脚手架、layout、/health 联通 | FORI-042 | ✅ done |
| 1 | **定价模块** API + 页面迁移 | FORI-043~046 | 设计完成，实现启动 |
| 2 | 字典 explore/* | FORI-050~052 | 计划 |
| 3 | 匹配/消息/交易 | FORI-053+ | 计划 |
| 4 | KYC、公证、信用 | FORI-060+ | 计划 |
| 5 | 营销推广 Agent | FORI-070+ | 计划 |

**迁移步骤（每模块 4 步）**:
1. Codex 复制 `prototype/app/<module>` 路由 → `apps/web/app/`
2. Mock → `packages/shared` 类型 + FastAPI API client
3. FastAPI router + Pydantic schema
4. Playwright 冒烟测试（关键路径）

---

## 4. Wave 1 API 契约 — 定价模块

> **SSOT**: `docs/execution/FORI-043_DESIGN.md §3`（完整 schema 在此，本节摘要）

### 4.1 `GET /api/v1/price/evaluate`

**Query 必填**: `community_id`, `viewer_role: "buyer"|"seller"|"agent"`  
**Query 可选**: `area_sqm`, `floor`, `total_floors`, `orientation`, `renovation`, `ownership_years`, `tax_bearer`

**Response 200 摘要**（camelCase，对齐 `PriceAssessment`）:
```json
{
  "success": true,
  "data": {
    "communityId": "community-001",
    "tier": "B",
    "basePricePerSqm": 35000,
    "adjustedPricePerSqm": 38500,
    "totalRange": { "low": 3311000, "mid": 3580500, "high": 3773200 },
    "factors": [{ "name": "楼层修正", "impactPercent": 3.0, "explanation": "..." }],
    "confidence": "medium",
    "sampleCount": 23,
    "viewerRole": "buyer",
    "roleView": { "fairRangeLow": 3152000, "fairRangeHigh": 3723200, "valueIndex": 82 }
  }
}
```

缓存：Redis `price:eval:{community_id}:{hash(params)}` TTL 24h，按 `viewer_role` 独立缓存。

### 4.2 `GET /api/v1/price/communities/{id}/trend`

**Query 可选**: `months`（默认 24），`compare_tier`  
**Response**: `trendDirection`, `changePercent3m`, `changePercent12m`, `points[]`

### 4.3 `POST /api/v1/price/reports`

**Body**: `{ communityId, viewerRole, areaSqm?, paymentRef }`  
Wave 1 `paymentRef` 可传 `"mock-payment"`  
**Response**: `{ reportId, pdfUrl, unlocked: true, priceWan: 29 }`  
**Error 402**: `{ amountFen: 2900 }`

### 4.4 `GET /api/v1/price/communities`

**Query**: `city`, `district`, `tier`, `keyword`, `page`, `limit`  
**Response**: 分页小区列表（`tier`, `tierConfidence`, `refPriceLow`, `refPriceHigh`, `sampleCount`）

### 4.5 统一错误格式

`{ "success": false, "error": "<message>", "data": null }`  
HTTP: 400/402/404/422/500

---

## 5. Wave 2 API 契约 — 楼盘字典模块

### 5.1 `GET /api/v1/dict/communities`

**Query**: `city`, `district`, `tier`, `keyword`, `mode: "map"|"card"|"list"`, `page`, `limit`  
**Response**:
```json
{
  "success": true,
  "data": [{
    "id": "community-001",
    "name": "中关村小区",
    "district": "海淀",
    "tier": "B",
    "refPriceLow": 32000,
    "refPriceHigh": 38000,
    "maintainerCount": 3,
    "topMaintainer": { "name": "李建国", "points": 87 },
    "coords": { "lat": 39.9800, "lng": 116.3090 }
  }],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

### 5.2 `GET /api/v1/dict/communities/{id}`

**Query**: `viewer_role`（控制字段可见性）  
**Response**: 完整小区详情，含 SUUMO 式字段分组（`overview`, `facilities`, `transport`, `price`, `transactions`, `cocreation`）

### 5.3 `GET /api/v1/dict/communities/{id}/transactions`

**Auth**: 认证经纪人 token 必须  
**Response**: 脱敏成交记录列表（楼层/面积/成交价/时间）

### 5.4 `PATCH /api/v1/dict/communities/{id}`

**Auth**: 经纪人 token，L2+  
**Body**: 变更字段（乐观锁：`version` 字段必填）  
**Response**: `{ newVersion: 4, pointsEarned: 5, maintainerRank: 2 }`  
**Error 409**: 版本冲突（`diff` 字段展示差异）

### 5.5 `GET /api/v1/dict/communities/{id}/contributions`

**Response**: 贡献时间线（`maintainer`, `fields`, `points`, `timestamp`）

---

## 6. Wave 3 API 契约 — 匹配撮合模块

### 6.1 `GET /api/v1/match/leads`

**Auth**: 经纪人 token  
**Query**: `priority: "P1"|"P2"|"P3"|"all"`, `status: "pending"|"accepted"|"history"`  
**Response**: MatchLead 列表（含 `responseDeadline`, `countdown`, `matchScore`, `reasons`）

### 6.2 `POST /api/v1/match/leads/{id}/respond`

**Body**: `{ action: "accept"|"defer"|"reject", reason? }`  
**Response**: `{ newStatus, message, creditScoreChange? }`  
超时 4h 自动 reject（状态机：`matched → expired → reassigned`）

### 6.3 `POST /api/v1/match/buyer-needs`

**Auth**: 任何实名用户  
**Body**: `{ district, housingType, budgetMin, budgetMax, urgency: "now"|"3m"|"6m" }`  
**Response**: `{ needId, matchScore, predictedLeadCount, entersPremiumPool: boolean }`

### 6.4 `GET /api/v1/match/status/{matchId}`

**Response**: 撮合状态机当前状态 + 时间线（`MatchRecord.timeline`）

---

## 7. Wave 4 API 契约 — 交易与认证

### 7.1 认证端点

| 端点 | 说明 |
|------|------|
| `POST /api/v1/auth/phone-verify` | 手机号验证码 |
| `POST /api/v1/auth/kyc/start` | KYC 流程启动 |
| `GET /api/v1/auth/kyc/status` | KYC 状态查询 |
| `POST /api/v1/auth/agent-cert` | 经纪人认证申请 |
| `GET /api/v1/auth/user-tier` | 当前用户等级和可见权限 |

### 7.2 交易端点

| 端点 | 说明 |
|------|------|
| `POST /api/v1/transaction` | 创建交易（状态机初始化） |
| `PATCH /api/v1/transaction/{id}/state` | 状态流转（幂等键保证） |
| `GET /api/v1/transaction/{id}` | 交易详情（含步骤、文件、分成） |
| `GET /api/v1/transaction/{id}/commission` | 分成核算明细（80/15/5） |
| `GET /api/v1/transaction/{id}/evidence` | 公证存证证书 |

### 7.3 公证机构端点（API-only）

| 端点 | 说明 |
|------|------|
| `POST /api/v1/notary/verify` | 前置核验请求（打包房源+双方认证） |
| `POST /api/v1/notary/store` | 交易存证提交 |
| `GET /api/v1/notary/{txId}/evidence` | 存证查询 |
| `POST /api/v1/notary/dispute` | 纠纷材料包请求 |
| `GET /api/v1/notary/dispute/{id}` | 纠纷状态查询 |

---

## 8. Agent 服务规格（六大业务 Agent）

### 8.1 price-eval Agent（Wave 1 核心）

**位置**: `services/agents/price-eval/`  
**框架**: OpenClaw（主）+ Hermes（兜底）  
**SSOT**: `docs/execution/FORI-043_DESIGN.md §6`

**输入**: `PriceEvalContext`（`community_id`, `viewer_role`, 可选个体参数）  
**输出**: `PriceResult`（`adjustedPricePerSqm`, `factors[]`, `confidence`, `role_view`）  
**SSE 端点**: `GET /api/v1/price/evaluate/stream`

**5 个 SSE 事件**: `price:eval:start` → `data_fetched` → `factor`（循环）→ `complete` / `error`

### 8.2 property-dict Agent（Wave 2）

**位置**: `services/agents/property-dict/`  
**职责**: 楼盘新增、多人协同、版本管理、数据核验、官方数据比对

**输入任务类型**:
- `PROPERTY_DICT_CREATE`: 新建小区/楼栋/单套档案
- `PROPERTY_DICT_UPDATE`: 字段更新（乐观锁检测）
- `PROPERTY_DICT_VALIDATE`: AI 辅助核验（语义校验 + 官方比对）
- `PROPERTY_DICT_SYNC`: 官方数据每日同步

**状态机**: `QUEUED → RUNNING → VALIDATING → COMPLETED / FAILED / NEEDS_REVIEW`

**事件发布**:
- `dict:created` → 触发首建者积分
- `dict:validated` → 触发维护积分
- `dict:conflict` → 通知相关经纪人处理冲突

### 8.3 listing-match Agent（Wave 3）

**位置**: `services/agents/listing-match/`  
**职责**: 供需甄别、脱敏归档、匹配算法、P1/P2/P3 推送

**匹配算法输入**:
```python
MatchContext:
  buyer_need_id: str
  target_district: str
  housing_type: str
  budget_range: Tuple[int, int]
  urgency: Literal["now", "3m", "6m"]
```

**匹配得分公式**:
```
score = 0.40 × location_match
      + 0.25 × budget_match
      + 0.20 × type_match
      + 0.10 × urgency_weight
      + 0.05 × tier_preference_match
```

**推送降级**：P1(4h) → P2(24h) → P3(通用池)

### 8.4 credit-auth Agent（Wave 4）

**位置**: `services/agents/credit-auth/`  
**职责**: 全主体认证、信用档案管理、外部接口调用

**调用链路**:
```
身份证 + 活体识别 → 第三方 eKYC API
从业资质 → 住建委资质查询 API
购房资格 → 城市限购 API（按城市差异化）
门店认证 → 工商企业信息 API
```

**信用评分模型**:
```python
CreditScore = 60  # L2 基础分
            + 客户好评率 × 20      # max 20
            + min(活跃度, 10)      # max 10
            + min(维护楼盘数 × 0.5, 10)  # max 10
```

### 8.5 trade-settlement Agent（Wave 4）

**位置**: `services/agents/trade-settlement/`  
**职责**: 交易状态机、资金监管、佣金核算、结算执行

**分成规则（PRD §5.3 / FORI-088 SSOT）**:
```python
total_service_fee = transaction_price × commission_rate  # 2%

agent_pool = total_service_fee × 0.80     # 80%
platform = total_service_fee × 0.15       # 15%
dict_contribution = total_service_fee × 0.05  # 5%

# dict_contribution 分配：
founder_reward = dict_contribution × 0.40      # 首建者 2%（占总额）
team_reward = dict_contribution × 0.60         # 其他维护者均分 3%
```

**幂等键**: 每个结算请求携带 `idempotency_key`，重复请求返回相同结果，不重复扣款

### 8.6 media-gen Agent（Wave 5）

**位置**: `services/agents/media-gen/`  
**职责**: 房源视频/图文/文案生成、全渠道分发

**输入任务类型**:
- `MATERIAL_GEN_VIDEO`: 生成 15-60s 视频素材
- `MATERIAL_GEN_IMAGE`: 生成 9 宫格图文
- `MATERIAL_GEN_COPY`: 生成三套文案（简洁/详细/情感）
- `DISTRIBUTE_PUBLISH`: 调用平台 API 分发

**状态流转**: `QUEUED → GENERATING → REVIEWING → PUBLISHING → COMPLETED / FAILED`

---

## 9. 三层解耦架构（框架无关设计）

```
┌───────────────────────────────────────────────────────┐
│  Layer 3 — 框架适配层 (adapters/)                     │
│  封装 OpenClaw 接口 → 平台标准 Agent 通用接口           │
│  openclaw.py · hermes_fallback.py                    │
├───────────────────────────────────────────────────────┤
│  Layer 2 — 平台内核层 (packages/shared/)              │
│  权限、缓存、监控、日志、分布式锁、合规存证、数据脱敏    │
│  与框架无关，独立公共底座                               │
├───────────────────────────────────────────────────────┤
│  Layer 1 — 业务 Agent 层 (services/agents/)           │
│  6 大 Agent 独立拆分，互不耦合                         │
│  通过 Layer 2 公共接口通信，不直接调用彼此              │
└───────────────────────────────────────────────────────┘
```

**框架切换机制**: OpenClaw 以独立子模块引入，不侵入源码；预留 `AGENT_FRAMEWORK=openclaw|hermes` 环境变量，业务层无感切换。

---

## 10. 多 Agent 编排集成

| 机制 | 路径 | 用途 |
|------|------|------|
| 配额门控 | `.ai/orchestration/scripts/quota-check.sh` | 派发前检查配额 |
| 认证持久化 | `.ai/orchestration/AUTH_PERSISTENCE.md` | Claude CLI token 自动续期 |
| 跨换位协议 | `.ai/orchestration/CROSS_SWAP_PROTOCOL.md` | Claude/Codex 设计/实现交替 |
| 文档 SSOT | `docs/CANON.md` | 有效文档单一事实源 |

**派发角色**:
- **Claude（epix）**: 架构设计 / ADR / 复杂评审 / 本文档
- **Codex（woot）**: 实现 / 测试 / 批量操作
- **Cursor（epix）**: 合并 / 编排 / 小改动
- **Hermes**: 长 Loop / 配额监控 / 定时续跑

---

## 11. 数据模型（四张核心表 — 定价模块，Wave 1）

> 完整 DDL 见 `docs/execution/FORI-043_DESIGN.md §2`

| 表 | 用途 |
|----|------|
| `communities` | 小区基础信息 + A/B/C/D 分层 |
| `price_tiers` | A/B/C/D 层级定义 + UI 参数（含种子数据）|
| `price_factors` | 个体修正因子定义（6 个因子，含种子数据）|
| `assessments` | 实时估价结果（JSONB factors，TTL 24h）|

Wave 2+ 追加：`dict_communities`, `dict_buildings`, `dict_units`, `contributions`, `match_records`, `transactions`, `users`, `credit_scores`

---

## 12. 构建与验证

```bash
# 原型（人类演示 SSOT）
cd prototype && rm -rf .next && npm run build

# Monorepo
npm install && npm run build --workspace=apps/web
cd apps/api && uvicorn main:app --port 8000  # GET /health

# Wave 1 价格 API
cd apps/api && python -m pytest tests/test_price.py

# E2E（Wave 3+）
cd tests/e2e && npx playwright test
```

CI: `.github/workflows/ci.yml` — prototype build + lint + typecheck。

---

## 13. 风险与缓解

| 风险 | 严重级 | 缓解措施 |
|------|--------|---------|
| Claude CLI auth 中断 | High | AUTH_PERSISTENCE + Cursor 后备；每日 22:30 自动刷新 |
| 双库维护（prototype + apps/web）| Medium | ADR-009 一次性迁移时间表；prototype 迁移后冻结 |
| Mock 拖延 API 接入 | Medium | Wave 1 强制 pricing 真实端点（FORI-045）；mock 仅用于演示 |
| OpenClaw 框架升级破坏性变更 | Low | 适配层隔离，仅修改 `adapters/openclaw.py` |
| 公证机构 API 不稳定 | Medium | 备用机构切换逻辑 + 人工跟进任务单 |
| 高并发场景下 Agent 积压 | Medium | 分布式任务队列 + 限流熔断 + 死信队列 |

---

*技术方案执行摘要 v2.0 · 2026-07-03 · Claude Code (epix)*
