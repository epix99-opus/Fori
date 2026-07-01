import SplashPage from "./page";
import HomePage from "./home/page";
import ListingDetailPage from "./listing/[id]/page";

const pages: Array<unknown> = [SplashPage, HomePage, ListingDetailPage];

if (pages.length !== 3) {
  throw new Error("Prototype pages 1-3 must be importable.");
}
