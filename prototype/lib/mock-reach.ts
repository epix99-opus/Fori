export type ChannelId = "douyin" | "weixin_video" | "xiaohongshu" | "weibo" | "manual";
export type ReachLeadStatus = "new" | "following" | "appointed" | "converted" | "lost";

export interface ChannelReach {
  channel: ChannelId;
  channelName: string;
  channelIcon: string;
  exposure: number;
  clicks: number;
  leads: number;
  interactions: { likes: number; comments: number; shares: number };
  topPostTime?: string;
  bestClickRate?: number;
  isAuthorized: boolean;
  accountName?: string;
  apiSupported: boolean;
}

export interface ReachLead {
  id: string;
  name: string;
  channel: string;
  need: string;
  createdAt: string;
  status: ReachLeadStatus;
}

export const mockChannelReach: ChannelReach[] = [
  { channel: "douyin", channelName: "抖音", channelIcon: "🎵", exposure: 28600, clicks: 1460, leads: 24, interactions: { likes: 382, comments: 67, shares: 45 }, topPostTime: "周四 20:00", bestClickRate: 6.2, isAuthorized: true, accountName: "@张建国房产", apiSupported: true },
  { channel: "weixin_video", channelName: "微信视频号", channelIcon: "📱", exposure: 12400, clicks: 680, leads: 13, interactions: { likes: 201, comments: 18, shares: 21 }, topPostTime: "周六 19:30", bestClickRate: 5.5, isAuthorized: true, accountName: "@建国找房", apiSupported: true },
  { channel: "xiaohongshu", channelName: "小红书", channelIcon: "📕", exposure: 4800, clicks: 240, leads: 5, interactions: { likes: 88, comments: 15, shares: 11 }, isAuthorized: false, apiSupported: false },
  { channel: "manual", channelName: "微信朋友圈", channelIcon: "💬", exposure: 200, clicks: 0, leads: 5, interactions: { likes: 0, comments: 0, shares: 0 }, isAuthorized: true, accountName: "手动发布", apiSupported: false },
  { channel: "weibo", channelName: "微博", channelIcon: "🔴", exposure: 0, clicks: 0, leads: 0, interactions: { likes: 0, comments: 0, shares: 0 }, isAuthorized: false, apiSupported: true },
];

export const mockReachLeads: ReachLead[] = [
  { id: "lead-004", name: "刘女士", channel: "抖音", need: "浦东两居 · 50-70㎡", createdAt: "2026-07-03 14:22", status: "following" },
  { id: "lead-007", name: "李先生", channel: "视频号", need: "宝安刚需两居 · 150 万以内", createdAt: "2026-07-03 09:15", status: "new" },
  { id: "lead-011", name: "郑先生", channel: "小红书", need: "静安两居 · 精装 · 500 万以内", createdAt: "2026-07-02 20:08", status: "following" },
  { id: "lead-014", name: "张先生", channel: "朋友圈", need: "南山两居房东 · 意向出租", createdAt: "2026-07-02 18:30", status: "new" },
];

export const mockStoryboardScenes = [
  { index: 1, label: "小区门口外景", time: "00:00-00:08", caption: "中关村小区，成熟社区，步行可达地铁与商业配套。", cameraMove: "静推" },
  { index: 2, label: "客厅全景", time: "00:08-00:18", caption: "42㎡ 大客厅，南向采光，适合改善家庭日常会客。", cameraMove: "横扫" },
  { index: 3, label: "主卧", time: "00:18-00:26", caption: "主卧带整墙衣柜，空间完整，采光稳定。", cameraMove: "左进" },
  { index: 4, label: "厨卫", time: "00:26-00:34", caption: "厨房动线清晰，卫生间干湿分离，维护状态良好。", cameraMove: "静拍" },
  { index: 5, label: "小区配套", time: "00:34-00:40", caption: "地铁 10 号线、社区商业、学校配套都在步行圈内。", cameraMove: "外景跟拍" },
  { index: 6, label: "片尾行动", time: "00:40-00:45", caption: "想了解更多？通过 Fori 站内消息预约看房。", cameraMove: "字幕+品牌尾帧" },
];
