import Link from "next/link";
import { Layers, LayoutGrid, List, LocateFixed, MapPin, SlidersHorizontal } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockListings } from "@/lib/mock";

const pins = [
  { left: "22%", top: "34%", id: "community-001", name: "中关村小区", tier: "B", price: "35,000" },
  { left: "54%", top: "44%", id: "community-002", name: "知春里", tier: "C", price: "29,000" },
  { left: "68%", top: "26%", id: "community-003", name: "上地嘉园", tier: "A", price: "48,000" },
];

export default function ExploreMapPage() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 pb-6">
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/explore/search" className="flex-1 rounded-xl bg-neutral-100 px-4 py-3 text-body-s text-neutral-500">海淀 · 三居 · 300万内</Link>
          <button className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700" type="button" aria-label="筛选">
            <SlidersHorizontal className="size-5" />
          </button>
        </div>
        <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="房源字典呈现方式">
          <Link href="/explore/dict" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-caption font-semibold text-neutral-600">
            <LayoutGrid className="size-4" />
            卡片
          </Link>
          <Link href="/explore/dict" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-caption font-semibold text-neutral-600">
            <List className="size-4" />
            列表
          </Link>
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-caption font-semibold text-primary-700 shadow-sm">
            <MapPin className="size-4" />
            地图
          </span>
        </div>
      </header>

      <section className="relative h-[430px] overflow-hidden bg-[#D8E7DF]">
        <div className="absolute inset-0 bg-[linear-gradient(35deg,rgba(255,255,255,.55)_12%,transparent_12%,transparent_50%,rgba(255,255,255,.5)_50%,rgba(255,255,255,.5)_62%,transparent_62%)] bg-[length:88px_88px]" />
        {pins.map((pin) => (
          <Link
            key={pin.id}
            href={`/explore/dict/${pin.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-caption font-semibold text-neutral-900 shadow-card"
            style={{ left: pin.left, top: pin.top }}
          >
            {pin.name}
            <br />
            <span className="text-primary-700">{pin.tier} 层级</span>
            <span className="text-neutral-500"> ¥{pin.price}/㎡</span>
          </Link>
        ))}
        <button className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-full bg-white text-primary-700 shadow-card" type="button" aria-label="定位">
          <LocateFixed className="size-6" />
        </button>
        <button className="absolute bottom-20 right-4 flex size-12 items-center justify-center rounded-full bg-white text-primary-700 shadow-card" type="button" aria-label="图层">
          <Layers className="size-6" />
        </button>
      </section>

      <section className="-mt-8 px-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-neutral-500">地图推荐房源</p>
              <h1 className="mt-1 text-h3">{listing.title}</h1>
              <p className="mt-1 text-body-s text-neutral-500">{listing.communityName} · {listing.areaSqm}㎡ · {listing.priceWan} 万</p>
            </div>
            <MapPin className="size-6 text-primary-700" />
          </div>
          <Link href="/listing/listing-001" className="mt-4 block">
            <Button className="w-full">查看房源详情</Button>
          </Link>
          <p className="mt-3 text-center text-caption text-neutral-500">
            高德地图 JS API 2.0 接入于 FORI-052+，当前展示 Mock 位置
          </p>
        </Card>
      </section>

      <AgentAssistFab
        pageContext="楼盘字典 · 地图模式"
        suggestedPrompts={["这片区域有哪些 A 级小区？", "对比地图上三个标注的价格层级", "未登录时地图能看哪些信息？"]}
      />
    </main>
  );
}
