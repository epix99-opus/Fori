# FORI-046 · Codex 实现 Handoff

> **任务**: FORI-046 核心产品 GAP 原型实现  
> **派发对象**: Codex woot  
> **版本**: 1.0 · 2026-07-03  
> **设计 SSOT**: `docs/execution/FORI-046_CORE_GAPS_DESIGN.md`  
> **前置条件**: 本文件发出后，Codex 评审设计文档（R1），评审 PASS 后才实现（I1-I3）

---

## 任务概述

补齐原型三大核心功能缺口，使 Fori 演示具备完整的地图找房体验、短视频制作流程和 CRM 线索跟踪。

**绝对约束**：
- 所有改动均在 `prototype/` 目录下进行
- `cd prototype && npm run build` 必须 PASS（0 TypeScript 错误）
- 不得留空白页面
- 实现完成后运行 build 验证

---

## Gap 1 — 地图核心房源字典

### 1.1 安装依赖

```bash
cd prototype
npm install leaflet react-leaflet @types/leaflet
```

### 1.2 新建文件

#### `prototype/lib/mock-map.ts`

```typescript
export interface CommunityPin {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  tier: "A" | "B" | "C" | "D";
  priceMin: number;      // 元/㎡，单价下限
  priceMax: number;      // 元/㎡，单价上限
  avgAreaSqm: number;    // 平均建筑面积（㎡）
  listingCount: number;
  maintainerCount: number;
}

// 参考总价推算（筛选和气泡显示均使用）
// totalPriceWan = (priceMin + priceMax) / 2 * avgAreaSqm / 10000

export const mockMapCommunities: CommunityPin[] = [
  // 北京 (12个)
  { id: "community-001", name: "中关村小区", city: "北京", district: "海淀", lat: 39.9800, lng: 116.3090, tier: "B", priceMin: 32000, priceMax: 38000, avgAreaSqm: 92, listingCount: 12, maintainerCount: 3 },
  { id: "community-002", name: "知春里", city: "北京", district: "海淀", lat: 39.9880, lng: 116.3340, tier: "C", priceMin: 26000, priceMax: 31000, avgAreaSqm: 78, listingCount: 8, maintainerCount: 2 },
  { id: "community-003", name: "上地嘉园", city: "北京", district: "海淀", lat: 40.0380, lng: 116.3080, tier: "A", priceMin: 44000, priceMax: 52000, avgAreaSqm: 135, listingCount: 5, maintainerCount: 4 },
  { id: "community-004", name: "万柳小区", city: "北京", district: "海淀", lat: 39.9650, lng: 116.2780, tier: "A", priceMin: 48000, priceMax: 58000, avgAreaSqm: 148, listingCount: 3, maintainerCount: 5 },
  { id: "community-005", name: "望京花园", city: "北京", district: "朝阳", lat: 40.0080, lng: 116.4780, tier: "B", priceMin: 35000, priceMax: 42000, avgAreaSqm: 95, listingCount: 18, maintainerCount: 2 },
  { id: "community-006", name: "三里屯SOHO附近", city: "北京", district: "朝阳", lat: 39.9360, lng: 116.4540, tier: "A", priceMin: 52000, priceMax: 68000, avgAreaSqm: 155, listingCount: 7, maintainerCount: 3 },
  { id: "community-007", name: "天通苑北", city: "北京", district: "昌平", lat: 40.0880, lng: 116.4120, tier: "C", priceMin: 18000, priceMax: 24000, avgAreaSqm: 82, listingCount: 32, maintainerCount: 1 },
  { id: "community-008", name: "回龙观东大街", city: "北京", district: "昌平", lat: 40.0680, lng: 116.3380, tier: "C", priceMin: 20000, priceMax: 26000, avgAreaSqm: 76, listingCount: 24, maintainerCount: 2 },
  { id: "community-009", name: "亦庄经济开发区", city: "北京", district: "大兴", lat: 39.7960, lng: 116.5060, tier: "B", priceMin: 28000, priceMax: 35000, avgAreaSqm: 89, listingCount: 15, maintainerCount: 2 },
  { id: "community-010", name: "西城金融街附近", city: "北京", district: "西城", lat: 39.9140, lng: 116.3580, tier: "A", priceMin: 58000, priceMax: 75000, avgAreaSqm: 140, listingCount: 4, maintainerCount: 6 },
  { id: "community-011", name: "通州运河旁", city: "北京", district: "通州", lat: 39.9020, lng: 116.6560, tier: "B", priceMin: 25000, priceMax: 32000, avgAreaSqm: 88, listingCount: 21, maintainerCount: 2 },
  { id: "community-012", name: "丰台科技园区", city: "北京", district: "丰台", lat: 39.8580, lng: 116.2780, tier: "B", priceMin: 30000, priceMax: 38000, avgAreaSqm: 90, listingCount: 11, maintainerCount: 3 },
  // 上海 (10个)
  { id: "community-013", name: "静安区域", city: "上海", district: "静安", lat: 31.2280, lng: 121.4480, tier: "A", priceMin: 68000, priceMax: 88000, avgAreaSqm: 128, listingCount: 6, maintainerCount: 5 },
  { id: "community-014", name: "浦东世纪公园旁", city: "上海", district: "浦东", lat: 31.2080, lng: 121.5380, tier: "B", priceMin: 42000, priceMax: 55000, avgAreaSqm: 98, listingCount: 14, maintainerCount: 3 },
  { id: "community-015", name: "徐汇漕河泾", city: "上海", district: "徐汇", lat: 31.1860, lng: 121.4200, tier: "B", priceMin: 48000, priceMax: 62000, avgAreaSqm: 105, listingCount: 9, maintainerCount: 4 },
  { id: "community-016", name: "张江高科", city: "上海", district: "浦东", lat: 31.2000, lng: 121.6020, tier: "B", priceMin: 38000, priceMax: 48000, avgAreaSqm: 93, listingCount: 17, maintainerCount: 2 },
  { id: "community-017", name: "闵行古美路", city: "上海", district: "闵行", lat: 31.1380, lng: 121.3880, tier: "C", priceMin: 28000, priceMax: 36000, avgAreaSqm: 80, listingCount: 22, maintainerCount: 1 },
  { id: "community-018", name: "长宁仙霞路", city: "上海", district: "长宁", lat: 31.2040, lng: 121.3940, tier: "B", priceMin: 52000, priceMax: 68000, avgAreaSqm: 110, listingCount: 8, maintainerCount: 3 },
  { id: "community-019", name: "嘉定新城", city: "上海", district: "嘉定", lat: 31.3760, lng: 121.2640, tier: "C", priceMin: 24000, priceMax: 32000, avgAreaSqm: 85, listingCount: 19, maintainerCount: 1 },
  { id: "community-020", name: "宝山顾村", city: "上海", district: "宝山", lat: 31.3480, lng: 121.3880, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 78, listingCount: 28, maintainerCount: 2 },
  { id: "community-021", name: "普陀长寿路", city: "上海", district: "普陀", lat: 31.2420, lng: 121.4100, tier: "B", priceMin: 44000, priceMax: 56000, avgAreaSqm: 97, listingCount: 12, maintainerCount: 3 },
  { id: "community-022", name: "陆家嘴金融城", city: "上海", district: "浦东", lat: 31.2360, lng: 121.5020, tier: "A", priceMin: 72000, priceMax: 98000, avgAreaSqm: 145, listingCount: 5, maintainerCount: 7 },
  // 广州 (7个)
  { id: "community-023", name: "天河北路", city: "广州", district: "天河", lat: 23.1480, lng: 113.3240, tier: "A", priceMin: 45000, priceMax: 58000, avgAreaSqm: 132, listingCount: 10, maintainerCount: 4 },
  { id: "community-024", name: "珠江新城花城", city: "广州", district: "天河", lat: 23.1160, lng: 113.3280, tier: "A", priceMin: 55000, priceMax: 72000, avgAreaSqm: 150, listingCount: 7, maintainerCount: 5 },
  { id: "community-025", name: "荔湾龙津西", city: "广州", district: "荔湾", lat: 23.1260, lng: 113.2480, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 75, listingCount: 16, maintainerCount: 1 },
  { id: "community-026", name: "白云嘉禾", city: "广州", district: "白云", lat: 23.1760, lng: 113.2600, tier: "B", priceMin: 28000, priceMax: 36000, avgAreaSqm: 88, listingCount: 20, maintainerCount: 2 },
  { id: "community-027", name: "海珠工业大道", city: "广州", district: "海珠", lat: 23.0880, lng: 113.2860, tier: "B", priceMin: 32000, priceMax: 42000, avgAreaSqm: 92, listingCount: 13, maintainerCount: 2 },
  { id: "community-028", name: "番禺万博", city: "广州", district: "番禺", lat: 22.9540, lng: 113.3140, tier: "B", priceMin: 25000, priceMax: 34000, avgAreaSqm: 95, listingCount: 25, maintainerCount: 2 },
  { id: "community-029", name: "黄埔科学城", city: "广州", district: "黄埔", lat: 23.1660, lng: 113.4380, tier: "B", priceMin: 22000, priceMax: 30000, avgAreaSqm: 87, listingCount: 18, maintainerCount: 1 },
  // 深圳 (7个)
  { id: "community-030", name: "南山科技园西", city: "深圳", district: "南山", lat: 22.5280, lng: 113.9620, tier: "A", priceMin: 58000, priceMax: 78000, avgAreaSqm: 138, listingCount: 8, maintainerCount: 5 },
  { id: "community-031", name: "福田中心区", city: "深圳", district: "福田", lat: 22.5400, lng: 114.0620, tier: "A", priceMin: 62000, priceMax: 82000, avgAreaSqm: 145, listingCount: 6, maintainerCount: 6 },
  { id: "community-032", name: "龙华民治大道", city: "深圳", district: "龙华", lat: 22.6320, lng: 114.0360, tier: "B", priceMin: 42000, priceMax: 55000, avgAreaSqm: 93, listingCount: 19, maintainerCount: 3 },
  { id: "community-033", name: "宝安西乡", city: "深圳", district: "宝安", lat: 22.5780, lng: 113.8840, tier: "C", priceMin: 28000, priceMax: 38000, avgAreaSqm: 82, listingCount: 24, maintainerCount: 2 },
  { id: "community-034", name: "罗湖东门", city: "深圳", district: "罗湖", lat: 22.5480, lng: 114.1180, tier: "C", priceMin: 32000, priceMax: 44000, avgAreaSqm: 79, listingCount: 15, maintainerCount: 1 },
  { id: "community-035", name: "光明新区", city: "深圳", district: "光明", lat: 22.7420, lng: 113.9360, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 84, listingCount: 30, maintainerCount: 1 },
  { id: "community-036", name: "坪山新区", city: "深圳", district: "坪山", lat: 22.6960, lng: 114.3520, tier: "D", priceMin: 18000, priceMax: 25000, avgAreaSqm: 68, listingCount: 12, maintainerCount: 1 },
  // 成都 (5个)
  { id: "community-037", name: "高新南区", city: "成都", district: "高新", lat: 30.5720, lng: 104.0680, tier: "A", priceMin: 22000, priceMax: 30000, avgAreaSqm: 118, listingCount: 15, maintainerCount: 3 },
  { id: "community-038", name: "天府新区兴隆湖", city: "成都", district: "天府新区", lat: 30.4420, lng: 104.0800, tier: "A", priceMin: 18000, priceMax: 28000, avgAreaSqm: 125, listingCount: 12, maintainerCount: 4 },
  { id: "community-039", name: "锦江区合江亭", city: "成都", district: "锦江", lat: 30.6720, lng: 104.1020, tier: "B", priceMin: 15000, priceMax: 22000, avgAreaSqm: 87, listingCount: 20, maintainerCount: 2 },
  { id: "community-040", name: "武侯祠大道", city: "成都", district: "武侯", lat: 30.6280, lng: 104.0480, tier: "B", priceMin: 16000, priceMax: 24000, avgAreaSqm: 90, listingCount: 18, maintainerCount: 2 },
  { id: "community-041", name: "郫都区", city: "成都", district: "郫都", lat: 30.7980, lng: 103.8940, tier: "C", priceMin: 10000, priceMax: 16000, avgAreaSqm: 76, listingCount: 8, maintainerCount: 1 },
  // 杭州 (4个)
  { id: "community-042", name: "西湖文化广场旁", city: "杭州", district: "拱墅", lat: 30.2940, lng: 120.1540, tier: "A", priceMin: 35000, priceMax: 48000, avgAreaSqm: 122, listingCount: 9, maintainerCount: 4 },
  { id: "community-043", name: "滨江区", city: "杭州", district: "滨江", lat: 30.2100, lng: 120.2100, tier: "B", priceMin: 28000, priceMax: 38000, avgAreaSqm: 94, listingCount: 16, maintainerCount: 3 },
  { id: "community-044", name: "余杭未来科技城", city: "杭州", district: "余杭", lat: 30.3220, lng: 120.0260, tier: "B", priceMin: 22000, priceMax: 32000, avgAreaSqm: 96, listingCount: 22, maintainerCount: 2 },
  { id: "community-045", name: "萧山区", city: "杭州", district: "萧山", lat: 30.1620, lng: 120.2680, tier: "C", priceMin: 18000, priceMax: 25000, avgAreaSqm: 82, listingCount: 14, maintainerCount: 1 },
  // 武汉 (3个)
  { id: "community-046", name: "光谷创业街", city: "武汉", district: "东湖高新", lat: 30.5000, lng: 114.4060, tier: "B", priceMin: 14000, priceMax: 20000, avgAreaSqm: 88, listingCount: 18, maintainerCount: 2 },
  { id: "community-047", name: "汉阳四新", city: "武汉", district: "汉阳", lat: 30.5640, lng: 114.2120, tier: "C", priceMin: 10000, priceMax: 15000, avgAreaSqm: 75, listingCount: 12, maintainerCount: 1 },
  { id: "community-048", name: "武昌区", city: "武汉", district: "武昌", lat: 30.5380, lng: 114.3020, tier: "B", priceMin: 13000, priceMax: 19000, avgAreaSqm: 90, listingCount: 15, maintainerCount: 2 },
  // 重庆 (2个)
  { id: "community-049", name: "渝中解放碑", city: "重庆", district: "渝中", lat: 29.5570, lng: 106.5760, tier: "B", priceMin: 12000, priceMax: 18000, avgAreaSqm: 85, listingCount: 10, maintainerCount: 2 },
  { id: "community-050", name: "南岸区", city: "重庆", district: "南岸", lat: 29.5200, lng: 106.5800, tier: "C", priceMin: 9000, priceMax: 14000, avgAreaSqm: 72, listingCount: 8, maintainerCount: 1 },
];

export const CITIES = ["北京", "上海", "广州", "深圳", "成都", "杭州", "武汉", "重庆"] as const;
export type City = typeof CITIES[number];

// 各城市可用区域列表（筛选面板动态渲染区域 Chip 使用）
export const CITY_DISTRICTS: Record<City, string[]> = {
  "北京": ["海淀", "朝阳", "昌平", "大兴", "西城", "东城", "通州", "丰台"],
  "上海": ["静安", "浦东", "徐汇", "闵行", "长宁", "嘉定", "宝山", "普陀"],
  "广州": ["天河", "荔湾", "白云", "海珠", "番禺", "黄埔"],
  "深圳": ["南山", "福田", "龙华", "宝安", "罗湖", "光明", "坪山"],
  "成都": ["高新", "天府新区", "锦江", "武侯", "郫都"],
  "杭州": ["拱墅", "滨江", "余杭", "萧山"],
  "武汉": ["东湖高新", "汉阳", "武昌"],
  "重庆": ["渝中", "南岸"],
};

export const CITY_CENTERS: Record<City, [number, number]> = {
  "北京": [39.9042, 116.4074],
  "上海": [31.2304, 121.4737],
  "广州": [23.1291, 113.2644],
  "深圳": [22.5431, 114.0579],
  "成都": [30.5728, 104.0668],
  "杭州": [30.2741, 120.1551],
  "武汉": [30.5928, 114.3055],
  "重庆": [29.5630, 106.5516],
};
```

### 1.3 改写 `prototype/app/explore/map/page.tsx`

完全重写此文件，使用 `react-leaflet` 实现真实地图。

**关键实现要点**：
1. `dynamic import` 避免 SSR 问题：

```typescript
// 在文件顶部
"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
```

2. 创建 `prototype/components/MapView.tsx`（client-only 组件）：
   - `MapContainer` from `react-leaflet`
   - `TileLayer` with OSM URL
   - `Marker` + 自定义 `DivIcon` for each community pin
   - `useMap()` for city center flyTo
   - 点击 Pin 时更新 `selectedCommunity` state
   - 底部上拉面板（`selectedCommunity` 展示）

3. 地图容器必须有固定高度（例如 `h-[60vh]` 或 `calc(100dvh - 200px)`）

**页面结构**：
```
/explore/map/page.tsx (Server Component wrapper)
  → dynamic import MapView (Client Component)
    → MapContainer (leaflet)
      → TileLayer (OSM)
      → communityPins.map(pin => <Marker .../>)
    → 顶部搜索栏 (固定)
    → 模式 Tab 栏（地图/卡片/列表）
    → 筛选 Bottom Sheet
    → 底部上拉面板（选中小区详情）
    → 底部 OSM 注释条
```

**筛选逻辑**：
```typescript
const [selectedCity, setSelectedCity] = useState<City>("北京");
const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);  // 空数组 = 不过滤（全选）
const [selectedTiers, setSelectedTiers] = useState<string[]>(["A","B","C","D"]);
const [maxTotalPriceWan, setMaxTotalPriceWan] = useState<number | null>(null); // 万元总价上限

// 参考总价公式：(priceMin + priceMax) / 2 × avgAreaSqm ÷ 10000
const getTotalPriceWan = (pin: CommunityPin): number =>
  (pin.priceMin + pin.priceMax) / 2 * pin.avgAreaSqm / 10000;

// 切换城市时重置区域（城市 ⊃ 区域，父变子清零）
const handleCityChange = (city: City) => {
  setSelectedCity(city);
  setSelectedDistricts([]);
};

const filteredPins = useMemo(() =>
  mockMapCommunities.filter(pin =>
    pin.city === selectedCity &&
    (selectedDistricts.length === 0 || selectedDistricts.includes(pin.district)) &&
    selectedTiers.includes(pin.tier) &&
    (maxTotalPriceWan === null || getTotalPriceWan(pin) <= maxTotalPriceWan)
  ), [selectedCity, selectedDistricts, selectedTiers, maxTotalPriceWan]
);
```

**Pin 气泡 DivIcon**（层级颜色）：
```typescript
const TIER_COLORS = { A: "#1A4B82", B: "#2563EB", C: "#D97706", D: "#6B7280" };

function createPinIcon(pin: CommunityPin, isSelected: boolean) {
  return L.divIcon({
    html: `<div style="background:white;border:2px solid ${TIER_COLORS[pin.tier]};
            border-radius:8px;padding:4px 8px;font-size:11px;font-weight:600;
            white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.12);
            ${isSelected ? 'transform:scale(1.1)' : ''}">
            ${pin.name}<br>
            <span style="color:${TIER_COLORS[pin.tier]}">${pin.tier}层</span>
            <span style="color:#6B7280"> ¥${(pin.priceMin/1000).toFixed(0)}k起</span>
           </div>`,
    className: "",
    iconAnchor: [0, 0],
  });
}
```

**底部注释条**（fixed bottom，在 Tab Bar 上方）：
```tsx
<div className="border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-center text-caption text-neutral-400">
  原型使用 OpenStreetMap + Mock 坐标；生产接入高德/腾讯/百度 JS API + 开源底图业务数据层
</div>
```

### 1.4 改写 `/explore/dict` 默认 Tab

在 `prototype/app/explore/dict/page.tsx` 找到 ViewModeToggle 或模式切换逻辑，将「地图」设为默认展示（或确保「地图」Tab 是第一个并默认选中）。

### 1.5 CSS 注意

在 `prototype/app/globals.css` 或组件内添加 Leaflet 样式：
```typescript
// 在 MapView.tsx 顶部
import "leaflet/dist/leaflet.css";
```

---

## Gap 2 — 短视频素材制作与自媒体触达

### 2.1 新建 Mock 数据

创建 `prototype/lib/mock-reach.ts`（内容参见设计文档 §2.3）：

```typescript
export interface ChannelReach {
  channel: "douyin" | "weixin_video" | "xiaohongshu" | "weibo" | "manual";
  channelName: string;
  channelIcon: string;  // emoji or icon name
  exposure: number;
  clicks: number;
  leads: number;
  interactions: { likes: number; comments: number; shares: number };
  topPostTime?: string;
  bestClickRate?: number;
  isAuthorized: boolean;
  accountName?: string;
  apiSupported: boolean;  // false = 手动发布渠道
}

export interface ReachLead {
  id: string;
  name: string;
  channel: string;
  need: string;
  createdAt: string;
  status: "new" | "following" | "appointed" | "converted" | "lost";
}

// 填充 Mock 数据（参见设计文档 §2.3）
export const mockChannelReach: ChannelReach[] = [ /* ... */ ];
export const mockReachLeads: ReachLead[] = [ /* ... */ ];
```

### 2.2 新建页面文件

#### `prototype/app/marketing/video/page.tsx`

内容规格（详见 FORI-046_CORE_GAPS_DESIGN.md §2.3）：
- Section 1：房源信息 + 视频类型选择（3 种 Radio Card）
- Section 2：分镜脚本（点击「AI 生成」→ 900ms loading → 显示 ≥ 4 个分镜卡）
- Section 3：视频参数（折叠卡）
- 底部固定 CTA：预览草稿 / 保存草稿 / 下一步发布渠道
- AgentAssistFab（pageContext="短视频制作工作台"）

**分镜卡片样式**：
```tsx
<div className="rounded-xl border border-neutral-200 bg-white p-3">
  <div className="flex items-center gap-2 text-caption font-semibold text-neutral-500">
    <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs">{scene.index}</span>
    {scene.label}
    <span className="ml-auto text-neutral-400">{scene.startSec}s-{scene.endSec}s</span>
  </div>
  <p className="mt-2 text-body-s text-neutral-900">{scene.caption}</p>
  <p className="mt-1 text-caption text-neutral-400">运镜：{scene.cameraMove}</p>
</div>
```

#### `prototype/app/marketing/publish/page.tsx`

内容规格（详见设计文档 §2.3）：
- Stepper 4 步：选素材 → 选渠道 → 发布设置 → 发布状态
- 步骤 2 必须展示 ≥ 2 个渠道（1 个已授权、1 个未授权）
- 未授权渠道用 🔴 标记 + [授权登录] 按钮
- 手动渠道（小红书）显示「仅支持复制文案后手动发布」说明
- 发布后展示各渠道状态（成功/进行中/手动）
- AgentAssistFab

#### `prototype/app/marketing/reach/page.tsx`

内容规格（详见设计文档 §2.3）：
- 顶部总览卡（蓝色渐变背景）：本周曝光/点击/线索
- 各渠道分析卡列表（≥ 2 个）
- 手动渠道卡（说明无法统计）
- 线索归因列表（≥ 3 条）
- AgentAssistFab

### 2.3 添加 workspace re-exports

```typescript
// prototype/app/workspace/media/video/page.tsx
export { default } from "../../../marketing/video/page";

// prototype/app/workspace/media/publish/page.tsx
export { default } from "../../../marketing/publish/page";

// prototype/app/workspace/media/reach/page.tsx
export { default } from "../../../marketing/reach/page";
```

### 2.4 从现有页面添加导航链接

在 `prototype/app/marketing/generate/page.tsx` 中，「短视频脚本」类型选中后，在底部或结果区增加 [短视频制作工作台 →] 链接指向 `/marketing/video`。

在 `prototype/app/marketing/manage/page.tsx` 的页头 + 按钮区，增加 [触达分析] 链接指向 `/marketing/reach`。

---

## Gap 3 — 潜在客户与房东信息跟踪与转化

### 3.1 新建 Mock 数据

创建 `prototype/lib/mock-leads.ts`：

```typescript
export type LeadType = "buyer" | "landlord";
export type BuyerStage = "new" | "following" | "appointed" | "negotiating" | "signing" | "converted" | "lost";
export type LandlordStage = "contacted" | "interested" | "agreed_list" | "listing_review" | "listed" | "sold";
export type LeadStage = BuyerStage | LandlordStage;

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  phone: string;
  source: "platform_match" | "media_reach" | "manual" | "referral";
  sourceDetail: string;
  stage: LeadStage;
  probability: number;
  need: string;
  expectedValue: string;
  lastContact: string;
  nextAction?: string;
  nextActionDate?: string;
  activities: LeadActivity[];
}

export interface LeadActivity {
  id: string;
  type: "call" | "wechat" | "visit" | "house_view" | "listing" | "note";
  time: string;
  summary: string;
  durationMin?: number;
}

// 12 条买家线索 + 6 条房东线索，覆盖所有漏斗阶段
export const mockLeads: Lead[] = [
  // 买家线索
  { id: "lead-001", type: "buyer", name: "周先生", phone: "138****5678", source: "platform_match", sourceDetail: "P1 匹配 07-01", stage: "following", probability: 78, need: "海淀三居 · 260-320 万", expectedValue: "2.8-3.6 万佣金", lastContact: "2026-07-01", nextAction: "约看房", nextActionDate: "2026-07-05 15:00",
    activities: [
      { id: "a1", type: "call", time: "2026-07-01 14:30", summary: "通话 10 分钟，客户对学区需求较高，预算可弹性到 340 万。", durationMin: 10 },
      { id: "a2", type: "note", time: "2026-07-01 10:20", summary: "来源：平台 P1 匹配推送" },
    ]
  },
  { id: "lead-002", type: "buyer", name: "何女士", phone: "139****4321", source: "platform_match", sourceDetail: "P2 匹配 06-28", stage: "appointed", probability: 64, need: "知春路两居 · 近地铁 · 200-240 万", expectedValue: "1.9-2.4 万佣金", lastContact: "2026-07-02",
    activities: [
      { id: "a3", type: "house_view", time: "2026-07-02 10:00", summary: "看了知春里 2 室，客户表示满意，需与家人商量。" },
    ]
  },
  { id: "lead-003", type: "buyer", name: "陈先生", phone: "136****8888", source: "manual", sourceDetail: "老客户介绍", stage: "new", probability: 45, need: "改善三居 · 学区优先 · 300 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-03",
    activities: []
  },
  { id: "lead-004", type: "buyer", name: "刘女士", phone: "137****2233", source: "media_reach", sourceDetail: "来自抖音推广", stage: "following", probability: 55, need: "浦东两居 · 50-70㎡", expectedValue: "1.5-2.0 万佣金", lastContact: "2026-07-02",
    activities: [
      { id: "a4", type: "wechat", time: "2026-07-02 16:30", summary: "微信沟通，发送了 3 套备选房源。" },
    ]
  },
  { id: "lead-005", type: "buyer", name: "王先生", phone: "135****5566", source: "platform_match", sourceDetail: "P1 匹配 06-25", stage: "negotiating", probability: 85, need: "天河改善四居 · 400-500 万", expectedValue: "4.0-5.0 万佣金", lastContact: "2026-07-01",
    activities: [
      { id: "a5", type: "house_view", time: "2026-06-28 14:00", summary: "看了珠江新城物业，满意。" },
      { id: "a6", type: "call", time: "2026-07-01 11:00", summary: "议价中，卖方报 480 万，客户出 460 万，协调中。", durationMin: 20 },
    ]
  },
  { id: "lead-006", type: "buyer", name: "张先生", phone: "133****7788", source: "referral", sourceDetail: "成交客户介绍", stage: "converted", probability: 100, need: "已成交 · 高新两居", expectedValue: "已成交 ¥1.8 万", lastContact: "2026-07-01",
    activities: [
      { id: "a7", type: "note", time: "2026-07-01 15:00", summary: "成交！高新南区 78㎡ 两居，成交价 198 万。" },
    ]
  },
  { id: "lead-007", type: "buyer", name: "李先生", phone: "158****3344", source: "media_reach", sourceDetail: "来自视频号", stage: "new", probability: 30, need: "宝安刚需两居 · 150 万以内", expectedValue: "1.0-1.5 万佣金", lastContact: "2026-07-03", activities: [] },
  { id: "lead-008", type: "buyer", name: "赵女士", phone: "181****4455", source: "platform_match", sourceDetail: "P3 匹配 06-30", stage: "lost", probability: 0, need: "已流失 · 已自行成交", expectedValue: "无", lastContact: "2026-07-02",
    activities: [{ id: "a8", type: "note", time: "2026-07-02 09:00", summary: "客户告知已通过其他中介成交。" }]
  },
  { id: "lead-009", type: "buyer", name: "孙先生", phone: "139****6677", source: "manual", sourceDetail: "微信私域引流", stage: "following", probability: 60, need: "天通苑三居 · 200-260 万", expectedValue: "2.0-2.8 万佣金", lastContact: "2026-07-02", activities: [
    { id: "a9", type: "call", time: "2026-07-02 19:00", summary: "晚上电话，确认了预算上限 280 万。", durationMin: 8 },
  ]},
  { id: "lead-010", type: "buyer", name: "吴女士", phone: "135****9900", source: "platform_match", sourceDetail: "P2 匹配 07-02", stage: "new", probability: 40, need: "福田三居 · 学区 · 450 万以内", expectedValue: "3.5-4.5 万佣金", lastContact: "2026-07-02", activities: [] },
  { id: "lead-011", type: "buyer", name: "郑先生", phone: "186****1122", source: "media_reach", sourceDetail: "来自小红书", stage: "following", probability: 50, need: "静安两居 · 精装 · 500 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-01",
    activities: [{ id: "a10", type: "wechat", time: "2026-07-01 20:00", summary: "微信收到咨询，已发送 2 套精装房源。" }]
  },
  { id: "lead-012", type: "buyer", name: "林女士", phone: "177****3344", source: "manual", sourceDetail: "门店来访", stage: "appointed", probability: 70, need: "余杭三居 · 地铁 · 300 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-02",
    activities: [{ id: "a11", type: "visit", time: "2026-07-02 14:00", summary: "门店来访，沟通了需求，约好 7-6 看房。" }]
  },
  // 房东线索
  { id: "lead-013", type: "landlord", name: "李女士", phone: "158****6699", source: "referral", sourceDetail: "老客户介绍", stage: "interested", probability: 65, need: "出售 · 海淀三居 · 约 280 万", expectedValue: "约 2.8 万佣金", lastContact: "2026-07-02",
    activities: [{ id: "a12", type: "call", time: "2026-07-02 11:00", summary: "了解了挂牌意向，3 个月内考虑出售。", durationMin: 15 }]
  },
  { id: "lead-014", type: "landlord", name: "张先生", phone: "139****5511", source: "media_reach", sourceDetail: "来自抖音", stage: "contacted", probability: 30, need: "出租 · 南山两居 · 月租 6000", expectedValue: "约 6000 元/月佣金 50%", lastContact: "2026-07-03", activities: [] },
  { id: "lead-015", type: "landlord", name: "王女士", phone: "136****8822", source: "platform_match", sourceDetail: "系统推荐", stage: "agreed_list", probability: 80, need: "出售 · 天河改善四居 · 约 460 万", expectedValue: "约 4.6 万佣金", lastContact: "2026-07-01",
    activities: [
      { id: "a13", type: "visit", time: "2026-07-01 15:00", summary: "上门核实房源，房主同意挂牌，待资料补全。" },
    ]
  },
  { id: "lead-016", type: "landlord", name: "陈先生", phone: "181****2233", source: "manual", sourceDetail: "社区活动结识", stage: "listing_review", probability: 85, need: "出售 · 高新两居 · 约 200 万", expectedValue: "约 2.0 万佣金", lastContact: "2026-06-30",
    activities: [{ id: "a14", type: "listing", time: "2026-06-30 09:00", summary: "已提交房源信息，核验中。" }]
  },
  { id: "lead-017", type: "landlord", name: "刘女士", phone: "135****4455", source: "referral", sourceDetail: "朋友介绍", stage: "listed", probability: 90, need: "出售 · 渝中两居 · 约 130 万", expectedValue: "约 1.3 万佣金", lastContact: "2026-07-02",
    activities: [{ id: "a15", type: "listing", time: "2026-07-02 14:00", summary: "房源已上架，等待买家匹配。" }]
  },
  { id: "lead-018", type: "landlord", name: "孙先生", phone: "139****7788", source: "platform_match", sourceDetail: "系统推荐", stage: "sold", probability: 100, need: "已成交 · 知春里三居 · 296 万", expectedValue: "已成交 ¥2.96 万", lastContact: "2026-07-01",
    activities: [{ id: "a16", type: "note", time: "2026-07-01 16:00", summary: "成交！买家周先生，296 万成交。" }]
  },
];

export const BUYER_STAGE_META: Record<string, { label: string; color: string }> = {
  new: { label: "新线索", color: "bg-neutral-200 text-neutral-700" },
  following: { label: "跟进中", color: "bg-blue-100 text-blue-700" },
  appointed: { label: "已约看", color: "bg-orange-100 text-orange-700" },
  negotiating: { label: "谈判中", color: "bg-yellow-100 text-yellow-700" },
  signing: { label: "签约中", color: "bg-purple-100 text-purple-700" },
  converted: { label: "已成交", color: "bg-green-100 text-semantic-success" },
  lost: { label: "已流失", color: "bg-red-100 text-semantic-danger" },
};

export const LANDLORD_STAGE_META: Record<string, { label: string; color: string }> = {
  contacted: { label: "初步接触", color: "bg-neutral-200 text-neutral-700" },
  interested: { label: "有意向", color: "bg-blue-100 text-blue-700" },
  agreed_list: { label: "同意挂牌", color: "bg-orange-100 text-orange-700" },
  listing_review: { label: "房源审核", color: "bg-yellow-100 text-yellow-700" },
  listed: { label: "已上架", color: "bg-purple-100 text-purple-700" },
  sold: { label: "已成交", color: "bg-green-100 text-semantic-success" },
};
```

### 3.2 新建页面文件

#### `prototype/app/workspace/agent/leads/page.tsx`

内容规格（详见 FORI-046_CORE_GAPS_DESIGN.md §3.4）：

**必须包含**：
1. 顶部漏斗统计面板（蓝色渐变背景）：
   - 本月新增/跟进中/已成交 三个数字
   - 漏斗进度条组（5 阶段，用横向 CSS 进度条，不用 ECharts）
   - 转化率 + 平均跟进天数
2. Tab 切换：[买家线索 (N)] [房东线索 (N)] [全部]
3. 线索卡片列表（从 `mockLeads` 取数据，按 Tab 过滤）
4. 每张卡片：姓名+阶段 Badge / 来源+时间 / 需求 / 上次跟进 / 下次动作 / 成交概率条 / 操作按钮
5. 空状态（无线索时）
6. `AgentAssistFab`

漏斗统计计算：
```typescript
const buyerLeads = mockLeads.filter(l => l.type === "buyer");
const funnelStages = [
  { stage: "new", label: "新线索", count: buyerLeads.filter(l => l.stage === "new").length },
  { stage: "following", label: "跟进中", count: buyerLeads.filter(l => l.stage === "following").length },
  { stage: "appointed", label: "已约看", count: buyerLeads.filter(l => l.stage === "appointed").length },
  { stage: "converted", label: "转化", count: buyerLeads.filter(l => l.stage === "converted").length },
  { stage: "lost", label: "流失", count: buyerLeads.filter(l => l.stage === "lost").length },
];
```

#### `prototype/app/workspace/agent/leads/[id]/page.tsx`

内容规格（设计文档 §3.4）：

**必须包含**：
1. 顶部客户信息卡（姓名/阶段/来源/需求/意向强度/联系方式）
2. 漏斗进度步骤条（竖向时间线，当前阶段高亮）
3. 跟进记录时间线（从 activities 渲染，≥ 2 条）
4. 底部固定操作栏：[记录跟进] [约看房] [推荐房源] [查看匹配]
5. 记录跟进 Bottom Sheet（点击后弹出）：跟进方式/时间/备注/阶段更新
6. `AgentAssistFab`

路由参数：`{ params: { id: string } }`，从 `mockLeads.find(l => l.id === id)` 取数据。

#### `prototype/app/workspace/agent/landlords/page.tsx`

内容规格（设计文档 §3.4）：

**必须包含**：
1. 顶部统计面板：本月接触/有意向/已上架 三个数字
2. 来源分布（简单横向 badge 列表）
3. 房东线索卡片列表（从 `mockLeads.filter(l => l.type === "landlord")` 取）
4. 每张卡片：姓名/阶段 Badge / 房源信息 / 联系时间/来源 / 意向说明 / 操作按钮
5. [手动录入房东线索] CTA（弹出 Toast 占位）
6. `AgentAssistFab`

### 3.3 改造现有 `/workspace/agent/buyers/page.tsx`

在现有页面顶部增加：
- 一行链接到新的线索总台：「查看完整 CRM 漏斗 → /workspace/agent/leads」
- 修改 Header 中「客源管理」改为「买家快速视图」
- 保留现有卡片（保持向后兼容）

---

## 验证清单（Codex 提交前必须通过）

```bash
cd prototype

# 1. 依赖安装
npm install leaflet react-leaflet @types/leaflet

# 2. TypeScript 类型检查
npx tsc --noEmit

# 3. Build 验证
npm run build
# 预期：0 errors，路由数量 ≥ 42（原 36 + 新增 6+）

# 4. 手动检查新路由存在于 build 输出
# 应包含：
# /explore/map, /marketing/video, /marketing/publish, /marketing/reach
# /workspace/agent/leads, /workspace/agent/leads/[id], /workspace/agent/landlords
```

### 每个新路由验收检查表

| 路由 | 检查项 |
|------|--------|
| `/explore/map` | 地图可见（非 CSS 背景）/ ≥ 20 个 Pin / 点击 Pin 弹出预览卡 / 筛选有效 / 注释条可见 |
| `/marketing/video` | 视频类型选择可用 / 点击生成后显示分镜列表（≥ 4 条）/ 底部 CTA 可点击 |
| `/marketing/publish` | 渠道列表（≥ 2 个，含授权状态）/ 发布按钮可点击 / 状态更新 |
| `/marketing/reach` | 总览数字可见 / ≥ 2 个渠道卡 / 线索列表（≥ 3 条）|
| `/workspace/agent/leads` | 漏斗条可见 / Tab 切换 / 线索卡片（≥ 5 条）|
| `/workspace/agent/leads/[id]` | 漏斗步骤条 / 跟进时间线（≥ 2 条）/ 底部操作栏 |
| `/workspace/agent/landlords` | 房东卡片（≥ 3 条）/ 统计面板 |

### Agent FAB suggestedPrompts（所有新页面必须有）

```typescript
// /explore/map
suggestedPrompts={["北京海淀有哪些 A 级小区？", "深圳南山的参考总价区间是多少？", "筛选海淀 B 级总价 300 万以内的小区"]}

// /marketing/video
suggestedPrompts={["帮我生成一个 30 秒的沉浸式浏览脚本", "这套房最适合哪种推广方向？", "分镜需要调整节奏，怎么改？"]}

// /marketing/publish
suggestedPrompts={["抖音发布最佳时间是什么时候？", "小红书没有 API 怎么手动发？", "如何让视频号获得更多曝光？"]}

// /marketing/reach
suggestedPrompts={["哪个渠道效果最好？", "如何提升点击转化率？", "手动录入一条来自朋友圈的线索"]}

// /workspace/agent/leads
suggestedPrompts={["哪几个线索最有可能近期成交？", "跟进中的客户多久没联系了？", "帮我分析转化率偏低的原因"]}

// /workspace/agent/leads/[id]
suggestedPrompts={["帮我准备一个约看房的话术", "这个客户的购房意向评分是多少？", "记录一条电话跟进"]}

// /workspace/agent/landlords
suggestedPrompts={["哪个房东最近最有可能挂牌？", "帮我写一个拜访话术", "有多少房东还没有录入房源？"]}
```

---

## 注意事项

1. **Leaflet SSR 问题**：`react-leaflet` 的 `MapContainer` 不支持 SSR，必须使用 `next/dynamic` 的 `{ ssr: false }` 包裹，否则 build 会报错。

2. **Leaflet CSS**：必须在 client-only 组件中 `import "leaflet/dist/leaflet.css"`，不要在 globals.css 中导入（可能导致 SSR 报错）。

3. **Default Marker Icon 问题**：Leaflet 在 webpack 打包环境下默认 marker icon 可能不显示。使用自定义 `L.divIcon` 代替 default marker，避免此问题。

4. **TypeScript**：所有新文件必须有明确类型定义，禁止使用 `any`。

5. **页面不得为空**：每个新路由在正常状态下必须有可见内容，空状态要使用 `EmptyState` 组件而不是空白页。

6. **复用现有组件**：优先使用 `Card`, `Button`, `Input`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `AgentAssistFab` 等已有组件，不要重复造轮子。
