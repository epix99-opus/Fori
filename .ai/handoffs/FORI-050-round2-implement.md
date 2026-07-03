# FORI-050 · Round 2 R2 原型实现 Handoff

> **派发**: Cursor → Codex (woot)  
> **分支**: `codex/fori-052-round2-r2-implement`  
> **依据**: `docs/execution/ROUND2_R1_MERGED.md`（R1 合并后）或本 handoff + 设计子文档  
> **模型**: `gpt-5.5 --yolo`（复杂 UI）

---

## 任务总览

| ID | 标题 | 优先级 | 主要文件 |
|----|------|--------|---------|
| FORI-087 | 贡献账本与首建者标签 UI | P1 | `prototype/app/explore/dict/[communityId]/page.tsx`, edit |
| FORI-088 | 成交分成瀑布图 Mock | P1 | `prototype/app/transaction/[id]/page.tsx` |
| FORI-090 | 价格页三角色差异化 | P1 | `prototype/app/price/[communityId]/page.tsx` |
| FORI-091 | 匹配撮合 4h 窗口 + 状态机 | P1 | `prototype/app/match/page.tsx` |
| FORI-093 | Agent FAB 全站关键页 | P1 | 多页面 + `AgentAssistFab.tsx` |

---

## FORI-087 — 贡献账本

**参考**: `docs/CO_CREATION_FISSION.md` §3-4

### 验收标准
- [ ] 小区详情页显示「首建者」标签（姓名+日期 Mock）
- [ ] Top3 维护者排行卡片（近90天积分 Mock）
- [ ] 贡献账本列表 ≥5 条 Mock 记录（动作/积分/状态）
- [ ] 编辑页显示当前用户累计积分

### Mock 数据
```typescript
const mockContributions = [
  { actor: "李四", action: "首建小区", points: 100, date: "2026-01-15" },
  { actor: "王五", action: "修订物业信息", points: 15, date: "2026-02-20" },
];
```

---

## FORI-088 — 分成瀑布图

**参考**: `docs/CO_CREATION_FISSION.md` §5.3

### 验收标准
- [ ] 交易详情页新增「收益分成」区块
- [ ] 瀑布图展示 5+ 分成项（平台/推广/信息/带看/全程）
- [ ] 信息贡献费可展开子项（首建者/协作者）
- [ ] 使用现有 ChartCard 或 CSS 条形图

---

## FORI-090 — 价格三角色

**参考**: `docs/PRICING_MATCHING.md` §3

### 验收标准
- [ ] 价格详情页顶部 Tab：买家 / 卖家 / 经纪人
- [ ] 买家：公允区间 + 议价建议（隐藏底价）
- [ ] 卖家：挂牌建议 + 竞品对比
- [ ] 经纪人：完整因子 + 双方区间 + 佣金预估
- [ ] 与 `viewer-role.ts` 可联动或独立 Tab

---

## FORI-091 — 撮合状态机

**参考**: `docs/PRICING_MATCHING.md` §4

### 验收标准
- [ ] 匹配页步骤条：匹配→响应→带看→议价→签约
- [ ] P1 客源卡片显示 4h 倒计时（Mock 从当前时间+4h）
- [ ] 「立即响应」「拒绝」按钮 + 状态变更 Mock
- [ ] 超时态样式（灰色+已转分配文案）

---

## FORI-093 — Agent FAB 铺开

**参考**: `docs/AGENT_PAGE_CONTRACTS.md` §3

### 验收标准
- [ ] FAB 添加到：listing, price, match, publish/listing, workspace/agent, transaction
- [ ] 每页 `suggestedPrompts` 不同（≥3 条）
- [ ] 三模态 Tab UI（文字/语音/拍摄）可切换（交互 Mock，无需真 ASR）
- [ ] 不破坏现有布局（z-index 50, bottom-24）

---

## 构建验证

```bash
cd prototype && npm run build
```

必须 PASS，无 TypeScript 错误。

---

## 禁止

- 不修改 `docs/` 设计原文（除非修复明显笔误）
- 不合并 main
- Commit: `feat: FORI-0XX description [codex]`

---

*Handoff · R2 实现 · Codex woot*
