"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  FileText,
  Home,
  Info,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
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

function buildPath(points: number[], width: number, height: number) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
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
  const gaugePosition = Math.min(88, Math.max(12, ((unitPrice - community.referenceRange[0]) / (community.referenceRange[1] - community.referenceRange[0])) * 60 + 20));
  const conclusion = calculated > unitPrice ? "该房源挂牌价合理，低于测算价约 3%" : "该房源挂牌价接近测算价，可继续观察议价空间";

  const trendPaths = useMemo(() => {
    const current = buildPath(trendPoints.map((point) => point.currentTier), 280, 128);
    const compare = buildPath(trendPoints.map((point) => point.compareTier), 280, 128);
    return { current, compare };
  }, []);

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

            <section className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-caption text-neutral-500">动态价格测算</p>
                  <h2 className="text-price-l price-nums">¥ {formatUnitPrice(calculated)} 元/㎡</h2>
                  <p className="text-body-s text-neutral-500">基准价 ¥{formatUnitPrice(baseline)} + 修正因子合计</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-caption font-semibold text-semantic-success">{conclusion}</span>
              </div>

              <div className="mt-5">
                <div className="relative h-24 overflow-hidden">
                  <div className="absolute inset-x-3 bottom-0 h-20 rounded-t-full bg-gradient-to-r from-green-100 via-primary-100 to-red-100" />
                  <div className="absolute inset-x-10 bottom-0 h-14 rounded-t-full bg-white" />
                  <div className="absolute bottom-2 left-1/2 h-1 w-[120px] origin-left rounded-full bg-primary-900 transition-transform" style={{ transform: `rotate(${gaugePosition - 90}deg)` }} />
                  <div className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 rounded-full bg-primary-900" />
                </div>
                <div className="flex justify-between text-caption text-neutral-500">
                  <span>偏低</span>
                  <span>合理区间</span>
                  <span>偏高</span>
                </div>
                <p className="mt-3 text-center text-body-s">
                  当前挂牌 ¥ {listing.priceWan} 万（{formatUnitPrice(unitPrice)} 元/㎡）
                </p>
              </div>
            </section>

            <section className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-h3">价格因素拆解瀑布图</h2>
                <Info className="size-4 text-neutral-500" />
              </div>
              <div className="mt-4 space-y-3">
                <WaterfallRow label="基准价" value={baseline} percent={0} max={baseline} />
                {factors.map((factor) => (
                  <button key={factor.label} type="button" className="w-full text-left" onClick={() => setSelectedFactor(factor)}>
                    <WaterfallRow label={`${factor.label} ${factor.percent > 0 ? "+" : ""}${factor.percent}%`} value={factor.amount} percent={factor.percent} max={baseline} />
                  </button>
                ))}
                <div className="border-t border-dashed border-neutral-200 pt-3">
                  <WaterfallRow label="测算价" value={calculated} percent={0} max={baseline} strong />
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-neutral-500">近 24 个月</p>
                  <h2 className="text-h3">片区历史价格走势</h2>
                </div>
                <TrendingUp className="size-5 text-primary-700" />
              </div>
              <svg viewBox="0 0 300 160" className="mt-3 h-44 w-full" role="img" aria-label="B 层级与 C 层级历史价格趋势线">
                {[24, 64, 104, 144].map((y) => (
                  <line key={y} x1="8" x2="292" y1={y} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
                ))}
                <path d={trendPaths.compare} transform="translate(10 12)" fill="none" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                <path d={trendPaths.current} transform="translate(10 12)" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                {trendPoints.map((point, index) => (
                  <text key={point.month} x={12 + index * 56} y="154" className="fill-neutral-500 text-[10px]">
                    {point.month}
                  </text>
                ))}
              </svg>
              <div className="flex gap-3 text-caption">
                <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-primary-500" />{community.tier} 层级</span>
                <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-secondary-500" />C 层级参考</span>
              </div>
            </section>

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

function WaterfallRow({ label, value, percent, max, strong = false }: { label: string; value: number; percent: number; max: number; strong?: boolean }) {
  const isNegative = value < 0;
  const width = Math.max(8, Math.min(100, (Math.abs(value) / max) * 100));

  return (
    <div className="grid grid-cols-[96px_1fr_88px] items-center gap-2 text-body-s">
      <span className={cn("truncate", strong && "font-semibold")}>{label}</span>
      <div className="relative h-5 rounded-full bg-neutral-100">
        <div
          className={cn("absolute top-1 h-3 rounded-full", isNegative ? "right-1/2 bg-red-300" : "left-0 bg-primary-500", strong && "bg-primary-900")}
          style={{ width: `${strong ? 100 : width}%` }}
        />
      </div>
      <span className={cn("text-right price-nums", strong && "font-semibold", isNegative ? "text-semantic-danger" : "text-neutral-900")}>
        {percent === 0 && !strong ? formatUnitPrice(value) : `${value >= 0 ? "+" : ""}${formatUnitPrice(value)}`}
      </span>
    </div>
  );
}
