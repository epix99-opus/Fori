"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Heart,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  Sofa,
  Star,
  TrendingDown,
} from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { mockAgents, mockListings, type Listing } from "@/lib/mock";

type ListingPageProps = {
  params: {
    id: string;
  };
};

type DetailState = "loading" | "ready" | "empty" | "error";

const detailImages = [
  "from-primary-100 via-white to-secondary-200",
  "from-blue-100 via-white to-emerald-100",
  "from-amber-100 via-white to-primary-100",
];

export default function ListingDetailPage({ params }: ListingPageProps) {
  const [status, setStatus] = useState<DetailState>("loading");
  const [activeImage, setActiveImage] = useState(0);
  const [priceOpen, setPriceOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const listing = useMemo(() => findListing(params.id), [params.id]);
  const agent = mockAgents.find((item) => item.id === listing?.agentId) ?? mockAgents[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (params.id === "error") {
        setStatus("error");
        return;
      }

      setStatus(listing ? "ready" : "empty");
    }, 650);

    return () => window.clearTimeout(timer);
  }, [listing, params.id]);

  if (status === "loading") {
    return (
      <main className="mobile-shell pb-24">
        <Skeleton className="h-[260px] rounded-none" />
        <section className="-mt-5 space-y-4 rounded-t-2xl bg-white p-4">
          <Skeleton className="h-9 w-2/5" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton variant="list" />
          <Skeleton variant="card" />
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mobile-shell flex min-h-dvh items-center px-4">
        <ErrorState
          title="房源详情加载失败"
          code="LISTING_MOCK_ERROR"
          description="当前为本地原型，可重试恢复详情数据。"
          onRetry={() => {
            setStatus("loading");
            window.setTimeout(() => setStatus(listing ? "ready" : "empty"), 500);
          }}
        />
      </main>
    );
  }

  if (status === "empty" || !listing) {
    return (
      <main className="mobile-shell flex min-h-dvh items-center px-4">
        <EmptyState
          title="房源不存在或已下架"
          description="可以返回首页查看相似推荐房源。"
          actionLabel="返回首页"
          onAction={() => {
            window.location.href = "/home";
          }}
        />
      </main>
    );
  }

  const unitPrice = Math.round((listing.priceWan * 10000) / listing.areaSqm);

  return (
    <main className="mobile-shell bg-neutral-100 pb-28">
      <section className="relative h-[260px] overflow-hidden bg-primary-900 text-white">
        <div className={`h-full w-full bg-gradient-to-br ${detailImages[activeImage]} transition-colors`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <Link href="/home" className="flex size-10 items-center justify-center rounded-full bg-white/80 text-neutral-900 backdrop-blur">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="收藏房源"
              className="flex size-10 items-center justify-center rounded-full bg-white/80 text-neutral-900 backdrop-blur"
              onClick={() => setFavorite((value) => !value)}
            >
              <Heart className={`size-5 ${favorite ? "fill-secondary-500 text-secondary-500" : ""}`} />
            </button>
            <button type="button" aria-label="分享房源" className="flex size-10 items-center justify-center rounded-full bg-white/80 text-neutral-900 backdrop-blur">
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-caption text-white/80">{listing.communityName}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h1 className="line-clamp-2 text-h1">{listing.title}</h1>
            <div className="rounded-full bg-black/35 px-2 py-1 text-caption">
              {activeImage + 1}/{detailImages.length}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {detailImages.map((tone, index) => (
              <button
                key={tone}
                type="button"
                aria-label={`查看第 ${index + 1} 张图片`}
                className={`h-1.5 rounded-full ${activeImage === index ? "w-7 bg-white" : "w-3 bg-white/50"}`}
                onClick={() => setActiveImage(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="-mt-5 space-y-4 rounded-t-2xl bg-white px-4 pb-5 pt-5 shadow-card">
        <div>
          <div className="flex items-end gap-2">
            <p className="price-nums text-price-l text-secondary-500">
              ¥ {listing.priceWan}万
            </p>
            <span className="pb-1 text-body-s text-neutral-500">总价</span>
          </div>
          <p className="mt-1 text-body-s text-neutral-500">均价 {unitPrice.toLocaleString("zh-CN")} 元/㎡</p>
        </div>

        <div>
          <h2 className="text-h2">{listing.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-xl bg-neutral-100 p-3 text-center">
          <InfoCell icon={Sofa} label="户型" value={`${listing.rooms}室${listing.halls}厅1卫`} />
          <InfoCell icon={Ruler} label="面积" value={`${listing.areaSqm}㎡`} />
          <InfoCell icon={TrendingDown} label="朝向" value="南北" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-body-s">
          <SpecItem label="楼层" value={`${listing.floor}层 / 共${listing.totalFloors}层`} />
          <SpecItem label="装修" value="精装" />
          <SpecItem label="建成年份" value="2010年" />
          <SpecItem label="产权" value="满五唯一" />
        </div>

        <div className="flex flex-wrap gap-2 text-caption">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-semantic-success">
            <BadgeCheck className="size-4" />
            实名核验房源
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-primary-700">
            <BadgeCheck className="size-4" />
            公证机构备案
          </span>
        </div>
      </section>

      <section className="space-y-4 px-4 py-4">
        <article className="rounded-xl bg-white p-4 shadow-card">
          <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setPriceOpen((value) => !value)}>
            <div>
              <p className="text-caption text-neutral-500">在地分层价格评估</p>
              <h3 className="mt-1 text-h3">该房源价格评估：合理偏低 3%</h3>
            </div>
            <ChevronDown className={`size-5 text-neutral-500 transition-transform ${priceOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="mt-3 rounded-xl bg-primary-100 p-3 text-body-s text-primary-900">
            中关村 A 层级小区三居成交均价约 {Math.round(unitPrice * 1.03).toLocaleString("zh-CN")} 元/㎡，本房源总价处于可谈区间。
          </div>
          {priceOpen ? (
            <div className="mt-3 space-y-3 text-body-s text-neutral-700">
              <SpecItem label="小区层级" value="A- 科技园核心成熟小区" />
              <SpecItem label="同户型参考" value="近 6 个月 4 套成交" />
              <SpecItem label="影响因素" value="楼层适中、满五唯一、装修维护良好" />
              <Button className="w-full" variant="secondary">查看完整价格图谱</Button>
            </div>
          ) : null}
        </article>

        <article className="rounded-xl bg-white p-4 shadow-card">
          <h3 className="text-h3">经纪人信息</h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-700 text-h3 text-white">
              {agent.displayName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{agent.displayName}</p>
                <span className="rounded-full bg-secondary-200 px-2 py-0.5 text-caption text-secondary-600">{agent.level}</span>
              </div>
              <p className="mt-1 text-body-s text-neutral-500">{agent.storeName}</p>
              <p className="mt-1 flex items-center gap-1 text-caption text-neutral-500">
                <Star className="size-4 fill-secondary-500 text-secondary-500" />
                信用评分 {agent.rating} · 成交 36 件 · 10 分钟前活跃
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl bg-white p-4 shadow-card">
          <h3 className="text-h3">房屋详情</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-body-s">
            <SpecItem label="建筑面积" value={`${listing.areaSqm}㎡`} />
            <SpecItem label="套内面积" value="78㎡" />
            <SpecItem label="物业费" value="3.8 元/㎡/月" />
            <SpecItem label="车位" value="可租可售" />
          </div>
        </article>
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white px-4 pt-3">
        <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-2">
          <Button variant="secondary" className="h-12">
            <Phone className="mr-1 size-4" />
            联系
          </Button>
          <Button variant="secondary" className="h-12">
            <MessageCircle className="mr-1 size-4" />
            沟通
          </Button>
          <Button className="h-12 px-2 text-xs sm:text-sm" onClick={() => setAppointmentOpen(true)}>
            <CalendarDays className="mr-1 size-4" />
            发起购买意向
          </Button>
        </div>
      </div>

      <BottomSheet open={appointmentOpen} title="发起购买意向" onClose={() => setAppointmentOpen(false)}>
        <div className="space-y-3">
          {["预约明天 10:00 看房并发起意向", "提交首轮意向价 268 万", "邀请经纪人创建交易记录"].map((time) => (
            <button key={time} type="button" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left text-body-m">
              {time}
            </button>
          ))}
          <Button className="w-full" onClick={() => setAppointmentOpen(false)}>确认并进入交易</Button>
        </div>
      </BottomSheet>
    </main>
  );
}

function findListing(id: string): Listing | undefined {
  const normalizedId = id.split("-more-")[0].replace(/-\d+$/, "");
  return mockListings.find((listing) => listing.id === id || listing.id === normalizedId);
}

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sofa;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Icon className="mx-auto size-5 text-primary-700" />
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
      <p className="mt-1 text-body-s font-semibold">{value}</p>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-100 px-3 py-2">
      <p className="text-caption text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
