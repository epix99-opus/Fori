# REVIEW-044-IMPL-CLAUDE

> **任务**: FORI-044 Wave 4 — Codex Wave 3 R2 原型实现对抗性评审  
> **评审人**: Claude Code (epix)  
> **分支**: `claude/fori-044-impl-review`  
> **被评审提交**: `72cdabc` — `feat: FORI-044 prototype R2 — settlement BottomSheet + design spec alignment [codex]`  
> **评审基准**: FORI-044_FULL_DESIGN.md §11 P0 Checklist + Handoff P0-1/P0-2/P0-3/P0-4 接受标准  
> **日期**: 2026-07-03

---

## VERDICT

**CONDITIONAL_PASS**

构建干净，核心功能流程可演示，但存在 **2 个 P0 阻塞项**未达接受标准，以及 **4 个 P1 缺口**。在 P0 项修复前不建议提交最终人类演示。

---

## FINDINGS

### BUILD

```
cd prototype && npm run build
结果: ✓ Compiled successfully (0 TypeScript 错误)
路由数: 38 条 (≥ 36 门禁 ✅)
```

---

### 8 条人类评审项逐项核查

#### 评审项 1 — 完整功能清单 (FORI-080)
**状态: ⚠️ PARTIAL**

- ✅ `/home` 六大模块入口卡片网格 (2×3) 存在，href 全部正确
- ✅ `moduleChecklist` 数组驱动，模块名/状态标签可见
- ❌ 缺少「完成进度指示器」(已实现/待实现功能数) — 设计规格 §3.1 要求
- ❌ 缺少「7 大价值闭环介绍区块」— 设计规格 §3.1 要求

**影响**: 人类演示时无法直观看出哪些功能已实现/待实现。P2 级别缺口。

---

#### 评审项 2 — 全角色功能与交互清单 (FORI-081)
**状态: ⚠️ PARTIAL — 文案不符合设计规格**

实现的 `roleGuides` 文案与设计规格不一致：

| 角色 | 设计规格文案 | 实现文案 | 匹配？ |
|------|------------|---------|-------|
| 买家 | 「用真实字典看懂市场，用公允价格出价，全程公证保障您的权益」 | 「先看真实字典和公允价，再发布需求进入撮合。」 | ❌ |
| 卖家 | 「合理挂牌、精准匹配、快速成交——平台科学定价让您少走弯路」 | 「用挂牌建议、推广素材和交易存证降低试错成本。」 | ❌ |
| 经纪人 | 「维护楼盘字典可获 P1 客源优先权；交易分成最高 80% 直接归您」 | 「维护楼盘字典可获得 P1 客源优先权与分成。」 | ⚠️ 近似 |
| 平台工作人员 | 「审核队列、风控异常、收益核算——完整后台工具链支撑您高效处理」 | 「通过字典审核、交易风控和收益分配看板处理异常。」 | ❌ |

**代码位置**: `prototype/app/home/page.tsx:74-79`

---

#### 评审项 3 — 房源字典核心模块 (FORI-082/083/084)
**状态: ❌ P0 阻塞 — SUUMO 6 Tab 未实现**

这是本次评审最严重的缺口。

**Handoff P0-1 接受标准**:
> 6 个 Tab 均有实际内容（无空白 Tab）  
> viewerRole 切换时「价格」「成交」Tab 内容随之变化  
> 🔒 标识符旁有升级 CTA

**设计规格 §4 / §11 P0 Checklist**:
> SUUMO 式字段分区（概况/设施/交通/价格/成交/共建 6 Tab）

**实际实现** (`prototype/app/explore/dict/[communityId]/page.tsx`):
- 无 Tab 导航，全部内容以**平铺卡片**形式展示
- 缺少「设施」Tab (健身房/游泳池/幼儿园等设施数据)
- 缺少「交通」Tab (地铁/公交/骑行信息)
- 缺少「价格」Tab (含角色脱敏的价格显示 + 🔒 lock)
- 缺少「成交」Tab (经纪人可见历史成交 + 非经纪人显示 🔒)
- viewerRole 仅影响「保密字段」单一 section，不控制 Tab 级别内容可见性
- 缺少非经纪人浏览成交记录时的「🔒 成交明细仅认证经纪人可见 + 了解经纪人入驻 →」CTA

**现有内容 (正确部分)**:
- ✅ 首建者标签 (Crown icon + 李四)
- ✅ 贡献账本 5 条记录
- ✅ Top3 维护者排行
- ✅ ViewerRoleSwitcher 组件
- ✅ 纠错入口 (`?intent=correction`)

---

#### 评审项 4 — 共建共赢裂变机制 (FORI-086/087/088)
**状态: ⚠️ PARTIAL — 裂变链路可演示，但 commission 数字错误**

- ✅ 贡献积分时间线 (5 条记录)
- ✅ 维护者 Top3 排行榜
- ✅ 「信息贡献费」展开显示首建者/协作者/纠错/推广分配
- ❌ **Commission 总额错误**:
  - 设计规格 §8.3: 总额 `¥60,000`（成交价 ¥300 万 × 2%）
  - 实现: `revenueTotal = 30000`（仅为规格的一半）
  - 实现代码: `prototype/app/transaction/[id]/page.tsx:114`
- ❌ **分成比例与 Header 描述不一致**:
  - Header 显示「80% 经纪人 / 15% 平台 / 5% 公证」
  - 实际各项合计: 平台8%+推广5%+信息贡献12%+带看25%+全程服务45%+公证5% = 100%
  - 经纪人实际占比 (带看+全程) = 25%+45% = **70%**，不是 80%

---

#### 评审项 5 — 设计开发过程管理 (FORI-094/095)
**状态: ✅ ACCEPTABLE**

- ✅ `docs/CANON.md` 已建立 (FORI-094)
- ✅ FORI-095 明确标注为 GAP (等待 Hermes 真实日志，不伪造) — 合规处理

---

#### 评审项 6 — 定价评估与撮合机制 (FORI-089/090/091)
**状态: ⚠️ PARTIAL — 三角色 Tab PASS，P1 pulse 未实现**

**价格页 (`/price/community-001`):**
- ✅ 三角色 Tab (买家/卖家/经纪人) 切换功能正常
- ✅ ConfidenceBadge (high/medium 状态正确)
- ✅ SampleCountNotice (sampleCount < 30 时触发)
- ✅ 估价有效期 sticky footer
- ✅ D-tier 警示条 + 「扩大搜索范围」按钮
- ✅ AgentAssistFab 随角色切换 prompts
- ✅ BottomSheet 付费墙 ¥29
- ⚠️ **低置信度 Badge 缺少 `animate-pulse`**:
  - 设计规格: `"bg-amber-100 text-amber-700 animate-pulse"`
  - 实现: `"bg-semantic-warning/10 text-semantic-warning"` (无动画)
  - 代码: `prototype/app/price/[communityId]/page.tsx:507`

**撮合页 (`/match`):**
- ✅ 撮合状态机步骤条
- ✅ 实时倒计时 (useInterval 正确实现)
- ✅ P1/P2/历史 筛选 Tab
- ✅ 接受/暂不处理/拒绝 三按钮
- ✅ EmptyState 存在 (文案略有偏差，P3 级别)
- ✅ AgentAssistFab
- ❌ **P1 红色 pulse 未实现** (handoff P0-3 接受标准):
  - 设计规格 §6.3: `"text-semantic-error animate-pulse"` when remainingMinutes < 30
  - 实现: countdown `<span className="price-nums font-semibold">{p1Countdown}</span>` 无条件样式切换
  - 代码: `prototype/app/match/page.tsx:231`
- ❌ **P2 左边框未实现** (handoff P0-3 接受标准):
  - 设计规格 §6.3: `P2: "border-l-4 border-semantic-warning bg-warning/5"`
  - 实现: P2 无左边框样式
  - 代码: `prototype/app/match/page.tsx:318` — 仅 P1 有 `border-l-secondary-500`
- ❌ **P1 左边框颜色错误**:
  - 设计规格: `border-semantic-error` (红色)
  - 实现: `border-l-secondary-500` (secondary 色系，非红色)
- ❌ **P1 卡片贡献引导文案缺失**:
  - 设计规格: `"📌 因您维护「{lead.communityName}」获得优先推送"`
  - 实现: P1 卡片无此文字

---

#### 评审项 7 — Agent 原生交互 (FORI-092/093)
**状态: ✅ PASS**

- ✅ AgentAssistFab 部署于 10+ 路由 (/home, /dict/community-001, /price, /price/community-001, /match, /transaction/tx-001, /auth/login, /workspace/agent, /explore/dict/community-001/edit 等)
- ✅ 三模态输入图标 (文字/语音/拍摄)
- ✅ 各页 suggestedPrompts 与页面语境相关
- ⚠️ `/explore/dict/community-001` suggestedPrompts 未使用规格内容 (低优先级偏差)

---

#### 评审项 8 — 收费获益体系 (FORI-085/088)
**状态: ⚠️ PARTIAL — 登录分级 PASS，commission 数字问题见评审项 4**

- ✅ 五级可见矩阵 (`/auth/login`) 清晰可见
- ✅ AgentAssistFab prompts 合规
- ❌ **Per-tier 「立即升级」CTA 缺失** (handoff P1-2):
  - 每行矩阵缺少 ghost 按钮 (手机验证→输入框, 实名认证→/auth/kyc, 经纪人认证→/profile/agent-cert)
  - 代码: `prototype/app/auth/login/page.tsx:71-84`
- ✅ ¥29 深度报告 BottomSheet 交互完整
- `/profile/settlement` 页面未创建 — 设计规格 §8.4 标注为 Wave 3 建议，不计为 blocker

---

### 附加发现 (设计规格遗漏引用)

> 任务 brief 引用 §3.26–§3.30。检查后确认 FORI-044_FULL_DESIGN.md v1.0 路由规格止于 §3.25 (`/listing/[id]`)，不存在 §3.26–§3.30。无遗漏。

---

## REQUIRED_CHANGES

按优先级排序，P0 项为发版前必须修复。

### P0 (阻塞)

#### RC-1: 实现 SUUMO 6-Tab 结构
**文件**: `prototype/app/explore/dict/[communityId]/page.tsx`

将现有平铺卡片改为 6-Tab 交互式导航：
- Tab 1 概况: 小区名/开发商/物业/建成年份/总楼栋/总户数/容积率/绿化率/车位比/标签 (设计 §4.2)
- Tab 2 设施: 内部配套 (健身房/游泳池/幼儿园等) + 周边配套 (设计 §4.3)
- Tab 3 交通: 地铁/公交/骑行 (设计 §4.4)
- Tab 4 价格: 参考区间 (所有用户) + 挂牌价 (手机验证+, 否则 🔒) + 历史成交入口 (经纪人, 否则 🔒) (设计 §4.5)
- Tab 5 成交: 经纪人可见历史记录; 非经纪人显示 🔒 + 「了解经纪人入驻 →」CTA (设计 §4.6)
- Tab 6 共建: 已实现内容 (贡献账本+排行榜) 迁移到此 Tab + 积分进度条 (设计 §4.7)

**接受标准**: Tab 切换正常; viewerRole 影响价格/成交 Tab 内容; 🔒 lock 配升级 CTA

#### RC-2: 修正 Commission 总额与分成比例
**文件**: `prototype/app/transaction/[id]/page.tsx:114-128`

```tsx
// 修正前
const revenueTotal = 30000;
const revenueShares = [
  { label: "平台服务费", amount: 2400, percent: 8, ... },
  ...
];

// 修正后 (严格按 FORI-044_FULL_DESIGN §8.3)
const revenueTotal = 60000; // ¥300万 × 2%
const revenueShares = [
  { label: "经纪人服务池", amount: 48000, percent: 80, ... },
  { label: "平台运营", amount: 9000, percent: 15, ... },
  { label: "首建者/字典维护贡献", amount: 3000, percent: 5, ..., expandable: true },
];
```

**接受标准**: Header 文字 "80% 经纪人 / 15% 平台 / 5% 字典" 与实际数字一致; 总额 ¥60,000

---

### P1 (应修复)

#### RC-3: P1 倒计时红色 pulse
**文件**: `prototype/app/match/page.tsx`

```tsx
// 在 MatchPage 中解析 p1Countdown 为分钟数
const p1MinutesRemaining = useMemo(() => {
  const [h, m] = p1Countdown.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}, [p1Countdown]);
const isUrgent = p1MinutesRemaining < 30;

// 在 countdown span 应用条件样式 (第 231 行附近)
<span className={cn(
  "price-nums font-semibold",
  isUrgent ? "text-semantic-danger animate-pulse" : ""
)}>
  {p1Countdown}
</span>
```

#### RC-4: P1/P2/P3 左边框颜色修正
**文件**: `prototype/app/match/page.tsx:318`

```tsx
// MatchCard 组件
const priorityStyle = {
  P1: "border-l-4 border-l-semantic-danger bg-red-50",
  P2: "border-l-4 border-l-semantic-warning bg-amber-50",
  P3: "border-l-4 border-l-neutral-300 bg-neutral-50",
};
const priority = lead.demand.priority === "normal" ? "P3" : lead.demand.priority;
<Card className={cn(priorityStyle[priority], isExpired && "opacity-70 grayscale")}>
```

#### RC-5: P1 贡献引导文案
**文件**: `prototype/app/match/page.tsx` (MatchCard 内)

```tsx
{isP1 && (
  <p className="text-xs text-primary-600 mb-2">
    📌 因您维护「{lead.listing.communityName}」获得本客源优先推送
  </p>
)}
```

#### RC-6: 首页角色引导文案对齐设计规格
**文件**: `prototype/app/home/page.tsx:74-79`

```tsx
const roleGuides = [
  { role: "买家", text: "用真实字典看懂市场，用公允价格出价，全程公证保障您的权益" },
  { role: "卖家", text: "合理挂牌、精准匹配、快速成交——平台科学定价让您少走弯路" },
  { role: "经纪人", text: "维护楼盘字典可获 P1 客源优先权；交易分成最高 80% 直接归您" },
  { role: "平台工作人员", text: "审核队列、风控异常、收益核算——完整后台工具链支撑您高效处理" },
];
```

---

### P2 (建议)

#### RC-7: 低置信度 Badge 添加 animate-pulse
**文件**: `prototype/app/price/[communityId]/page.tsx:507`

```tsx
low: { label: "低置信 · 仅参考", className: "bg-amber-100 text-amber-700 animate-pulse" },
```

#### RC-8: Login 页面 Per-tier 升级 CTA
**文件**: `prototype/app/auth/login/page.tsx:71-84`

每个 tier 行末增加 ghost 按钮，按 handoff P1-2 规格跳转对应升级页面。

---

## 汇总

| 编号 | 类别 | 文件 | 严重度 | 状态 |
|------|------|------|--------|------|
| RC-1 | SUUMO 6-Tab 结构缺失 | `/explore/dict/[communityId]/page.tsx` | P0 | 阻塞 |
| RC-2 | Commission 数字错误 (¥30K/70% vs ¥60K/80%) | `/transaction/[id]/page.tsx` | P0 | 阻塞 |
| RC-3 | P1 倒计时红色 pulse 缺失 | `/match/page.tsx` | P1 | 应修复 |
| RC-4 | P2/P3 左边框/背景颜色缺失 | `/match/page.tsx` | P1 | 应修复 |
| RC-5 | P1 贡献引导文案缺失 | `/match/page.tsx` | P1 | 应修复 |
| RC-6 | 首页角色引导文案不符规格 | `/home/page.tsx` | P1 | 应修复 |
| RC-7 | 低置信度 Badge 无 animate-pulse | `/price/[communityId]/page.tsx` | P2 | 建议 |
| RC-8 | Login Per-tier 升级 CTA 缺失 | `/auth/login/page.tsx` | P2 | 建议 |

**修复建议**: RC-1/RC-2 为本次 Wave 的唯一阻塞项。RC-3~RC-6 可在同一 PR 中一并修复 (均为小改)。RC-7/RC-8 可列入下一 Wave。

---

*REVIEW-044-IMPL-CLAUDE · Claude Code (epix) · 2026-07-03 · claude/fori-044-impl-review*
