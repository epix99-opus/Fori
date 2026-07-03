# FORI-043 设计文档 — 定价模块 API + 人类评审修订

> **版本**: 1.0 · 2026-07-02  
> **任务**: FORI-043（D4 Wave 1 定价 API 设计）  
> **分支**: `claude/fori-043-human-review-design`  
> **依据**: `docs/PRICING_MATCHING.md`（FORI-089）、人类评审意见8条  
> **实现 Handoff**: `.ai/handoffs/FORI-043-implement.md`

---

## 1. 本轮设计背景

### 1.1 人类评审落实状态

| 评审条 | 核心诉求 | 设计产出 | 状态 |
|--------|---------|---------|------|
| 1 | 完整功能清单无删减 | `docs/FEATURE_INVENTORY.md` (FORI-080) | ✅ |
| 2 | 全角色交互矩阵 | `docs/ROLE_UX_MATRIX.md` (FORI-081) | ✅ |
| 3 | 房源字典 SUUMO 规范 | `docs/UI_DESIGN.md` §字典 (FORI-082) | ✅ |
| 4 | 共建共赢裂变机制 | `docs/CO_CREATION_FISSION.md` (FORI-086) | ✅ |
| 5 | 文档治理 CANON | `docs/CANON.md` (FORI-094) | ✅ |
| 6 | **定价撮合机制** | `docs/PRICING_MATCHING.md` (FORI-089) | ✅ 设计完成 → **本文档为实现规格** |
| 7 | Agent 原生交互 | `docs/AGENT_PAGE_CONTRACTS.md` (FORI-092) | ✅ |
| 8 | 收费获益体系 | 分级矩阵实现 + 付费墙本文档 §5 | ✅设计/⏳实现 |

### 1.2 本次设计修订要点

本轮评审对定价模块提出了三项核心修订（相较原型阶段）：

**修订 R-1**：三方差异化视图必须覆盖**全信息隔离**，不得互泄敏感字段。  
- 原型阶段：三个 Tab 切换，数据同源  
- 修订后：API 层按 `viewer_role` 参数过滤，后端单一信任点

**修订 R-2**：定价报告需接入**付费墙**（评审项 8 收费体系）。  
- 原型阶段：无付费门控  
- 修订后：完整因子报告 ¥29/份，接口层验证 `payment_ref`

**修订 R-3**：撮合状态机须对接**共建积分系统**（评审项 4）。  
- 原型阶段：成交后无分配明细  
- 修订后：`completed` 状态触发 `settlement_snapshot`，含贡献分成权重

---

## 2. 定价模块 API 规格

### 2.1 端点总览

| 方法 | 路径 | 描述 | 认证级 |
|------|------|------|--------|
| GET | `/api/v1/price/evaluate` | 房源估价（角色差异化） | L2（验证身份） |
| GET | `/api/v1/price/communities/{id}/trend` | 片区价格走势 | L1（手机验证） |
| POST | `/api/v1/price/reports` | 生成完整估价报告（付费） | L3（实名） |
| GET | `/api/v1/price/reports/{report_id}` | 获取报告详情 | L3 |
| GET | `/api/v1/price/communities/{id}/tier` | 片区层级信息 | L1 |

### 2.2 `GET /api/v1/price/evaluate`

**Query 参数**:
```
community_id    string  必填  小区 ID
unit_id         string  选填  单套 ID（有则精算，无则小区均价）
area_sqm        float   选填  建筑面积（无 unit_id 时必填）
floor           int     选填  楼层
orientation     string  选填  朝向（S/E/W/N/SE/SW）
decoration      string  选填  装修等级（rough/basic/fine/luxury）
viewer_role     string  必填  视角（buyer/seller/agent）
```

**Response 200**（viewer_role=buyer）:
```json
{
  "community_id": "community-001",
  "unit_id": null,
  "tier": "B",
  "viewer_role": "buyer",
  "display": {
    "fair_range": { "low": 2800000, "mid": 3000000, "high": 3200000 },
    "price_per_sqm": { "low": 65100, "mid": 69800, "high": 74400 },
    "value_index": 87,
    "offer_suggestion": 2950000,
    "offer_hint": "建议出价 ¥295 万，当前市场溢价率约 3%",
    "hidden_fields": ["seller_floor_price", "commission_detail"]
  },
  "confidence": "high",
  "sample_count": 23,
  "generated_at": "2026-07-02T20:00:00Z"
}
```

**Response 200**（viewer_role=seller）:
```json
{
  "viewer_role": "seller",
  "display": {
    "list_suggestion": { "low": 3100000, "high": 3300000 },
    "net_proceeds_estimate": 2850000,
    "competing_listings": 3,
    "avg_days_on_market": 52,
    "cycle_prediction": "45–60 天",
    "hidden_fields": ["buyer_max_budget"]
  },
  "confidence": "high"
}
```

**Response 200**（viewer_role=agent）:
```json
{
  "viewer_role": "agent",
  "display": {
    "full_factors": [
      { "name": "楼层", "impact_percent": 3.0, "base": 65000, "adjusted": 66950, "explanation": "中层溢价" },
      { "name": "朝向", "impact_percent": 2.5, "base": 66950, "adjusted": 68624, "explanation": "南向" },
      { "name": "装修", "impact_percent": 8.0, "base": 68624, "adjusted": 74115, "explanation": "精装" }
    ],
    "buyer_visible_range": { "low": 2800000, "high": 3200000 },
    "seller_visible_range": { "low": 3100000, "high": 3300000 },
    "negotiation_space": 300000,
    "commission_estimate": {
      "total_rate": 0.015,
      "agent_share": 0.012,
      "platform_share": 0.003,
      "estimated_amount": 44400
    },
    "price_trend_30d": "+1.2%"
  }
}
```

**错误**:
- `400` — 缺少必填参数
- `403` — viewer_role=agent 但登录角色非经纪人
- `404` — community_id 不存在

### 2.3 `GET /api/v1/price/communities/{id}/trend`

**Response 200**:
```json
{
  "community_id": "community-001",
  "tier": "B",
  "trend": [
    { "month": "2024-07", "tier_price_sqm": 62000, "city_avg_sqm": 58000 },
    { "month": "2024-08", "tier_price_sqm": 63500, "city_avg_sqm": 58200 }
  ],
  "period_months": 24,
  "data_source": "platform_transactions"
}
```

### 2.4 `POST /api/v1/price/reports`（付费报告）

**Request Body**:
```json
{
  "community_id": "community-001",
  "unit_id": "unit-001-1201",
  "viewer_role": "buyer",
  "payment_ref": "wxpay_abc123"
}
```

**Response 200**:
```json
{
  "report_id": "rpt-2026-001",
  "status": "generated",
  "pdf_url": "/api/v1/price/reports/rpt-2026-001/download",
  "unlocked": true,
  "price": 2900,
  "currency_fen": true,
  "expires_at": "2026-07-09T20:00:00Z"
}
```

**付费墙规则**:
- L1（手机验证）：可见片区均价 + 层级 + 趋势线
- L2（实名认证）：可见三方视角基础估价
- L3 付费（¥29/报告）：完整因子拆解 + PDF + 历史对比

**`payment_ref` 验证**：调用 `packages/shared/payment.ts` → `verifyPayment(ref, amount=2900)`；Mock 阶段：`ref !== null` 即 pass。

---

## 3. 撮合 API 规格

### 3.1 端点总览

| 方法 | 路径 | 描述 | 认证级 |
|------|------|------|--------|
| POST | `/api/v1/match/needs` | 买家发布需求 | L2 |
| GET | `/api/v1/match/needs/{id}` | 查询需求详情+匹配状态 | L2 |
| POST | `/api/v1/match/{id}/respond` | 经纪人响应（4h 窗口） | L2+经纪人角色 |
| POST | `/api/v1/match/{id}/schedule` | 预约带看 | L2 |
| PUT | `/api/v1/match/{id}/status` | 状态推进（议价/签约） | L2 |
| GET | `/api/v1/match/agent/queue` | 经纪人任务队列 | L2+经纪人角色 |

### 3.2 `POST /api/v1/match/needs`

**Request**:
```json
{
  "buyer_id": "user-001",
  "community_ids": ["community-001", "community-002"],
  "budget_range": { "min": 2500000, "max": 3500000 },
  "area_range": { "min": 80, "max": 120 },
  "requirements": "南向、中层以上、精装优先"
}
```

**Response 201**:
```json
{
  "need_id": "need-2026-001",
  "status": "need_published",
  "matched_at": null,
  "priority": "P1",
  "message": "需求已发布，系统将在 30 分钟内完成智能匹配"
}
```

### 3.3 状态机转换 API

**`PUT /api/v1/match/{id}/status`**:
```json
{
  "action": "agent_respond",
  "actor_id": "agent-001",
  "note": "我对这套房熟悉，今天下午可以带看"
}
```

**状态转换规则**（后端强验证）:

```
need_published → matched（系统，30min 内）
matched → agent_responded（经纪人，4h 内；超时 → reassigned）
agent_responded → viewing_scheduled（双方确认，24h 内）
viewing_scheduled → viewing_done（经纪人签到）
viewing_done → negotiating（任一方出价）
negotiating → agreed（双方确认同一价格，7d 内）
negotiating → failed（取消）
agreed → contracting（3d 内进入签约）
contracting → completed（过户完成）
completed → [触发分成结算快照]
```

### 3.4 成交结算快照

`completed` 状态触发时，系统自动创建 `settlement_snapshot`:
```json
{
  "match_id": "match-2026-001",
  "transaction_price": 2980000,
  "commission_total": 44700,
  "distribution": [
    { "role": "platform", "amount": 8940, "rate": 0.003, "reason": "平台服务费" },
    { "role": "agent_primary", "amount": 26820, "rate": 0.009, "reason": "全程服务" },
    { "role": "dict_founder", "amount": 4470, "rate": 0.0015, "reason": "楼盘首建者" },
    { "role": "dict_collaborators", "amount": 2235, "rate": 0.00075, "reason": "协作维护者（2人均摊）" },
    { "role": "referral", "amount": 2235, "rate": 0.00075, "reason": "推荐人" }
  ],
  "created_at": "2026-07-02T20:00:00Z"
}
```

---

## 4. 数据模型（TypeScript Schema）

```typescript
// packages/shared/src/types/pricing.ts

export interface PriceEvaluateRequest {
  communityId: string;
  unitId?: string;
  areaSqm?: number;
  floor?: number;
  orientation?: "S" | "E" | "W" | "N" | "SE" | "SW";
  decoration?: "rough" | "basic" | "fine" | "luxury";
  viewerRole: "buyer" | "seller" | "agent";
}

export interface PriceFactor {
  name: string;
  impactPercent: number;
  base: number;
  adjusted: number;
  explanation: string;
}

export interface PriceEvaluateResponse {
  communityId: string;
  unitId?: string;
  tier: "A" | "B" | "C" | "D";
  viewerRole: "buyer" | "seller" | "agent";
  display: BuyerPriceDisplay | SellerPriceDisplay | AgentPriceDisplay;
  confidence: "high" | "medium" | "low";
  sampleCount: number;
  generatedAt: string;
}

export interface BuyerPriceDisplay {
  fairRange: { low: number; mid: number; high: number };
  pricePerSqm: { low: number; mid: number; high: number };
  valueIndex: number;
  offerSuggestion: number;
  offerHint: string;
  hiddenFields: string[];
}

export interface SellerPriceDisplay {
  listSuggestion: { low: number; high: number };
  netProceedsEstimate: number;
  competingListings: number;
  avgDaysOnMarket: number;
  cyclePrediction: string;
  hiddenFields: string[];
}

export interface AgentPriceDisplay {
  fullFactors: PriceFactor[];
  buyerVisibleRange: { low: number; high: number };
  sellerVisibleRange: { low: number; high: number };
  negotiationSpace: number;
  commissionEstimate: {
    totalRate: number;
    agentShare: number;
    platformShare: number;
    estimatedAmount: number;
  };
  priceTrend30d: string;
}

// packages/shared/src/types/matching.ts

export type MatchStatus =
  | "need_published"
  | "matched"
  | "agent_responded"
  | "reassigned"
  | "viewing_scheduled"
  | "viewing_done"
  | "negotiating"
  | "agreed"
  | "failed"
  | "contracting"
  | "completed";

export interface MatchRecord {
  id: string;
  buyerNeedId: string;
  listingId?: string;
  agentId: string;
  priority: "P1" | "P2" | "P3";
  status: MatchStatus;
  responseDeadline: string;
  createdAt: string;
  timeline: Array<{ status: MatchStatus; at: string; actor: string; note?: string }>;
}

export interface SettlementSnapshot {
  matchId: string;
  transactionPrice: number;
  commissionTotal: number;
  distribution: Array<{
    role: string;
    amount: number;
    rate: number;
    reason: string;
  }>;
  createdAt: string;
}
```

---

## 5. 付费体系集成（评审项 8）

### 5.1 登录等级 × 可见内容矩阵（定价模块）

| 内容 | 未登录 | L1手机验证 | L2实名 | L3付费 |
|------|--------|-----------|--------|--------|
| 片区层级（A/B/C/D） | ✅ | ✅ | ✅ | ✅ |
| 片区均价（模糊±10%） | ✅ | ✅ | ✅ | ✅ |
| 精确估价区间 | ❌ | ❌ | ✅ | ✅ |
| 三方差异化视图 | ❌ | ❌ | ✅（基础） | ✅（完整） |
| 因子拆解明细 | ❌ | ❌ | ❌ | ✅ |
| PDF 报告下载 | ❌ | ❌ | ❌ | ✅ |
| 历史趋势（24月） | ❌ | ✅ | ✅ | ✅ |

### 5.2 付费墙交互设计

```
未达到权限时 → 显示模糊预览图（高斯模糊 CSS）
             → 「解锁完整报告 ¥29」CTA 按钮
             → 微信/支付宝支付弹窗
             → 回调验证 payment_ref → 解锁内容（无刷新，React state）
```

### 5.3 收费定价策略

| 服务 | 定价 | 规则 |
|------|------|------|
| 估价报告 | ¥29/份 | 同一单元 30 天内免费查看 |
| 经纪人月度订阅 | ¥199/月 | 无限报告 + 客源推送优先级 |
| 平台增值数据包 | ¥99/月 | 经纪人专属走势预测 + 区域热力图 |

---

## 6. Agent 集成规格

### 6.1 PriceEvalAgent 契约

```python
# services/agents/price-eval/agent.py

class PriceEvalAgent:
    async def evaluate(self, context: PriceEvalContext) -> PriceResult:
        """
        context:
          - community_id, unit_id, factors
          - viewer_role（决定过滤逻辑）
        返回 PriceResult，适配 OpenClaw 适配层
        """
        ...

    async def generate_report(self, eval_result: PriceResult, payment_verified: bool) -> ReportResult:
        """付费报告生成，PDF 渲染"""
        ...
```

### 6.2 MatchAgent 契约

```python
class MatchAgent:
    async def match_need(self, need: BuyerNeed) -> List[MatchCandidate]:
        """基于楼盘字典维护者优先级 + 预算匹配"""
        ...

    async def notify_agent(self, match: MatchRecord) -> None:
        """推送 P1 客源通知，启动 4h 计时"""
        ...

    async def auto_reassign(self, match_id: str) -> MatchRecord:
        """4h 超时自动重新分配 + 扣信用分 5 分"""
        ...
```

### 6.3 页面 Agent 助手接入点

| 页面 | 触发词 | Agent 能力 |
|------|--------|-----------|
| `/price/[id]` | 「为什么这个价格？」 | 解释因子权重 |
| `/price/[id]` | 「帮我生成报告」 | 触发付费流程 |
| `/match` | 「我的客源在哪」 | 返回 match 队列 |
| `/match/[id]` | 「给买家发一个出价建议」 | 生成议价草稿 |

---

## 7. FastAPI 实现路由（供 Codex 参考）

```python
# apps/api/routers/price.py

from fastapi import APIRouter, Depends, Query
from packages_shared.types import PriceEvaluateResponse, ViewerRole
from core.auth import require_level

router = APIRouter(prefix="/api/v1/price", tags=["price"])

@router.get("/evaluate", response_model=PriceEvaluateResponse)
async def evaluate_price(
    community_id: str = Query(...),
    unit_id: str | None = Query(None),
    area_sqm: float | None = Query(None),
    floor: int | None = Query(None),
    orientation: str | None = Query(None),
    decoration: str | None = Query(None),
    viewer_role: ViewerRole = Query(...),
    user=Depends(require_level(2))
):
    ...

@router.post("/reports", response_model=ReportResponse)
async def create_report(
    body: ReportCreateRequest,
    user=Depends(require_level(3))
):
    # 验证 payment_ref
    # 生成报告
    ...
```

```python
# apps/api/routers/match.py

router = APIRouter(prefix="/api/v1/match", tags=["match"])

@router.post("/needs", response_model=NeedCreateResponse)
async def publish_need(body: NeedCreateRequest, user=Depends(require_level(2))): ...

@router.post("/{match_id}/respond")
async def respond_to_match(
    match_id: str,
    body: MatchRespondRequest,
    user=Depends(require_level(2, role="agent"))
): ...

@router.put("/{match_id}/status")
async def update_status(match_id: str, body: StatusUpdateRequest, user=Depends(require_level(2))): ...
```

---

## 8. 实现里程碑与验收

### Wave 1a（FORI-043，Codex 实现）

| 子任务 | 文件 | 验收 |
|--------|------|------|
| 043-A | `apps/api/routers/price.py` | GET /evaluate 三角色返回正确过滤字段 |
| 043-B | `apps/api/routers/match.py` | POST /needs → 201；PUT status 验证转换规则 |
| 043-C | `packages/shared/src/types/pricing.ts` | TypeScript 类型 0 error |
| 043-D | `packages/shared/src/types/matching.ts` | SettlementSnapshot 字段齐全 |
| 043-E | Mock 数据种子 | `apps/api/data/seed_pricing.py` ≥ 3 小区 |

### Wave 1b（FORI-044/045，后续派发）

| 子任务 | 内容 |
|--------|------|
| 044 | PriceEvalAgent 接 OpenClaw adapter |
| 045 | 付费验证模块（payment_ref 校验 + Mock WeChat pay stub） |

### 验收命令

```bash
# API 启动
cd apps/api && uvicorn main:app --port 8000

# 冒烟测试
curl "http://localhost:8000/api/v1/price/evaluate?community_id=community-001&area_sqm=88&viewer_role=buyer" \
  -H "Authorization: Bearer test-l2-token" | jq .display.fair_range

curl "http://localhost:8000/api/v1/price/evaluate?community_id=community-001&area_sqm=88&viewer_role=seller" \
  -H "Authorization: Bearer test-l2-token" | jq .display.list_suggestion

# 状态机验证：非法转换必须返回 422
curl -X PUT "http://localhost:8000/api/v1/match/match-001/status" \
  -d '{"action":"agreed"}' | jq .status_code  # 应为 422（跳过中间态）
```

---

## 9. 与既有文档衔接

| 文档 | 与本文关系 |
|------|-----------|
| `docs/PRICING_MATCHING.md` | 上游设计原稿；本文是实现规格，不重复定性描述 |
| `docs/CO_CREATION_FISSION.md` §5.3 | 分成比例来源；本文 §3.4 引用 |
| `docs/AGENT_PAGE_CONTRACTS.md` | Agent I/O 契约；本文 §6 对齐 |
| `docs/execution/TECHNICAL_SOLUTION.md` | 本文是 Wave 1 API 的完整补充 |
| `.ai/handoffs/FORI-043-implement.md` | 本文的 Codex 实现指令版本 |

---

*FORI-043 设计 · Claude Code @ epix · 2026-07-02*
