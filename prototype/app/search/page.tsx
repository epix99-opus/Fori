"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Clock3,
  Heart,
  ListFilter,
  Map,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockAgents, mockListings, type Listing } from "@/lib/mock";
import { cn } from "@/lib/utils";

type SearchState = "loading" | "ready" | "empty" | "error";
type SortKey = "latest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";

type SearchListing = Listing & {
  imageTone: string;
  orientation: string;
  decoration: string;
  postedAgo: string;
};

type Filters = {
  district: string;
  price: string;
  rooms: string[];
  area: string;
  orientation: string;
  floor: string;
  tags: string[];
};

const initialFilters: Filters = {
  district: "全部区域",
  price: "不限",
  rooms: [],
  area: "不限",
  orientation: "不限",
  floor: "不限",
  tags: [],
};

const sortLabels: Record<SortKey, string> = {
  latest: "最新",
  price_asc: "价格↑",
  price_desc: "价格↓",
  area_asc: "面积↑",
  area_desc: "面积↓",
};

const histories = ["中关村三居", "知春路 90㎡", "近地铁 满五", "海淀 A 级小区"];
const hotCommunities = ["中关村小区", "知春里", "学院南路 32 号院", "万柳书院", "融科橄榄城", "上地东里"];
const imageTones = [
  "from-primary-100 via-white to-secondary-200",
  "from-blue-100 via-white to-emerald-100",
  "from-amber-100 via-white to-primary-100",
  "from-neutral-200 via-white to-blue-100",
];

const allListings: SearchListing[] = Array.from({ length: 9 }, (_, index) => {
  const base = mockListings[index % mockListings.length];
  const districts = ["海淀", "朝阳", "西城"];
  const titles = ["南北通透三居", "近地铁精装两居", "满五唯一改善房", "低密花园小高层"];

  return {
    ...base,
    id: index === 0 ? base.id : `${base.id}-search-${index}`,
    title: `${base.communityName}${titles[index % titles.length]}`,
    district: districts[index % districts.length],
    priceWan: base.priceWan + index * 18,
    areaSqm: base.areaSqm + (index % 4) * 9,
    rooms: index % 3 === 0 ? 3 : index % 3 === 1 ? 2 : 4,
    floor: index % 4 === 0 ? "低楼层" : index % 4 === 1 ? "中楼层" : index % 4 === 2 ? "高楼层" : "顶层",
    tags: index % 2 === 0 ? ["已核验", "近地铁", "满5年"] : ["核验中", "学区房", "独立产权"],
    imageTone: imageTones[index % imageTones.length],
    orientation: index % 2 === 0 ? "南北" : "东南",
    decoration: index % 2 === 0 ? "精装" : "简装",
    postedAgo: index < 2 ? "刚刚更新" : `${index + 1} 天前`,
  };
});

export default function SearchPage() {
  const [status, setStatus] = useState<SearchState>("loading");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("ready"), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const suggestions = useMemo(() => {
    const source = Array.from(new Set(allListings.flatMap((listing) => [listing.communityName, listing.address, ...listing.tags])));
    if (!keyword) return source.slice(0, 5);
    return source.filter((item) => item.includes(keyword)).slice(0, 5);
  }, [keyword]);

  const results = useMemo(() => {
    const normalizedKeyword = keyword.trim();
    const filtered = allListings.filter((listing) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [listing.title, listing.communityName, listing.address, listing.district, ...listing.tags].some((text) => text.includes(normalizedKeyword));
      const matchesDistrict = filters.district === "全部区域" || listing.district === filters.district;
      const matchesRooms = filters.rooms.length === 0 || filters.rooms.includes(`${listing.rooms}室`);
      const matchesTags = filters.tags.length === 0 || filters.tags.every((tag) => listing.tags.includes(tag));
      const matchesFloor = filters.floor === "不限" || listing.floor === filters.floor;
      const matchesOrientation = filters.orientation === "不限" || listing.orientation === filters.orientation;
      const matchesPrice = filters.price === "不限" || (filters.price === "300万以下" ? listing.priceWan < 300 : listing.priceWan >= 300);
      const matchesArea = filters.area === "不限" || (filters.area === "90㎡以下" ? listing.areaSqm < 90 : listing.areaSqm >= 90);
      return matchesKeyword && matchesDistrict && matchesRooms && matchesTags && matchesFloor && matchesOrientation && matchesPrice && matchesArea;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price_asc") return a.priceWan - b.priceWan;
      if (sort === "price_desc") return b.priceWan - a.priceWan;
      if (sort === "area_asc") return a.areaSqm - b.areaSqm;
      if (sort === "area_desc") return b.areaSqm - a.areaSqm;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [filters, keyword, sort]);

  const selectedFilterCount = getSelectedFilterCount(filters);
  const visibleStatus: SearchState = status === "ready" && results.length === 0 ? "empty" : status;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1700);
  }

  function patchFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleArrayFilter(key: "rooms" | "tags", value: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
  }

  return (
    <main className="mobile-shell pb-8">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
            <Input
              aria-label="搜索关键词"
              autoFocus
              className="h-11 rounded-xl bg-neutral-100 pl-10 pr-10"
              placeholder="搜索小区、地址、关键词"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            {keyword ? (
              <button
                type="button"
                aria-label="清空搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                onClick={() => setKeyword("")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Link href="/home" className="px-1 text-body-s font-semibold text-primary-700">
            取消
          </Link>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {!keyword ? (
          <SearchDiscovery
            onKeyword={(value) => setKeyword(value)}
            onClear={() => showToast("搜索历史已清除")}
          />
        ) : null}

        {keyword && suggestions.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="shrink-0 rounded-full bg-white px-3 py-2 text-caption font-semibold text-neutral-700 shadow-card"
                onClick={() => setKeyword(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <div className="rounded-xl bg-white p-3 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-neutral-500">搜索结果</p>
              <h1 className="text-h2">找到 {visibleStatus === "ready" ? results.length : "--"} 套房源</h1>
            </div>
            <button type="button" className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-2 text-caption font-semibold" onClick={() => showToast("地图模式原型入口")}>
              <Map className="size-4" />
              地图
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-caption font-semibold",
                  sort === key ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700",
                )}
                onClick={() => setSort(key)}
              >
                {sortLabels[key]}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <QuickFilter label={filters.district} active={filters.district !== "全部区域"} onClick={() => patchFilter("district", filters.district === "海淀" ? "全部区域" : "海淀")} />
            <QuickFilter label={filters.rooms[0] ?? "户型"} active={filters.rooms.length > 0} onClick={() => toggleArrayFilter("rooms", "3室")} />
            <QuickFilter label={filters.price} active={filters.price !== "不限"} onClick={() => patchFilter("price", filters.price === "300万以下" ? "不限" : "300万以下")} />
            <QuickFilter label={`更多筛选${selectedFilterCount ? ` · ${selectedFilterCount}` : ""}`} active={selectedFilterCount > 0} onClick={() => setSheetOpen(true)} icon />
          </div>
        </div>

        {visibleStatus === "loading" ? (
          <div className="space-y-3">
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </div>
        ) : null}

        {visibleStatus === "error" ? (
          <ErrorState
            title="搜索服务暂不可用"
            code="SEARCH_MOCK_ERROR"
            description="可重试恢复本地 Mock 搜索结果，或查看热门小区。"
            onRetry={() => {
              setStatus("loading");
              window.setTimeout(() => setStatus("ready"), 450);
            }}
          />
        ) : null}

        {visibleStatus === "empty" ? (
          <EmptyState
            title="没有符合条件的房源"
            description="可以放宽价格、面积或标签条件，也可以订阅提醒。"
            actionLabel="重置筛选"
            onAction={() => {
              setFilters(initialFilters);
              setKeyword("");
            }}
          />
        ) : null}

        {visibleStatus === "ready" ? (
          <div className="space-y-3">
            {results.map((listing) => (
              <ListingResultCard key={listing.id} listing={listing} onFavorite={() => showToast("已加入收藏")} />
            ))}
          </div>
        ) : null}
      </section>

      <div className="fixed bottom-4 right-[calc(50%-205px)] z-20 flex flex-col gap-2 px-4">
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setKeyword("不存在的小区")}>
          空状态
        </button>
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setStatus("error")}>
          错误
        </button>
      </div>

      <BottomSheet open={sheetOpen} title="筛选房源" onClose={() => setSheetOpen(false)}>
        <div className="max-h-[58vh] space-y-5 overflow-y-auto pr-1">
          <FilterGroup title="区域" options={["全部区域", "海淀", "朝阳", "西城"]} selected={[filters.district]} onSelect={(value) => patchFilter("district", value)} />
          <FilterGroup title="价格" options={["不限", "300万以下", "300万以上"]} selected={[filters.price]} onSelect={(value) => patchFilter("price", value)} />
          <FilterGroup title="户型" options={["1室", "2室", "3室", "4室"]} selected={filters.rooms} onSelect={(value) => toggleArrayFilter("rooms", value)} multiple />
          <FilterGroup title="面积" options={["不限", "90㎡以下", "90㎡以上"]} selected={[filters.area]} onSelect={(value) => patchFilter("area", value)} />
          <FilterGroup title="朝向" options={["不限", "南北", "东南"]} selected={[filters.orientation]} onSelect={(value) => patchFilter("orientation", value)} />
          <FilterGroup title="楼层" options={["不限", "低楼层", "中楼层", "高楼层", "顶层"]} selected={[filters.floor]} onSelect={(value) => patchFilter("floor", value)} />
          <FilterGroup title="标签" options={["学区房", "近地铁", "独立产权", "满5年"]} selected={filters.tags} onSelect={(value) => toggleArrayFilter("tags", value)} multiple />
        </div>
        <div className="mt-4 grid grid-cols-[1fr_2fr] gap-3 border-t border-neutral-200 pt-4">
          <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
            <RotateCcw className="mr-1 size-4" />
            重置
          </Button>
          <Button onClick={() => setSheetOpen(false)}>
            查看 {results.length} 套
          </Button>
        </div>
      </BottomSheet>

      {toast ? <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-[390px] px-4"><Toast type="success" title={toast} /></div> : null}
    </main>
  );
}

function SearchDiscovery({ onKeyword, onClear }: { onKeyword: (value: string) => void; onClear: () => void }) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-h3">近期搜索</h2>
          <button type="button" className="text-caption font-semibold text-neutral-500" onClick={onClear}>
            清除
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {histories.map((item) => (
            <button key={item} type="button" className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-2 text-caption" onClick={() => onKeyword(item)}>
              <Clock3 className="size-3.5 text-neutral-500" />
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-card">
        <h2 className="text-h3">热门小区</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {hotCommunities.map((item, index) => (
            <button key={item} type="button" className="overflow-hidden rounded-xl bg-neutral-100 text-left" onClick={() => onKeyword(item)}>
              <div className={`h-16 bg-gradient-to-br ${imageTones[index % imageTones.length]}`} />
              <span className="block px-2 py-2 text-[11px] font-semibold leading-4 text-neutral-800">{item}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickFilter({ label, active, icon, onClick }: { label: string; active: boolean; icon?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-caption font-semibold",
        active ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-700",
      )}
      onClick={onClick}
    >
      {icon ? <SlidersHorizontal className="size-4" /> : null}
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  multiple,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string[];
  multiple?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-body-s font-semibold">
        <ListFilter className="size-4 text-primary-700" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={cn("rounded-full px-3 py-2 text-caption font-semibold", active ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700")}
              onClick={() => {
                if (!multiple && active) return;
                onSelect(option);
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ListingResultCard({ listing, onFavorite }: { listing: SearchListing; onFavorite: () => void }) {
  const agent = mockAgents.find((item) => item.id === listing.agentId) ?? mockAgents[0];
  const unitPrice = Math.round((listing.priceWan * 10000) / listing.areaSqm);

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-card">
      <div className="flex gap-3 p-3">
        <Link href={`/listing/${listing.id}`} className={`h-28 w-28 shrink-0 rounded-xl bg-gradient-to-br ${listing.imageTone}`} aria-label={listing.title} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link href={`/listing/${listing.id}`} className="line-clamp-2 flex-1 text-body-s font-semibold text-neutral-900">
              {listing.title}
            </Link>
            <button type="button" aria-label="收藏房源" className="text-neutral-500" onClick={onFavorite}>
              <Heart className="size-5" />
            </button>
          </div>
          <p className="mt-2 price-nums text-price-m text-secondary-500">
            {listing.priceWan}万
            <span className="ml-1 text-caption">约 {unitPrice.toLocaleString("zh-CN")} 元/㎡</span>
          </p>
          <p className="mt-1 text-caption text-neutral-500">
            {listing.areaSqm}㎡ · {listing.rooms}室{listing.halls}厅 · {listing.orientation} · {listing.floor}
          </p>
          <p className="mt-1 line-clamp-1 text-caption text-neutral-500">
            {listing.communityName} · {listing.district} · {agent.displayName}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {listing.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] leading-4 text-primary-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2 text-caption text-neutral-500">
        <span>{listing.postedAgo}</span>
        <span className="inline-flex items-center gap-1">
          <ArrowDownUp className="size-3.5" />
          {listing.decoration}
        </span>
      </div>
    </article>
  );
}

function getSelectedFilterCount(filters: Filters) {
  let count = 0;
  if (filters.district !== "全部区域") count += 1;
  if (filters.price !== "不限") count += 1;
  if (filters.rooms.length > 0) count += 1;
  if (filters.area !== "不限") count += 1;
  if (filters.orientation !== "不限") count += 1;
  if (filters.floor !== "不限") count += 1;
  if (filters.tags.length > 0) count += 1;
  return count;
}
