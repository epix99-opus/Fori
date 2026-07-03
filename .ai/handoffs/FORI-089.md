# Handoff — FORI-089

> **状态**: ready  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-089-pricing-matching`  
> **预估配额**: ~35 msg  
> **前置**: 可与 FORI-080 并行

---

## 角色

Fori **定价/撮合设计专家**（Claude Code）。任务类型：**设计**。

## 输入

- 评审项 6 全文
- 初始需求模块五全文、模块二 §2.3
- `docs/reviews/REVIEW-UX-USER-PERSPECTIVE.md` UX-01/02/06
- `prototype/app/price/[communityId]/page.tsx`

## 任务

**任务 ID**: FORI-089  
**标题**: 定价评估与撮合机制完整方案

### 目标

产出 `docs/PRICING_MATCHING.md`：
1. 在地分层定价：输入/输出、A/B/C/D 层级、三方差异化输出（买家出价区间、卖家净收益、经纪人议价锚点）
2. 撮合机制：意向草稿、4h 响应、经纪人创建交易、状态机
3. 公正中立原则：样本可信度、D 层级警示、税费/总成本
4. Agent 契约摘要：PriceEvalAgent + MatchAgent

### 验收标准

- [ ] 买家/卖家/经纪人各 ≥5 条专属输出字段
- [ ] 撮合状态机 ≥8 状态
- [ ] 链接 FORI-043~046 实施切片
- [ ] commit：`docs: pricing and matching mechanism design [claude]`

### 后续

FORI-090/091 原型增强；FORI-043 API 以本文档为契约来源。
