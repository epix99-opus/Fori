# FORI-043 设计文档：在地分层定价模块完整设计

> **任务**: FORI-043 · Design  
> **阶段**: D4 Wave 1 首切片  
> **负责人**: Claude Code (epix)  
> **版本**: 1.0 · 2026-07-02  
> **依据**: `docs/PRICING_MATCHING.md`、`docs/PRD.md §3.5`、人类评审第 6 条  
> **前置**: FORI-040 MVP 切片策略、Wave 0 脚手架  
> **后续**: FORI-044（定价 Agent 契约）、FORI-045（定价前端接线）

---

## 1. 背景与目标

### 1.1 选型原因

Wave 1 首切片选择定价模块（模块五）的原因（来自 REVIEW-030 + MVP_SLICE.md）：

- **核心差异化**：PRD §3.5 明确定价为平台独有能力，区别于竞品的关键锚点
- **可 Mock 验证**：估价模型可用历史成交样本 Mock，不阻塞合规长链路
- **已有原型**：`prototype/app/price/` 已实现三角色 Tab + 图表组件，可直接迁移
- **人类评审第 6 条**：明确要求「先形成完整方案再进行功能实现」，本文档即完整方案

### 1.2 设计目标

1. 产出 PostgreSQL 数据模型（4 张表），支持在地分层定价的完整数据存储
2. 定义 4 个 API 端点的完整输入/输出 schema，无 TBD
3. 明确三角色（买家/卖家/经纪人）的差异化输出字段矩阵
4. 设计 price-eval Agent I/O 契约与 OpenClaw SSE 事件
5. 指定原型增强规格（非 cosmetic 的功能变更清单），覆盖评审第 6 条

### 1.3 设计约束

- 技术栈：Next.js 14 (App Router) + FastAPI (Python 3.12) + PostgreSQL 16 + Redis 7（SPEC §5.1）
- 禁止 MVP 降级（SPEC §5.3）
- 禁止 TBD（SPEC §5.3）
- 设计阶段不得修改 `prototype/` 或 `src/` 代码
- 与 `docs/PRICING_MATCHING.md` 中 `PriceAssessment` interface 严格对齐

---

## 2. 在地分层定价数据模型

### 2.1 总览

```
communities        ←── 小区基础信息与分层评级
price_tiers        ←── A/B/C/D 层级定义与 UI 参数
price_factors      ←── 个体修正因子定义（楼层/朝向/装修等）
assessments        ←── 实时生成的估价结果（TTL 24h）
```

### 2.2 PostgreSQL Schema

```sql
-- ============================================================
-- communities：小区基础信息 + A/B/C/D 分层
-- ============================================================
CREATE TABLE communities (
  id                    VARCHAR(64)    PRIMARY KEY,
  name                  VARCHAR(128)   NOT NULL,
  city                  VARCHAR(64)    NOT NULL,
  district              VARCHAR(64)    NOT NULL,
  zone                  VARCHAR(128)   NOT NULL,

  -- 分层
  tier                  CHAR(1)        NOT NULL CHECK (tier IN ('A','B','C','D')),
  tier_confidence       SMALLINT       NOT NULL DEFAULT 80
                                       CHECK (tier_confidence BETWEEN 0 AND 100),

  -- 分层算法输入指标（对应 PRD §5.2 权重指标）
  build_year            SMALLINT,
  floor_area_ratio      NUMERIC(4,2),                 -- 容积率
  green_rate            NUMERIC(5,2),                 -- 绿化率 %
  parking_ratio         NUMERIC(4,2),                 -- 车位比
  school_district_level SMALLINT       CHECK (school_district_level BETWEEN 1 AND 5),
  metro_distance_m      INTEGER,                      -- 最近地铁距离 m
  property_mgmt_score   SMALLINT       CHECK (property_mgmt_score BETWEEN 1 AND 10),

  -- 价格参考（CNY/㎡）
  ref_price_low         INTEGER        NOT NULL,
  ref_price_high        INTEGER        NOT NULL,
  sample_count          SMALLINT       NOT NULL DEFAULT 0,

  last_evaluated_at     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communities_tier      ON communities(tier);
CREATE INDEX idx_communities_district  ON communities(city, district);
CREATE INDEX idx_communities_name_gin  ON communities USING GIN (to_tsvector('simple', name));


-- ============================================================
-- price_tiers：A/B/C/D 层级定义 + UI 行为参数
-- ============================================================
CREATE TABLE price_tiers (
  tier             CHAR(1)      PRIMARY KEY CHECK (tier IN ('A','B','C','D')),
  label            VARCHAR(32)  NOT NULL,
  description      TEXT         NOT NULL,
  confidence_level VARCHAR(8)   NOT NULL CHECK (confidence_level IN ('high','medium','low')),
  min_sample       SMALLINT     NOT NULL,   -- 低于此值显示样本不足警告
  show_warning     BOOLEAN      NOT NULL DEFAULT FALSE
);

INSERT INTO price_tiers VALUES
  ('A', 'A 高品质圈层', '改善圈层、资源稀缺、高流动性，议价空间较小',      'high',   30, FALSE),
  ('B', 'B 中端圈层',   '品质刚需、成交样本稳定，价格锚点清晰',            'medium', 20, FALSE),
  ('C', 'C 刚需圈层',   '普通刚需，样本量可能不足，建议标注参考数量',        'medium', 15, TRUE),
  ('D', 'D 老旧/边缘',  '样本较少，测算结果仅作参考，需扩大成交周期复核',    'low',    10, TRUE);


-- ============================================================
-- price_factors：个体修正因子定义
-- ============================================================
CREATE TABLE price_factors (
  id           SERIAL       PRIMARY KEY,
  factor_key   VARCHAR(32)  NOT NULL UNIQUE,
  factor_name  VARCHAR(64)  NOT NULL,
  min_pct      NUMERIC(5,2) NOT NULL,   -- 最小影响比例 %
  max_pct      NUMERIC(5,2) NOT NULL,   -- 最大影响比例 %
  data_source  VARCHAR(64)  NOT NULL,   -- 来源：dict | listing | survey | policy | market
  description  TEXT
);

INSERT INTO price_factors (factor_key, factor_name, min_pct, max_pct, data_source, description) VALUES
  ('floor',        '楼层修正',   -5.0,  8.0, 'dict',    '低楼层 -5% ~ -2%；高楼层 +2% ~ +8%，顶楼 -1%'),
  ('orientation',  '朝向修正',   -3.0,  5.0, 'dict',    '纯北向 -3%；南北通透 +4%；纯南 +3%'),
  ('renovation',   '装修修正',  -10.0, 15.0, 'listing', '毛坯 0%；简装 +2%；精装 +8%；豪装 +15%'),
  ('ownership',    '产权修正',  -20.0,  2.0, 'cert',    '40 年产权 -10%；满 2 年 +1%；满 5 年 +2%'),
  ('tax',          '税费修正',   -5.0,  0.0, 'policy',  '高额税费由买家承担 -3%'),
  ('scarcity',     '稀缺度修正', -5.0, 10.0, 'market',  '在售 <5 套 +2%；在售 >50 套 -2%；特殊景观 +5%');


-- ============================================================
-- assessments：生成的估价结果（TTL 24h，Redis 缓存同步）
-- ============================================================
CREATE TABLE assessments (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id            VARCHAR(64) NOT NULL REFERENCES communities(id),
  unit_id                 VARCHAR(64),                    -- 可选：具体房源 ID

  -- 层级与价格
  tier                    CHAR(1)     NOT NULL CHECK (tier IN ('A','B','C','D')),
  base_price_per_sqm      INTEGER     NOT NULL,           -- CNY/㎡，修正前基准价
  adjusted_price_per_sqm  INTEGER     NOT NULL,           -- CNY/㎡，叠加因子后
  range_low               BIGINT      NOT NULL,           -- 总价区间 低 CNY
  range_mid               BIGINT      NOT NULL,           -- 总价区间 中
  range_high              BIGINT      NOT NULL,           -- 总价区间 高
  area_sqm                NUMERIC(7,2),                   -- 面积（用于总价）

  -- 因子拆解（与 PriceAssessment.factors 对齐）
  factors                 JSONB       NOT NULL DEFAULT '[]',
  -- 结构: [{ "name": "楼层修正", "impactPercent": 3.0, "explanation": "..." }]

  -- 质量指标
  confidence              VARCHAR(8)  NOT NULL CHECK (confidence IN ('high','medium','low')),
  sample_count            SMALLINT    NOT NULL DEFAULT 0,

  -- 生命周期
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_assessments_community ON assessments(community_id);
CREATE INDEX idx_assessments_gen_at    ON assessments(generated_at DESC);
-- TimescaleDB 分区（Wave 1 后，assessments 数据量大时启用）
-- SELECT create_hypertable('assessments', 'generated_at');
```

### 2.3 数据关系说明

- `assessments.community_id → communities.id`：一个小区可生成多条估价记录
- `assessments.tier` 继承自 `communities.tier`，但可因 `unit_id` 差异（如同小区不同楼栋）覆盖
- `assessments.factors` JSONB 存储因子拆解结果，与 `price_factors` 因子定义对应
- 24h TTL 通过 `expires_at` 字段管理，Redis 同步缓存，API 读取时优先命中缓存

---

## 3. API 端点完整契约

所有端点遵循统一响应格式（`packages/shared/types/api.ts`）：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; page: number; limit: number };
}
```

### 3.1 GET /api/v1/price/evaluate — 单次估价

**Query Parameters:**

| 参数 | 类型 | 必填 | 验证规则 | 说明 |
|------|------|:----:|---------|------|
| `community_id` | string | ✅ | max 64 chars | 小区 ID |
| `viewer_role` | `"buyer"｜"seller"｜"agent"` | ✅ | enum | 角色，控制输出字段 |
| `area_sqm` | number | — | 10 ~ 10000 | 建筑面积（㎡），用于总价 |
| `floor` | integer | — | 1 ~ 200 | 所在楼层 |
| `total_floors` | integer | — | 1 ~ 200 | 总层数 |
| `orientation` | `"south"｜"north"｜"east"｜"west"｜"south_north"` | — | enum | 朝向 |
| `renovation` | `"raw"｜"basic"｜"finished"｜"luxury"` | — | enum | 装修状态 |
| `ownership_years` | number | — | 0 ~ 100 | 持有年限（产权修正） |
| `tax_bearer` | `"buyer"｜"seller"｜"split"` | — | enum | 税费承担方 |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "communityId": "community-001",
    "unitId": null,
    "tier": "B",
    "basePricePerSqm": 35000,
    "adjustedPricePerSqm": 38500,
    "totalRange": {
      "low": 3311000,
      "mid": 3580500,
      "high": 3773200
    },
    "factors": [
      { "name": "楼层修正",  "impactPercent":  3.0, "explanation": "8/18 层位于小高层舒适区，采光与噪音条件优于低楼层" },
      { "name": "朝向修正",  "impactPercent":  2.0, "explanation": "南北通透在当前小区近 90 天成交样本中溢价明显" },
      { "name": "装修修正",  "impactPercent":  8.0, "explanation": "精装可直接入住，降低买方短期装修成本和空置周期" },
      { "name": "税费修正",  "impactPercent": -3.0, "explanation": "税费承担方式偏向买家，测算价需回调" },
      { "name": "稀缺度修正","impactPercent":  2.0, "explanation": "同户型当前在售少于 5 套，近 30 天咨询热度上升" }
    ],
    "confidence": "medium",
    "sampleCount": 23,
    "generatedAt": "2026-07-02T10:00:00Z",
    "expiresAt": "2026-07-03T10:00:00Z",
    "viewerRole": "buyer",
    "roleView": {
      "fairRangeLow": 3152000,
      "fairRangeHigh": 3723200,
      "valueIndex": 82,
      "negotiationSuggestion": "建议出价 295 万 ±5%",
      "hiddenFields": ["sellerFloorPrice", "commissionDetail"]
    }
  }
}
```

**Error 400** — 缺少必填参数：
```json
{ "success": false, "error": "community_id is required" }
```

**Error 404** — 小区不存在：
```json
{ "success": false, "error": "community not found", "data": null }
```

**Error 422** — 参数格式错误：
```json
{ "success": false, "error": "area_sqm must be between 10 and 10000" }
```

**缓存策略**: Redis key `price:eval:{community_id}:{hash(params)}`, TTL 24h；`viewer_role` 作为 hash 输入，不同角色独立缓存

---

### 3.2 GET /api/v1/price/communities/{id}/trend — 历史走势

**Path Parameter:** `id: string` — 小区 ID

**Query Parameters:**

| 参数 | 类型 | 必填 | 默认值 | 验证规则 |
|------|------|:----:|-------|---------|
| `months` | integer | — | 24 | 1 ~ 60 |
| `compare_tier` | `"A"｜"B"｜"C"｜"D"` | — | 自动选相邻层级 | 对比层级 |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "communityId": "community-001",
    "tier": "B",
    "trendDirection": "up",
    "changePercent3m": 4.1,
    "changePercent12m": 11.8,
    "points": [
      { "month": "2024-07", "tierPrice": 34200, "comparePrice": 30800 },
      { "month": "2024-08", "tierPrice": 34500, "comparePrice": 31000 },
      { "month": "2024-09", "tierPrice": 34800, "comparePrice": 31100 },
      { "month": "2024-10", "tierPrice": 35200, "comparePrice": 31400 },
      { "month": "2024-11", "tierPrice": 35100, "comparePrice": 31600 },
      { "month": "2024-12", "tierPrice": 35600, "comparePrice": 31800 },
      { "month": "2025-01", "tierPrice": 36000, "comparePrice": 32100 },
      { "month": "2025-02", "tierPrice": 36400, "comparePrice": 32200 },
      { "month": "2025-03", "tierPrice": 37100, "comparePrice": 32600 },
      { "month": "2025-04", "tierPrice": 37800, "comparePrice": 32900 },
      { "month": "2025-05", "tierPrice": 38200, "comparePrice": 33100 },
      { "month": "2025-06", "tierPrice": 38600, "comparePrice": 33200 }
    ]
  }
}
```

**Error 404:**
```json
{ "success": false, "error": "community not found" }
```

---

### 3.3 POST /api/v1/price/reports — 生成深度报告（付费墙）

**Request Body:**

```json
{
  "communityId": "community-001",
  "unitId": null,
  "viewerRole": "buyer",
  "areaSqm": 93.0,
  "paymentRef": "wx-payment-ref-20260702-abc123"
}
```

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|:----:|---------|
| `communityId` | string | ✅ | 存在于 communities |
| `viewerRole` | `"buyer"｜"seller"｜"agent"` | ✅ | enum |
| `areaSqm` | number | — | 10 ~ 10000 |
| `unitId` | string | — | max 64 chars |
| `paymentRef` | string | ✅ | 支付回执 ref（Wave 1 Mock 可传 `"mock-payment"`） |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "reportId": "rpt-550e8400-e29b-41d4-a716-446655440000",
    "pdfUrl": "/api/v1/price/reports/rpt-550e8400-e29b-41d4-a716-446655440000/download",
    "unlocked": true,
    "generatedAt": "2026-07-02T10:05:00Z",
    "expiresAt": "2026-07-09T10:05:00Z",
    "priceWan": 29
  }
}
```

**Error 402** — 未付费：
```json
{ "success": false, "error": "payment required", "data": { "amountFen": 2900 } }
```

**Error 422** — 参数校验失败：
```json
{ "success": false, "error": "communityId is required" }
```

---

### 3.4 GET /api/v1/price/communities — 小区列表（搜索）

**Query Parameters:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:----:|-------|------|
| `city` | string | — | — | 城市过滤 |
| `district` | string | — | — | 片区过滤 |
| `tier` | `"A"｜"B"｜"C"｜"D"` | — | — | 层级过滤 |
| `keyword` | string | — | — | 小区名关键字（全文搜索） |
| `page` | integer | — | 1 | 页码 |
| `limit` | integer | — | 20 | 每页数量，最大 100 |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "community-001",
      "name": "中关村小区",
      "district": "海淀",
      "zone": "中关村北区",
      "tier": "B",
      "tierConfidence": 85,
      "refPriceLow": 32000,
      "refPriceHigh": 38000,
      "sampleCount": 23
    },
    {
      "id": "community-002",
      "name": "知春里",
      "district": "海淀",
      "zone": "知春路",
      "tier": "C",
      "tierConfidence": 72,
      "refPriceLow": 28500,
      "refPriceHigh": 33000,
      "sampleCount": 14
    }
  ],
  "meta": { "total": 4, "page": 1, "limit": 20 }
}
```

---

## 4. 三角色差异化输出矩阵

基于 `PRICING_MATCHING.md §3`，对齐 `viewer_role` 参数控制的字段可见性。

### 4.1 字段可见性矩阵

| 信息块 | 字段 | 买家 (buyer) | 卖家 (seller) | 经纪人 (agent) |
|--------|------|:-----------:|:------------:|:-------------:|
| **公允区间** | `roleView.fairRangeLow/High` | ✅ 显示「可用于出价的安全锚点」 | ❌ 隐藏 | ✅ 双边均显示 |
| **性价比指数** | `roleView.valueIndex` | ✅ 显示 0-100 指数 | ❌ 隐藏 | ✅ 显示（带对标数据） |
| **议价建议** | `roleView.negotiationSuggestion` | ✅「建议出价 295 万 ±5%」 | ❌ 隐藏 | ✅ 显示买卖双方议价空间 |
| **挂牌建议** | `roleView.listingAdvice` | ❌ 隐藏 | ✅「建议挂牌 310-330 万」 | ✅ 显示 |
| **竞品对比** | `roleView.competitorCount` | ❌ 隐藏数量详情 | ✅「同小区在售 3 套」 | ✅ 全部竞品列表 |
| **成交周期预测** | `roleView.estimatedDays` | ❌ 隐藏 | ✅「预计 45-60 天」 | ✅ 显示 |
| **完整因子拆解** | `factors[]` | ✅ 全部因子（简版说明） | ✅ 全部因子（简版说明） | ✅ 全部因子 + 权重数值 |
| **佣金预估** | `roleView.commissionEstimate` | ❌ 隐藏 | ❌ 隐藏 | ✅「约 2.4 万（80% 服务池）」 |
| **卖家底价** | `roleView.sellerFloorPrice` | ❌ 永远隐藏 | ✅（仅该卖家） | ❌ 不透传给经纪人 |
| **买家最高预算** | `roleView.buyerMaxBudget` | ✅（仅该买家） | ❌ 永远隐藏 | ❌ 不透传给经纪人 |
| **调价历史** | `roleView.priceHistory` | ❌ 隐藏 | ❌ 隐藏 | ✅ 片区 24 月走势详解 |
| **置信度标签** | `confidence` + `sampleCount` | ✅ 显示（简化标签） | ✅ 显示 | ✅ 显示（含数值） |

### 4.2 roleView 字段定义（完整 TypeScript 类型）

```typescript
// packages/shared/types/price.ts

interface BuyerRoleView {
  fairRangeLow: number;          // 公允区间低值 CNY
  fairRangeHigh: number;         // 公允区间高值 CNY
  valueIndex: number;            // 性价比指数 0-100
  negotiationSuggestion: string; // 议价建议文字
  hiddenFields: string[];        // 客户端声明已隐藏字段
}

interface SellerRoleView {
  listingAdviceLow: number;      // 挂牌建议低值 CNY
  listingAdviceHigh: number;     // 挂牌建议高值 CNY
  competitorCount: number;       // 同小区在售套数
  estimatedDaysMin: number;      // 预计成交周期（最短天数）
  estimatedDaysMax: number;      // 预计成交周期（最长天数）
  hiddenFields: string[];
}

interface AgentRoleView {
  buyerFairRangeLow: number;
  buyerFairRangeHigh: number;
  sellerListingLow: number;
  sellerListingHigh: number;
  matchingSpread: number;        // 撮合空间 = sellerListing - buyerFair CNY
  commissionEstimate: number;    // 佣金预估 CNY
  commissionBasis: string;       // 佣金计算说明
  competitorList: Array<{        // 竞品列表（脱敏）
    area: string;
    floor: string;
    price: string;
    daysOnMarket: number;
  }>;
}

// 估价 API 主响应，对齐 PRICING_MATCHING.md PriceAssessment
interface PriceAssessmentResponse {
  communityId: string;
  unitId: string | null;
  tier: "A" | "B" | "C" | "D";
  basePricePerSqm: number;
  adjustedPricePerSqm: number;
  totalRange: { low: number; mid: number; high: number };
  factors: Array<{ name: string; impactPercent: number; explanation: string }>;
  confidence: "high" | "medium" | "low";
  sampleCount: number;
  generatedAt: string;           // ISO 8601
  expiresAt: string;             // ISO 8601
  viewerRole: "buyer" | "seller" | "agent";
  roleView: BuyerRoleView | SellerRoleView | AgentRoleView;
}
```

---

## 5. D-tier 警示、置信度、样本量 UI 规格

### 5.1 置信度 Badge

| `confidence` 值 | 标签文字 | 颜色 Token | 显示位置 |
|:---:|---------|-----------|---------|
| `high` | 「高置信」 | `bg-semantic-success/10 text-semantic-success` | 层级 Badge 右侧 |
| `medium` | 「中置信」 | `bg-secondary-200 text-secondary-600` | 层级 Badge 右侧 |
| `low` | 「低置信 · 仅参考」 | `bg-semantic-warning/10 text-semantic-warning` | 层级 Badge 右侧 + D-tier 警示条内重复 |

### 5.2 样本量展示规则

| `sampleCount` | 显示 | 组件 |
|:---:|------|------|
| ≥ 30 | 不单独展示 | — |
| 15 ~ 29 | 「样本 {n} 套，参考性中等」 | 小字 `text-body-s text-neutral-500` |
| < 15 | 「仅 {n} 套成交样本，建议扩大周期」 | `text-semantic-warning` + 图标 |

### 5.3 D-tier 警示条（已在原型中实现，需增强）

当 `tier === "D"` 时展示，规格：

```
┌──────────────────────────────────────────────────────────┐
│ ⚠  样本不足，测算结果仅作参考                              │
│    D 层级成交样本 {sampleCount} 套，测算结果不建议直接用于 │
│    出价决策，请扩大成交周期至 12 个月或结合实地勘察。      │
│    [扩大搜索范围] 按钮（跳转至周边小区对比）               │
└──────────────────────────────────────────────────────────┘
```

- 容器：`rounded-xl border border-semantic-warning/40 bg-semantic-warning/10 px-4 py-3`
- 按钮：`Button variant="ghost" size="sm"`，点击跳转 `/price?district={district}&tier=C`
- 原型现状：已有警示条，缺少动态 `sampleCount` 注入和「扩大搜索范围」按钮

### 5.4 置信度降级提示

当 `sampleCount < price_tiers.min_sample` 且 `tier` 为 C 或 D 时，API 响应中 `confidence` 自动降级为 `"low"`，前端警示条自动出现（不需额外逻辑判断）。

---

## 6. Agent Hooks：price-eval Agent I/O

### 6.1 price-eval Agent 职责

`services/agents/price-eval/` 实现估价核心算法，通过 OpenClaw 框架接入。

功能边界：
- 根据 `community_id` 和个体参数，计算 `PriceAssessment`
- 调用 `price_factors` 定义进行因子权重叠加
- 生成三角色差异化 `roleView`
- 通过 SSE 流式推送估价进度（用于 UI 实时反馈）

### 6.2 Agent 输入契约

```python
# services/agents/price-eval/schema.py

from pydantic import BaseModel, Field
from typing import Literal, Optional

class PriceEvalContext(BaseModel):
    community_id: str = Field(..., max_length=64)
    viewer_role: Literal["buyer", "seller", "agent"]
    area_sqm: Optional[float] = Field(None, ge=10, le=10000)
    floor: Optional[int] = Field(None, ge=1, le=200)
    total_floors: Optional[int] = Field(None, ge=1, le=200)
    orientation: Optional[Literal["south", "north", "east", "west", "south_north"]] = None
    renovation: Optional[Literal["raw", "basic", "finished", "luxury"]] = None
    ownership_years: Optional[float] = Field(None, ge=0, le=100)
    tax_bearer: Optional[Literal["buyer", "seller", "split"]] = None
    request_id: str = Field(..., description="追踪 ID，透传到 SSE 事件")
```

### 6.3 Agent 输出契约

```python
class FactorResult(BaseModel):
    name: str
    impact_percent: float
    explanation: str

class PriceRangeResult(BaseModel):
    low: int    # CNY 总价
    mid: int
    high: int

class PriceResult(BaseModel):
    community_id: str
    unit_id: Optional[str]
    tier: Literal["A", "B", "C", "D"]
    base_price_per_sqm: int
    adjusted_price_per_sqm: int
    total_range: PriceRangeResult
    factors: list[FactorResult]
    confidence: Literal["high", "medium", "low"]
    sample_count: int
    generated_at: str     # ISO 8601
    expires_at: str       # ISO 8601
    viewer_role: Literal["buyer", "seller", "agent"]
    role_view: dict       # 根据 viewer_role 返回对应 View 结构
```

### 6.4 Agent 评估流程

```
PriceEvalContext 输入
   │
   ├─ 1. 查询 communities 表（community_id）
   │      获取: tier, ref_price_low, ref_price_high, sample_count
   │
   ├─ 2. 查询近 N 笔成交数据（N=30，不足时扩展周期）
   │      计算: 中位数 base_price_per_sqm, 25%/75% 分位
   │
   ├─ 3. 依次叠加 price_factors 因子修正
   │      if floor and total_floors → 楼层因子
   │      if orientation → 朝向因子
   │      if renovation → 装修因子
   │      if ownership_years → 产权因子
   │      if tax_bearer == "buyer" → 税费因子
   │      调用市场热度 API → 稀缺度因子
   │
   ├─ 4. 计算 adjusted_price_per_sqm = base × (1 + Σ factors)
   │
   ├─ 5. 根据 area_sqm 计算 total_range (low=×0.92, mid=×1.00, high=×1.055)
   │
   ├─ 6. 根据 viewer_role 生成 role_view（隐藏对方敏感字段）
   │
   └─ 7. 写入 assessments 表 + Redis 缓存（TTL 24h）
         返回 PriceResult
```

### 6.5 OpenClaw SSE 事件规范

**端点**: `GET /api/v1/price/evaluate/stream?{params}` (Content-Type: text/event-stream)

| 事件名 | 触发时机 | Payload 示例 |
|--------|---------|-------------|
| `price:eval:start` | Agent 开始计算 | `{ "requestId": "req-123", "communityId": "community-001" }` |
| `price:eval:data_fetched` | 成交样本获取完成 | `{ "sampleCount": 23, "periodMonths": 6 }` |
| `price:eval:factor` | 每个因子计算完成 | `{ "factorKey": "floor", "impactPercent": 3.0, "name": "楼层修正" }` |
| `price:eval:complete` | 估价完成 | 完整 `PriceResult` JSON |
| `price:eval:error` | 计算失败 | `{ "code": "INSUFFICIENT_SAMPLE", "message": "样本量不足，建议扩大成交周期" }` |

**SSE 接入点（apps/api/adapters/openclaw.py）**:

```python
# apps/api/adapters/openclaw.py

async def stream_price_eval(context: PriceEvalContext):
    """OpenClaw SSE 适配器：将 price-eval Agent 输出转换为 SSE 流"""
    yield f"event: price:eval:start\ndata: {json.dumps({'requestId': context.request_id})}\n\n"

    agent = PriceEvalAgent()
    async for event in agent.evaluate_stream(context):
        yield f"event: {event.name}\ndata: {json.dumps(event.payload)}\n\n"
```

---

## 7. 原型增强规格

> **说明**: 本节列出 `prototype/` 需要变更的功能规格，供 FORI-044/045 执行阶段实施。  
> **约束**: 设计阶段不修改代码，仅定义规格。  
> **原则**: 只列非 cosmetic（影响功能或数据对齐）的变更。

### 7.1 `/price/page.tsx` — 入口页增强

**现状（原型）**: 硬编码 `mockListings[0]`，三个模式卡片无交互差异，无角色选择器。

**需要变更（功能性）**:

| 变更编号 | 变更描述 | 影响 |
|---------|---------|------|
| E1 | 添加角色选择器（`viewer_role: buyer｜seller｜agent`），默认 `buyer` | 控制后续 `/price/[id]` 页面输出内容 |
| E2 | 小区搜索框接入 `GET /api/v1/price/communities?keyword=...`，替换硬编码 `mockListings[0]` | 实现真实小区搜索 |
| E3 | 三个模式卡片（小区均价/单套估价/手动参数）传入不同 query 参数跳转：`/price/[id]?mode=community｜unit｜manual` | 控制 API 参数组合 |
| E4 | 「当前片区参考均价」卡片显示 `GET /api/v1/price/communities?limit=1` 返回的动态数据（而非硬编码字符串） | 去除硬编码内容 |

### 7.2 `/price/[communityId]/page.tsx` — 详情页增强

**现状（原型）**: 使用硬编码 `communities[]` 和 `factors[]`，置信度不展示，样本量不展示，D-tier 警示缺少动态 `sampleCount` 和「扩大范围」按钮。

**需要变更（功能性）**:

| 变更编号 | 变更描述 | 影响 |
|---------|---------|------|
| E5 | 将 `communities[]` 硬编码替换为调用 `GET /api/v1/price/communities`（支持 mode=real/mock 切换，Wave 1 可 mock） | 小区数据来自 API |
| E6 | 将 `factors[]` 和价格计算逻辑替换为调用 `GET /api/v1/price/evaluate` 结果，使用 `assessmentData.adjustedPricePerSqm` 替代本地计算 | 数据源对齐 API |
| E7 | 添加置信度 Badge：显示 `assessmentData.confidence`（`high/medium/low`），含颜色 Token（见 §5.1） | 关键质量指标 |
| E8 | 添加样本量展示：当 `sampleCount < 30` 时在层级卡片下方显示「样本 {n} 套」（见 §5.2） | 透明度核心功能 |
| E9 | D-tier 警示条增强：注入动态 `sampleCount`，添加「扩大搜索范围」按钮（跳转 `/price?district=...&tier=C`） | 覆盖评审第 6 条 |
| E10 | `RoleInsightBlock` 各角色字段来源改为 `assessmentData.roleView`（而非本地计算），对齐 §4.1 矩阵 | 数据隔离正确性 |
| E11 | 历史走势图数据来源改为 `GET /api/v1/price/communities/{id}/trend`（支持 mock 回退） | 去除硬编码 `trendPoints` |
| E12 | 添加估价有效期提示：在固定底栏上方显示「估价有效期至 {expiresAt}，超期自动重算」 | 用户预期管理 |
| E13 | `AgentAssistFab` 的 `suggestedPrompts` 根据当前 `priceRole` 动态生成：买家提示议价话术，卖家提示挂牌策略，经纪人提示撮合空间 | Agent 原生能力对齐 §6 |

### 7.3 新增共享类型（`packages/shared/types/price.ts`）

- `PriceAssessmentResponse`（见 §4.2）
- `BuyerRoleView`、`SellerRoleView`、`AgentRoleView`
- `TrendPoint`、`CommunityListItem`

---

## 8. 验收标准 Checklist

### 8.1 设计完整性

- [ ] FORI-043_DESIGN.md 所有章节完整，无 TBD、无「待定」
- [ ] 所有 API 端点有完整 Query/Body 参数表 + 200/4xx 响应示例
- [ ] PG schema 4 张表有字段类型、约束、索引定义
- [ ] price_tiers 和 price_factors 有种子数据

### 8.2 Schema 一致性

- [ ] `assessments.factors` JSONB 结构与 `PRICING_MATCHING.md PriceAssessment.factors` 完全对齐
- [ ] API Response 中 `communityId/unitId/tier/basePricePerSqm/adjustedPricePerSqm/totalRange/factors/confidence/generatedAt` 字段名与 `PriceAssessment` interface 一致（camelCase）
- [ ] `viewer_role` 参数在 API 和 Agent 契约中一致使用 `buyer|seller|agent`

### 8.3 三角色覆盖

- [ ] §4 矩阵覆盖买家/卖家/经纪人全部 10 个信息块
- [ ] 买家不可见：`sellerFloorPrice`、`commissionDetail`、`sellerListingAdvice`（已在 `hiddenFields` 中声明）
- [ ] 卖家不可见：`buyerMaxBudget`、`negotiationSuggestion`
- [ ] 经纪人可见：双侧区间 + 佣金预估（但不透传底价给对方）

### 8.4 原型评审第 6 条覆盖

- [ ] E7（置信度）+ E8（样本量）+ E9（D-tier 扩大按钮）直接响应「公正中立、在心理层面照顾各参与方」
- [ ] E10（roleView 数据隔离）响应「保全各参与方利益」
- [ ] E13（AgentAssistFab 动态 prompts）响应「Agent 原生实现交互」

### 8.5 Agent 契约

- [ ] `PriceEvalContext` 所有字段有 Pydantic 验证约束
- [ ] `PriceResult` 字段与 `PriceAssessmentResponse` 对齐（snake_case → camelCase 由适配层转换）
- [ ] 5 个 OpenClaw SSE 事件有名称 + Payload 定义

### 8.6 文档一致性

- [ ] `TECHNICAL_SOLUTION.md §4` 已同步本文档 API 契约
- [ ] `PM_TASK_PLAN.md §3` 已添加 D4-W1 FORI-043 行
- [ ] `PM_TASK_PLAN.md §5` 已预留 Agent attribution 表结构

---

## 附录 A：与现有文档的引用关系

| 本文档章节 | 依据文档 |
|-----------|---------|
| §1 背景 | `docs/execution/MVP_SLICE.md` Wave 1 |
| §2 数据模型 | `docs/PRD.md §3.5`、`docs/PRICING_MATCHING.md §2.4` |
| §3 API | `docs/PRICING_MATCHING.md §2.4 PriceAssessment`、`docs/execution/TECHNICAL_SOLUTION.md §4` |
| §4 三角色矩阵 | `docs/PRICING_MATCHING.md §3` |
| §5 UI 规格 | `docs/PRICING_MATCHING.md §2.2 D-tier`、原型 `prototype/app/price/[communityId]/page.tsx` |
| §6 Agent | `docs/PRICING_MATCHING.md §7`、`docs/SPEC.md §5.1 Agent 框架` |
| §7 原型规格 | `.ai/handoffs/Human/Fori平台原型评审意见.md 第6条` |

---

*FORI-043 Design · 2026-07-02 · Claude Code (epix)*
