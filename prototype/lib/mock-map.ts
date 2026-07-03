export interface CommunityPin {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  tier: "A" | "B" | "C" | "D";
  priceMin: number;
  priceMax: number;
  avgAreaSqm: number;
  listingCount: number;
  maintainerCount: number;
}

export const mockMapCommunities: CommunityPin[] = [
  { id: "community-001", name: "中关村小区", city: "北京", district: "海淀", lat: 39.98, lng: 116.309, tier: "B", priceMin: 32000, priceMax: 38000, avgAreaSqm: 92, listingCount: 12, maintainerCount: 3 },
  { id: "community-002", name: "知春里", city: "北京", district: "海淀", lat: 39.988, lng: 116.334, tier: "C", priceMin: 26000, priceMax: 31000, avgAreaSqm: 78, listingCount: 8, maintainerCount: 2 },
  { id: "community-003", name: "上地嘉园", city: "北京", district: "海淀", lat: 40.038, lng: 116.308, tier: "A", priceMin: 44000, priceMax: 52000, avgAreaSqm: 135, listingCount: 5, maintainerCount: 4 },
  { id: "community-004", name: "万柳小区", city: "北京", district: "海淀", lat: 39.965, lng: 116.278, tier: "A", priceMin: 48000, priceMax: 58000, avgAreaSqm: 148, listingCount: 3, maintainerCount: 5 },
  { id: "community-005", name: "望京花园", city: "北京", district: "朝阳", lat: 40.008, lng: 116.478, tier: "B", priceMin: 35000, priceMax: 42000, avgAreaSqm: 95, listingCount: 18, maintainerCount: 2 },
  { id: "community-006", name: "三里屯SOHO附近", city: "北京", district: "朝阳", lat: 39.936, lng: 116.454, tier: "A", priceMin: 52000, priceMax: 68000, avgAreaSqm: 155, listingCount: 7, maintainerCount: 3 },
  { id: "community-007", name: "天通苑北", city: "北京", district: "昌平", lat: 40.088, lng: 116.412, tier: "C", priceMin: 18000, priceMax: 24000, avgAreaSqm: 82, listingCount: 32, maintainerCount: 1 },
  { id: "community-008", name: "回龙观东大街", city: "北京", district: "昌平", lat: 40.068, lng: 116.338, tier: "C", priceMin: 20000, priceMax: 26000, avgAreaSqm: 76, listingCount: 24, maintainerCount: 2 },
  { id: "community-009", name: "亦庄经济开发区", city: "北京", district: "大兴", lat: 39.796, lng: 116.506, tier: "B", priceMin: 28000, priceMax: 35000, avgAreaSqm: 89, listingCount: 15, maintainerCount: 2 },
  { id: "community-010", name: "西城金融街附近", city: "北京", district: "西城", lat: 39.914, lng: 116.358, tier: "A", priceMin: 58000, priceMax: 75000, avgAreaSqm: 140, listingCount: 4, maintainerCount: 6 },
  { id: "community-011", name: "通州运河旁", city: "北京", district: "通州", lat: 39.902, lng: 116.656, tier: "B", priceMin: 25000, priceMax: 32000, avgAreaSqm: 88, listingCount: 21, maintainerCount: 2 },
  { id: "community-012", name: "丰台科技园区", city: "北京", district: "丰台", lat: 39.858, lng: 116.278, tier: "B", priceMin: 30000, priceMax: 38000, avgAreaSqm: 90, listingCount: 11, maintainerCount: 3 },
  { id: "community-013", name: "静安区域", city: "上海", district: "静安", lat: 31.228, lng: 121.448, tier: "A", priceMin: 68000, priceMax: 88000, avgAreaSqm: 128, listingCount: 6, maintainerCount: 5 },
  { id: "community-014", name: "浦东世纪公园旁", city: "上海", district: "浦东", lat: 31.208, lng: 121.538, tier: "B", priceMin: 42000, priceMax: 55000, avgAreaSqm: 98, listingCount: 14, maintainerCount: 3 },
  { id: "community-015", name: "徐汇漕河泾", city: "上海", district: "徐汇", lat: 31.186, lng: 121.42, tier: "B", priceMin: 48000, priceMax: 62000, avgAreaSqm: 105, listingCount: 9, maintainerCount: 4 },
  { id: "community-016", name: "张江高科", city: "上海", district: "浦东", lat: 31.2, lng: 121.602, tier: "B", priceMin: 38000, priceMax: 48000, avgAreaSqm: 93, listingCount: 17, maintainerCount: 2 },
  { id: "community-017", name: "闵行古美路", city: "上海", district: "闵行", lat: 31.138, lng: 121.388, tier: "C", priceMin: 28000, priceMax: 36000, avgAreaSqm: 80, listingCount: 22, maintainerCount: 1 },
  { id: "community-018", name: "长宁仙霞路", city: "上海", district: "长宁", lat: 31.204, lng: 121.394, tier: "B", priceMin: 52000, priceMax: 68000, avgAreaSqm: 110, listingCount: 8, maintainerCount: 3 },
  { id: "community-019", name: "嘉定新城", city: "上海", district: "嘉定", lat: 31.376, lng: 121.264, tier: "C", priceMin: 24000, priceMax: 32000, avgAreaSqm: 85, listingCount: 19, maintainerCount: 1 },
  { id: "community-020", name: "宝山顾村", city: "上海", district: "宝山", lat: 31.348, lng: 121.388, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 78, listingCount: 28, maintainerCount: 2 },
  { id: "community-021", name: "普陀长寿路", city: "上海", district: "普陀", lat: 31.242, lng: 121.41, tier: "B", priceMin: 44000, priceMax: 56000, avgAreaSqm: 97, listingCount: 12, maintainerCount: 3 },
  { id: "community-022", name: "陆家嘴金融城", city: "上海", district: "浦东", lat: 31.236, lng: 121.502, tier: "A", priceMin: 72000, priceMax: 98000, avgAreaSqm: 145, listingCount: 5, maintainerCount: 7 },
  { id: "community-023", name: "天河北路", city: "广州", district: "天河", lat: 23.148, lng: 113.324, tier: "A", priceMin: 45000, priceMax: 58000, avgAreaSqm: 132, listingCount: 10, maintainerCount: 4 },
  { id: "community-024", name: "珠江新城花城", city: "广州", district: "天河", lat: 23.116, lng: 113.328, tier: "A", priceMin: 55000, priceMax: 72000, avgAreaSqm: 150, listingCount: 7, maintainerCount: 5 },
  { id: "community-025", name: "荔湾龙津西", city: "广州", district: "荔湾", lat: 23.126, lng: 113.248, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 75, listingCount: 16, maintainerCount: 1 },
  { id: "community-026", name: "白云嘉禾", city: "广州", district: "白云", lat: 23.176, lng: 113.26, tier: "B", priceMin: 28000, priceMax: 36000, avgAreaSqm: 88, listingCount: 20, maintainerCount: 2 },
  { id: "community-027", name: "海珠工业大道", city: "广州", district: "海珠", lat: 23.088, lng: 113.286, tier: "B", priceMin: 32000, priceMax: 42000, avgAreaSqm: 92, listingCount: 13, maintainerCount: 2 },
  { id: "community-028", name: "番禺万博", city: "广州", district: "番禺", lat: 22.954, lng: 113.314, tier: "B", priceMin: 25000, priceMax: 34000, avgAreaSqm: 95, listingCount: 25, maintainerCount: 2 },
  { id: "community-029", name: "黄埔科学城", city: "广州", district: "黄埔", lat: 23.166, lng: 113.438, tier: "B", priceMin: 22000, priceMax: 30000, avgAreaSqm: 87, listingCount: 18, maintainerCount: 1 },
  { id: "community-030", name: "南山科技园西", city: "深圳", district: "南山", lat: 22.528, lng: 113.962, tier: "A", priceMin: 58000, priceMax: 78000, avgAreaSqm: 138, listingCount: 8, maintainerCount: 5 },
  { id: "community-031", name: "福田中心区", city: "深圳", district: "福田", lat: 22.54, lng: 114.062, tier: "A", priceMin: 62000, priceMax: 82000, avgAreaSqm: 145, listingCount: 6, maintainerCount: 6 },
  { id: "community-032", name: "龙华民治大道", city: "深圳", district: "龙华", lat: 22.632, lng: 114.036, tier: "B", priceMin: 42000, priceMax: 55000, avgAreaSqm: 93, listingCount: 19, maintainerCount: 3 },
  { id: "community-033", name: "宝安西乡", city: "深圳", district: "宝安", lat: 22.578, lng: 113.884, tier: "C", priceMin: 28000, priceMax: 38000, avgAreaSqm: 82, listingCount: 24, maintainerCount: 2 },
  { id: "community-034", name: "罗湖东门", city: "深圳", district: "罗湖", lat: 22.548, lng: 114.118, tier: "C", priceMin: 32000, priceMax: 44000, avgAreaSqm: 79, listingCount: 15, maintainerCount: 1 },
  { id: "community-035", name: "光明新区", city: "深圳", district: "光明", lat: 22.742, lng: 113.936, tier: "C", priceMin: 22000, priceMax: 30000, avgAreaSqm: 84, listingCount: 30, maintainerCount: 1 },
  { id: "community-036", name: "坪山新区", city: "深圳", district: "坪山", lat: 22.696, lng: 114.352, tier: "D", priceMin: 18000, priceMax: 25000, avgAreaSqm: 68, listingCount: 12, maintainerCount: 1 },
  { id: "community-037", name: "高新南区", city: "成都", district: "高新", lat: 30.572, lng: 104.068, tier: "A", priceMin: 22000, priceMax: 30000, avgAreaSqm: 118, listingCount: 15, maintainerCount: 3 },
  { id: "community-038", name: "天府新区兴隆湖", city: "成都", district: "天府新区", lat: 30.442, lng: 104.08, tier: "A", priceMin: 18000, priceMax: 28000, avgAreaSqm: 125, listingCount: 12, maintainerCount: 4 },
  { id: "community-039", name: "锦江区合江亭", city: "成都", district: "锦江", lat: 30.672, lng: 104.102, tier: "B", priceMin: 15000, priceMax: 22000, avgAreaSqm: 87, listingCount: 20, maintainerCount: 2 },
  { id: "community-040", name: "武侯祠大道", city: "成都", district: "武侯", lat: 30.628, lng: 104.048, tier: "B", priceMin: 16000, priceMax: 24000, avgAreaSqm: 90, listingCount: 18, maintainerCount: 2 },
  { id: "community-041", name: "郫都区", city: "成都", district: "郫都", lat: 30.798, lng: 103.894, tier: "C", priceMin: 10000, priceMax: 16000, avgAreaSqm: 76, listingCount: 8, maintainerCount: 1 },
  { id: "community-042", name: "西湖文化广场旁", city: "杭州", district: "拱墅", lat: 30.294, lng: 120.154, tier: "A", priceMin: 35000, priceMax: 48000, avgAreaSqm: 122, listingCount: 9, maintainerCount: 4 },
  { id: "community-043", name: "滨江区", city: "杭州", district: "滨江", lat: 30.21, lng: 120.21, tier: "B", priceMin: 28000, priceMax: 38000, avgAreaSqm: 94, listingCount: 16, maintainerCount: 3 },
  { id: "community-044", name: "余杭未来科技城", city: "杭州", district: "余杭", lat: 30.322, lng: 120.026, tier: "B", priceMin: 22000, priceMax: 32000, avgAreaSqm: 96, listingCount: 22, maintainerCount: 2 },
  { id: "community-045", name: "萧山区", city: "杭州", district: "萧山", lat: 30.162, lng: 120.268, tier: "C", priceMin: 18000, priceMax: 25000, avgAreaSqm: 82, listingCount: 14, maintainerCount: 1 },
  { id: "community-046", name: "光谷创业街", city: "武汉", district: "东湖高新", lat: 30.5, lng: 114.406, tier: "B", priceMin: 14000, priceMax: 20000, avgAreaSqm: 88, listingCount: 18, maintainerCount: 2 },
  { id: "community-047", name: "汉阳四新", city: "武汉", district: "汉阳", lat: 30.564, lng: 114.212, tier: "C", priceMin: 10000, priceMax: 15000, avgAreaSqm: 75, listingCount: 12, maintainerCount: 1 },
  { id: "community-048", name: "武昌区", city: "武汉", district: "武昌", lat: 30.538, lng: 114.302, tier: "B", priceMin: 13000, priceMax: 19000, avgAreaSqm: 90, listingCount: 15, maintainerCount: 2 },
  { id: "community-049", name: "渝中解放碑", city: "重庆", district: "渝中", lat: 29.557, lng: 106.576, tier: "B", priceMin: 12000, priceMax: 18000, avgAreaSqm: 85, listingCount: 10, maintainerCount: 2 },
  { id: "community-050", name: "南岸区", city: "重庆", district: "南岸", lat: 29.52, lng: 106.58, tier: "C", priceMin: 9000, priceMax: 14000, avgAreaSqm: 72, listingCount: 8, maintainerCount: 1 },
];

export const CITIES = ["北京", "上海", "广州", "深圳", "成都", "杭州", "武汉", "重庆"] as const;
export type City = (typeof CITIES)[number];

export const CITY_DISTRICTS: Record<City, string[]> = {
  北京: ["海淀", "朝阳", "昌平", "大兴", "西城", "通州", "丰台"],
  上海: ["静安", "浦东", "徐汇", "闵行", "长宁", "嘉定", "宝山", "普陀"],
  广州: ["天河", "荔湾", "白云", "海珠", "番禺", "黄埔"],
  深圳: ["南山", "福田", "龙华", "宝安", "罗湖", "光明", "坪山"],
  成都: ["高新", "天府新区", "锦江", "武侯", "郫都"],
  杭州: ["拱墅", "滨江", "余杭", "萧山"],
  武汉: ["东湖高新", "汉阳", "武昌"],
  重庆: ["渝中", "南岸"],
};

export const CITY_CENTERS: Record<City, [number, number]> = {
  北京: [39.9042, 116.4074],
  上海: [31.2304, 121.4737],
  广州: [23.1291, 113.2644],
  深圳: [22.5431, 114.0579],
  成都: [30.5728, 104.0668],
  杭州: [30.2741, 120.1551],
  武汉: [30.5928, 114.3055],
  重庆: [29.563, 106.5516],
};

export function getTotalPriceWan(pin: CommunityPin): number {
  return ((pin.priceMin + pin.priceMax) / 2) * pin.avgAreaSqm / 10000;
}
