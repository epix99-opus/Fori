import SplashPage from "./page";
import HomePage from "./home/page";
import ListingDetailPage from "./listing/[id]/page";
import SearchPage from "./search/page";
import DictBrowsePage from "./explore/dict/page";
import DictEditPage from "./explore/dict/[communityId]/edit/page";

const pages: Array<unknown> = [SplashPage, HomePage, ListingDetailPage, SearchPage, DictBrowsePage, DictEditPage];

if (pages.length !== 6) {
  throw new Error("Prototype pages 1-6 must be importable.");
}
