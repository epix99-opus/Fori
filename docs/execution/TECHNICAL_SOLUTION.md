# Fori 技术方案（执行摘要）

> **版本**: 1.1 · 2026-07-02（FORI-043 设计后更新）  
> **受众**: 开发、编排、Human 审阅  
> **详细架构**: 见 [ADR-009](../adr/ADR-009-prototype-to-production-migration.md)（不重复全文）  
> **Wave 1 完整 API 规格**: 见 [`FORI-043_DESIGN.md`](./FORI-043_DESIGN.md)

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

> **完整规格**见 [`FORI-043_DESIGN.md`](./FORI-043_DESIGN.md)（本节为摘要）

### 4.1 端点清单

| 方法 | 路径 | 认证级 | 说明 |
|------|------|--------|------|
| GET | `/api/v1/price/evaluate` | L2 | 三角色差异化估价（核心） |
| GET | `/api/v1/price/communities/{id}/trend` | L1 | 24 月走势 |
| POST | `/api/v1/price/reports` | L3+付费 | 完整因子报告 ¥29 |
| POST | `/api/v1/match/needs` | L2 | 买家发布需求 |
| POST | `/api/v1/match/{id}/respond` | L2+经纪人 | 4h 窗口响应 |
| PUT | `/api/v1/match/{id}/status` | L2 | 状态机推进 |

### 4.2 三角色信息隔离原则（评审修订 R-1）

- `viewer_role=buyer`：显示公允区间 + 议价建议；**隐藏**卖家底价、佣金明细
- `viewer_role=seller`：显示挂牌建议 + 净收益预估；**隐藏**买家最高预算
- `viewer_role=agent`：完整因子 + 双方区间 + 佣金预估（需 `user.role=agent` 验证）
- 信息隔离在 API 层实现，不依赖前端过滤

### 4.3 付费墙（评审修订 R-2）

- L1（手机验证）：片区均价 + 层级 + 趋势线（免费）
- L2（实名）：基础估价区间（免费）
- L3（付费 ¥29/报告）：完整因子 + PDF + 历史对比

Wave 1 Mock：`payment_ref !== null` 即验证通过；Wave 2+ 接真实支付网关。

### 4.4 成交结算快照（评审修订 R-3）

`completed` 状态触发 `settlement_snapshot`，分成比例：

| 分配方 | 比例 | 说明 |
|--------|------|------|
| 平台 | 0.3% | 平台服务费 |
| 一线经纪人 | 0.9% | 全程服务 |
| 楼盘首建者 | 0.15% | 字典贡献 |
| 协作维护者 | 0.075% | 均摊 |
| 推荐人 | 0.075% | 裂变激励 |
| **总计** | **1.5%** | 买方支付 |

### 4.5 Agent 契约

`services/agents/price-eval/` 实现 `PriceEvalAgent.evaluate(context) → PriceResult`；OpenClaw adapter 见 `apps/api/adapters/openclaw.py`。完整契约见 `docs/AGENT_PAGE_CONTRACTS.md`。

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
