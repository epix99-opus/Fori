VERDICT: CONDITIONAL_PASS

---

# FORI-043 实现评审报告

> **评审对象**: Codex 实现分支 `origin/codex/fori-043-prototype-impl`（commits c7415a5, 9997840）
> **设计基线**: `docs/execution/FORI-043_DESIGN.md` §7（E1-E13）
> **评审人**: Claude Code (epix)
> **日期**: 2026-07-02

---

## SUMMARY

Codex 对 FORI-043 原型的实现整体**实质性**，E1-E13 全部有对应代码变更，非 cosmetic 修饰。三角色 roleView 白名单在运行时正确隔离，测试文件以 runtime assertion 方式验证了买家不见卖家底价、卖家不见买家预算、经纪人不透传双方私密字段。D-tier 警示条完整增强：动态注入 `sampleCount`，「扩大搜索范围」按钮路由正确。`explore/dict` 无关变更在 9997840 中已 revert 干净。

主要问题集中在**类型定义偏差**（`hiddenFields` 缺失、roleView 非判别联合、mock 字段名与 API spec 不对齐）和一个**未注释的 prebuild workaround**。这些问题不阻断原型验证，但会在 Wave 2 接线时形成映射负债。

---

## FINDINGS

### Blocker

无 Blocker。

---

### Major

**M1：`hiddenFields` 完全缺失，类型链断裂**

设计 §4.2 `BuyerRoleView` 和 `SellerRoleView` 均定义了 `hiddenFields: string[]`，作为客户端声明已隐藏字段的标准机制。实现中两个类型均省略此字段，`AgentRoleView` 同样缺失。

当前原型依赖 JavaScript runtime 属性检查（`"sellerFloorPrice" in buyerView`）来验证隔离，测试可通过，但：
- 共享类型 `PriceAssessmentResponse` 无法向 API client 生成器（如 openapi-typescript）声明隐藏字段
- FORI-044 和 FORI-045 依赖这个类型做接线，偏差会传播

**影响**：类型链断裂，Wave 2 接线时被迫修类型。

---

**M2：roleView 非判别联合，TypeScript 无法静态保证字段隔离**

```typescript
// price-data.ts
roleView: BuyerRoleView | SellerRoleView | AgentRoleView;
```

这不是 discriminated union，TypeScript 无法静态推断 `assessmentData.viewerRole === "buyer"` 意味着 `roleView` 一定是 `BuyerRoleView`。页面中使用 `as BuyerRoleView` 强制转换（page.tsx:496, 509, 519），运行时语义正确，但 TypeScript 编译器不验证此约束。

设计评审（REVIEW-043-DESIGN-CODEX.md Major #3）已将此列为结构问题。实现沿用了原有不安全模式。

正确写法应为：
```typescript
type PriceAssessmentResponse =
  | { viewerRole: "buyer";  roleView: BuyerRoleView;  ... }
  | { viewerRole: "seller"; roleView: SellerRoleView; ... }
  | { viewerRole: "agent";  roleView: AgentRoleView;  ... };
```

**影响**：若后端响应与 `viewerRole` 不同步，前端强转可产生运行时错误，且 TypeScript 无法在编译期捕获。

---

**M3：TrendPoint 与 CommunityListItem 字段名与 API spec 不对齐**

| 字段 | 设计 §3.2/3.4 API spec | 实现 price-data.ts |
|------|----------------------|-------------------|
| 趋势数据月度价格（当层级） | `tierPrice` | `currentTier` |
| 趋势数据月度价格（参考层级） | `comparePrice` | `compareTier` |
| 小区置信度 | `tierConfidence: number`（0-100 整数） | `confidence: ConfidenceLevel`（"high"\|"medium"\|"low" 字符串） |

Wave 2 前端接线时需要额外映射层。若跳过，会导致图表数据对不上 API 返回字段，属于隐性技术债。

---

### Minor

**m1：prebuild workaround 无注释**

```json
"prebuild": "mkdir -p .next/server && printf '{}' > .next/server/pages-manifest.json"
```

此脚本在 `next build` 前写入一个空的 `pages-manifest.json` stub，是 Next.js standalone 模式已知 bug 的规避手段。脚本无注释说明原因、关联 issue 或预期的 Next.js 版本修复窗口，后续维护者无法判断是否可以移除。

**m2：`marketStats` 和 `transactions` 仍为页面级硬编码**

`page.tsx` 第 53-63 行的市场统计和近期成交数组仍为硬编码。设计 §7.2 中无对应 E 编号，属于既有原型内容，但与 E6（因子数据源对齐 API）的精神不一致。不阻断 Wave 1，但 Wave 2 应补充 E 编号并替换。

**m3：`AgentRoleView.priceHistory` 超出 §4.2 类型定义**

实现在 `AgentRoleView`（price-data.ts:44）中添加了 `priceHistory: string`，设计 §4.1 矩阵中列出「调价历史」为经纪人可见字段，但 §4.2 `AgentRoleView` TypeScript 类型中未包含此字段。添加本身语义合理，但未同步设计文档，形成文档-代码分叉。

---

## E1-E13 逐项核查

| 编号 | 描述 | 实现状态 | 说明 |
|------|------|---------|------|
| E1 | 角色选择器，默认 buyer | ✅ 完整 | `page.tsx:50` `useState<PriceViewerRole>("buyer")` |
| E2 | 小区搜索框接入 `getCommunities(keyword, ...)` | ✅ 完整 | `page.tsx:57-59`，keyword + filter 双路径 |
| E3 | 三个模式卡片传入 `mode=community|unit|manual` | ✅ 完整 | `ModeCard` href 参数化 |
| E4 | 片区参考均价动态化 | ✅ 完整 | `referenceCommunity = communities[0]` |
| E5 | 详情页小区数据来自 `getCommunities()` | ✅ 完整 | `[communityId]/page.tsx:115-116`，Wave 1 mock 可接受 |
| E6 | 因子和价格逻辑来自 `evaluatePrice()` | ✅ 完整 | `assessmentData` 驱动全部价格展示 |
| E7 | 置信度 Badge，颜色 Token 正确 | ✅ 完整 | `ConfidenceBadge` 组件，三色 Token 与 §5.1 完全匹配 |
| E8 | 样本量展示，三档阈值正确 | ✅ 完整 | `SampleCountNotice`：≥30 不显示，15-29 中等提示，<15 警告色 |
| E9 | D-tier 警示条动态 sampleCount + 扩大搜索按钮 | ✅ 完整 | 动态注入，按钮路由 `/price?district=...&tier=C` 正确 |
| E10 | `RoleInsightBlock` 字段来源改为 `assessmentData.roleView` | ✅ 完整 | 三分支 role view 渲染，注释标注来源 |
| E11 | 历史走势图数据来自 `getTrend()` | ✅ 完整 | `trendPoints = getTrend(selectedCommunityId)` |
| E12 | 估价有效期提示 `expiresAt` | ✅ 完整 | 固定底栏上方，格式 `formatDateTime(expiresAt)` |
| E13 | `AgentAssistFab` 动态 prompts 按角色差异化 | ✅ 完整 | `getSuggestedPrompts()` 三角色独立 prompts |

---

## 三角色白名单核查

| 角色 | 正确字段 | 禁止字段（已隔离） | 测试覆盖 |
|------|---------|-----------------|---------|
| buyer | fairRangeLow/High, valueIndex, negotiationSuggestion, buyerMaxBudget | sellerFloorPrice ✅, commissionEstimate ✅ | test.ts:30 |
| seller | listingAdviceLow/High, competitorCount, estimatedDaysMin/Max, sellerFloorPrice | buyerMaxBudget ✅, commissionEstimate ✅ | test.ts:34 |
| agent | buyerFairRange, sellerListing, matchingSpread, commissionEstimate, competitorList | sellerFloorPrice ✅, buyerMaxBudget ✅ | test.ts:38 |

运行时隔离正确，测试以 `"field" in view` assertion 验证，无字段泄漏。

---

## 无关变更核查

- commit 9997840 已完整 revert `prototype/app/explore/dict/page.tsx`
- dict 页面当前状态：使用 `mockListings`、`mockAgents`，无定价相关代码注入
- **PASS**：无关变更已清理

---

## REQUIRED_CHANGES

以下变更为 CONDITIONAL_PASS 的前提条件，须在 FORI-044/045 接线前完成：

**RC1（Wave 2 前必须）**：对齐 `TrendPoint` 字段名至 API spec（`currentTier` → `tierPrice`，`compareTier` → `comparePrice`）；对齐 `CommunityListItem.confidence` 至 `tierConfidence: number`（或在 API 响应适配层做映射，并在设计文档中标注）。

**RC2（FORI-044 跟进）**：将 `BuyerRoleView | SellerRoleView | AgentRoleView` 重构为 discriminated union，消除 `as` 强转，使 TypeScript 静态保证角色隔离。

**RC3（文档对齐）**：补充 `hiddenFields: string[]` 字段至 TypeScript 类型定义，或在 FORI-043_DESIGN.md §4.2 明确注明此字段为 Wave 2 后端序列化控制字段、原型阶段不要求实现，二选一，消除设计-实现分叉。

以下为建议性修正，不阻断合并：

**RC4**：`prebuild` 脚本添加行内注释说明原因和关联 Next.js 版本，防止被误删。

**RC5**：`AgentRoleView.priceHistory` 同步至设计 §4.2 类型定义。

---

## BUILD_RECOMMENDATION

`prebuild` workaround（`printf '{}' > .next/server/pages-manifest.json`）是已知 Next.js standalone 模式 bug 的规避，**原型阶段可接受**，不应在生产构建中使用。

建议在 TECHNICAL_SOLUTION.md 中记录此依赖项和预期的移除时机，避免进入生产 Dockerfile。

**本次构建建议**：可进行 `next build` 验证，prebuild 会写入 stub 文件；如构建通过，CONDITIONAL_PASS 结论成立，RC1-RC3 在后续任务中跟进处理。

---

## 结论

FORI-043 Codex 实现覆盖了设计规格的核心功能点，三角色数据隔离和 D-tier 风险提示是本次实现的质量亮点。类型定义偏差是主要遗留问题，在 Wave 2 接线前按 RC1-RC3 修正即可合并。

*FORI-043 Impl Review · 2026-07-02 · Claude Code (epix)*
