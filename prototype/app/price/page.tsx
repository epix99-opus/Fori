"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Calculator, Home, SlidersHorizontal } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";
import {
  getCommunities,
  type CommunityListItem,
  type QualityTier,
  type PriceMode,
  type PriceViewerRole,
} from "@/lib/price-data";

const roleTabs: Array<{ key: PriceViewerRole; label: string; caption: string }> = [
  { key: "buyer", label: "买家", caption: "查看公允区间与议价锚点" },
  { key: "seller", label: "卖家", caption: "查看挂牌建议与成交周期" },
  { key: "agent", label: "经纪人", caption: "查看撮合空间与服务收益" },
];

const modes: Array<{ key: PriceMode; icon: typeof Building2; title: string; text: string }> = [
  { key: "community", icon: Building2, title: "小区均价", text: "成交样本" },
  { key: "unit", icon: Home, title: "单套估价", text: "户型修正" },
  { key: "manual", icon: SlidersHorizontal, title: "手动参数", text: "无房源也可评估" },
];

function formatUnitPrice(value: number) {
  return value.toLocaleString("zh-CN");
}

function normalizeTier(value: string | null): QualityTier | undefined {
  return value === "A" || value === "B" || value === "C" || value === "D" ? value : undefined;
}

export default function PriceEntryPage() {
  return (
    <Suspense fallback={<PriceEntryFallback />}>
      <PriceEntryContent />
    </Suspense>
  );
}

function PriceEntryContent() {
  const searchParams = useSearchParams();
  const [priceRole, setPriceRole] = useState<PriceViewerRole>("buyer");
  const [keyword, setKeyword] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("community-001");

  const districtFilter = searchParams.get("district") ?? undefined;
  const tierFilter = normalizeTier(searchParams.get("tier"));
  const hasUrlFilter = Boolean(districtFilter || tierFilter);
  const communities = useMemo(
    () => getCommunities(keyword, { district: districtFilter, tier: tierFilter }),
    [districtFilter, keyword, tierFilter],
  );
  const allCommunities = useMemo(() => getCommunities(), []);
  const selectedCommunity =
    communities.find((community) => community.id === selectedCommunityId) ?? communities[0] ?? allCommunities[0];
  const referenceCommunity = communities[0] ?? selectedCommunity;

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">独立价格评估入口</p>
        <h1 className="mt-1 text-h1">输入小区或房源，生成在地分层价格图谱</h1>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "rounded-lg px-2 py-2 text-caption font-semibold",
                priceRole === tab.key ? "bg-primary-700 text-white shadow-sm" : "text-neutral-700",
              )}
              onClick={() => setPriceRole(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-caption text-neutral-500">
          {roleTabs.find((tab) => tab.key === priceRole)?.caption}
        </p>

        <div className="mt-4">
          <Input
            label="目标小区"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索小区、片区或层级"
          />
        </div>
      </section>

      {hasUrlFilter ? (
        <section className="mt-4 rounded-xl border border-semantic-warning/30 bg-semantic-warning/10 p-3 shadow-card">
          <p className="text-caption font-semibold text-semantic-warning">已按风险提示扩大搜索范围</p>
          <p className="mt-1 text-body-s text-neutral-700">
            {districtFilter ?? "全部片区"} · {tierFilter ? `${tierFilter} 级小区` : "全部层级"} · 命中 {communities.length} 个样本
          </p>
          <Link href="/price" className="mt-2 inline-block text-caption font-semibold text-primary-700">
            清除筛选
          </Link>
        </section>
      ) : null}

      <section className="mt-4 space-y-2">
        {(communities.length ? communities : allCommunities).map((community) => (
          <button
            key={community.id}
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border bg-white p-3 text-left shadow-card",
              selectedCommunity.id === community.id ? "border-primary-700" : "border-transparent",
            )}
            onClick={() => setSelectedCommunityId(community.id)}
          >
            <span>
              <span className="block font-semibold">{community.name}</span>
              <span className="mt-1 block text-body-s text-neutral-500">
                {community.zone} · {community.tier} 级 · 样本 {community.sampleCount} 套
              </span>
            </span>
            <span className="text-right text-caption text-neutral-500">
              ¥{formatUnitPrice(community.referenceRange[0])}-{formatUnitPrice(community.referenceRange[1])}/㎡
            </span>
          </button>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {modes.map((mode) => (
          <ModeCard
            key={mode.key}
            mode={mode.key}
            icon={mode.icon}
            title={mode.title}
            text={mode.text}
            community={selectedCommunity}
            role={priceRole}
          />
        ))}
      </section>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-h3">当前片区参考均价</h2>
            <p className="mt-1 text-body-s text-neutral-500">
              {referenceCommunity.name} · ¥{formatUnitPrice(referenceCommunity.referenceRange[0])}-
              {formatUnitPrice(referenceCommunity.referenceRange[1])}/㎡ · {referenceCommunity.confidence === "low" ? "低置信" : "可评估"}
            </p>
          </div>
          <Calculator className="size-8 text-primary-700" />
        </div>
      </Card>

      <Link href={`/price/${selectedCommunity.id}?mode=community&role=${priceRole}`} className="mt-4 block">
        <Button className="w-full">
          生成评估
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </Link>
      <AgentAssistFab
        pageContext="价格评估入口"
        suggestedPrompts={["帮我选择买家/卖家/经纪人视角", "解释 A/B/C/D 层级差异", "我没有具体房源，如何手动估价？"]}
      />
    </main>
  );
}

function PriceEntryFallback() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">独立价格评估入口</p>
        <h1 className="mt-1 text-h1">输入小区或房源，生成在地分层价格图谱</h1>
        <div className="mt-4 h-10 rounded-xl bg-neutral-100" />
        <div className="mt-4 h-12 rounded-xl bg-neutral-100" />
      </section>
    </main>
  );
}

function ModeCard({
  icon: Icon,
  title,
  text,
  mode,
  community,
  role,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
  mode: PriceMode;
  community: CommunityListItem;
  role: PriceViewerRole;
}) {
  return (
    <Link
      href={`/price/${community.id}?mode=${mode}&role=${role}`}
      className="rounded-xl bg-white p-3 text-center shadow-card"
    >
      <Icon className="mx-auto size-6 text-primary-700" />
      <p className="mt-2 text-caption font-semibold">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-neutral-500">{text}</p>
    </Link>
  );
}
