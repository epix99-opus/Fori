export type LeadType = "buyer" | "landlord";
export type BuyerStage = "new" | "following" | "appointed" | "negotiating" | "signing" | "converted" | "lost";
export type LandlordStage = "contacted" | "interested" | "agreed_list" | "listing_review" | "listed" | "sold";
export type LeadStage = BuyerStage | LandlordStage;

export interface LeadActivity {
  id: string;
  type: "call" | "wechat" | "visit" | "house_view" | "listing" | "note";
  time: string;
  summary: string;
  durationMin?: number;
}

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

const baseActivities: LeadActivity[] = [
  { id: "a1", type: "note", time: "2026-07-01 10:20", summary: "来源：平台 P1 匹配推送。" },
  { id: "a2", type: "call", time: "2026-07-01 14:30", summary: "通话 10 分钟，客户对学区需求较高，预算可弹性到 340 万。", durationMin: 10 },
  { id: "a3", type: "wechat", time: "2026-07-02 09:15", summary: "发送 3 套备选房源，客户重点关注小区维护质量。" },
];

export const mockLeads: Lead[] = [
  { id: "lead-001", type: "buyer", name: "周先生", phone: "138****5678", source: "platform_match", sourceDetail: "P1 匹配 07-01", stage: "following", probability: 78, need: "海淀三居 · 260-320 万", expectedValue: "2.8-3.6 万佣金", lastContact: "2026-07-01", nextAction: "约看房", nextActionDate: "2026-07-05 15:00", activities: baseActivities },
  { id: "lead-002", type: "buyer", name: "何女士", phone: "139****4321", source: "platform_match", sourceDetail: "P2 匹配 06-28", stage: "appointed", probability: 64, need: "知春路两居 · 近地铁 · 200-240 万", expectedValue: "1.9-2.4 万佣金", lastContact: "2026-07-02", nextAction: "看房后回访", activities: [{ id: "a4", type: "house_view", time: "2026-07-02 10:00", summary: "看了知春里 2 室，客户表示满意，需与家人商量。" }] },
  { id: "lead-003", type: "buyer", name: "陈先生", phone: "136****8888", source: "manual", sourceDetail: "老客户介绍", stage: "new", probability: 45, need: "改善三居 · 学区优先 · 300 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-03", activities: [] },
  { id: "lead-004", type: "buyer", name: "刘女士", phone: "137****2233", source: "media_reach", sourceDetail: "来自抖音推广", stage: "following", probability: 55, need: "浦东两居 · 50-70㎡", expectedValue: "1.5-2.0 万佣金", lastContact: "2026-07-02", activities: [{ id: "a5", type: "wechat", time: "2026-07-02 16:30", summary: "微信沟通，发送了 3 套备选房源。" }] },
  { id: "lead-005", type: "buyer", name: "王先生", phone: "135****5566", source: "platform_match", sourceDetail: "P1 匹配 06-25", stage: "negotiating", probability: 85, need: "天河改善四居 · 400-500 万", expectedValue: "4.0-5.0 万佣金", lastContact: "2026-07-01", activities: [{ id: "a6", type: "house_view", time: "2026-06-28 14:00", summary: "看了珠江新城物业，满意。" }, { id: "a7", type: "call", time: "2026-07-01 11:00", summary: "议价中，卖方报 480 万，客户出 460 万。", durationMin: 20 }] },
  { id: "lead-006", type: "buyer", name: "张先生", phone: "133****7788", source: "referral", sourceDetail: "成交客户介绍", stage: "converted", probability: 100, need: "已成交 · 高新两居", expectedValue: "已成交 ¥1.8 万", lastContact: "2026-07-01", activities: [{ id: "a8", type: "note", time: "2026-07-01 15:00", summary: "成交，高新南区 78㎡ 两居，成交价 198 万。" }] },
  { id: "lead-007", type: "buyer", name: "李先生", phone: "158****3344", source: "media_reach", sourceDetail: "来自视频号", stage: "new", probability: 30, need: "宝安刚需两居 · 150 万以内", expectedValue: "1.0-1.5 万佣金", lastContact: "2026-07-03", activities: [] },
  { id: "lead-008", type: "buyer", name: "赵女士", phone: "181****4455", source: "platform_match", sourceDetail: "P3 匹配 06-30", stage: "lost", probability: 0, need: "已流失 · 已自行成交", expectedValue: "无", lastContact: "2026-07-02", activities: [{ id: "a9", type: "note", time: "2026-07-02 09:00", summary: "客户告知已通过其他中介成交。" }] },
  { id: "lead-009", type: "buyer", name: "孙先生", phone: "139****6677", source: "manual", sourceDetail: "微信私域引流", stage: "following", probability: 60, need: "天通苑三居 · 200-260 万", expectedValue: "2.0-2.8 万佣金", lastContact: "2026-07-02", activities: [{ id: "a10", type: "call", time: "2026-07-02 19:00", summary: "确认预算上限 280 万。", durationMin: 8 }] },
  { id: "lead-010", type: "buyer", name: "吴女士", phone: "135****9900", source: "platform_match", sourceDetail: "P2 匹配 07-02", stage: "signing", probability: 92, need: "福田三居 · 学区 · 450 万以内", expectedValue: "3.5-4.5 万佣金", lastContact: "2026-07-02", activities: [{ id: "a11", type: "note", time: "2026-07-02 17:00", summary: "已进入合同条款确认。" }] },
  { id: "lead-011", type: "buyer", name: "郑先生", phone: "186****1122", source: "media_reach", sourceDetail: "来自小红书", stage: "following", probability: 50, need: "静安两居 · 精装 · 500 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-01", activities: [{ id: "a12", type: "wechat", time: "2026-07-01 20:00", summary: "已发送 2 套精装房源。" }] },
  { id: "lead-012", type: "buyer", name: "林女士", phone: "177****3344", source: "manual", sourceDetail: "门店来访", stage: "appointed", probability: 70, need: "余杭三居 · 地铁 · 300 万以内", expectedValue: "2.5-3.5 万佣金", lastContact: "2026-07-02", activities: [{ id: "a13", type: "visit", time: "2026-07-02 14:00", summary: "门店来访，约好 7-6 看房。" }] },
  { id: "lead-013", type: "landlord", name: "李女士", phone: "158****6699", source: "referral", sourceDetail: "老客户介绍", stage: "interested", probability: 65, need: "出售 · 海淀三居 · 约 280 万", expectedValue: "约 2.8 万佣金", lastContact: "2026-07-02", activities: [{ id: "a14", type: "call", time: "2026-07-02 11:00", summary: "了解挂牌意向，3 个月内考虑出售。", durationMin: 15 }] },
  { id: "lead-014", type: "landlord", name: "张先生", phone: "139****5511", source: "media_reach", sourceDetail: "来自抖音", stage: "contacted", probability: 30, need: "出租 · 南山两居 · 月租 6000", expectedValue: "约 6000 元/月佣金 50%", lastContact: "2026-07-03", activities: [] },
  { id: "lead-015", type: "landlord", name: "王女士", phone: "136****8822", source: "platform_match", sourceDetail: "系统推荐", stage: "agreed_list", probability: 80, need: "出售 · 天河改善四居 · 约 460 万", expectedValue: "约 4.6 万佣金", lastContact: "2026-07-01", activities: [{ id: "a15", type: "visit", time: "2026-07-01 15:00", summary: "上门核实房源，房主同意挂牌。" }] },
  { id: "lead-016", type: "landlord", name: "陈先生", phone: "181****2233", source: "manual", sourceDetail: "社区活动结识", stage: "listing_review", probability: 85, need: "出售 · 高新两居 · 约 200 万", expectedValue: "约 2.0 万佣金", lastContact: "2026-06-30", activities: [{ id: "a16", type: "listing", time: "2026-06-30 09:00", summary: "已提交房源信息，核验中。" }] },
  { id: "lead-017", type: "landlord", name: "刘女士", phone: "135****4455", source: "referral", sourceDetail: "朋友介绍", stage: "listed", probability: 90, need: "出售 · 渝中两居 · 约 130 万", expectedValue: "约 1.3 万佣金", lastContact: "2026-07-02", activities: [{ id: "a17", type: "listing", time: "2026-07-02 14:00", summary: "房源已上架，等待买家匹配。" }] },
  { id: "lead-018", type: "landlord", name: "孙先生", phone: "139****7788", source: "platform_match", sourceDetail: "系统推荐", stage: "sold", probability: 100, need: "已成交 · 知春里三居 · 296 万", expectedValue: "已成交 ¥2.96 万", lastContact: "2026-07-01", activities: [{ id: "a18", type: "note", time: "2026-07-01 16:00", summary: "买家周先生，296 万成交。" }] },
];

export const BUYER_STAGE_META: Record<BuyerStage, { label: string; color: string }> = {
  new: { label: "新线索", color: "bg-neutral-200 text-neutral-700" },
  following: { label: "跟进中", color: "bg-blue-100 text-blue-700" },
  appointed: { label: "已约看", color: "bg-orange-100 text-orange-700" },
  negotiating: { label: "谈判中", color: "bg-yellow-100 text-yellow-700" },
  signing: { label: "签约中", color: "bg-purple-100 text-purple-700" },
  converted: { label: "已成交", color: "bg-green-100 text-semantic-success" },
  lost: { label: "已流失", color: "bg-red-100 text-semantic-danger" },
};

export const LANDLORD_STAGE_META: Record<LandlordStage, { label: string; color: string }> = {
  contacted: { label: "初步接触", color: "bg-neutral-200 text-neutral-700" },
  interested: { label: "有意向", color: "bg-blue-100 text-blue-700" },
  agreed_list: { label: "同意挂牌", color: "bg-orange-100 text-orange-700" },
  listing_review: { label: "房源审核", color: "bg-yellow-100 text-yellow-700" },
  listed: { label: "已上架", color: "bg-purple-100 text-purple-700" },
  sold: { label: "已成交", color: "bg-green-100 text-semantic-success" },
};

export function getLeadStageMeta(lead: Lead) {
  return lead.type === "buyer" ? BUYER_STAGE_META[lead.stage as BuyerStage] : LANDLORD_STAGE_META[lead.stage as LandlordStage];
}
