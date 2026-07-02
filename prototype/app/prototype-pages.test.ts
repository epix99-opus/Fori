import SplashPage from "./page";
import HomePage from "./home/page";
import ListingDetailPage from "./listing/[id]/page";
import SearchPage from "./search/page";
import ExploreSearchPage from "./explore/search/page";
import ExploreMapPage from "./explore/map/page";
import DictBrowsePage from "./explore/dict/page";
import DictDetailPage from "./explore/dict/[communityId]/page";
import DictEditPage from "./explore/dict/[communityId]/edit/page";
import PriceEntryPage from "./price/page";
import PriceEvaluationPage from "./price/[communityId]/page";
import PublishListingPage from "./publish/listing/page";
import BuyerNeedPage from "./publish/buyer-need/page";
import MatchPage from "./match/page";
import AgentMatchesPage from "./workspace/agent/matches/page";
import LoginPage from "./auth/login/page";
import KycPage from "./auth/kyc/page";
import AgentCertPage from "./profile/agent-cert/page";
import CreditPage from "./profile/credit/page";
import TransactionPage from "./transaction/[id]/page";
import TransactionsPage from "./profile/transactions/page";
import ProfileTransactionPage from "./profile/transactions/[txId]/page";
import EvidencePage from "./profile/transactions/[txId]/evidence/page";
import MarketingGeneratePage from "./marketing/generate/page";
import WorkspaceMediaGeneratePage from "./workspace/media/generate/page";
import MarketingManagePage from "./marketing/manage/page";
import WorkspaceMediaManagePage from "./workspace/media/manage/page";
import AgentWorkspacePage from "./workspace/agent/page";
import AgentBuyersPage from "./workspace/agent/buyers/page";
import AgentListingsPage from "./workspace/agent/listings/page";
import AgentStatsPage from "./workspace/agent/stats/page";
import StoreWorkspacePage from "./workspace/store/page";
import MessagesPage from "./messages/page";
import ProfilePage from "./profile/page";
import ProfileMePage from "./profile/me/page";
import SettingsPage from "./profile/settings/page";

const pages: Array<unknown> = [
  SplashPage,
  HomePage,
  ListingDetailPage,
  SearchPage,
  ExploreSearchPage,
  ExploreMapPage,
  DictBrowsePage,
  DictDetailPage,
  DictEditPage,
  PriceEntryPage,
  PriceEvaluationPage,
  PublishListingPage,
  BuyerNeedPage,
  MatchPage,
  AgentMatchesPage,
  LoginPage,
  KycPage,
  AgentCertPage,
  CreditPage,
  TransactionPage,
  TransactionsPage,
  ProfileTransactionPage,
  EvidencePage,
  MarketingGeneratePage,
  WorkspaceMediaGeneratePage,
  MarketingManagePage,
  WorkspaceMediaManagePage,
  AgentWorkspacePage,
  AgentBuyersPage,
  AgentListingsPage,
  AgentStatsPage,
  StoreWorkspacePage,
  MessagesPage,
  ProfilePage,
  ProfileMePage,
  SettingsPage,
];

if (pages.length !== 36) {
  throw new Error("Prototype core and required pages must be importable.");
}
