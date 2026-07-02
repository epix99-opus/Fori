# Fori 生产仓库目录结构

> **任务**: FORI-041 产出  
> **版本**: v1.0 · 2026-07-02  
> **决策依据**: ADR-009 (`docs/adr/ADR-009-prototype-to-production-migration.md`)  
> **执行任务**: FORI-042（Codex 实现此结构）  
>
> 本文件为机器可读目录树，是 FORI-042 Codex 任务的脚手架规范。  
> 标注 `[占位]` 的目录/文件由 FORI-042 创建空结构；标注 `[Wave N]` 的由对应 Wave 任务填充。

---

## 目录树

```
Fori/                                       # Monorepo 根（FORI-042 添加根 package.json）
│
├── apps/
│   ├── web/                                # Next.js 14 生产前端（自 prototype/ 迁移）
│   │   ├── app/                            # Next.js App Router
│   │   │   ├── layout.tsx                  # 根布局 + PWA 元数据 [Wave 0]
│   │   │   ├── page.tsx                    # 根页 → redirect /home [Wave 0]
│   │   │   ├── globals.css                 # Tailwind 4.x 全局样式 [Wave 0]
│   │   │   │
│   │   │   ├── home/
│   │   │   │   └── page.tsx                # 首页信息流 [Wave 0]
│   │   │   ├── search/
│   │   │   │   └── page.tsx                # 全局房源搜索 [Wave 0]
│   │   │   ├── messages/                   # M2 匹配闭环配套 [Wave 3]
│   │   │   │   └── page.tsx                # 消息中心
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx            # 登录页 [Wave 0]
│   │   │   │   └── kyc/
│   │   │   │       └── page.tsx            # KYC 实名认证 [Wave 4]
│   │   │   │
│   │   │   ├── price/                      # M5 在地分层定价 [Wave 1 ⭐]
│   │   │   │   ├── page.tsx                # 价格评估入口
│   │   │   │   └── [communityId]/
│   │   │   │       └── page.tsx            # 小区价格图谱详情
│   │   │   │
│   │   │   ├── explore/                    # M1 楼盘字典探索 [Wave 2]
│   │   │   │   ├── dict/
│   │   │   │   │   ├── page.tsx            # 字典浏览列表
│   │   │   │   │   └── [communityId]/
│   │   │   │   │       ├── page.tsx        # 小区详情
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx    # 协同编辑
│   │   │   │   ├── map/
│   │   │   │   │   └── page.tsx            # 片区地图浏览
│   │   │   │   └── search/
│   │   │   │       └── page.tsx            # 字典内搜索
│   │   │   │
│   │   │   ├── listing/                    # M2 房源详情 [Wave 3]
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── publish/                    # M2 发布房源/客源 [Wave 3]
│   │   │   │   ├── listing/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── buyer-need/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── match/
│   │   │   │   └── page.tsx                # M2 匹配推荐列表 [Wave 3]
│   │   │   │
│   │   │   ├── transaction/                # M3 交易详情（进行中）[Wave 4]
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── profile/                    # 个人中心
│   │   │   │   ├── page.tsx                # 入口 [Wave 0]
│   │   │   │   ├── me/
│   │   │   │   │   └── page.tsx            # 我的资料 [Wave 0]
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx            # 设置 [Wave 0]
│   │   │   │   ├── credit/
│   │   │   │   │   └── page.tsx            # M3 信用档案 [Wave 4]
│   │   │   │   ├── agent-cert/
│   │   │   │   │   └── page.tsx            # M3 经纪人认证状态 [Wave 4]
│   │   │   │   └── transactions/
│   │   │   │       ├── page.tsx            # M3 历史交易列表 [Wave 4]
│   │   │   │       └── [txId]/
│   │   │   │           ├── page.tsx        # 交易详情 [Wave 4]
│   │   │   │           └── evidence/
│   │   │   │               └── page.tsx    # 证据链 [Wave 4]
│   │   │   │
│   │   │   └── workspace/                  # 工作台
│   │   │       ├── agent/                  # M2 经纪人工作台 [Wave 3]
│   │   │       │   ├── page.tsx
│   │   │       │   ├── listings/
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── buyers/
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── matches/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── stats/
│   │   │       │       └── page.tsx
│   │   │       ├── store/
│   │   │       │   └── page.tsx            # M2 门店工作台 [Wave 3]
│   │   │       └── media/                  # M4 素材营销工作台 [Wave 5]
│   │   │           ├── generate/
│   │   │           │   └── page.tsx        # 素材生成（合并自 prototype/marketing/generate）
│   │   │           └── manage/
│   │   │               └── page.tsx        # 素材管理（合并自 prototype/marketing/manage）
│   │   │
│   │   ├── components/                     # 应用级组件（非 UI 原语）
│   │   │   └── PwaRuntime.tsx              # PWA 生命周期管理（自 prototype/components 迁移）
│   │   │
│   │   ├── lib/
│   │   │   ├── api/                        # API 客户端（Wave 1 起替换 Mock）[占位]
│   │   │   │   └── index.ts
│   │   │   └── mock/                       # 开发期 Mock 数据层（自 prototype/lib/mock 迁移）
│   │   │       └── [自 prototype/lib/mock 迁移]
│   │   │
│   │   ├── public/                         # PWA 资产（自 prototype/public 迁移）
│   │   │   ├── manifest.json
│   │   │   ├── sw.js
│   │   │   ├── icon-192.svg
│   │   │   └── icon-512.svg
│   │   │
│   │   ├── next.config.mjs                 # 含 marketing → workspace/media 的 301 重定向
│   │   ├── tailwind.config.ts              # Tailwind 4.x 配置
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json                   # 含 @fori/ui、@fori/shared 路径别名
│   │   ├── components.json                 # shadcn/ui 配置
│   │   └── package.json
│   │
│   └── api/                                # FastAPI 主 API [Wave 1 起实质填充]
│       ├── main.py                         # FastAPI app 入口 [占位]
│       ├── routers/                        # 路由模块 [占位]
│       │   └── __init__.py
│       ├── kernel/                         # 平台内核层（ARCHITECTURE.md §4.2）[占位]
│       │   ├── __init__.py
│       │   ├── cache.py
│       │   ├── lock.py
│       │   ├── notary.py
│       │   └── scheduler.py
│       ├── adapters/                       # 框架适配层（ARCHITECTURE.md §4.1）[占位]
│       │   ├── __init__.py
│       │   ├── interface.py                # AgentInterface ABC
│       │   ├── openclaw.py                 # OpenClawAgentAdapter
│       │   └── hermes.py                   # HermesAgentAdapter
│       ├── schemas/                        # Pydantic 模型 [占位]
│       │   └── __init__.py
│       ├── db/                             # SQLAlchemy models + Alembic [占位]
│       │   ├── __init__.py
│       │   ├── models/
│       │   └── migrations/
│       ├── openapi.json                    # CI 导出，供 packages/shared 类型生成
│       ├── requirements.txt
│       └── pyproject.toml                  # ruff + mypy + black 配置
│
├── packages/
│   ├── shared/                             # 跨应用共享类型/工具
│   │   ├── src/
│   │   │   ├── types/                      # TypeScript DTO 类型 [Wave 1 起填充]
│   │   │   │   └── index.ts
│   │   │   ├── constants/                  # 枚举、常量
│   │   │   │   └── index.ts
│   │   │   ├── api/                        # openapi-typescript 生成的 API 类型 [Wave 1]
│   │   │   │   └── .gitkeep
│   │   │   ├── utils.ts                    # 自 prototype/lib/utils.ts 迁移（cn 等）
│   │   │   └── index.ts                    # 统一导出
│   │   ├── tsconfig.json
│   │   └── package.json                    # name: @fori/shared
│   │
│   └── ui/                                 # 共享 UI 组件库（自 prototype/components 抽取）
│       ├── src/
│       │   ├── BottomSheet.tsx
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── ChartCard.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorState.tsx
│       │   ├── Input.tsx
│       │   ├── Skeleton.tsx
│       │   ├── Stepper.tsx
│       │   ├── TabBar.tsx
│       │   ├── Toast.tsx
│       │   ├── ui/                         # shadcn/ui 基础件（自 prototype/components/ui/）
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── input.tsx
│       │   │   ├── label.tsx
│       │   │   ├── skeleton.tsx
│       │   │   ├── tabs.tsx
│       │   │   └── toast.tsx
│       │   └── index.ts                    # 统一导出全部组件
│       ├── tsconfig.json
│       └── package.json                    # name: @fori/ui
│
├── services/
│   ├── agents/                             # 六大业务 Agent（Python 包）
│   │   ├── property-dict/                  # M1 楼盘字典共建 (PropertyDictAgent) [占位]
│   │   │   └── README.md                   # 接口契约占位 → FORI-051 填充
│   │   ├── listing-match/                  # M2 房源客源匹配 (ListingMatchAgent) [占位]
│   │   │   └── README.md                   # 接口契约占位 → FORI-061 填充
│   │   ├── credit-notary/                  # M3 信用认证公证 (CreditNotaryAgent) [占位]
│   │   │   └── README.md                   # 接口契约占位 → FORI-071 填充
│   │   ├── trade-settlement/               # M3 合规交易结算 (TradeSettlementAgent) [占位]
│   │   │   └── README.md                   # 接口契约占位 → FORI-071 填充
│   │   ├── media-gen/                      # M4 素材生成分发 (MediaGenAgent) [占位]
│   │   │   └── README.md                   # 接口契约占位 → FORI-080 填充
│   │   └── price-eval/                     # M5 在地分层定价 (PriceEvalAgent) [占位]
│   │       └── README.md                   # 接口契约占位 → FORI-044 填充
│   │
│   └── workers/                            # Kafka 消费者 + Celery 异步任务 [占位]
│       └── README.md
│
├── docs/
│   ├── adr/                                # 架构决策记录（ADR-009 起独立成文）
│   │   └── ADR-009-prototype-to-production-migration.md
│   ├── execution/
│   │   ├── MVP_SLICE.md                    # Wave 切片排期（FORI-040 产出）
│   │   └── REPO_LAYOUT.md                  # 本文件
│   ├── reviews/
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   ├── SPEC.md
│   ├── UI_DESIGN.md
│   ├── MIGRATION-TAILWIND4.md
│   └── TASK_BREAKDOWN.md
│
├── tests/
│   ├── e2e/                                # Playwright E2E 测试 [Wave 1 起]
│   │   └── .gitkeep
│   └── integration/                        # pytest 集成测试 [Wave 1 起]
│       └── .gitkeep
│
├── prototype/                              # 冻结（FORI-042 后不接受新功能）
│   └── [frozen — 见 ADR-009 §7]           # Wave 1 验证后归档至 archive/prototype-v0/
│
├── archive/                                # 归档目录（Wave 1 后创建）[占位]
│
├── .ai/                                    # Agent 编排配置（不改动）
│   ├── manifest.json
│   ├── handoffs/
│   ├── orchestration/
│   └── prompts/
│
├── .claude/
│   └── settings.json
│
├── CLAUDE.md
├── AGENTS.md
└── package.json                            # Monorepo 根（FORI-042 创建，pnpm workspaces）
```

---

## 关键路径别名约定

FORI-042 需在各 `tsconfig.json` 和根 `package.json` 中配置：

| 别名 | 解析目标 | 用途 |
|------|---------|------|
| `@fori/ui` | `packages/ui/src` | UI 原语组件 |
| `@fori/shared` | `packages/shared/src` | 类型、工具、常量 |
| `@/` | `apps/web/` | Next.js 应用内部相对引用 |

---

## Monorepo 工具链约定

| 工具 | 版本 | 配置文件 |
|------|------|---------|
| pnpm workspaces | latest | `package.json` + `pnpm-workspace.yaml` |
| Turborepo | latest | `turbo.json`（FORI-042 创建） |
| TypeScript | 5.x | 各包 `tsconfig.json` 继承根 `tsconfig.base.json` |
| Changesets | latest | `.changeset/`（发布管理，Wave 5 后启用）|

---

## Mock 数据层淘汰计划

`apps/web/lib/mock/` 在各 Wave 完成时逐步废弃：

| Wave | 废弃 Mock 范围 | 替换为 |
|------|--------------|--------|
| Wave 1 | `mock/price.ts` | FastAPI `/api/v1/price/` |
| Wave 2 | `mock/properties.ts` | FastAPI `/api/v1/properties/` |
| Wave 3 | `mock/listings.ts`, `mock/matches.ts` | FastAPI `/api/v1/listings/`, `/api/v1/matches/` |
| Wave 4 | `mock/transactions.ts`, `mock/credit.ts` | FastAPI `/api/v1/transactions/`, `/api/v1/credit/` |
| Wave 5 | `mock/materials.ts` | FastAPI `/api/v1/materials/` |

---

*本文件由 FORI-041 (Claude Code) 产出，FORI-042 (Codex) 据此创建目录结构。*  
*变更须经 Cursor Gate 并更新 manifest.json。*
