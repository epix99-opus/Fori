# REVIEW-031 架构级交叉审查

**审查人**：Claude Code（架构/深审角色）
**审查日期**：2026-07-01
**审查范围**：FORI-031 原型修订 — REVIEW-030 8 项必修 + UX P1 改进实现质量
**审查依据**：REVIEW-030-FINAL.md、REVIEW-UX-USER-PERSPECTIVE.md、prototype/ 实际代码

---

## VERDICT: CONDITIONAL_PASS

8 项必修中 7 项完全通过、1 项存在功能缺口（SW 离线队列无背景同步触发器）。UX P1 中可在原型层实施的项目均已部分落地，但价格评估页 D 层级置信度提示仍弱。新增 36 页验证覆盖完整，ECharts 实现为真实图表配置而非占位。整体工程质量显著提升，标记 CONDITIONAL_PASS，1 项 REQUIRED_CHANGE 需修复后可升为 PASS。

---

## 逐项验证

### 必修 1：修正 TabBar ✅ PASS

**验证路径**：`prototype/components/TabBar.tsx`

- Tab 2 = `找房` / Compass 图标 / 路由 `/explore/search` ✅
- Tab 4 = `工作台` / Briefcase 图标 / 路由 `/workspace/agent` ✅
- 消息中心从主 TabBar 移除，保留为独立路由 `/messages` ✅
- 完全符合 UI_DESIGN §1.1 五 Tab 定义：首页、找房、发布、工作台、我的

---

### 必修 2：统一路由到 UI_DESIGN 路由体系 ✅ PASS（含一处轻微不一致）

**验证路径**：`prototype/app/` 目录结构

| UI_DESIGN 规范路由 | 实现方式 | 状态 |
|---|---|---|
| `/explore/search` | re-export from `/search/page` | ✅ |
| `/workspace/agent/matches` | re-export from `/match/page` | ✅ |
| `/workspace/media/generate` | re-export from `/marketing/generate/page` | ✅ |
| `/workspace/media/manage` | re-export from `/marketing/manage/page` | ✅ |
| `/profile/transactions/[txId]` | 独立实现，非 re-export | ✅ |

旧路由均保留（`/search`、`/match`、`/marketing/generate`、`/marketing/manage`）便于已有链接迁移 ✅

**轻微不一致**：`/transaction/[id]` 保留为独立完整实现，未重定向到规范路由 `/profile/transactions/[txId]`。两个路由分别渲染不同实现，测试文件同时导入两者。功能不影响，但逻辑一致性略弱。

---

### 必修 3：补齐 UI_DESIGN §3.2 必需页面 ✅ PASS

**验证路径**：`prototype/app/` 目录 + 内容抽查

| 必需页面 | 文件路径 | 内容质量 |
|---|---|---|
| `/auth/login` | `app/auth/login/page.tsx` | 手机号+验证码表单、信任三要素卡片、KYC跳转 ✅ |
| `/auth/kyc` | `app/auth/kyc/page.tsx` | 文件存在 ✅ |
| `/price` | `app/price/page.tsx` | 小区/面积/总价输入、三种评估模式卡、跳转评估详情 ✅ |
| `/workspace/agent/buyers` | `app/workspace/agent/buyers/page.tsx` | 成交概率、预计佣金、跟进超时风险排序 ✅ |
| `/workspace/agent/listings` | `app/workspace/agent/listings/page.tsx` | 文件存在 ✅ |
| `/workspace/agent/stats` | `app/workspace/agent/stats/page.tsx` | 成交漏斗可视化（CSS 进度条）、本月统计、佣金结算跳转 ✅ |

---

### 必修 4：补齐关键中间页 ✅ PASS

**验证路径**：页面文件 + 内容抽查

| 关键中间页 | 实现质量 |
|---|---|
| `/explore/map` | CSS 网格地图底板 + 3 个价格气泡 Pin（可点击） + 定位/图层控制按钮 + 推荐房源卡片 ✅ |
| `/explore/dict/[communityId]` | 小区概览（楼栋数/住宅数/成交样本）+ 楼栋列表 + 进入编辑 CTA + Top3 权益标签 ✅ |
| `/profile/transactions` | 文件存在 ✅ |

地图页说明：采用 CSS 模拟地图底板而非真实高德 SDK，可接受（原型阶段）。Pins 点击跳转到楼盘字典详情，导航链路完整。

---

### 必修 5：ECharts 5 集成 ✅ PASS

**验证路径**：`prototype/package.json` + `prototype/components/ChartCard.tsx` + `app/price/[communityId]/page.tsx`

- 依赖：`"echarts": "^5.6.0"`, `"echarts-for-react": "^3.0.6"` ✅
- `ChartCard.tsx` 使用 `dynamic()` SSR 安全导入 + 类型化 `EChartsOption` ✅
- 价格评估页实现三图：
  - 仪表盘（Gauge）：基于参考价区间动态量程 ✅
  - 瀑布图（Waterfall）：基准价 + 5 项修正因素逐项拆解，含负值红色渲染 ✅
  - 走势折线图（Line/Area）：24 个月当前层级 vs 参考层级对比 ✅
- 所有图表配置基于计算属性（`useMemo`），参数联动小区切换动态重算 ✅

**这是本次修订最高质量的交付物**：非静态占位，为真实可交互 ECharts 图表。

---

### 必修 6：Tailwind 版本对齐方案 ✅ PASS

**验证路径**：`docs/MIGRATION-TAILWIND4.md`

- 明确范围：原型阶段保留 Tailwind 3.x，生产执行必须升级到 4.x ✅
- 8 步迁移程序（分支策略、依赖升级、PostCSS 重配、主题迁移、shadcn 验证、构建验证、视觉回归、文档清除） ✅
- 验收标准（构建通过、无 Tailwind utility 警告、三端视觉回归） ✅
- 要求完成后从 SPEC/ARCHITECTURE 中移除原型例外声明 ✅

---

### 必修 7：PWA Service Worker ⚠️ CONDITIONAL_PASS

**验证路径**：`prototype/public/sw.js` + `prototype/components/PwaRuntime.tsx` + `app/layout.tsx`

**通过项**：
- `sw.js` 实现 install/activate/fetch 三个生命周期事件 ✅
- install 时预缓存 9 条核心路由（含 `/explore/map`、`/price`、`/workspace/agent`） ✅
- activate 时清理旧版本 cache（版本号 `fori-prototype-v31`） ✅
- GET 请求走 `readThroughCache`：网络优先，失败回退缓存，最终兜底 `/home` ✅
- POST/PUT/PATCH/DELETE 走 `queueWriteWhenOffline`：网络失败写入 IndexedDB `offlineQueue` ✅
- `PwaRuntime.tsx` 初始化 IndexedDB（`drafts` + `offlineQueue` stores）并注册 SW ✅
- `PwaRuntime` 在 `app/layout.tsx` 中已挂载 ✅

**缺口（REQUIRED_CHANGE）**：
`sw.js` 的 `queueWriteWhenOffline` 函数将写操作存入 IndexedDB `offlineQueue`，并向用户返回 `"已写入离线队列，恢复网络后同步"` 的提示。但 **SW 内没有 `sync` 事件监听器**，网络恢复时队列永远不会被自动冲刷。用户收到"已写入"的承诺但实际数据不会同步，构成信息误导。

---

### 必修 8：更新验证脚本 ✅ PASS

**验证路径**：`prototype/app/prototype-pages.test.ts`

- 导入数量从 21 增至 36 ✅
- 硬性断言 `pages.length !== 36` 确保新增页面不可静默缺失 ✅
- 所有 6 项必需页面均已导入（`LoginPage`, `KycPage`, `PriceEntryPage`, `AgentBuyersPage`, `AgentListingsPage`, `AgentStatsPage`） ✅
- 新增关键中间页（`ExploreMapPage`, `DictDetailPage`, `TransactionsPage`）均已导入 ✅
- 规范路由页面（`AgentMatchesPage`, `WorkspaceMediaGeneratePage`, `WorkspaceMediaManagePage`）和旧路由原件同时导入，验证 re-export 链路完整性 ✅

---

## UX P1 改进项验证

本次原型修订可在页面层实施的 P1 项（UX-02、UX-10、UX-12）有部分落地；架构/流程级 P1 项（UX-01、UX-04、UX-05、UX-09、UX-13、UX-15、UX-16 到 UX-18）超出原型修订范围，不作为本次验收判据。

| P1 项 | 范围判断 | 实现情况 |
|---|---|---|
| UX-02：价格评估买家决策支撑 | 可在原型层实施 | 已添加 `conclusion`（合理性判断）、`empowerment`（三方赋能）、市场行情统计块、近期成交参考。但 D 层级"样本可信度"警示只在 `tierCopy.D.description` 中一句话提示，未在 D 层选中时以醒目样式单独呈现 ⚠️ |
| UX-10：匹配卡片经纪人收益判断 | 可在原型层实施 | `AgentBuyersPage` 已为每个客源卡展示成交概率、预计佣金、超时风险 ✅ |
| UX-12：工作台今日优先队列 | 可在原型层实施 | `AgentBuyersPage` 按超时风险排序；但工作台主页（`/workspace/agent`）是否有统一优先队列未能在本次审查中完整读取，存在不确定性 ⚠️ |
| UX-01、04、05、06、09、13、15-18 | 超出原型修订范围 | 不在本次评估范围 |

---

## FINDINGS

1. **SW 离线队列无法自动同步**：`queueWriteWhenOffline` 存入 IndexedDB 但无 `sync` event handler，用户被告知"恢复网络后同步"但实际不会触发。为 P1 级功能性缺口。

2. **`/transaction/[id]` 双实现**：旧路由与 `/profile/transactions/[txId]` 均为完整独立实现，测试同时导入两者。后续应将 `/transaction/[id]` 改为 re-export 规范路由，或在 SPEC 中记录双实现的意图。

3. **re-export 方向与 SUGGESTIONS 建议相反**：REVIEW-030 SUGGESTIONS 建议旧路由 redirect 到规范路由，但实际实现为规范路由 re-export 旧路由原件。逻辑等价，但规范路由实现文件只有一行 re-export，若旧路由文件被删除则断链。建议将实现迁移到规范路径，将旧路径改为 re-export。

4. **价格评估 D 层级置信度提示弱**：`tierCopy.D.description = "样本较少，需扩大周期并提高风险提示权重"`，但 D 层选中时界面上没有差异化的视觉警示（UX-02 要求对样本不足场景用醒目提示说明"仅作参考"）。

5. **地图页为 CSS 模拟而非高德 SDK**：在原型阶段可接受。但下一阶段 FORI-032 应记录高德 JS API 2.0 集成为必做项，以免原型与生产路径分化。

6. **`prototype-pages.test.ts` 未运行类型检查**：文件为 `.ts` 但未通过 `tsc --noEmit` 或 `vitest` 运行过；仅验证 import 可编译，不验证运行时渲染。构建验证通过可弥补，但建议加 `npm run typecheck` 到验收命令。

---

## REQUIRED_CHANGES

### RC-1（HIGH）：补齐 SW 背景同步触发器

**文件**：`prototype/public/sw.js`

在 SW 中添加 `sync` 事件监听，当网络恢复且浏览器触发 Background Sync 时，从 IndexedDB `offlineQueue` 取出所有记录并重试 fetch。同时在 `queueWriteWhenOffline` 中，如果浏览器支持 `registration.sync.register()`，则调用以注册后台同步。这样"恢复网络后同步"的承诺才能真正兑现。

如 Background Sync API 浏览器兼容性不满足（Safari 目前仅部分支持），可将"离线队列将在下次打开应用时重试"作为降级说明，在 UI 提示中修正措辞，避免用户误解为自动同步。

---

## SUGGESTIONS

1. **迁移实现至规范路径**：将 `prototype/app/marketing/generate/page.tsx`、`marketing/manage/page.tsx`、`match/page.tsx` 的实现移到各自规范路径 (`workspace/media/generate/`, `workspace/media/manage/`, `workspace/agent/matches/`)，旧路径保留为 re-export。这样规范路径是"源"，旧路径是"别名"，语义更准确，也符合 REVIEW-030 SUGGESTIONS §2 的方向。

2. **`/transaction/[id]` 改为 re-export**：参照其他旧路由统一改为 `export { default } from "../../profile/transactions/[txId]/page"`，避免双实现分化。

3. **价格评估 D 层级醒目提示**：在 `status === "ready"` 且 `community.tier === "D"` 时，在三图上方渲染一个 `Toast` 或警告条，内容参照 UX-02 建议："样本数量不足，仅作参考，不建议直接出价"。

4. **下一任务记录高德地图集成**：在 `.ai/plan/` 或 FORI-032 任务说明中明确标注"地图页需从 CSS 模拟升级为高德 JS API 2.0"，防止原型视觉遮蔽生产实现缺口。

5. **验收命令增加 typecheck**：`prototype/package.json` 的验收脚本建议改为 `npm run build && npx tsc --noEmit`，以同时捕获类型错误和构建错误。
