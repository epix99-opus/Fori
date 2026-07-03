# FORI-044 · Codex 原型补全实现 Handoff

> **分支**: `codex/fori-044-prototype`  
> **Owner**: Codex (woot)  
> **依赖**: FORI-044 设计包（`docs/execution/FORI-044_FULL_DESIGN.md`）PASS  
> **门禁**: `cd prototype && npm run build` PASS（0 TypeScript 错误）  
> **约束**: 仅修改 `prototype/` 目录；不修改 `apps/`、`docs/`、`packages/`  
> **禁止**: 创建空白页、伪造完成状态、删减功能  

---

## 0. 执行前确认

```bash
cd prototype && npm run build  # 确认当前 build PASS（基准）
git status                     # 确认在 codex/fori-044-prototype 分支
```

---

## 1. 优先级 P0 — 必须完成（人类评审阻塞）

### P0-1：`/explore/dict/community-001` — SUUMO 式六 Tab

**文件**: `prototype/app/explore/dict/[communityId]/page.tsx`

**现状**: 已有字典详情、贡献账本、ViewerRoleSwitcher、AgentAssistFab。

**需要增强**：将现有内容整理为 6 个 Tab（概况/设施/交通/价格/成交/共建）。

**UI 规格（参考 FORI-044_FULL_DESIGN §4）**：

**「概况」Tab**：
```tsx
// 显示字段组：基础信息 + 建筑指标 + 标签
const overviewFields = [
  { label: "小区名称", value: "中关村小区" },
  { label: "所在城市", value: "北京市 · 海淀区 · 中关村北区" },
  { label: "开发商", value: "北京城建集团" },
  { label: "物业公司", value: "金地物业" },
  { label: "建成年份", value: "2005 年" },
  { label: "总楼栋数", value: "8 栋" },
  { label: "总户数", value: "456 户" },
  { label: "容积率", value: "2.8" },
  { label: "绿化率", value: "31%" },
  { label: "车位比", value: "0.85:1" },
]
// 标签数组：["B 中端圈层", "品质刚需", "地铁近", "部分学区"]
```

**「设施」Tab**：
```tsx
const facilityData = {
  internal: [
    { name: "健身房", available: true, note: "免费" },
    { name: "游泳池", available: false },
    { name: "幼儿园", available: true, note: "园内" },
    { name: "人防车库", available: true },
  ],
  nearby: [
    { category: "学校", items: ["XX 小学（500m）", "YY 中学（1.2km）"] },
    { category: "医院", items: ["ZZ 医院（800m）"] },
    { category: "购物", items: ["沃尔玛（400m）", "苏宁（200m）"] },
  ]
}
```

**「交通」Tab**：
```tsx
const transportData = {
  metro: [
    { line: "地铁 4 号线", station: "中关村站", walkMin: 8, distanceM: 640 },
    { line: "地铁 13 号线", station: "五道口站", walkMin: 15, distanceM: 1200 },
  ],
  bus: ["22路", "331路", "365路（门口站）"],
}
```

**「价格」Tab（脱敏）**：
```tsx
// 按 viewerRole 控制展示
// 游客/手机用户：显示参考区间（模糊）
// 实名用户+：显示精确区间
// 经纪人：显示历史成交
const priceData = {
  rangeAll: "¥32,000 – ¥38,000 /㎡",      // 所有用户
  listingRange: "¥300 万 – ¥450 万",        // 手机验证+
  exactFloor: "精确楼层/房号",              // 实名认证+，显示 🔒 提示
  transactionHistory: "历史成交明细",       // 经纪人+，显示 🔒 提示
}
```

**「成交」Tab（经纪人可见，其他显示 🔒）**：
```tsx
const transactions = [
  { date: "2025-12", floor: 4, type: "2室1厅", area: 89, price: 302, condition: "南北通透" },
  { date: "2025-11", floor: 8, type: "3室2厅", area: 118, price: 385, condition: "精装改善" },
  { date: "2025-10", floor: 12, type: "2室1厅", area: 91, price: 299, condition: "普通装修" },
]
// 非经纪人：显示 "🔒 成交明细仅认证经纪人可见" + "了解经纪人入驻 →" 按钮
```

**「共建」Tab（已实现，确认内容）**：
- 首建者标签 ✅
- 贡献时间线（确保至少 5 条）✅
- 维护者排行榜 Top 3（如未实现，需添加）
- 「维护超过 50 分解锁 P1 客源」进度条

**接受标准**:
- 6 个 Tab 均有实际内容（无空白 Tab）
- viewerRole 切换时「价格」「成交」Tab 内容随之变化
- 🔒 标识符旁有升级 CTA

---

### P0-2：`/price/community-001` — 三角色 Tab 增强

**文件**: `prototype/app/price/[communityId]/page.tsx`

**现状**: 已有三角色 Tab + ECharts 走势图 + D-tier 警示 + 付费墙。

**需要补充**：

1. **置信度 Badge**（已有 UX，确认存在）：
   - `confidence === "high"` → `bg-green-100 text-green-700` 「高置信」
   - `confidence === "medium"` → `bg-neutral-200 text-neutral-600` 「中置信」
   - `confidence === "low"` → `bg-amber-100 text-amber-700 animate-pulse` 「低置信·仅参考」

2. **样本量展示**（`sampleCount < 30` 时）：
   ```tsx
   {sampleCount < 30 && (
     <p className={cn("text-sm", sampleCount < 15 ? "text-amber-600" : "text-neutral-500")}>
       {sampleCount < 15 
         ? `⚠ 仅 ${sampleCount} 套成交样本，建议扩大周期`
         : `样本 ${sampleCount} 套，参考性中等`
       }
     </p>
   )}
   ```

3. **估价有效期提示**（底部固定栏上方）：
   ```tsx
   <p className="text-xs text-neutral-400 text-center py-2">
     估价有效期至 2026-07-04 10:00，超期自动重算
   </p>
   ```

4. **D-tier 警示条**（确认「扩大搜索范围」按钮存在，tier=D 时显示）：
   ```tsx
   {tier === "D" && (
     <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3">
       <p className="text-sm font-medium text-amber-700">⚠ 样本不足，测算结果仅作参考</p>
       <p className="mt-1 text-xs text-amber-600">
         D 层级成交样本 {sampleCount} 套，不建议直接用于出价决策
       </p>
       <Button variant="ghost" size="sm" onClick={() => router.push(`/price?district=${district}&tier=C`)}>
         扩大搜索范围 →
       </Button>
     </div>
   )}
   ```

5. **AgentAssistFab suggestedPrompts 根据 priceRole 动态**：
   ```tsx
   const prompts = {
     buyer: ["这个价格合理吗？", "我应该出价多少？", "还有哪些同层级竞品？"],
     seller: ["我的房子应该挂多少？", "多久能成交？", "如何提高挂牌吸引力？"],
     agent: ["买卖双方价差是多少？", "我的佣金预估是多少？", "帮我准备谈判话术"],
   }
   ```

**接受标准**:
- 置信度 Badge 在三种状态下正常展示
- 样本量小于 30 时出现提示
- 估价有效期文字可见
- AgentAssistFab prompts 随角色 Tab 切换

---

### P0-3：`/match` — 4h 倒计时与 P1 视觉

**文件**: `prototype/app/match/page.tsx`

**现状**: 已有撮合状态机步骤条 + P1/P2 过滤 + 基础倒计时。

**需要确认/增强**：

1. **P1 红色 pulse 在剩余 < 30min 时触发**：
   ```tsx
   const isUrgent = remainingMinutes < 30
   <span className={cn(
     "text-sm font-mono",
     isUrgent ? "text-red-600 animate-pulse" : "text-neutral-600"
   )}>
     {formatCountdown(responseDeadline)}
   </span>
   ```

2. **P1/P2/P3 左侧彩色边框**：
   ```tsx
   const priorityStyle = {
     P1: "border-l-4 border-red-500 bg-red-50",
     P2: "border-l-4 border-amber-400 bg-amber-50",
     P3: "border-l-4 border-neutral-300 bg-neutral-50",
   }
   ```

3. **P1 卡片顶部注释**（贡献引导）：
   ```tsx
   {lead.priority === "P1" && (
     <p className="text-xs text-primary-600 mb-2">
       📌 因您维护「{lead.communityName}」获得优先推送
     </p>
   )}
   ```

4. **「接受」「暂缓」「拒绝」三按钮**（确认存在）

5. **空状态 EmptyState** 提示文案：
   ```
   暂无匹配客源
   维护更多楼盘字典可获得 P1 客源优先推送
   [去维护楼盘 →]
   ```

**接受标准**:
- P1 卡片有红色左边框 + 倒计时（< 30min 时红色 pulse）
- P2 卡片有橙色左边框
- 空状态有引导到字典维护的 CTA

---

### P0-4：`/transaction/tx-001` — 分成瀑布图完整性

**文件**: `prototype/app/transaction/[id]/page.tsx`

**现状**: 已有步骤条 + 80/15/5 瀑布图 + 公证存证。

**需要确认**：

1. **分成数字与说明文字均有意义**（非硬编码「X%」而是实际数字）：
   ```tsx
   const commissionData = {
     totalFee: 60000,       // ¥6万（假设成交价300万，佣金2%）
     agentPool: 48000,      // 80%
     platform: 9000,        // 15%
     dictContribution: 3000 // 5%
   }
   // 首建者细分：字典贡献奖励的说明
   ```

2. **「字典贡献奖励」可展开**（点击展示贡献者分配）：
   ```tsx
   // 点击 ¥3,000 区块展开：
   // 首建者 李建国：¥1,200（40%）
   // 团队维护者 王芳：¥900（30%）
   // 团队维护者 张明：¥900（30%）
   ```

3. **Agent FAB suggestedPrompts**：
   ```tsx
   ["帮我确认税费", "下一步需要做什么？", "分成计算有问题吗？"]
   ```

---

### P0-5：`/home` — 模块入口 + 角色引导完整性

**文件**: `prototype/app/home/page.tsx`

**现状**: 已有六大模块入口 + 四角色引导。

**需要确认**：

1. **六大模块入口卡片全部可点击跳转**（验证 href 正确）：
   - 楼盘字典 → `/explore/dict`
   - 定价评估 → `/price`
   - 智能撮合 → `/match`
   - 交易公证 → `/transaction/tx-001`
   - 共建收益 → `/explore/dict/community-001`
   - 认证分级 → `/auth/login`

2. **四角色引导文案**（核对是否与设计一致）：
   - 买家：「用真实字典看懂市场，用公允价格出价，全程公证保障您的权益」
   - 卖家：「合理挂牌、精准匹配、快速成交——平台科学定价让您少走弯路」
   - 经纪人：「维护楼盘字典可获 P1 客源优先权；交易分成最高 80% 直接归您」
   - 平台工作人员：「审核队列、风控异常、收益核算——完整后台工具链支撑您高效处理」

---

## 2. 优先级 P1 — 应完成（提升评审质量）

### P1-1：`/explore/dict` — 卡片数量 ≥ 4，地图有 Mock 标记

**文件**: `prototype/app/explore/dict/page.tsx`

**需要确认**：
- 卡片/列表模式至少显示 4 个小区
- 地图模式显示 3 个 Mock 气泡（含小区名 + 层级 + 参考价格文字）
- 地图模式底部说明文字：「高德地图 JS API 2.0 接入于 FORI-052+，当前展示 Mock 位置」

---

### P1-2：`/auth/login` — 五级矩阵 CTA 可点击

**文件**: `prototype/app/auth/login/page.tsx`

**需要增强**（现有矩阵展示正确，增加 CTA 入口）：
```tsx
// 每行增加「立即升级」按钮（ghost 样式）
// 「手机验证」→ 点击下方手机号输入框
// 「实名认证」→ Link to="/auth/kyc"
// 「经纪人认证」→ Link to="/profile/agent-cert"
// 「平台工作人员」→ 显示「请联系平台管理员」
```

---

### P1-3：`/explore/map` — 非空白页

**文件**: `prototype/app/explore/map/page.tsx`

**现状**: 未知（可能仅有占位 div）

**需要**：
```tsx
export default function MapPage() {
  return (
    <div className="relative h-dvh bg-neutral-200 overflow-hidden">
      {/* Mock 地图背景 */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <p className="text-neutral-400 text-sm">
          地图数据加载中<br/>
          （高德 JS API 2.0 接入于 FORI-052+）
        </p>
      </div>
      
      {/* Mock 小区气泡 */}
      {mockMapPoints.map(point => (
        <Link key={point.id} href={`/explore/dict/${point.id}`}
          style={{ position: "absolute", left: point.x, top: point.y }}
          className="bg-white rounded-lg px-2 py-1 shadow-md text-xs font-medium border border-primary-200"
        >
          {point.name}<br/>
          <span className="text-primary-600">{point.tier}</span>
          <span className="text-neutral-500"> ¥{point.price}/㎡</span>
        </Link>
      ))}
      
      {/* 搜索框 */}
      <div className="absolute top-4 left-4 right-4">
        <Input placeholder="搜索小区或区域" className="bg-white shadow-md" />
      </div>
      
      <TabBar />
    </div>
  )
}

const mockMapPoints = [
  { id: "community-001", name: "中关村小区", tier: "B", price: 35000, x: "35%", y: "40%" },
  { id: "community-002", name: "知春里", tier: "C", price: 29000, x: "55%", y: "30%" },
  { id: "community-003", name: "上地嘉园", tier: "A", price: 48000, x: "25%", y: "25%" },
]
```

---

### P1-4：`/explore/dict/community-001/edit` — 积分 Toast

**文件**: `prototype/app/explore/dict/[communityId]/edit/page.tsx`

**需要增强**（确认提交后 Toast 包含积分信息）：
```tsx
// 提交成功后：
showToast(`✅ 已提交！获得 +5 维护积分，当前楼盘排名第 2`)
```

---

### P1-5：`/workspace/agent` — 经纪人工作台完整性

**文件**: `prototype/app/workspace/agent/page.tsx`

**需要确认**（非空白，包含基础内容）：
- 信用评分卡（L2 认证 + 分数）
- 今日 P1 客源数量提醒（红色 Badge）
- 快捷操作 4 个入口
- Agent FAB（建议：`["今天哪个P1客源最紧急？", "如何提高信用分？"]`）

---

## 3. 优先级 P2 — 建议完成（加分项）

### P2-1：步骤条组件复用

将 `transaction/[id]` 和 `match` 中的步骤条逻辑提取为 `components/FlowStepper.tsx`（可复用于 kyc 页）。

```tsx
interface FlowStep {
  id: string
  label: string
  status: "done" | "current" | "pending"
}

export function FlowStepper({ steps }: { steps: FlowStep[] }) {
  // 横向步骤条，done=绿色，current=主色，pending=灰色
}
```

### P2-2：认证 Badge 统一组件

将多页重复的认证状态 Badge 提取为 `components/CertBadge.tsx`：
```tsx
type CertLevel = "L1" | "L2" | "L3" | "platform"
export function CertBadge({ level }: { level: CertLevel }) { ... }
```

### P2-3：角色切换 fade 动画

在三角色 Tab 信息块替换时添加 transition：
```css
.role-content { transition: opacity 150ms ease-in-out; }
```

---

## 4. 不可做清单（明确禁止）

- ❌ 修改 `docs/` 目录任何文件
- ❌ 修改 `apps/` 或 `packages/` 目录
- ❌ 创建空白占位页（必须有实际内容）
- ❌ 删减已有功能（只能增强）
- ❌ 修改 `lib/mock.ts` 中已有的 Mock 数据结构（可以添加新条目）
- ❌ 引入新的 npm 包（使用现有组件库）
- ❌ 伪造 TypeScript 类型（`as any` 仅用于 Mock 数据）

---

## 5. 构建验证

```bash
# 完成后必须通过：
cd prototype && npm run build

# 预期输出：
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# Route (app)    Size    First Load JS
# 36 个路由全部出现
```

如有 TypeScript 错误，必须修复后再提交。

---

## 6. 提交规范

```bash
git add prototype/app/explore/dict/[communityId]/page.tsx \
        prototype/app/price/[communityId]/page.tsx \
        prototype/app/match/page.tsx \
        prototype/app/transaction/[id]/page.tsx \
        prototype/app/home/page.tsx \
        prototype/app/explore/map/page.tsx \
        # ... 所有修改文件

git commit -m "feat: FORI-044 prototype UI completions — dict SUUMO tabs, price badges, match P1 UX [codex]"
```

---

## 7. P0 验收矩阵

| 验收项 | 文件 | 检验方式 |
|--------|------|---------|
| 字典详情 6 个 Tab 均有内容 | `/explore/dict/community-001` | 人工浏览每 Tab |
| 价格页角色切换信息块不同 | `/price/community-001` | 切换三个 Tab 对比 |
| P1 倒计时有红色 pulse | `/match` | 检查 animate-pulse 类 |
| 分成数字实际可见 | `/transaction/tx-001` | 查看「收益分配」区块 |
| 六大模块入口可跳转 | `/home` | 逐一点击 6 个入口 |
| 地图页不空白 | `/explore/map` | 浏览器打开 |
| build PASS | — | `npm run build` |

---

*FORI-044 Codex 实现 Handoff · 2026-07-03 · Claude Code (epix)*
