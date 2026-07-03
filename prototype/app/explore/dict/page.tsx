"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronDown,
  CircleDollarSign,
  MapPin,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { ViewModeToggle, type DictViewMode } from "@/components/ViewModeToggle";
import { ViewerRoleSwitcher } from "@/components/ViewerRoleSwitcher";
import { mockAgents, mockListings, type Listing } from "@/lib/mock";
import { canViewField, maskValue, type ViewerRole } from "@/lib/viewer-role";
import { cn } from "@/lib/utils";

type DictState = "loading" | "ready" | "empty" | "error";
type QualityGrade = "A" | "B" | "C" | "D";

type Building = {
  id: string;
  name: string;
  floors: number;
  units: number;
  type: string;
  hasElevator: boolean;
  unitsRecorded: string[];
};

type Community = {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  avgPrice: number;
  saleCount: number;
  maintainerCount: number;
  maintainerNames: string[];
  grade: QualityGrade;
  updatedAgo: string;
  imageTone: string;
  developer: string;
  year: number;
  buildings: Building[];
  listings: Listing[];
};

const imageTones = [
  "from-primary-100 via-white to-secondary-200",
  "from-blue-100 via-white to-emerald-100",
  "from-amber-100 via-white to-primary-100",
  "from-neutral-200 via-white to-blue-100",
];

const communities: Community[] = Array.from({ length: 8 }, (_, index) => {
  const listing = mockListings[index % mockListings.length];
  const names = ["中关村小区", "知春里", "学院南路 32 号院", "万柳书院", "上地东里", "融科橄榄城", "牡丹园西里", "苏州街公寓"];
  const districts = ["海淀", "海淀", "海淀", "海淀", "海淀", "朝阳", "海淀", "西城"];
  const grades: QualityGrade[] = ["A", "B", "B", "A", "C", "B", "C", "D"];
  const saleCount = 12 - index;

  return {
    id: index === 0 ? listing.communityId : `community-${String(index + 1).padStart(3, "0")}`,
    name: names[index],
    city: "北京",
    district: districts[index],
    address: index === 0 ? listing.address : `${districts[index]}示范路 ${18 + index} 号`,
    avgPrice: 72000 + index * 2600,
    saleCount: Math.max(saleCount, 1),
    maintainerCount: 5 + index,
    maintainerNames: [mockAgents[0]?.displayName ?? "维护经纪人", index % 2 === 0 ? "王佳" : "李宁", "陈晨"],
    grade: grades[index],
    updatedAgo: index < 2 ? "3 小时前" : `${index + 1} 天前`,
    imageTone: imageTones[index % imageTones.length],
    developer: index % 2 === 0 ? "北京城市建设开发" : "首开集团",
    year: 2006 + index,
    buildings: [
      {
        id: `building-${index}-1`,
        name: "1 号楼",
        floors: 18 + (index % 3) * 3,
        units: 3,
        type: "板楼",
        hasElevator: true,
        unitsRecorded: ["1-802", "2-1201", "3-1602"],
      },
      {
        id: `building-${index}-2`,
        name: "2 号楼",
        floors: 12 + (index % 2) * 6,
        units: 2,
        type: index % 2 === 0 ? "塔楼" : "板塔结合",
        hasElevator: index % 2 === 0,
        unitsRecorded: ["1-603", "2-901"],
      },
    ],
    listings: Array.from({ length: Math.min(3, saleCount) }, (_, listingIndex) => ({
      ...listing,
      id: `${listing.id}-dict-${index}-${listingIndex}`,
      communityId: index === 0 ? listing.communityId : `community-${String(index + 1).padStart(3, "0")}`,
      communityName: names[index],
      district: districts[index],
      priceWan: listing.priceWan + index * 22 + listingIndex * 8,
      areaSqm: listing.areaSqm + listingIndex * 6,
      title: `${names[index]} ${listingIndex % 2 === 0 ? "核验三居" : "精装两居"}`,
    })),
  };
});

const cities = ["北京", "上海", "深圳"];
const districts = ["全部片区", "海淀", "朝阳", "西城"];

export default function DictBrowsePage() {
  const [status, setStatus] = useState<DictState>("loading");
  const [city, setCity] = useState("北京");
  const [district, setDistrict] = useState("全部片区");
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<DictViewMode>("card");
  const [viewerRole, setViewerRole] = useState<ViewerRole>("guest");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("ready"), 520);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      const matchesCity = community.city === city;
      const matchesDistrict = district === "全部片区" || community.district === district;
      const matchesKeyword = !keyword || [community.name, community.address, community.developer].some((text) => text.includes(keyword));
      return matchesCity && matchesDistrict && matchesKeyword;
    });
  }, [city, district, keyword]);

  const selectedCommunity = communities.find((community) => community.id === selectedCommunityId) ?? null;
  const visibleStatus: DictState = status === "ready" && !selectedCommunity && filteredCommunities.length === 0 ? "empty" : status;

  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        expandedBuildingId={expandedBuildingId}
        viewerRole={viewerRole}
        onToggleBuilding={(buildingId) => setExpandedBuildingId((current) => (current === buildingId ? null : buildingId))}
        onBack={() => {
          setSelectedCommunityId(null);
          setExpandedBuildingId(null);
        }}
      />
    );
  }

  if (viewMode === "map") {
    return (
      <main className="mobile-shell min-h-dvh bg-neutral-100">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <div className="mt-3">
            <ViewerRoleSwitcher value={viewerRole} onChange={setViewerRole} />
          </div>
        </header>
        <section className="relative h-[calc(100dvh-180px)] overflow-hidden bg-[#D8E7DF]">
          <div className="absolute inset-0 bg-[linear-gradient(35deg,rgba(255,255,255,.55)_12%,transparent_12%,transparent_50%,rgba(255,255,255,.5)_50%,rgba(255,255,255,.5)_62%,transparent_62%)] bg-[length:88px_88px]" />
          {filteredCommunities.slice(0, 6).map((community, index) => (
            <button
              key={community.id}
              type="button"
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-700 px-3 py-2 text-caption font-semibold text-white shadow-card"
              style={{ left: `${18 + index * 14}%`, top: `${28 + (index % 3) * 18}%` }}
              onClick={() => setSelectedCommunityId(community.id)}
            >
              {community.name} · {canViewField(viewerRole, "priceReference") ? `${community.saleCount}套` : "登录可见"}
            </button>
          ))}
        </section>
        <div className="px-4 py-3">
          <Link href="/explore/map" className="block text-center text-caption font-semibold text-primary-700">
            打开全屏地图页 →
          </Link>
        </div>
        <AgentAssistFab pageContext="楼盘字典 · 地图模式" suggestedPrompts={["这片区域有哪些 A 级小区？", "帮我对比地图上的在售套数"]} />
      </main>
    );
  }

  return (
    <main className="mobile-shell pb-8">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
            <Input
              aria-label="搜索小区"
              className="h-11 rounded-xl bg-neutral-100 pl-10"
              placeholder="搜索小区名、地址"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <select
            aria-label="城市选择"
            className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-body-s font-semibold"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          >
            {cities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {districts.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-caption font-semibold",
                district === item ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700",
              )}
              onClick={() => setDistrict(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-xl bg-primary-900 p-4 text-white shadow-card">
          <p className="text-caption text-primary-300">楼盘字典 · SUUMO 式规范披露</p>
          <h1 className="mt-1 text-h1">按城市、片区浏览真实小区底表</h1>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-caption">
            <Metric label="小区" value={`${filteredCommunities.length}`} />
            <Metric
              label="在售"
              value={
                canViewField(viewerRole, "priceReference")
                  ? `${filteredCommunities.reduce((sum, item) => sum + item.saleCount, 0)}`
                  : "—"
              }
            />
            <Metric label="维护人" value={`${filteredCommunities.reduce((sum, item) => sum + item.maintainerCount, 0)}`} />
          </div>
        </div>

        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <ViewerRoleSwitcher value={viewerRole} onChange={setViewerRole} />

        {visibleStatus === "loading" ? <Skeleton variant="list" className="rounded-xl bg-white p-4 shadow-card" /> : null}

        {visibleStatus === "error" ? (
          <ErrorState
            title="楼盘字典加载失败"
            code="DICT_MOCK_ERROR"
            description="当前为本地原型，可重试恢复缓存版本。"
            onRetry={() => {
              setStatus("loading");
              window.setTimeout(() => setStatus("ready"), 450);
            }}
          />
        ) : null}

        {visibleStatus === "empty" ? (
          <EmptyState title="当前筛选下暂无小区" description="可切换片区，或清空搜索关键词后查看全部字典。" actionLabel="重置筛选" onAction={() => {
            setKeyword("");
            setDistrict("全部片区");
          }} />
        ) : null}

        {visibleStatus === "ready" ? (
          <div className={viewMode === "list" ? "divide-y divide-neutral-200 overflow-hidden rounded-xl bg-white shadow-card" : "space-y-3"}>
            {filteredCommunities.map((community) =>
              viewMode === "list" ? (
                <CommunityListRow
                  key={community.id}
                  community={community}
                  viewerRole={viewerRole}
                  onClick={() => setSelectedCommunityId(community.id)}
                />
              ) : (
                <CommunityCard
                  key={community.id}
                  community={community}
                  viewerRole={viewerRole}
                  onClick={() => setSelectedCommunityId(community.id)}
                />
              ),
            )}
          </div>
        ) : null}
      </section>

      <AgentAssistFab pageContext="楼盘字典 · 浏览" suggestedPrompts={["这个小区适合改善型买家吗？", "哪些字段需要实名才能看？"]} />

      <div className="fixed bottom-4 left-[calc(50%-205px)] z-20 flex flex-col gap-2 px-4">
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setKeyword("没有这个小区")}>
          空状态
        </button>
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setStatus("error")}>
          错误
        </button>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 py-3">
      <p className="price-nums text-h2">{value}</p>
      <p className="mt-1 text-white/70">{label}</p>
    </div>
  );
}

function CommunityListRow({
  community,
  viewerRole,
  onClick,
}: {
  community: Community;
  viewerRole: ViewerRole;
  onClick: () => void;
}) {
  return (
    <button type="button" className="flex w-full items-center gap-3 p-3 text-left" onClick={onClick}>
      <div className={`h-14 w-14 shrink-0 rounded-lg bg-gradient-to-br ${community.imageTone}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="line-clamp-1 text-body-s font-semibold">{community.name}</h2>
          <GradeBadge grade={community.grade} />
        </div>
        <p className="mt-1 text-caption text-neutral-500">{community.district} · {community.address}</p>
        <p className="mt-1 text-caption font-semibold text-secondary-500">
          {canViewField(viewerRole, "priceReference")
            ? `参考 ${(community.avgPrice / 10000).toFixed(1)} 万/㎡ · ${community.saleCount} 套在售`
            : maskValue(viewerRole, "priceReference", "")}
        </p>
      </div>
    </button>
  );
}

function CommunityCard({
  community,
  viewerRole,
  onClick,
}: {
  community: Community;
  viewerRole: ViewerRole;
  onClick: () => void;
}) {
  return (
    <button type="button" className="w-full overflow-hidden rounded-xl bg-white text-left shadow-card" onClick={onClick}>
      <div className="flex gap-3 p-3">
        <div className={`h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br ${community.imageTone}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="line-clamp-1 text-body-s font-semibold text-neutral-900">{community.name}</h2>
              <p className="mt-1 text-caption text-neutral-500">{community.district} · {community.updatedAgo}更新</p>
            </div>
            <GradeBadge grade={community.grade} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-caption">
            <SmallMetric
              label="参考均价"
              value={
                canViewField(viewerRole, "priceReference")
                  ? `${(community.avgPrice / 10000).toFixed(1)}万/㎡`
                  : "登录可见"
              }
            />
            <SmallMetric
              label="在售"
              value={canViewField(viewerRole, "priceReference") ? `${community.saleCount}套` : "—"}
            />
            <SmallMetric label="维护" value={`${community.maintainerCount}人`} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2 text-caption text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <UserRoundCheck className="size-3.5" />
          {community.maintainerNames.slice(0, 2).join("、")}
        </span>
        <span>查看详情</span>
      </div>
    </button>
  );
}

function CommunityDetail({
  community,
  expandedBuildingId,
  viewerRole,
  onToggleBuilding,
  onBack,
}: {
  community: Community;
  expandedBuildingId: string | null;
  viewerRole: ViewerRole;
  onToggleBuilding: (buildingId: string) => void;
  onBack: () => void;
}) {
  return (
    <main className="mobile-shell bg-neutral-100 pb-24">
      <header className="relative h-56 overflow-hidden bg-primary-900 text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${community.imageTone}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <button type="button" className="flex size-10 items-center justify-center rounded-full bg-white/85 text-neutral-900" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </button>
          <Link href={`/explore/dict/${community.id}/edit`} className="rounded-full bg-white/85 px-3 py-2 text-caption font-semibold text-neutral-900">
            维护字典
          </Link>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <h1 className="text-h1">{community.name}</h1>
            <GradeBadge grade={community.grade} />
          </div>
          <p className="mt-2 flex items-center gap-1 text-body-s text-white/85">
            <MapPin className="size-4" />
            {community.address}
          </p>
        </div>
      </header>

      <section className="-mt-4 space-y-4 rounded-t-2xl bg-neutral-100 px-4 pb-6 pt-4">
        <article className="rounded-xl bg-white p-4 shadow-card">
          <h2 className="text-h3">小区概览</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-body-s">
            <SpecItem label="开发商" value={community.developer} />
            <SpecItem label="竣工年份" value={`${community.year} 年`} />
            <SpecItem label="总楼栋" value={`${community.buildings.length} 栋`} />
            <SpecItem
              label="参考均价"
              value={
                canViewField(viewerRole, "priceReference")
                  ? `${community.avgPrice.toLocaleString("zh-CN")} 元/㎡`
                  : maskValue(viewerRole, "priceReference", "")
              }
            />
            {canViewField(viewerRole, "dealHistory") ? (
              <SpecItem label="近 12 月成交" value="18 套 · 均价 8.2 万/㎡" />
            ) : (
              <SpecItem label="近 12 月成交" value={maskValue(viewerRole, "dealHistory", "")} masked />
            )}
            <SpecItem label="容积率" value="2.6" />
            <SpecItem label="绿化率" value="32%" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["地铁", "学区", "商场", "医院"].map((tag) => (
              <span key={tag} className="rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">
                {tag}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-h3">楼栋信息</h2>
            <span className="text-caption text-neutral-500">{community.buildings.length} 栋已录入</span>
          </div>
          <div className="mt-3 space-y-2">
            {community.buildings.map((building) => (
              <div key={building.id} className="rounded-xl border border-neutral-200">
                <button type="button" className="flex w-full items-center justify-between p-3 text-left" onClick={() => onToggleBuilding(building.id)}>
                  <div>
                    <p className="font-semibold">{building.name}</p>
                    <p className="mt-1 text-caption text-neutral-500">
                      {building.floors} 层 · {building.units} 单元 · {building.type} · {building.hasElevator ? "有电梯" : "无电梯"}
                    </p>
                  </div>
                  <ChevronDown className={cn("size-5 text-neutral-500 transition-transform", expandedBuildingId === building.id && "rotate-180")} />
                </button>
                {expandedBuildingId === building.id ? (
                  <div className="border-t border-neutral-200 px-3 py-2">
                    <p className="text-caption text-neutral-500">已录入单套住宅</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {building.unitsRecorded.map((unit) => (
                        <span key={unit} className="rounded-full bg-neutral-100 px-3 py-1 text-caption font-semibold">
                          {canViewField(viewerRole, "unitNumber") ? unit : "房号保密"}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-h3">在售房源</h2>
            <span className="text-caption text-neutral-500">{community.listings.length} 套样例</span>
          </div>
          <div className="mt-3 space-y-3">
            {community.listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
                <div>
                  <p className="line-clamp-1 text-body-s font-semibold">{listing.title}</p>
                  <p className="mt-1 text-caption text-neutral-500">{listing.areaSqm}㎡ · {listing.rooms}室{listing.halls}厅 · {listing.floor}/{listing.totalFloors}层</p>
                </div>
                <p className="price-nums text-body-s font-semibold text-secondary-500">{listing.priceWan}万</p>
              </Link>
            ))}
          </div>
        </article>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary">
            <BadgeCheck className="mr-1 size-4" />
            收藏小区
          </Button>
          <Button>
            <Building2 className="mr-1 size-4" />
            查看在售
          </Button>
        </div>
      </section>
    </main>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-100 px-2 py-2">
      <p className="font-semibold text-neutral-900">{value}</p>
      <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">{label}</p>
    </div>
  );
}

function SpecItem({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return (
    <div>
      <p className="text-caption text-neutral-500">{label}</p>
      <p className={cn("mt-1 font-semibold", masked ? "text-neutral-400" : "text-neutral-900")}>{value}</p>
    </div>
  );
}

function GradeBadge({ grade }: { grade: QualityGrade }) {
  const tone = {
    A: "bg-emerald-50 text-semantic-success",
    B: "bg-primary-100 text-primary-700",
    C: "bg-amber-50 text-amber-700",
    D: "bg-neutral-100 text-neutral-600",
  }[grade];

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption font-bold", tone)}>
      {grade === "A" ? <ShieldCheck className="size-3.5" /> : <CircleDollarSign className="size-3.5" />}
      {grade} 级
    </span>
  );
}
