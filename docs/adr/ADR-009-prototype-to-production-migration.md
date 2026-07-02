# ADR-009: Prototype → Production 一次性迁移策略

| 字段 | 内容 |
|------|------|
| **编号** | ADR-009 |
| **标题** | Prototype → Production 一次性迁移策略 |
| **状态** | 已采纳 (Accepted) |
| **日期** | 2026-07-02 |
| **负责人** | Claude Code (Expert · 架构/深审) |
| **任务** | FORI-041 |
| **依据** | `docs/execution/MVP_SLICE.md`、`docs/SPEC.md §5.1`、`docs/ARCHITECTURE.md` |

> **编号说明**：ARCHITECTURE.md §12 已存在 ADR-001～ADR-008（技术栈与基础设施决策）。本文件作为第一个独立 ADR 文档，编号 ADR-009，ADR-001～ADR-008 的内联摘要保留在 ARCHITECTURE.md §12，后续重要决策将同步补充独立文件至 `docs/adr/`。

---

## 1. Context（背景）

### 1.1 现状

`prototype/` 目录包含一个**可构建的交互原型**，技术栈为：

- Next.js 14 (App Router)
- Tailwind CSS **3.x**（SPEC §5.1 允许原型临时使用）
- shadcn/ui + lucide-react + ECharts
- Mock 数据层（`lib/mock/`），无后端对接

原型共包含 **36 条路由**（见 §3 路由映射表），覆盖六大业务模块的全量 UI 交互流程；12 个 UI 原语组件位于 `prototype/components/`。

### 1.2 问题

1. **双维护风险**：若 `prototype/` 与 `apps/web` 长期并存，UI 改动、组件 API 变更须同步到两处，产生线性增长的维护成本。
2. **技术债务**：原型使用 Tailwind CSS 3.x，生产要求 4.x（SPEC §5.1）。并存越久，升级变更量越大。
3. **Mock 污染**：`lib/mock/` 会在开发期无意识被新路由引用，拖延真实 API 接线时间。
4. **测试断点**：原型无 E2E 测试。生产路由需从第一天起接受 Playwright 覆盖，越早切换覆盖范围越大。

### 1.3 约束

- SPEC §5.1 已锁定技术栈，不得降级或替换
- 禁止 MVP 范围缩减（六大模块全量保留）
- 禁止"TBD/待定/暂不考虑"
- FORI-042（Monorepo 初始化）为本决策的执行任务

---

## 2. 决策选项对比

### Option A · 一次性迁移（本次采纳）

将 `prototype/` 全量迁移到 `apps/web`，同步完成 Tailwind 3→4 升级，迁移完成后立即冻结并归档原型。

| 维度 | 评估 |
|------|------|
| 维护成本 | 最低：单一代码库，无双写 |
| 迁移风险 | 中：Tailwind 4.x 升级需逐页验证，但 `docs/MIGRATION-TAILWIND4.md` 已有映射 |
| 执行配额 | Codex ~60 min（FORI-042）|
| 完成后收益 | E2E 覆盖从 Wave 1 起连续积累 |

### Option B · 增量并行迁移

保留 `prototype/`，按路由逐个迁移到 `apps/web`，新功能直接写入生产。

| 维度 | 评估 |
|------|------|
| 维护成本 | 高：双库状态需同步跟踪，过渡期存在两套路由 |
| 迁移风险 | 低：每次只改一个路由，失败代价小 |
| 执行配额 | 需要多次 Codex 调用（每波次单独处理） |
| 完成后收益 | 分散、延迟 |

**不选原因**：双维护成本高，过渡期 E2E 无法覆盖完整路径，违反"prototype 可迁移"原则（MVP_SLICE.md §2）。

### Option C · 全部重写

忽略原型，在 `apps/web` 从零实现全量 UI。

| 维度 | 评估 |
|------|------|
| 维护成本 | 无双写，但一次性成本最高 |
| 迁移风险 | 高：已验证的 UI 流程（经 FORI-031 原型评审通过）需重新设计 |
| 执行配额 | Codex ~200+ min |

**不选原因**：原型已通过设计评审，交互逻辑经过用户路径验证。重写浪费已有投入，且引入设计回退风险。

---

## 3. 决策（Option A：一次性迁移）

**在 FORI-042 中，由 Codex 一次性完成以下操作：**

1. 搭建 Monorepo 骨架（`apps/web`、`apps/api`、`packages/ui`、`packages/shared`、`services/agents`）
2. 将 `prototype/app/**` → `apps/web/app/**`（路径保持一致，减少链接失效）
3. 将 `prototype/components/**` → `packages/ui/src/**`（提取 UI 原语）
4. 升级 Tailwind CSS 3.x → 4.x（参照 `docs/MIGRATION-TAILWIND4.md`）
5. 将 `prototype/lib/utils.ts` → `packages/shared/src/utils.ts`
6. 将 `prototype/lib/mock/**` → `apps/web/lib/mock/**`（开发期暂留，Wave N 逐步替换为真实 API）
7. 迁移 PWA 资产（`public/`、`manifest.json`、`sw.js`）
8. 冻结 `prototype/`（停止新功能提交）

---

## 4. 路由映射表

> 约定：`prototype/app/X` → `apps/web/app/X`（路径 1:1 保留，除注明 Merge 项）

### 4.1 基础框架路由（Wave 0）

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/layout.tsx` | `app/layout.tsx` | 根布局 + PWA 元数据；`PwaRuntime` 移至 `apps/web/components/` |
| `app/globals.css` | `app/globals.css` | Tailwind 4.x 重写 |
| `app/page.tsx` | `app/page.tsx` | 根页 → redirect `/home` |
| `app/home/page.tsx` | `app/home/page.tsx` | 首页信息流 |
| `app/search/page.tsx` | `app/search/page.tsx` | 全局房源搜索 |
| `app/messages/page.tsx` | `app/messages/page.tsx` | 消息中心 |
| `app/auth/login/page.tsx` | `app/auth/login/page.tsx` | 登录页 |
| `app/profile/page.tsx` | `app/profile/page.tsx` | 个人中心入口 |
| `app/profile/me/page.tsx` | `app/profile/me/page.tsx` | 我的资料 |
| `app/profile/settings/page.tsx` | `app/profile/settings/page.tsx` | 设置 |

### 4.2 Wave 1 — 在地分层定价（M5）⭐ 首切片

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/price/page.tsx` | `app/price/page.tsx` | 价格评估入口 |
| `app/price/[communityId]/page.tsx` | `app/price/[communityId]/page.tsx` | 小区价格图谱详情 |

### 4.3 Wave 2 — 楼盘字典（M1）

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/explore/dict/page.tsx` | `app/explore/dict/page.tsx` | 字典浏览列表 |
| `app/explore/dict/[communityId]/page.tsx` | `app/explore/dict/[communityId]/page.tsx` | 小区详情 |
| `app/explore/dict/[communityId]/edit/page.tsx` | `app/explore/dict/[communityId]/edit/page.tsx` | 小区编辑（协同） |
| `app/explore/map/page.tsx` | `app/explore/map/page.tsx` | 地图片区浏览 |
| `app/explore/search/page.tsx` | `app/explore/search/page.tsx` | 字典内搜索 |

### 4.4 Wave 3 — 匹配闭环（M2）

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/listing/[id]/page.tsx` | `app/listing/[id]/page.tsx` | 房源详情 |
| `app/publish/listing/page.tsx` | `app/publish/listing/page.tsx` | 发布房源 |
| `app/publish/buyer-need/page.tsx` | `app/publish/buyer-need/page.tsx` | 发布客源 |
| `app/match/page.tsx` | `app/match/page.tsx` | 匹配推荐列表 |
| `app/workspace/agent/page.tsx` | `app/workspace/agent/page.tsx` | 经纪人工作台首页 |
| `app/workspace/agent/listings/page.tsx` | `app/workspace/agent/listings/page.tsx` | 我的房源 |
| `app/workspace/agent/buyers/page.tsx` | `app/workspace/agent/buyers/page.tsx` | 我的客源 |
| `app/workspace/agent/matches/page.tsx` | `app/workspace/agent/matches/page.tsx` | 匹配推送记录 |
| `app/workspace/agent/stats/page.tsx` | `app/workspace/agent/stats/page.tsx` | 业绩统计 |
| `app/workspace/store/page.tsx` | `app/workspace/store/page.tsx` | 门店工作台 |

### 4.5 Wave 4 — 信用与公证（M3）

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/auth/kyc/page.tsx` | `app/auth/kyc/page.tsx` | KYC 实名认证 |
| `app/transaction/[id]/page.tsx` | `app/transaction/[id]/page.tsx` | 交易详情（进行中） |
| `app/profile/credit/page.tsx` | `app/profile/credit/page.tsx` | 信用档案展示 |
| `app/profile/agent-cert/page.tsx` | `app/profile/agent-cert/page.tsx` | 经纪人认证状态 |
| `app/profile/transactions/page.tsx` | `app/profile/transactions/page.tsx` | 历史交易列表 |
| `app/profile/transactions/[txId]/page.tsx` | `app/profile/transactions/[txId]/page.tsx` | 历史交易详情 |
| `app/profile/transactions/[txId]/evidence/page.tsx` | `app/profile/transactions/[txId]/evidence/page.tsx` | 证据链浏览 |

### 4.6 Wave 5 — 素材营销（M4）【含合并】

| 原型路径 | 生产路径（apps/web/app/） | 说明 |
|---------|--------------------------|------|
| `app/workspace/media/generate/page.tsx` | `app/workspace/media/generate/page.tsx` | 素材生成（正式路径） |
| `app/workspace/media/manage/page.tsx` | `app/workspace/media/manage/page.tsx` | 素材管理（正式路径） |
| `app/marketing/generate/page.tsx` | **Merge →** `app/workspace/media/generate/page.tsx` | 与 workspace/media/generate 合并，原路径废弃 |
| `app/marketing/manage/page.tsx` | **Merge →** `app/workspace/media/manage/page.tsx` | 与 workspace/media/manage 合并，原路径废弃 |

**合并原因**：`marketing/` 和 `workspace/media/` 存在功能重叠；`workspace/` 是经纪人工作台的统一入口，`marketing/` 独立路径割裂导航一致性。生产版统一归入 `workspace/media/`，`marketing/` 路径添加 301 重定向（由 `next.config.mjs` redirects 实现）。

---

## 5. 组件抽取策略（prototype/components → packages/ui）

### 5.1 UI 原语组件（全量移入 packages/ui/src）

| 原型文件 | 目标路径 | 类型 |
|---------|---------|------|
| `components/Button.tsx` | `packages/ui/src/Button.tsx` | 基础按钮 |
| `components/Card.tsx` | `packages/ui/src/Card.tsx` | 卡片容器 |
| `components/Input.tsx` | `packages/ui/src/Input.tsx` | 输入框 |
| `components/BottomSheet.tsx` | `packages/ui/src/BottomSheet.tsx` | 底部抽屉 |
| `components/ChartCard.tsx` | `packages/ui/src/ChartCard.tsx` | ECharts 卡片封装 |
| `components/EmptyState.tsx` | `packages/ui/src/EmptyState.tsx` | 空状态 |
| `components/ErrorState.tsx` | `packages/ui/src/ErrorState.tsx` | 错误状态 |
| `components/Skeleton.tsx` | `packages/ui/src/Skeleton.tsx` | 骨架屏 |
| `components/Stepper.tsx` | `packages/ui/src/Stepper.tsx` | 步骤条 |
| `components/TabBar.tsx` | `packages/ui/src/TabBar.tsx` | 底部导航栏 |
| `components/Toast.tsx` | `packages/ui/src/Toast.tsx` | 轻提示 |

### 5.2 应用级组件（保留在 apps/web/components）

| 原型文件 | 目标路径 | 理由 |
|---------|---------|------|
| `components/PwaRuntime.tsx` | `apps/web/components/PwaRuntime.tsx` | 依赖 SW 注册、推送权限等 PWA 生命周期 API，非通用 UI 原语 |

### 5.3 共享工具与类型（prototype/lib → packages/shared）

| 原型路径 | 目标路径 | 说明 |
|---------|---------|------|
| `lib/utils.ts` | `packages/shared/src/utils.ts` | `cn()` 等通用工具函数 |
| `lib/mock/**` | `apps/web/lib/mock/**` | Mock 数据层，仅在开发期保留；Wave N 对应路由接线真实 API 后逐文件删除 |

### 5.4 包导出约定

```typescript
// packages/ui/src/index.ts — 统一导出
export { Button } from './Button'
export { Card } from './Card'
// ...

// packages/shared/src/index.ts
export { cn } from './utils'
export type { ApiResponse } from './types'
```

`apps/web` 中所有组件引用路径从 `@/components/Xxx` 变更为 `@fori/ui` 或 `@fori/shared`（monorepo 内部包名由 FORI-042 在 `package.json` 中定义）。

---

## 6. Tailwind 3.x → 4.x 升级策略

迁移过程中**强制**将 Tailwind 升级到 4.x，不得保留 3.x 配置。

| 变更点 | 原型（3.x） | 生产（4.x） | 参考 |
|--------|------------|------------|------|
| 配置文件 | `tailwind.config.ts` | `tailwind.config.ts`（新语法） | `docs/MIGRATION-TAILWIND4.md` |
| CSS 变量 | 手动定义 | `@theme` 指令 | 同上 |
| 自定义颜色 | `extend.colors` | `--color-*` CSS 变量 | 同上 |
| PostCSS | `postcss.config.mjs` | 同，但插件版本更新 | 同上 |

升级验证：FORI-042 的验收标准包含 `next build` 无 CSS 警告/错误。

---

## 7. Prototype 冻结时间点与归档策略

### 7.1 冻结时间点

**触发条件**：FORI-042 通过 L1 验收（`apps/web next build` 成功且 CI 绿灯）

**冻结行为**：
- 在 `prototype/README.md` 顶部追加 `> ⚠️ FROZEN: 自 FORI-042 完成后停止开发。新功能请在 apps/web 中实现。`
- `prototype/` 不再接受功能性 PR（仅允许紧急安全修补）
- 所有新 Codex 任务的工作目录切换到 `apps/web/`

### 7.2 归档时间点

**触发条件**：Wave 1 完成（FORI-046 Hermes 验证 PASS）——即 `apps/web /price` 路由通过全栈联调，真实 FastAPI 数据可渲染

**归档操作**：
```bash
# 由 Cursor/Human 执行
git mv prototype archive/prototype-v0
git commit -m "chore: archive prototype, apps/web is canonical [human]"
```

归档后 `archive/prototype-v0/` 只读保留，作为 UI 设计历史参考。

---

## 8. 六大业务 Agent 在 services/agents/ 的占位说明

每个 Agent 目录在 FORI-042 中创建占位结构，不含实现代码，仅含 README 接口契约（由对应设计任务填充）：

```
services/agents/
├── property-dict/          # M1 楼盘字典共建 Agent (PropertyDictAgent)
│   └── README.md           # 任务契约占位 → FORI-051 实现
├── listing-match/          # M2 房源客源匹配 Agent (ListingMatchAgent)
│   └── README.md           # 任务契约占位 → FORI-061 实现
├── credit-notary/          # M3 信用认证公证 Agent (CreditNotaryAgent)
│   └── README.md           # 任务契约占位 → FORI-071 实现
├── trade-settlement/       # M3 合规交易结算 Agent (TradeSettlementAgent)
│   └── README.md           # 任务契约占位 → FORI-071 实现
├── media-gen/              # M4 素材生成分发 Agent (MediaGenAgent)
│   └── README.md           # 任务契约占位 → FORI-080 实现
└── price-eval/             # M5 在地分层定价 Agent (PriceEvalAgent)
    └── README.md           # 任务契约占位 → FORI-044 实现
```

**设计→执行链路**：

| Agent | 设计任务 | 执行任务 | Wave |
|-------|---------|---------|------|
| PriceEvalAgent | FORI-044（Claude） | FORI-043（Codex） | Wave 1 |
| PropertyDictAgent | FORI-051（Claude） | FORI-051（Codex） | Wave 2 |
| ListingMatchAgent | FORI-061（Claude） | FORI-061（Codex） | Wave 3 |
| CreditNotaryAgent | FORI-071（Claude） | FORI-072（Codex） | Wave 4 |
| TradeSettlementAgent | FORI-071（Claude） | FORI-072（Codex） | Wave 4 |
| MediaGenAgent | FORI-080（Claude+Codex） | FORI-081（Codex） | Wave 5 |

各 Agent 在 `services/agents/` 的 Python 包结构遵循 ARCHITECTURE.md §4.3：继承 `BaseAgent`，通过 `AgentRuntime` 访问内核能力，禁止直接导入 `AgentInterface` 或框架 SDK。

---

## 9. OpenAPI 契约位置

FastAPI 自动生成的 OpenAPI 3.1 schema 约定路径：

```
apps/api/openapi.json          # CI 中由 FastAPI 导出，提交到仓库供前端类型生成
packages/shared/src/api/       # 自 openapi.json 生成的 TypeScript 类型（由 openapi-typescript 工具链）
```

前端 API 调用通过 `packages/shared/src/api/` 中的类型安全客户端，禁止手写裸 fetch 调用（Wave 1 起执行）。

---

## 10. 迁移验收 Checklist

FORI-042 完成时，Hermes 验证以下全部项目（L1 门禁）：

**构建**
- [ ] `apps/web next build` 成功，零 TypeScript 错误，零 ESLint 错误
- [ ] `apps/api` Python 依赖安装完毕，`mypy` 类型检查通过（空骨架）
- [ ] `packages/ui` 独立 `tsc --noEmit` 通过
- [ ] `packages/shared` 独立 `tsc --noEmit` 通过

**路由**
- [ ] §3 中全部 34 条生产路由在 `apps/web/app/` 下存在对应 `page.tsx`
- [ ] `marketing/` 的 2 条重定向规则在 `apps/web/next.config.mjs` 中配置
- [ ] 所有 `@/components/Xxx` 引用已替换为 `@fori/ui` 或 `apps/web/components/Xxx`

**组件**
- [ ] `packages/ui/src/` 包含 §5.1 的全部 11 个组件
- [ ] `packages/ui/src/index.ts` 统一导出全部组件
- [ ] `PwaRuntime.tsx` 位于 `apps/web/components/`，不在 `packages/ui/`

**样式**
- [ ] `apps/web/tailwind.config.ts` 使用 Tailwind 4.x 语法（无 `extend.colors` 残留）
- [ ] 浏览器截图验证 `/home` 和 `/price` 页面样式无明显回退

**PWA**
- [ ] `apps/web/public/manifest.json` 和 `sw.js` 存在
- [ ] Lighthouse PWA 检查 ≥ 3/5 核心指标通过

**原型冻结**
- [ ] `prototype/README.md` 顶部有 FROZEN 标注
- [ ] `prototype/` 无 Wave 0 之后的新功能提交

**Agent 占位**
- [ ] `services/agents/` 下六个子目录存在，各含 `README.md`

---

## 11. Consequences（后果分析）

### 正面影响

- **单一代码库**：Wave 1 起所有新功能直接在 `apps/web` 开发，零双写
- **连续 E2E 覆盖**：Playwright 从第一个生产路由起积累，Wave 1 结束后覆盖率有效增长
- **Tailwind 4.x 早期落地**：避免后期技术债务，`@theme` 统一设计 token
- **类型安全 API 客户端**：从 Wave 1 起前后端契约通过 OpenAPI 强制对齐，减少运行时类型错误
- **组件库独立发布路径**：`packages/ui` 架构允许未来提取为独立 npm 包供其他 Fori 产品复用

### 风险与缓解

| 风险 | 概率 | 缓解措施 |
|------|------|---------|
| Tailwind 4.x 升级引入视觉回退 | 中 | `docs/MIGRATION-TAILWIND4.md` 提供详细映射；FORI-042 验收要求截图确认 |
| Mock 数据层被新功能引用 | 低 | Mock 路径隔离在 `apps/web/lib/mock/`；代码评审检查 import 路径 |
| `marketing/` 重定向遗漏 | 低 | Playwright E2E 覆盖旧路径的 301 跳转 |
| Agent 占位 README 内容不足 | 低 | 各设计任务（FORI-044/051/061/071/080）填充完整契约，占位只需包名和模块描述 |

---

## 12. 参考

- `docs/execution/MVP_SLICE.md` — Wave 切片顺序与依赖
- `docs/execution/REPO_LAYOUT.md` — 机器可读目录树
- `docs/SPEC.md §5.1` — 技术栈锁定约束
- `docs/ARCHITECTURE.md §4.3` — 业务 Agent 层设计规范
- `docs/MIGRATION-TAILWIND4.md` — Tailwind 3→4 升级映射
- ADR-001 (ARCHITECTURE.md §12) — Next.js 14 PWA 决策
- ADR-006 (ARCHITECTURE.md §12) — 框架适配层设计

---

*ADR-009 · 版本 v1.0 · 2026-07-02 · 状态：已采纳*
