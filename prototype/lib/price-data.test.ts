import {
  evaluatePrice,
  getCommunities,
  getTrend,
  type AgentRoleView,
  type BuyerRoleView,
  type SellerRoleView,
} from "./price-data";

const communities = getCommunities();

if (communities.length !== 4) {
  throw new Error("FORI-043 price prototype requires four community seeds.");
}

const dTierCommunity = communities.find((community) => community.id === "community-004");

if (!dTierCommunity || dTierCommunity.tier !== "D" || dTierCommunity.sampleCount !== 8) {
  throw new Error("community-004 must be a D-tier low-sample seed.");
}

const buyerAssessment = evaluatePrice("community-001", "buyer", "community");
const sellerAssessment = evaluatePrice("community-001", "seller", "community");
const agentAssessment = evaluatePrice("community-001", "agent", "community");

const buyerView = buyerAssessment.roleView as BuyerRoleView;
const sellerView = sellerAssessment.roleView as SellerRoleView;
const agentView = agentAssessment.roleView as AgentRoleView;

if (!buyerView.fairRangeLow || "sellerFloorPrice" in buyerView || "commissionEstimate" in buyerView) {
  throw new Error("buyer roleView must only expose buyer-safe fields.");
}

if (!sellerView.listingAdviceLow || "buyerMaxBudget" in sellerView || "commissionEstimate" in sellerView) {
  throw new Error("seller roleView must only expose seller-safe fields.");
}

if (!agentView.matchingSpread || "sellerFloorPrice" in agentView || "buyerMaxBudget" in agentView) {
  throw new Error("agent roleView must expose matching fields without party secrets.");
}

if (getTrend("community-001").length < 6) {
  throw new Error("price trend mock must provide chartable history.");
}

const dTierFiltered = getCommunities("", { tier: "D" });

if (dTierFiltered.length !== 1 || dTierFiltered[0]?.id !== "community-004") {
  throw new Error("getCommunities must support D-tier risk filtering from the price entry URL.");
}

const districtTierFiltered = getCommunities("", { district: "海淀", tier: "C" });

if (!districtTierFiltered.length || districtTierFiltered.some((community) => community.district !== "海淀" || community.tier !== "C")) {
  throw new Error("getCommunities must combine district and tier filters.");
}
