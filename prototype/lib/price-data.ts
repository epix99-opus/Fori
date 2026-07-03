export type QualityTier = "A" | "B" | "C" | "D";
export type PriceViewerRole = "buyer" | "seller" | "agent";
export type PriceMode = "community" | "unit" | "manual";
export type ConfidenceLevel = "high" | "medium" | "low";

export type PriceFactor = {
  name: string;
  impactPercent: number;
  explanation: string;
};

export type BuyerRoleView = {
  fairRangeLow: number;
  fairRangeHigh: number;
  valueIndex: number;
  negotiationSuggestion: string;
  buyerMaxBudget: number;
};

export type SellerRoleView = {
  listingAdviceLow: number;
  listingAdviceHigh: number;
  competitorCount: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  sellerFloorPrice: number;
};

export type AgentRoleView = {
  buyerFairRangeLow: number;
  buyerFairRangeHigh: number;
  sellerListingLow: number;
  sellerListingHigh: number;
  matchingSpread: number;
  commissionEstimate: number;
  commissionBasis: string;
  competitorList: Array<{
    area: string;
    floor: string;
    price: string;
    daysOnMarket: number;
  }>;
  priceHistory: string;
};

export type PriceAssessmentResponse = {
  communityId: string;
  unitId: string | null;
  tier: QualityTier;
  basePricePerSqm: number;
  adjustedPricePerSqm: number;
  totalRange: { low: number; mid: number; high: number };
  factors: PriceFactor[];
  confidence: ConfidenceLevel;
  sampleCount: number;
  generatedAt: string;
  expiresAt: string;
  viewerRole: PriceViewerRole;
  roleView: BuyerRoleView | SellerRoleView | AgentRoleView;
};

export type CommunityListItem = {
  id: string;
  name: string;
  district: string;
  zone: string;
  tier: QualityTier;
  referenceRange: [number, number];
  sampleCount: number;
  confidence: ConfidenceLevel;
  averagePricePerSqm: number;
};

export type CommunityFilters = {
  district?: string;
  tier?: QualityTier;
  confidence?: ConfidenceLevel;
};

export type TrendPoint = {
  month: string;
  currentTier: number;
  compareTier: number;
};

const AREA_SQM = 89.6;
const GENERATED_AT = "2026-07-02T21:30:00-07:00";
const EXPIRES_AT = "2026-07-03T21:30:00-07:00";

const communities: CommunityListItem[] = [
  {
    id: "community-001",
    name: "中关村小区",
    district: "海淀",
    zone: "中关村北区",
    tier: "B",
    referenceRange: [32000, 38000],
    sampleCount: 42,
    confidence: "high",
    averagePricePerSqm: 35600,
  },
  {
    id: "community-002",
    name: "知春里",
    district: "海淀",
    zone: "知春路",
    tier: "C",
    referenceRange: [28500, 33000],
    sampleCount: 23,
    confidence: "medium",
    averagePricePerSqm: 30800,
  },
  {
    id: "community-003",
    name: "万柳书院",
    district: "海淀",
    zone: "万柳",
    tier: "A",
    referenceRange: [61000, 72000],
    sampleCount: 36,
    confidence: "high",
    averagePricePerSqm: 66800,
  },
  {
    id: "community-004",
    name: "学院南路 32 号院",
    district: "海淀",
    zone: "学院路",
    tier: "D",
    referenceRange: [23000, 27000],
    sampleCount: 8,
    confidence: "low",
    averagePricePerSqm: 24800,
  },
];

const baseFactors: PriceFactor[] = [
  { name: "楼层修正", impactPercent: 3, explanation: "8/18 层位于小高层舒适区，采光与噪音条件优于低楼层。" },
  { name: "朝向修正", impactPercent: 2, explanation: "南北通透在当前小区近 90 天成交样本中溢价明显。" },
  { name: "装修修正", impactPercent: 8, explanation: "精装可直接入住，降低买方短期装修成本和空置周期。" },
  { name: "税费修正", impactPercent: -3, explanation: "税费承担方式偏向买家，测算价需回调以匹配真实支付意愿。" },
  { name: "稀缺度修正", impactPercent: 2, explanation: "同户型当前在售少于 5 套，近 30 天咨询热度上升。" },
];

const trendByCommunity: Record<string, TrendPoint[]> = {
  "community-001": [
    { month: "2026-01", currentTier: 34800, compareTier: 31100 },
    { month: "2026-02", currentTier: 35100, compareTier: 31600 },
    { month: "2026-03", currentTier: 36000, compareTier: 32100 },
    { month: "2026-04", currentTier: 37100, compareTier: 32600 },
    { month: "2026-05", currentTier: 38600, compareTier: 33200 },
    { month: "2026-06", currentTier: 37900, compareTier: 32900 },
  ],
  "community-002": [
    { month: "2026-01", currentTier: 30100, compareTier: 33600 },
    { month: "2026-02", currentTier: 30500, compareTier: 33800 },
    { month: "2026-03", currentTier: 31100, compareTier: 34100 },
    { month: "2026-04", currentTier: 30900, compareTier: 34200 },
    { month: "2026-05", currentTier: 31500, compareTier: 34400 },
    { month: "2026-06", currentTier: 31200, compareTier: 34300 },
  ],
  "community-003": [
    { month: "2026-01", currentTier: 64200, compareTier: 35200 },
    { month: "2026-02", currentTier: 65000, compareTier: 35600 },
    { month: "2026-03", currentTier: 66100, compareTier: 35900 },
    { month: "2026-04", currentTier: 66800, compareTier: 36100 },
    { month: "2026-05", currentTier: 67900, compareTier: 36400 },
    { month: "2026-06", currentTier: 67200, compareTier: 36200 },
  ],
  "community-004": [
    { month: "2026-01", currentTier: 24100, compareTier: 31200 },
    { month: "2026-02", currentTier: 24400, compareTier: 31500 },
    { month: "2026-03", currentTier: 24600, compareTier: 31800 },
    { month: "2026-04", currentTier: 24300, compareTier: 31900 },
    { month: "2026-05", currentTier: 24900, compareTier: 32100 },
    { month: "2026-06", currentTier: 24700, compareTier: 32000 },
  ],
};

export function getCommunities(keyword = "", filters: CommunityFilters = {}): CommunityListItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return communities.filter((community) =>
    (!normalizedKeyword ||
      [community.name, community.district, community.zone, community.tier].some((value) =>
        value.toLowerCase().includes(normalizedKeyword),
      )) &&
    (!filters.district || community.district === filters.district) &&
    (!filters.tier || community.tier === filters.tier) &&
    (!filters.confidence || community.confidence === filters.confidence),
  );
}

export function evaluatePrice(
  communityId: string,
  role: PriceViewerRole = "buyer",
  mode: PriceMode = "community",
): PriceAssessmentResponse {
  const community = communities.find((item) => item.id === communityId) ?? communities[0];
  const factors = getModeFactors(mode);
  const totalImpact = factors.reduce((sum, factor) => sum + factor.impactPercent, 0);
  const adjustedPricePerSqm = Math.round(community.averagePricePerSqm * (1 + totalImpact / 100));
  const midTotal = Math.round(adjustedPricePerSqm * AREA_SQM);
  const totalRange = {
    low: Math.round(midTotal * 0.92),
    mid: midTotal,
    high: Math.round(midTotal * 1.055),
  };

  return {
    communityId: community.id,
    unitId: mode === "community" ? null : `${community.id}-unit-demo`,
    tier: community.tier,
    basePricePerSqm: community.averagePricePerSqm,
    adjustedPricePerSqm,
    totalRange,
    factors,
    confidence: community.sampleCount < 15 || community.tier === "D" ? "low" : community.confidence,
    sampleCount: community.sampleCount,
    generatedAt: GENERATED_AT,
    expiresAt: EXPIRES_AT,
    viewerRole: role,
    roleView: buildRoleView(role, totalRange, community, adjustedPricePerSqm),
  };
}

export function getTrend(communityId: string): TrendPoint[] {
  return trendByCommunity[communityId] ?? trendByCommunity["community-001"];
}

function getModeFactors(mode: PriceMode): PriceFactor[] {
  if (mode === "manual") {
    return [
      ...baseFactors,
      { name: "手动参数修正", impactPercent: -1, explanation: "用户手动输入的税费与楼龄参数使估价略微回调。" },
    ];
  }

  if (mode === "unit") {
    return [
      ...baseFactors,
      { name: "户型精度修正", impactPercent: 1.5, explanation: "单套估价叠加户型、楼层与朝向组合的精细修正。" },
    ];
  }

  return baseFactors;
}

function buildRoleView(
  role: PriceViewerRole,
  totalRange: PriceAssessmentResponse["totalRange"],
  community: CommunityListItem,
  adjustedPricePerSqm: number,
): PriceAssessmentResponse["roleView"] {
  if (role === "seller") {
    return {
      listingAdviceLow: Math.round(totalRange.mid * 1.01),
      listingAdviceHigh: Math.round(totalRange.high * 1.04),
      competitorCount: community.tier === "D" ? 1 : 3,
      estimatedDaysMin: community.tier === "D" ? 60 : 45,
      estimatedDaysMax: community.tier === "D" ? 90 : 60,
      sellerFloorPrice: Math.round(totalRange.low * 0.98),
    };
  }

  if (role === "agent") {
    const buyerFairRangeLow = totalRange.low;
    const buyerFairRangeHigh = totalRange.high;
    const sellerListingLow = Math.round(totalRange.mid * 1.01);
    const sellerListingHigh = Math.round(totalRange.high * 1.04);

    return {
      buyerFairRangeLow,
      buyerFairRangeHigh,
      sellerListingLow,
      sellerListingHigh,
      matchingSpread: sellerListingLow - buyerFairRangeHigh,
      commissionEstimate: Math.round(totalRange.mid * 0.01 * 0.8),
      commissionBasis: "按成交总价 1% 服务费、80% 经纪人服务池估算。",
      competitorList: [
        { area: "89㎡", floor: "中楼层", price: `${Math.round((adjustedPricePerSqm * 89) / 10000)} 万`, daysOnMarket: 22 },
        { area: "96㎡", floor: "高楼层", price: `${Math.round((adjustedPricePerSqm * 96 * 1.03) / 10000)} 万`, daysOnMarket: 37 },
        { area: "91㎡", floor: "低楼层", price: `${Math.round((adjustedPricePerSqm * 91 * 0.97) / 10000)} 万`, daysOnMarket: 54 },
      ],
      priceHistory: "近 24 个月价格先稳后升，低样本小区需结合周边 C 层级校验。",
    };
  }

  return {
    fairRangeLow: totalRange.low,
    fairRangeHigh: totalRange.high,
    valueIndex: Math.max(62, Math.min(92, 100 - Math.round((adjustedPricePerSqm - community.referenceRange[0]) / 500))),
    negotiationSuggestion: `建议首轮出价 ${formatWan(totalRange.low)}-${formatWan(totalRange.mid)} 万，并保留 3%-5% 调整空间。`,
    buyerMaxBudget: Math.round(totalRange.high * 1.03),
  };
}

function formatWan(value: number): number {
  return Math.round(value / 10000);
}
