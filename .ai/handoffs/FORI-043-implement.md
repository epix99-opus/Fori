# Handoff — FORI-043：定价 API 实现

> **状态**: ready  
> **目标 Agent**: Codex @ woot  
> **分支**: `codex/fori-043-pricing-api`  
> **预估配额**: ~90 min（Layer A）  
> **前置**: FORI-042（monorepo 脚手架）已完成  
> **设计依据**: `docs/execution/FORI-043_DESIGN.md`（主规格）、`docs/PRICING_MATCHING.md`（定性描述）

---

## 角色

你是 Fori 项目的**后端开发者**（Codex on woot）。任务类型：**实现（Execute）**。  
**禁止自验标 done** — Human/Hermes 将 `git diff` + curl 验证。

## 启动必读（按序）

1. `docs/execution/FORI-043_DESIGN.md` — **本次实现的完整规格，包含所有 API schema**
2. `docs/PRICING_MATCHING.md` — 定价机制背景（§2 分层、§3 三方视图、§4 状态机）
3. `docs/execution/TECHNICAL_SOLUTION.md` — 技术栈与目录约定
4. `apps/api/main.py` — 现有 FastAPI 入口
5. `prototype/app/price/[communityId]/page.tsx` — UI 参考（理解三角色视图逻辑）

---

## 任务清单

### 043-A — 定价估价 API

**文件**: `apps/api/routers/price.py`（新建）

实现三个端点：

```
GET /api/v1/price/evaluate        → 三角色差异化估价
GET /api/v1/price/communities/{id}/trend  → 24 月价格走势
POST /api/v1/price/reports        → 付费报告（Mock payment_ref 校验）
```

**关键约束**：
- `viewer_role` 参数必须决定 response 字段过滤（buyer 不能看到 seller_floor_price）
- 对应用户等级检查：`/evaluate` 需 L2，`/reports` 需 L3（暂用 Header 模拟）
- D 层级添加 `tier_warning: "数据样本量不足，置信度偏低"` 字段
- 偏离市价 >15% 时添加 `deviation_warning: true`

**Mock 数据**（硬编码 3 个小区即可）：

```python
MOCK_COMMUNITIES = {
    "community-001": {
        "name": "翠湖花园",
        "tier": "B",
        "base_price_sqm": 68000,
        "city": "深圳",
        "district": "南山"
    },
    "community-002": {
        "name": "万科金域",
        "tier": "A",
        "base_price_sqm": 95000,
        "city": "深圳",
        "district": "福田"
    },
    "community-003": {
        "name": "老城小区",
        "tier": "D",
        "base_price_sqm": 42000,
        "city": "深圳",
        "district": "罗湖"
    }
}
```

个体因子修正算法（直接在 Python 中实现，不调用外部 Agent）：

```python
FACTOR_WEIGHTS = {
    "floor": {"low": -0.05, "mid": 0, "high": 0.08},     # 低/中/高层
    "orientation_S": 0.025, "orientation_N": -0.03,
    "decoration_fine": 0.08, "decoration_luxury": 0.15,
    "decoration_rough": -0.10,
}
```

### 043-B — 撮合 API

**文件**: `apps/api/routers/match.py`（新建）

实现四个端点：

```
POST /api/v1/match/needs          → 买家发布需求（返回 need_id + status=need_published）
GET  /api/v1/match/needs/{id}     → 查询需求+匹配状态
POST /api/v1/match/{id}/respond   → 经纪人响应（验证 4h 截止时间）
PUT  /api/v1/match/{id}/status    → 状态推进（服务端强验证状态机）
```

**状态机规则**（必须后端强验证，非法转换返回 422）：

```python
VALID_TRANSITIONS = {
    "need_published": ["matched"],
    "matched": ["agent_responded", "reassigned"],
    "reassigned": ["matched"],
    "agent_responded": ["viewing_scheduled"],
    "viewing_scheduled": ["viewing_done"],
    "viewing_done": ["negotiating"],
    "negotiating": ["agreed", "failed"],
    "agreed": ["contracting"],
    "contracting": ["completed"],
}
```

`completed` 状态触发结算快照（参见 `FORI-043_DESIGN.md` §3.4），写入 `settlement_snapshots` 内存存储即可（Wave 1 无数据库）。

### 043-C — 共享类型

**文件**: `packages/shared/src/types/pricing.ts`（新建）  
**文件**: `packages/shared/src/types/matching.ts`（新建）

完整复制 `FORI-043_DESIGN.md` §4 中的 TypeScript interface 定义，`tsc --noEmit` 无错误。

### 043-D — 路由注册

**文件**: `apps/api/main.py`

在现有 `/health` 路由之后注册：
```python
from routers import price, match
app.include_router(price.router)
app.include_router(match.router)
```

### 043-E — 冒烟测试脚本

**文件**: `apps/api/tests/test_pricing_smoke.py`

```python
# 最小化冒烟：3 个角色 × 3 个小区 = 9 个场景
# 验证字段过滤（buyer 不含 commission_detail）
# 验证状态机非法转换返回 422
```

使用 `pytest` + `httpx.AsyncClient`（已有依赖则用，否则添加到 requirements.txt）。

---

## 禁止

- 不修改 `prototype/` 任何文件
- 不修改 `docs/` 设计文档
- 不合并 main
- 不调用真实支付接口（`payment_ref !== null` 即验证通过）
- 不引入数据库（Wave 1 全用内存 dict）

---

## 验收清单

```bash
cd apps/api && uvicorn main:app --port 8000 --reload &

# 043-A: 三角色差异化
curl "localhost:8000/api/v1/price/evaluate?community_id=community-001&area_sqm=88&viewer_role=buyer&floor=12&decoration=fine" \
  -H "X-Auth-Level: 2" -H "X-User-Role: buyer" | jq .display.fair_range
# 期望: {"low": ..., "mid": ..., "high": ...}

curl "localhost:8000/api/v1/price/evaluate?community_id=community-001&area_sqm=88&viewer_role=seller" \
  -H "X-Auth-Level: 2" -H "X-User-Role: seller" | jq .display.list_suggestion
# 期望: {"low": ..., "high": ...}

curl "localhost:8000/api/v1/price/evaluate?community_id=community-001&area_sqm=88&viewer_role=agent" \
  -H "X-Auth-Level: 2" -H "X-User-Role: agent" | jq .display.full_factors | length
# 期望: >= 3

# 043-B: 状态机保护
curl -X POST "localhost:8000/api/v1/match/needs" \
  -H "Content-Type: application/json" -H "X-Auth-Level: 2" \
  -d '{"buyer_id":"user-001","community_ids":["community-001"],"budget_range":{"min":2500000,"max":3500000}}' | jq .status
# 期望: "need_published"

# D 层级警示
curl "localhost:8000/api/v1/price/evaluate?community_id=community-003&area_sqm=60&viewer_role=buyer" \
  -H "X-Auth-Level: 2" | jq .tier_warning
# 期望: non-null string

# pytest
cd apps/api && python -m pytest tests/test_pricing_smoke.py -v
# 期望: all PASS

# TypeScript 类型检查
cd packages/shared && npx tsc --noEmit
# 期望: 0 errors
```

---

## Git / Worktree

```bash
cd /Users/woot/Dev/Fori
git fetch origin
git worktree add ../Fori-fori-043 -B codex/fori-043-pricing-api origin/main
cd ../Fori-fori-043

# 实现后
git add apps/api/routers/price.py \
        apps/api/routers/match.py \
        apps/api/main.py \
        apps/api/tests/test_pricing_smoke.py \
        packages/shared/src/types/pricing.ts \
        packages/shared/src/types/matching.ts
git commit -m "feat: D4 Wave1 pricing and matching API [codex]"
```

### 429 续跑

若 Layer A 耗尽，commit 当前断点：
```bash
git add -A && git commit -m "wip: FORI-043 partial [codex]"
```
续跑时从最后成功的子任务（043-A/B/C/D/E）继续。

---

## 派发命令（Cursor 门控后执行）

```bash
.ai/orchestration/scripts/quota-check.sh codex || exit 1
ssh woot 'cd /Users/woot/Dev/Fori && git fetch && \
  git worktree add ../Fori-fori-043 -B codex/fori-043-pricing-api origin/main 2>/dev/null || true && \
  cd ../Fori-fori-043 && codex exec "$(cat .ai/handoffs/FORI-043-implement.md)" --model gpt-5.5 --yolo < /dev/null 2>&1'
```

---

*Handoff · FORI-043 · D4 Wave 1 · Claude Code @ epix · 2026-07-02*
