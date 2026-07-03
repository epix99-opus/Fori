## VERDICT: CONDITIONAL_PASS

> **审查日期**: 2026-07-03  
> **审查人**: Claude Code (epix)  
> **分支**: `claude/fori-046-impl-review`  
> **依据设计**: `docs/execution/FORI-046_CORE_GAPS_DESIGN.md`  
> **前置评审**: `docs/reviews/REVIEW-046-DESIGN-CODEX.md` — PASS

---

## 总结

三大 Gap 均已实现且视觉完整。地图使用真实 `react-leaflet` + OSM，50 个 Pin 覆盖 8 城市；短视频三页流程完整（video → publish → reach）；CRM 提供漏斗可视化、买家/房东线索和详情页。发现 1 个 **Major** 问题（地图 Pin 交互被 flyTo 打断）和 3 个 **Minor** 问题，无 Critical。

---

## FINDINGS

### F1: CityFlyTo 在每次 render 触发，打断 Pin 点击交互

- **严重级别**: Major
- **证据**: `prototype/components/MapView.tsx:49-53`
- **描述**: `CityFlyTo` 组件在 render body 内直接调用 `map.flyTo()`，未包裹在 `useEffect` 中。每当任何 state 变化（如 `selectedCommunity`、`filterOpen`、`toast`）触发 re-render 时，地图都会飞回当前城市中心（duration 0.6s）。用户点击 Pin → 底部面板正确展示小区详情，但地图同时动画飞离 Pin 位置，严重干扰 Pin 交互体验。
- **影响范围**: 所有点击 Pin、筛选、打开/关闭 Filter Sheet 的操作

```tsx
// 当前（有问题）
function CityFlyTo({ city }: { city: City }) {
  const map = useMap();
  map.flyTo(CITY_CENTERS[city], city === "重庆" ? 11 : 12, { duration: 0.6 });
  return null;
}

// 应改为
function CityFlyTo({ city }: { city: City }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(CITY_CENTERS[city], city === "重庆" ? 11 : 12, { duration: 0.6 });
  }, [city, map]);
  return null;
}
```

---

### F2: 总价筛选使用预设 Chips 替代双端滑块

- **严重级别**: Minor
- **证据**: `prototype/components/MapView.tsx:221-226`
- **描述**: 设计规格 §1.5 要求"双端滑块（万元，范围 0~2000，步进 10）"，实现改为 6 个预设 Chip（不限/200万内/300万内/500万内/800万内/1200万内）。功能上可以过滤 Pin，但 UX 与设计存在差异；只能选上限而非自由范围。

---

### F3: 短视频页面默认 `ready` 状态，跳过 Idle 入口态

- **严重级别**: Minor
- **证据**: `prototype/app/marketing/video/page.tsx:26`
- **描述**: `useState<"idle" | "loading" | "ready">("ready")` 直接初始化为 `ready`，分镜脚本上屏时无需点击「AI 生成分镜脚本」按钮。设计规格 §2.3 定义的三态流程（Idle → Loading 900ms → Ready）在 Demo 时看不到完整入口流。可点击「重新生成」才能触发 loading 态。

---

### F4: 线索阶段筛选 Chips 仅含买家阶段，切换至房东 Tab 时失效

- **严重级别**: Minor
- **证据**: `prototype/app/workspace/agent/leads/page.tsx:14-20, 68-72`
- **描述**: `funnelStages` 仅定义买家漏斗阶段（new/following/appointed/converted/lost），在「房东线索」Tab 下点击「跟进中」筛选，结果为 0（房东阶段为 interested/agreed_list 等）。设计规格 §3.4 要求房东/买家 Tab 均有相应阶段过滤。

---

### F5: 北京区域列表缺少「东城」

- **严重级别**: Info
- **证据**: `prototype/lib/mock-map.ts:73`
- **描述**: Handoff 规格中北京有 8 个区域（含东城），实际实现仅 7 个（海淀/朝阳/昌平/大兴/西城/通州/丰台），缺少东城。无东城小区 Pin，筛选面板不显示东城 Chip，逻辑一致，仅与规格文档计数不符。

---

### F6: 地图搜索栏为纯展示占位

- **严重级别**: Info
- **证据**: `prototype/components/MapView.tsx:116-128`
- **描述**: 顶部搜索栏显示文字"搜索城市/小区/地址 · 当前 北京"，点击无反应，无输入框。原型可接受，生产阶段需替换为真实搜索。

---

## Gap 验收逐项核查

### Gap 1 — 地图

| 验收项 | 状态 | 备注 |
|--------|------|------|
| `react-leaflet` 真实地图（非 CSS 背景） | ✅ PASS | `MapContainer` + `TileLayer` OSM |
| ≥20 个 Pin，覆盖 ≥3 城市 | ✅ PASS | 50 个 Pin，8 城市 |
| 点击 Pin → 底部面板展示预览卡 | ⚠️ PASS* | 面板展示正确，但地图 flyTo 打断交互（F1） |
| 层级筛选过滤 Pin | ✅ PASS | A/B/C/D 多选 Chip |
| 区域筛选过滤 Pin | ✅ PASS | 随城市动态加载，切换城市自动重置 |
| 总价滑块按参考总价过滤 | ⚠️ PASS* | 功能正确，但改为预设 Chips（F2） |
| 城市切换 → 地图飞移 | ✅ PASS | `CityFlyTo` 切换城市有效（但每次 render 均触发，见 F1） |
| Pin → 预览卡 → [查看详情] → `/explore/dict/[id]` | ✅ PASS | `Link href={/explore/dict/${selectedCommunity.id}}` |
| 底部 OSM 注释 | ✅ PASS | "原型使用 OpenStreetMap + Mock 坐标；生产接入高德..." |
| `/explore/dict` 默认地图 Tab | ✅ PASS | `useState<DictViewMode>("map")` |

### Gap 2 — 短视频

| 验收项 | 状态 | 备注 |
|--------|------|------|
| `/marketing/video` 分镜脚本可见（≥4 个） | ✅ PASS | 6 个 `mockStoryboardScenes` |
| 点击生成 → loading 900ms → 展示 | ✅ PASS | `generate()` 触发，可通过「重新生成」验证 |
| `/marketing/publish` ≥2 渠道（含授权状态） | ✅ PASS | 5 渠道，抖音+视频号已授权，小红书/微博未授权 |
| 手动渠道（小红书）显示复制引导 | ✅ PASS | Step 4 有"小红书手动发布引导"橙色卡片 |
| 发布按钮 → 状态更新 | ✅ PASS | `publish()` 切换到 Step 4 显示各渠道状态 |
| `/marketing/reach` 总览数字 + ≥2 渠道卡 | ✅ PASS | 4 个渠道卡（抖音/视频号/小红书/朋友圈） |
| 线索归因列表 ≥3 条 | ✅ PASS | `mockReachLeads` 4 条 |
| 全部 3 页有 AgentAssistFab | ✅ PASS | video/publish/reach 均已部署 |

### Gap 3 — CRM

| 验收项 | 状态 | 备注 |
|--------|------|------|
| `/workspace/agent/leads` 漏斗可视化 | ✅ PASS | 5 阶段 CSS 进度条，纯 FunnelRow 组件 |
| 买家/房东 Tab 切换 | ✅ PASS | 3 个 Tab（买家/房东/全部） |
| 线索卡片 ≥5 条 | ✅ PASS | 18 条（12 买家 + 6 房东） |
| 阶段 Badge 颜色区分 | ✅ PASS | `getLeadStageMeta` 统一颜色映射 |
| `/workspace/agent/leads/[id]` 漏斗步骤条 | ✅ PASS | `stages.map` 竖向时间线，当前阶段高亮 |
| 跟进时间线 ≥2 条 | ✅ PASS | `activities` 渲染，空时提供占位条目 |
| 底部操作栏 4 按钮 | ✅ PASS | 记录/约看/房源/匹配 |
| 记录跟进 BottomSheet | ✅ PASS | 含方式选择/备注/保存 |
| `/workspace/agent/landlords` ≥3 张房东卡 | ✅ PASS | 6 条房东线索 |
| 房东漏斗阶段 Badge | ✅ PASS | `LANDLORD_STAGE_META` 独立配色 |
| 三个新路由均有 AgentAssistFab | ✅ PASS | leads/leads[id]/landlords 均已部署 |
| 阶段筛选 Chips 对房东 Tab 有效 | ❌ MINOR | 仅有买家阶段，房东 Tab 筛选失效（F4） |

---

## REQUIRED_CHANGES

### P0 — 必须在合并前修复（1 项）

**P0-1: 修复 `CityFlyTo` 触发时机**（对应 F1）

文件：`prototype/components/MapView.tsx`

```tsx
// 将 CityFlyTo 改为 useEffect 控制
import { useEffect } from "react";

function CityFlyTo({ city }: { city: City }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(CITY_CENTERS[city], city === "重庆" ? 11 : 12, { duration: 0.6 });
  }, [city, map]);
  return null;
}
```

### P1 — 建议在下次迭代修复（3 项）

**P1-1**: 线索阶段筛选 Chips 随 Tab 动态切换（F4）——当切换到「房东线索」Tab 时，显示房东漏斗阶段 Chips 而非买家阶段。

**P1-2**: 总价双端滑块（F2）——`prototype/components/MapView.tsx` 中的预设 Chips 替换为 `<input type="range">` 双端滑块，精度对齐设计规格。

**P1-3**: 短视频页面初始态（F3）——将 `useState("ready")` 改为 `useState("idle")`，完整展示 Idle → Loading → Ready 三态流程。
