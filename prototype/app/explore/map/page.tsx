"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { LayoutGrid, List, MapPin } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";

const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="flex h-[70dvh] items-center justify-center bg-neutral-100 text-body-s text-neutral-500">地图加载中...</div>,
});

export default function ExploreMapPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 pb-6">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="房源字典呈现方式">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-caption font-semibold text-primary-700 shadow-sm">
            <MapPin className="size-4" />
            地图
          </span>
          <Link href="/explore/dict" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-caption font-semibold text-neutral-600">
            <LayoutGrid className="size-4" />
            卡片
          </Link>
          <Link href="/explore/dict" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-caption font-semibold text-neutral-600">
            <List className="size-4" />
            列表
          </Link>
        </div>
      </header>

      <MapView />

      <AgentAssistFab
        pageContext="楼盘字典 · 地图模式"
        suggestedPrompts={["北京海淀有哪些 A 级小区？", "深圳南山的参考总价区间是多少？", "筛选海淀 B 级总价 300 万以内的小区"]}
      />
    </main>
  );
}
