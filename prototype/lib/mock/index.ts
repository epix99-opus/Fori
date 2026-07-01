import type { Agent, BuyerDemand, Listing, Message, Transaction, User } from "./types";

export const mockUsers: User[] = [
  {
    id: "user-001",
    name: "林女士",
    phoneMasked: "138****8201",
    roles: ["owner", "buyer"],
    verificationStatus: "verified",
    creditScore: 92,
  },
];

export const mockAgents: Agent[] = [
  {
    id: "agent-001",
    userId: "user-agent-001",
    displayName: "张明",
    level: "L2",
    storeName: "中关村安心门店",
    serviceAreas: ["中关村", "知春路"],
    verifiedAt: "2026-06-20T09:00:00-07:00",
    rating: 4.8,
  },
];

export const mockListings: Listing[] = [
  {
    id: "listing-001",
    title: "中关村科技园精装三居",
    communityId: "community-001",
    communityName: "中关村小区",
    city: "北京",
    district: "海淀",
    address: "中关村南路 18 号",
    priceWan: 280,
    areaSqm: 92,
    rooms: 3,
    halls: 2,
    floor: "8",
    totalFloors: 18,
    tags: ["已核验", "高性价比", "满5年"],
    coverUrl: "/placeholder-listing.jpg",
    imageCount: 9,
    ownerId: "user-001",
    agentId: "agent-001",
    status: "active",
    verificationStatus: "verified",
    updatedAt: "2026-07-01T10:00:00-07:00",
  },
];

export const mockBuyerDemands: BuyerDemand[] = [
  {
    id: "demand-001",
    buyerId: "user-buyer-001",
    city: "北京",
    districts: ["海淀"],
    budgetMinWan: 240,
    budgetMaxWan: 320,
    minAreaSqm: 80,
    rooms: 3,
    priority: "P1",
    status: "open",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    listingId: "listing-001",
    buyerId: "user-buyer-001",
    sellerId: "user-001",
    agentId: "agent-001",
    status: "notary",
    currentStepLabel: "公证机构核验",
    notarizationHash: "0x9f3a...c21b",
    updatedAt: "2026-07-01T09:30:00-07:00",
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-001",
    userId: "user-001",
    type: "transaction",
    title: "交易进度更新",
    body: "公证机构已收到核验材料。",
    read: false,
    createdAt: "2026-07-01T09:35:00-07:00",
  },
];

export type * from "./types";
