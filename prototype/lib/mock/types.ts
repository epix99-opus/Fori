export type UserRole = "guest" | "buyer" | "owner" | "agent" | "store_admin";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type User = {
  id: string;
  name: string;
  phoneMasked: string;
  avatarUrl?: string;
  roles: UserRole[];
  verificationStatus: VerificationStatus;
  creditScore?: number;
};

export type AgentLevel = "L1" | "L2" | "L3";

export type Agent = {
  id: string;
  userId: string;
  displayName: string;
  level: AgentLevel;
  storeName?: string;
  serviceAreas: string[];
  verifiedAt?: string;
  rating: number;
};

export type ListingStatus = "draft" | "pending_review" | "active" | "sold" | "off_market";

export type Listing = {
  id: string;
  title: string;
  communityId: string;
  communityName: string;
  city: string;
  district: string;
  address: string;
  priceWan: number;
  areaSqm: number;
  rooms: number;
  halls: number;
  floor: string;
  totalFloors: number;
  tags: string[];
  coverUrl: string;
  imageCount: number;
  ownerId: string;
  agentId?: string;
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  updatedAt: string;
};

export type BuyerDemand = {
  id: string;
  buyerId: string;
  city: string;
  districts: string[];
  budgetMinWan: number;
  budgetMaxWan: number;
  minAreaSqm?: number;
  rooms?: number;
  priority: "P1" | "P2" | "normal";
  status: "open" | "matched" | "closed";
};

export type TransactionStatus =
  | "intent"
  | "contract"
  | "notary"
  | "fund_escrow"
  | "transfer"
  | "completed"
  | "terminated";

export type Transaction = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  agentId?: string;
  status: TransactionStatus;
  currentStepLabel: string;
  notarizationHash?: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  userId: string;
  type: "system" | "match" | "transaction";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};
