"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EChartsOption } from "echarts";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  FileText,
  Home,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { ChartCard } from "@/components/ChartCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockListings } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type QualityTier = "A" | "B" | "C" | "D";

type CommunityOption = {
  id: string;
  name: string;
  district: string;
  zone: string;
  tier: QualityTier;
  referenceRange: [number, number];
};

type PriceFactor = {
  label: string;
  percent: number;
  amount: number;
  reason: string;
};

type TrendPoint = {
  month: string;
  currentTier: number;
  compareTier: number;
};

const communities: CommunityOption[] = [
  { id: "community-001", name: "中关村小区", district: "海淀", zone: "中关村北区", tier: "B", referenceRange: [32000, 38000] },
  { id: "community-002", name: "知春里", district: "海淀", zone: "知春路", tier: "C", referenceRange: [28500, 33000] },
  { id: "community-003", name: "万柳书院", district: "海淀", zone: "万柳", tier: "A", referenceRange: [61000, 72000] },
  { id: "community-004", name: "学院南路 32 号院", district: "海淀", zone: "学院路", tier: "D", referenceRange: [23000, 27000] },
];

const tierCopy: Record<QualityTier, { title: string; description: string; tone: string }> = {
  A: { title: "A 高品质圈层", description: "高流动性、稀缺学区或改善盘，议价空间较小。", tone: "bg-primary-900 text-white" },
  B: { title: "B 中端圈层", description: "成交样本稳定，价格锚点清晰，适合科学定价。", tone: "bg-primary-500 text-white" },
  C: { title: "C 刚需圈层", description: "关注总价和通勤，价格对户型与楼层更敏感。", tone: "bg-secondary-200 text-secondary-600" },
  D: { title: "D 基础圈层", description: "样本较少，需扩大周期并提高风险提示权重。", tone: "bg-neutral-200 text-neutral-700" },
};

const factors: PriceFactor[] = [
  { label: "楼层修正", percent: 3, amount: 1050, reason: "8/18 层位于小高层舒适区，采光与噪音条件优于低楼层。" },
  { label: "朝向修正", percent: 2, amount: 700, reason: "南北通透在当前小区近 90 天成交样本中溢价明显。" },
  { label: "装修修正", percent: 8, amount: 2800, reason: "精装可直接入住，降低买方短期装修成本和空置周期。" },
  { label: "税费修正", percent: -3, amount: -1050, reason: "税费承担方式偏向买家，测算价需回调以匹配真实支付意愿。" },
  { label: "稀缺度修正", percent: 2, amount: 700, reason: "同户型当前在售少于 5 套，近 30 天咨询热度上升。" },
];

const trendPoints: TrendPoint[] = [
  { month: "07", currentTier: 34200, compareTier: 30800 },
  { month: "09", currentTier: 34800, compareTier: 31100 },
  { month: "11", currentTier: 35100, compareTier: 31600 },
  { month: "01", currentTier: 36000, compareTier: 32100 },
  { month: "03", currentTier: 37100, compareTier: 32600 },
  { month: "05", currentTier: 38600, compareTier: 33200 },
];

const marketStats = [
  { label: "近 30 天成交", value: "12 套", note: "同比 +20%" },
  { label: "平均成交周期", value: "45 天", note: "较片区快 6 天" },
  { label: "当前在售", value: "28 套", note: "同户型 4 套" },
];

const transactions = [
  { area: "89㎡", floor: "中楼层", price: "272 万", unit: "30,560 元/㎡", date: "2026-06" },
  { area: "96㎡", floor: "高楼层", price: "305 万", unit: "31,770 元/㎡", date: "2026-05" },
  { area: "91㎡", floor: "中楼层", price: "286 万", unit: "31,430 元/㎡", date: "2026-04" },
];

const empowerment = [
  { role: "买家", text: "用因素拆解判断议价空间，避免只看挂牌价。" },
  { role: "卖家", text: "把测算价同步为挂牌建议价，减少无效试探。" },
  { role: "经纪人", text: "生成可解释报告，支撑撮合和复盘。" },
];

function formatUnitPrice(value: number) {
  return value.toLocaleString("zh-CN");
}

export default function PriceEvaluationPage({ params }: { params: { communityId: string } }) {
  const [status, setStatus] = useState<PageState>("loading");
  const [selectedCommunityId, setSelectedCommunityId] = useState(params.communityId);
  const [communitySheetOpen, setCommunitySheetOpen] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<PriceFactor | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus(communities.some((community) => community.id === selectedCommunityId) ? "ready" : "empty");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [selectedCommunityId]);

  const community = communities.find((item) => item.id === selectedCommunityId) ?? communities[0];
  const listing = mockListings[0];
  const baseline = community.referenceRange[1] - 3000;
  const calculated = baseline + factors.reduce((sum, factor) => sum + factor.amount, 0);
  const unitPrice = Math.round((listing.priceWan * 10000) / listing.areaSqm);
  const conclusion = calculated > unitPrice ? "该房源挂牌价合理，低于测算价约 3%" : "该房源挂牌价接近测算价，可继续观察议价空间";

  const gaugeOption = useMemo<EChartsOption>(
    () => ({
      series: [
        {
          type: "gauge",
          min: community.referenceRange[0],
          max: community.referenceRange[1] + 5000,
          progress: { show: true, width: 14, itemStyle: { color: "#2563EB" } },
          axisLine: { lineStyle: { width: 14, color: [[0.35, "#86EFAC"], [0.75, "#93C5FD"], [1, "#FCA5A5"]] } },
          pointer: { width: 4 },
          detail: { formatter: (value: number) => `¥${formatUnitPrice(Math.round(value))}/㎡`, fontSize: 18, color: "#111827" },
          data: [{ value: unitPrice, name: "当前挂牌均价" }],
        },
      ],
    }),
    [community.referenceRange, unitPrice],
  );

  const waterfallOption = useMemo<EChartsOption>(() => {
    const labels = ["基准价", ...factors.map((factor) => factor.label), "测算价"];
    const values = [baseline, ...factors.map((factor) => factor.amount), calculated];
    const helpers = values.reduce<number[]>((acc, value, index) => {
      if (index === 0 || index === values.length - 1) return [...acc, 0];
      const previous = acc[index - 1] + values[index - 1];
      return [...acc, value < 0 ? previous + value : previous];
    }, []);

    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 8, right: 8, top: 18, bottom: 24, containLabel: true },
      xAxis: { type: "category", data: labels, axisLabel: { interval: 0, rotate: 28, fontSize: 10 } },
      yAxis: { type: "value", axisLabel: { formatter: (value: number) => `${Math.round(value / 1000)}k` } },
      series: [
        { type: "bar", stack: "total", itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, data: helpers },
        {
          type: "bar",
          stack: "total",
          data: values,
          itemStyle: { color: (params) => (Number(params.value) < 0 ? "#EF4444" : "#2563EB") },
        },
      ],
    };
  }, [baseline, calculated]);

  const trendOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, data: [`${community.tier} 层级`, "C 层级参考"] },
      grid: { left: 8, right: 12, top: 18, bottom: 48, containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: trendPoints.map((point) => point.month) },
      yAxis: { type: "value", axisLabel: { formatter: (value: number) => `${Math.round(value / 1000)}k` } },
      series: [
        { name: `${community.tier} 层级`, type: "line", smooth: true, data: trendPoints.map((point) => point.currentTier), areaStyle: { opacity: 0.08 }, color: "#2563EB" },
        { name: "C 层级参考", type: "line", smooth: true, data: trendPoints.map((point) => point.compareTier), color: "#D97706" },
      ],
    }),
    [community.tier],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function retry() {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 500);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">价格图谱</p>
            <h1 className="truncate text-h3">{listing.title}</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => showToast("分享卡片已生成")}>
            <Share2 className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {status === "loading" ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton variant="card" />
            <Skeleton variant="list" />
          </>
        ) : null}

        {status === "error" ? (
          <ErrorState title="价格计算失败" code="PRICE_EVAL_MOCK_ERROR" description="当前评估参数已保留，可重试重新计算。" onRetry={retry} />
        ) : null}

        {status === "empty" ? (
          <EmptyState
            title="暂无该小区评估样本"
            description="可切换小区或扩大成交周期后重新计算。"
            actionLabel="选择小区"
            onAction={() => setCommunitySheetOpen(true)}
          />
        ) : null}

        {status === "ready" ? (
          <>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl bg-primary-100 p-4 text-left shadow-card"
              onClick={() => setCommunitySheetOpen(true)}
            >
              <span>
                <span className="block text-caption font-semibold text-primary-700">小区选择入口</span>
                <span className="mt-1 block text-h3">{community.name}</span>
                <span className="mt-1 block text-body-s text-neutral-700">
                  位于 {community.zone} · {community.tier} 级 · 参考均价 ¥{formatUnitPrice(community.referenceRange[0])}-
                  {formatUnitPrice(community.referenceRange[1])} 元/㎡
                </span>
              </span>
              <ChevronDown className="size-5 text-primary-700" />
            </button>

            <section className="grid grid-cols-4 gap-2">
              {(["A", "B", "C", "D"] as QualityTier[]).map((tier) => (
                <div key={tier} className={cn("rounded-xl p-3 text-center shadow-card", community.tier === tier ? tierCopy[tier].tone : "bg-white text-neutral-700")}>
                  <p className="text-h3">{tier}</p>
                  <p className="mt-1 text-[11px] leading-4">{tierCopy[tier].title.slice(2)}</p>
                </div>
              ))}
            </section>

            <ChartCard title="动态价格测算仪表盘" eyebrow={`测算价 ¥${formatUnitPrice(calculated)} 元/㎡ · ${conclusion}`} option={gaugeOption} height={260} />

            <ChartCard title="价格因素拆解瀑布图" eyebrow="基准价、楼层、朝向、装修、税费、稀缺度逐项归因" option={waterfallOption} />
            <ChartCard title="片区历史价格走势" eyebrow="近 24 个月同层级与参考层级对比" option={trendOption} />

            <section className="grid grid-cols-3 gap-2">
              {marketStats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-3 shadow-card">
                  <p className="text-caption text-neutral-500">{stat.label}</p>
                  <p className="mt-1 text-h3 price-nums">{stat.value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-semantic-success">{stat.note}</p>
                </div>
              ))}
            </section>

            <section className="rounded-xl bg-white p-4 shadow-card">
              <h2 className="text-h3">近期成交参考</h2>
              <div className="mt-3 divide-y divide-neutral-200">
                {transactions.map((transaction) => (
                  <div key={`${transaction.area}-${transaction.date}`} className="flex items-center justify-between py-3 text-body-s">
                    <div>
                      <p className="font-semibold">{transaction.area} · {transaction.floor}</p>
                      <p className="text-neutral-500">{transaction.date} 成交 · {transaction.unit}</p>
                    </div>
                    <span className="font-semibold">{transaction.price}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-primary-900 p-4 text-white shadow-card">
              <h2 className="text-h3">三方价格赋能</h2>
              <div className="mt-3 space-y-3">
                {empowerment.map((item) => (
                  <div key={item.role} className="flex gap-3 rounded-xl bg-white/10 p-3">
                    <Users className="mt-0.5 size-5 shrink-0 text-primary-300" />
                    <p className="text-body-s"><span className="font-semibold">{item.role}</span>：{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>

      {status === "ready" ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-3">
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => showToast("已设为挂牌建议价")}>
              <Home className="mr-1 size-4" />
              设为挂牌价
            </Button>
            <Button className="flex-1" onClick={() => showToast("PDF 报告生成中")}>
              <FileText className="mr-1 size-4" />
              生成报告
            </Button>
          </div>
        </div>
      ) : null}

      <BottomSheet open={communitySheetOpen} title="选择评估小区" onClose={() => setCommunitySheetOpen(false)}>
        <div className="space-y-2">
          {communities.map((option) => (
            <button
              key={option.id}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 p-3 text-left"
              onClick={() => {
                setStatus("loading");
                setSelectedCommunityId(option.id);
                setCommunitySheetOpen(false);
              }}
            >
              <span>
                <span className="block font-semibold">{option.name}</span>
                <span className="text-body-s text-neutral-500">{option.zone} · {option.tier} 级 · {formatUnitPrice(option.referenceRange[0])}-{formatUnitPrice(option.referenceRange[1])} 元/㎡</span>
              </span>
              <Building2 className="size-5 text-primary-700" />
            </button>
          ))}
          <Button variant="ghost" className="w-full" onClick={() => setStatus("error")}>
            <RefreshCw className="mr-1 size-4" />
            模拟计算错误
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={Boolean(selectedFactor)} title={selectedFactor?.label} onClose={() => setSelectedFactor(null)}>
        {selectedFactor ? (
          <div className="space-y-3">
            <p className="text-body-s text-neutral-700">{selectedFactor.reason}</p>
            <div className="rounded-xl bg-neutral-100 p-3 text-body-s">
              影响权重：<span className={selectedFactor.amount >= 0 ? "text-semantic-success" : "text-semantic-danger"}>
                {selectedFactor.amount >= 0 ? "+" : ""}{formatUnitPrice(selectedFactor.amount)} 元/㎡
              </span>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}
