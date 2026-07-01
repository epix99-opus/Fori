import SplashPage from "./page";
import HomePage from "./home/page";
import ListingDetailPage from "./listing/[id]/page";
import SearchPage from "./search/page";
import DictBrowsePage from "./explore/dict/page";
import DictEditPage from "./explore/dict/[communityId]/edit/page";
import PriceEvaluationPage from "./price/[communityId]/page";
import PublishListingPage from "./publish/listing/page";
import BuyerNeedPage from "./publish/buyer-need/page";

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
];

if (pages.length !== 9) {
  throw new Error("Prototype pages 1-9 must be importable.");
}
