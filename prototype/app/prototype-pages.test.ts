import SplashPage from "./page";
import HomePage from "./home/page";
import ListingDetailPage from "./listing/[id]/page";
import SearchPage from "./search/page";
import DictBrowsePage from "./explore/dict/page";
import DictEditPage from "./explore/dict/[communityId]/edit/page";
import PriceEvaluationPage from "./price/[communityId]/page";
import PublishListingPage from "./publish/listing/page";
import BuyerNeedPage from "./publish/buyer-need/page";
import MatchPage from "./match/page";
import AgentCertPage from "./profile/agent-cert/page";
import CreditPage from "./profile/credit/page";
import TransactionPage from "./transaction/[id]/page";
import EvidencePage from "./profile/transactions/[txId]/evidence/page";
import MarketingGeneratePage from "./marketing/generate/page";
import MarketingManagePage from "./marketing/manage/page";
import AgentWorkspacePage from "./workspace/agent/page";
import StoreWorkspacePage from "./workspace/store/page";

const pages: Array<unknown> = [
  SplashPage,
  HomePage,
  ListingDetailPage,
  SearchPage,
  DictBrowsePage,
  DictEditPage,
  PriceEvaluationPage,
  PublishListingPage,
  BuyerNeedPage,
  MatchPage,
  AgentCertPage,
  CreditPage,
  TransactionPage,
  EvidencePage,
  MarketingGeneratePage,
  MarketingManagePage,
  AgentWorkspacePage,
  StoreWorkspacePage,
];

if (pages.length !== 18) {
  throw new Error("Prototype pages 1-18 must be importable.");
}
