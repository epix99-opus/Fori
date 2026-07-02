import Link from "next/link";
import { Layers, LocateFixed, MapPin, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockListings } from "@/lib/mock";

const pins = [
  { left: "22%", top: "34%", label: "中关村", count: 28 },
  { left: "54%", top: "44%", label: "知春路", count: 16 },
  { left: "68%", top: "26%", label: "学院路", count: 11 },
];

export default function ExploreMapPage() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 pb-6">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <Link href="/explore/search" className="flex-1 rounded-xl bg-neutral-100 px-4 py-3 text-body-s text-neutral-500">海淀 · 三居 · 300万内</Link>
        <button className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700" type="button" aria-label="筛选">
          <SlidersHorizontal className="size-5" />
        </button>
      </header>

      <section className="relative h-[430px] overflow-hidden bg-[#D8E7DF]">
        <div className="absolute inset-0 bg-[linear-gradient(35deg,rgba(255,255,255,.55)_12%,transparent_12%,transparent_50%,rgba(255,255,255,.5)_50%,rgba(255,255,255,.5)_62%,transparent_62%)] bg-[length:88px_88px]" />
        {pins.map((pin) => (
          <Link
            key={pin.label}
            href="/explore/dict/community-001"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-700 px-3 py-2 text-caption font-semibold text-white shadow-card"
            style={{ left: pin.left, top: pin.top }}
          >
            {pin.label} · {pin.count}
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
        </Card>
      </section>
    </main>
  );
}
