"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  ChevronDown,
  Heart,
  LineChart,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { TabBar } from "@/components/TabBar";
import { Toast } from "@/components/Toast";
import { mockAgents, mockListings, type Listing } from "@/lib/mock";

type FeedListing = Listing & {
  recommendationReason: string;
  postedAgo: string;
  imageTone: string;
};

type FeedState = "loading" | "ready" | "empty" | "error";

const imageTones = [
  "from-primary-100 via-white to-secondary-200",
  "from-blue-100 via-white to-emerald-100",
  "from-amber-100 via-white to-primary-100",
  "from-neutral-200 via-white to-blue-100",
];

function buildFeed(repeat = 8): FeedListing[] {
  return Array.from({ length: repeat }, (_, index) => {
    const listing = mockListings[index % mockListings.length];
    const priceOffset = index * 8;

    return {
      ...listing,
      id: index === 0 ? listing.id : `${listing.id}-${index + 1}`,
      title: index === 0 ? listing.title : `${listing.communityName} ${index % 2 === 0 ? "南北通透改善三居" : "近地铁精装好房"}`,
      priceWan: listing.priceWan + priceOffset,
      areaSqm: listing.areaSqm + (index % 3) * 6,
      tags: index % 2 === 0 ? listing.tags : ["已核验", "近地铁", "业主诚售"],
      recommendationReason: index % 2 === 0 ? "价格低于同层级小区均值 3%" : "近 7 日咨询热度上升",
      postedAgo: index < 3 ? `${index + 1} 天前` : "刚刚更新",
      imageTone: imageTones[index % imageTones.length],
    };
  });
}

const cityOptions = ["北京", "上海", "深圳", "杭州"];
const defaultFeed = buildFeed();

const moduleChecklist = [
  { module: "楼盘字典", href: "/explore/dict", status: "地图/卡片/列表" },
  { module: "定价评估", href: "/price", status: "三角色价格图谱" },
  { module: "智能撮合", href: "/match", status: "4h 响应窗口" },
  { module: "交易公证", href: "/transaction/tx-001", status: "资金监管+分成" },
  { module: "共建收益", href: "/explore/dict/community-001", status: "贡献账本" },
  { module: "认证分级", href: "/auth/login", status: "可见矩阵" },
];

const roleGuides = [
  { role: "买家", text: "用真实字典看懂市场，用公允价格出价，全程公证保障您的权益" },
  { role: "卖家", text: "合理挂牌、精准匹配、快速成交——平台科学定价让您少走弯路" },
  { role: "经纪人", text: "维护楼盘字典可获 P1 客源优先权；交易分成最高 80% 直接归您" },
  { role: "平台工作人员", text: "审核队列、风控异常、收益核算——完整后台工具链支撑您高效处理" },
];

export default function HomePage() {
  const [status, setStatus] = useState<FeedState>("loading");
  const [city, setCity] = useState("北京");
  const [items, setItems] = useState<FeedListing[]>([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(defaultFeed.slice(0, 6));
      setStatus("ready");
    }, 650);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (status !== "ready") return;
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 220;
      if (!nearBottom) return;

      setItems((currentItems) => {
        if (currentItems.length >= defaultFeed.length * 2) return currentItems;
        const nextBatch = buildFeed(4).map((listing, index) => ({
          ...listing,
          id: `${listing.id}-more-${page}-${index}`,
        }));
        return [...currentItems, ...nextBatch];
      });
      setPage((currentPage) => currentPage + 1);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, status]);

  const agent = mockAgents[0];
  const unreadCount = 2;

  const cards = useMemo(() => {
    if (status !== "ready") return null;

    return items.map((listing, index) => (
      <div key={listing.id} className="break-inside-avoid">
        {index === 4 ? <PriceFlash /> : null}
        <ListingCard listing={listing} agentName={agent.displayName} onFavorite={() => showToast("已加入收藏")} />
      </div>
    ));
  }, [agent.displayName, items, status]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function refreshFeed() {
    setRefreshing(true);
    window.setTimeout(() => {
      setItems(buildFeed().reverse().slice(0, 6));
      setStatus("ready");
      setRefreshing(false);
      showToast("推荐流已刷新");
    }, 700);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const startY = touchStartY.current;
    touchStartY.current = null;
    if (startY === null || window.scrollY > 0) return;
    const distance = (event.changedTouches[0]?.clientY ?? startY) - startY;
    if (distance > 72) refreshFeed();
  }

  return (
    <main className="mobile-shell pb-28" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 items-center gap-1 rounded-xl bg-neutral-100 px-3 text-body-s font-semibold text-neutral-900"
            onClick={() => setCitySheetOpen(true)}
          >
            <MapPin className="size-4 text-primary-700" />
            {city}
            <ChevronDown className="size-4 text-neutral-500" />
          </button>
          <Link
            href="/search"
            className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-neutral-100 px-3 text-body-s text-neutral-500"
          >
            <Search className="size-5" />
            搜索小区、地铁、商圈
          </Link>
          <button type="button" className="relative flex size-11 items-center justify-center rounded-xl bg-neutral-100">
            <Bell className="size-5 text-neutral-700" />
            <span className="absolute right-2 top-2 min-w-4 rounded-full bg-secondary-500 px-1 text-[10px] leading-4 text-white">
              {unreadCount}
            </span>
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-2xl bg-primary-900 p-4 text-white shadow-card">
          <p className="text-caption text-primary-300">Fori 今日推荐</p>
          <h1 className="mt-2 text-h1">真实核验房源，按在地价格层级推荐</h1>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-caption">
            {[
              { label: "楼盘字典", icon: Building2 },
              { label: "价格评估", icon: LineChart },
              { label: "经纪认证", icon: UserCheck },
              { label: "发布房源", icon: ShieldCheck },
            ].map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.label} className="rounded-xl bg-white/10 px-1 py-3">
                  <Icon className="mx-auto mb-2 size-5" />
                  {entry.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption font-semibold text-primary-700">功能清单对齐</p>
              <h2 className="mt-1 text-h3">六大模块入口保持可见</h2>
            </div>
            <Link href="/profile" className="text-caption font-semibold text-primary-700">
              我的权益
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {moduleChecklist.map((item) => (
              <Link key={item.module} href={item.href} className="rounded-xl bg-neutral-100 p-3">
                <p className="text-body-s font-semibold text-neutral-900">{item.module}</p>
                <p className="mt-1 text-caption text-neutral-500">{item.status}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-card">
          <p className="text-caption font-semibold text-primary-700">角色化使用路径</p>
          <div className="mt-3 space-y-2">
            {roleGuides.map((item) => (
              <div key={item.role} className="rounded-xl border border-neutral-200 p-3">
                <p className="text-body-s font-semibold">{item.role}</p>
                <p className="mt-1 text-caption text-neutral-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-neutral-500">{refreshing ? "正在刷新推荐" : "下拉可刷新"}</p>
            <h2 className="text-h2">为你推荐</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={refreshFeed} disabled={refreshing}>
            <RefreshCw className={`mr-1 size-4 ${refreshing ? "animate-spin" : ""}`} />
            换一批
          </Button>
        </div>

        {status === "loading" ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : null}

        {status === "error" ? (
          <ErrorState
            title="推荐服务暂不可用"
            code="HOME_FEED_MOCK_ERROR"
            description="当前为本地原型，可重试恢复 Mock 推荐流。"
            onRetry={() => {
              setStatus("loading");
              window.setTimeout(() => {
                setItems(defaultFeed.slice(0, 6));
                setStatus("ready");
              }, 500);
            }}
          />
        ) : null}

        {status === "empty" ? (
          <EmptyState title="暂无推荐，换个城市试试？" description="可切换城市或稍后刷新推荐流。" actionLabel="选择城市" onAction={() => setCitySheetOpen(true)} />
        ) : null}

        {status === "ready" ? <div className="columns-2 gap-3 space-y-3">{cards}</div> : null}
      </section>

      <div className="fixed bottom-24 right-[calc(50%-205px)] z-20 flex flex-col gap-2 px-4">
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setStatus("empty")}>
          空状态
        </button>
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setStatus("error")}>
          错误
        </button>
      </div>

      <BottomSheet open={citySheetOpen} title="选择城市" onClose={() => setCitySheetOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          {cityOptions.map((cityName) => (
            <Button
              key={cityName}
              variant={cityName === city ? "primary" : "secondary"}
              onClick={() => {
                setCity(cityName);
                setStatus("loading");
                setCitySheetOpen(false);
                window.setTimeout(() => {
                  setItems(buildFeed().slice(0, 6));
                  setStatus("ready");
                }, 500);
              }}
            >
              {cityName}
            </Button>
          ))}
        </div>
      </BottomSheet>

      {toast ? <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-[390px] px-4"><Toast type="success" title={toast} /></div> : null}
      <AgentAssistFab pageContext="首页功能总览" suggestedPrompts={["我作为买家应该从哪一步开始？", "解释 Fori 六大模块如何协同", "哪些信息需要实名认证后可见？"]} />
      <TabBar active="home" />
    </main>
  );
}

function PriceFlash() {
  return (
    <div className="mb-3 rounded-xl bg-primary-100 p-3 text-primary-900 shadow-card">
      <p className="text-body-s font-semibold">今日价格快讯</p>
      <div className="mt-2 space-y-1 text-caption">
        <p>中关村：近 30 日挂牌均价 -1.8%</p>
        <p>知春路：三居成交周期缩短 5 天</p>
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  agentName,
  onFavorite,
}: {
  listing: FeedListing;
  agentName: string;
  onFavorite: () => void;
}) {
  return (
    <article className="mb-3 overflow-hidden rounded-xl bg-white shadow-card">
      <Link href={`/listing/${listing.id}`} className="block">
        <div className={`relative aspect-[3/3.4] bg-gradient-to-br ${listing.imageTone}`}>
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/85 p-2 backdrop-blur">
            <p className="line-clamp-2 text-body-s font-semibold text-neutral-900">{listing.recommendationReason}</p>
          </div>
        </div>
      </Link>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listing/${listing.id}`} className="line-clamp-2 text-body-s font-semibold text-neutral-900">
            {listing.title}
          </Link>
          <button type="button" aria-label="收藏房源" className="text-neutral-500" onClick={onFavorite}>
            <Heart className="size-5" />
          </button>
        </div>
        <p className="price-nums text-price-m text-secondary-500">
          {listing.priceWan}
          <span className="ml-1 text-caption">万</span>
        </p>
        <p className="text-caption text-neutral-500">
          {listing.areaSqm}㎡ · {listing.rooms}室{listing.halls}厅 · {listing.floor}/{listing.totalFloors}层
        </p>
        <p className="line-clamp-1 text-caption text-neutral-500">
          {listing.communityName} · {listing.district}
        </p>
        <div className="flex flex-wrap gap-1">
          {listing.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] leading-4 text-primary-700">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-neutral-200 pt-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary-700 text-[10px] font-semibold text-white">
            {agentName.slice(0, 1)}
          </div>
          <span className="text-caption text-neutral-500">{agentName} · {listing.postedAgo}</span>
        </div>
      </div>
    </article>
  );
}
