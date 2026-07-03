"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Edit3,
  Eye,
  Megaphone,
  Pause,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockListings } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type PromotionStatus = "draft" | "active" | "ended";
type PromotionPlan = {
  id: string;
  title: string;
  listingTitle: string;
  channel: string;
  status: PromotionStatus;
  budgetWan: number;
  exposure: number;
  clicks: number;
  conversions: number;
  preview: string;
  updatedAt: string;
};

const statusMeta: Record<PromotionStatus, { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-neutral-200 text-neutral-700" },
  active: { label: "进行中", className: "bg-green-50 text-semantic-success" },
  ended: { label: "已结束", className: "bg-blue-50 text-primary-700" },
};

const plans: PromotionPlan[] = [
  {
    id: "promo-001",
    title: "中关村三居短视频推广",
    listingTitle: mockListings[0].title,
    channel: "抖音 / 视频号 / 小红书",
    status: "active",
    budgetWan: 1.2,
    exposure: 28600,
    clicks: 1460,
    conversions: 38,
    preview: "15 秒户型亮点短视频，主打地铁通勤和改善型家庭。",
    updatedAt: "今天 10:20",
  },
  {
    id: "promo-002",
    title: "朋友圈图文私域转化",
    listingTitle: "海淀改善客专属房源包",
    channel: "微信朋友圈 / 社群",
    status: "draft",
    budgetWan: 0.4,
    exposure: 0,
    clicks: 0,
    conversions: 0,
    preview: "三段式真实房况文案，待补充封面和预约看房入口。",
    updatedAt: "昨天 18:40",
  },
  {
    id: "promo-003",
    title: "六月成交复盘种草",
    listingTitle: "中关村小区成交案例",
    channel: "小红书 / 微博",
    status: "ended",
    budgetWan: 0.8,
    exposure: 19200,
    clicks: 920,
    conversions: 21,
    preview: "以成交价格透明和交易流程可信为核心的复盘图文。",
    updatedAt: "06-28 09:12",
  },
];

export default function MarketingManagePage() {
  const [pageState, setPageState] = useState<PageState>("ready");
  const [selectedStatus, setSelectedStatus] = useState<PromotionStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const visiblePlans = useMemo(
    () => plans.filter((plan) => selectedStatus === "all" || plan.status === selectedStatus),
    [selectedStatus],
  );
  const totals = useMemo(
    () =>
      plans.reduce(
        (acc, plan) => ({
          exposure: acc.exposure + plan.exposure,
          clicks: acc.clicks + plan.clicks,
          conversions: acc.conversions + plan.conversions,
        }),
        { exposure: 0, clicks: 0, conversions: 0 },
      ),
    [],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function restoreReady() {
    setPageState("loading");
    window.setTimeout(() => setPageState("ready"), 600);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketing/generate" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回素材生成">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">自媒体智能营销</p>
            <h1 className="truncate text-h3">推广管理</h1>
          </div>
          <Link href="/marketing/publish" className="flex size-10 items-center justify-center rounded-xl bg-primary-700 text-white" aria-label="新建推广">
            <Plus className="size-5" />
          </Link>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-primary-900 p-4 text-white shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-primary-200">全渠道分发</p>
              <h2 className="mt-1 text-h1">推广计划一屏管理</h2>
            </div>
            <Megaphone className="size-8 text-primary-200" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/marketing/publish" className="rounded-xl bg-white/10 px-3 py-2 text-center text-caption font-semibold text-white">
              新建发布
            </Link>
            <Link href="/marketing/reach" className="rounded-xl bg-white px-3 py-2 text-center text-caption font-semibold text-primary-700">
              触达分析
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="曝光" value={formatNumber(totals.exposure)} />
            <Metric label="点击" value={formatNumber(totals.clicks)} />
            <Metric label="转化" value={`${totals.conversions}`} />
          </div>
        </section>

        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "all", label: "全部" },
            { key: "draft", label: "草稿" },
            { key: "active", label: "进行中" },
            { key: "ended", label: "已结束" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                "rounded-full px-3 py-2 text-caption font-semibold",
                selectedStatus === item.key ? "bg-primary-700 text-white" : "bg-white text-neutral-600 shadow-card",
              )}
              onClick={() => setSelectedStatus(item.key as PromotionStatus | "all")}
            >
              {item.label}
            </button>
          ))}
        </div>

        {pageState === "loading" ? <Skeleton variant="list" /> : null}
        {pageState === "error" ? (
          <ErrorState title="推广计划加载失败" code="PROMOTION_MANAGE_MOCK_ERROR" description="当前为本地原型，可重试恢复推广列表。" onRetry={restoreReady} />
        ) : null}
        {pageState === "empty" ? (
          <EmptyState title="暂无推广计划" description="生成素材后可创建多平台推广计划。" actionLabel="新建推广" onAction={() => showToast("跳转素材生成占位")} />
        ) : null}

        {pageState === "ready" ? (
          <div className="space-y-3">
            {visiblePlans.map((plan) => (
              <PromotionCard key={plan.id} plan={plan} onAction={showToast} />
            ))}
          </div>
        ) : null}
      </section>

      <div className="fixed bottom-6 right-[calc(50%-205px)] z-20 flex flex-col gap-2 px-4">
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setPageState("empty")}>
          空状态
        </button>
        <button type="button" className="rounded-full bg-white px-3 py-2 text-caption text-neutral-500 shadow-card" onClick={() => setPageState("error")}>
          错误
        </button>
      </div>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function PromotionCard({ plan, onAction }: { plan: PromotionPlan; onAction: (message: string) => void }) {
  const status = statusMeta[plan.status];

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-200 text-primary-700">
            <BarChart3 className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-body font-semibold text-neutral-900">{plan.title}</h3>
              <span className={cn("shrink-0 rounded-full px-2 py-1 text-caption font-semibold", status.className)}>{status.label}</span>
            </div>
            <p className="mt-1 text-caption text-neutral-500">{plan.listingTitle}</p>
            <p className="mt-1 text-caption text-neutral-500">{plan.channel} · {plan.updatedAt}</p>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-100 p-3">
          <div className="flex items-center gap-2 text-caption font-semibold text-neutral-700">
            <Eye className="size-4 text-primary-700" />
            推广内容预览
          </div>
          <p className="mt-2 text-body-s text-neutral-600">{plan.preview}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniMetric label="曝光" value={formatNumber(plan.exposure)} />
          <MiniMetric label="点击" value={formatNumber(plan.clicks)} />
          <MiniMetric label="转化" value={`${plan.conversions}`} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ActionButton icon={Edit3} label="编辑" onClick={() => onAction("编辑推广占位")} />
          <ActionButton icon={Pause} label={plan.status === "active" ? "暂停" : "发布"} onClick={() => onAction(plan.status === "active" ? "推广已暂停占位" : "推广发布占位")} />
          <ActionButton danger icon={Trash2} label="删除" onClick={() => onAction("删除推广占位")} />
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-2 py-3 text-center">
      <p className="price-nums text-h3">{value}</p>
      <p className="mt-1 text-caption text-primary-200">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-2 py-3">
      <p className="price-nums text-body font-semibold text-neutral-900">{value}</p>
      <p className="text-caption text-neutral-500">{label}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, danger = false, onClick }: { icon: LucideIcon; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn("flex items-center justify-center gap-1 rounded-xl bg-neutral-100 px-2 py-2 text-caption font-semibold", danger ? "text-semantic-danger" : "text-neutral-700")}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function formatNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return `${value}`;
}
