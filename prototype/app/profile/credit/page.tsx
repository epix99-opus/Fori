"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronDown,
  FileCheck2,
  LineChart,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockAgents, mockTransactions, mockUsers } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type CreditDimension = {
  label: string;
  score: number;
  max: number;
  description: string;
};

type CreditEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  tone: "success" | "info" | "warning";
};

type DealRecord = {
  id: string;
  date: string;
  area: string;
  priceRange: string;
  rating: number;
};

const dimensions: CreditDimension[] = [
  { label: "基础认证", score: 60, max: 60, description: "L2 执业认证已通过" },
  { label: "成交评价", score: 18, max: 20, description: "好评率 90%，近 10 条评价稳定" },
  { label: "活跃度", score: 8, max: 10, description: "近 30 天 16 次有效操作" },
  { label: "楼盘维护", score: 9, max: 10, description: "维护 6 个楼盘，最近无驳回" },
];

const events: CreditEvent[] = [
  { id: "event-1", date: "2026-06-28", title: "资质核验通过", description: "从业资格证与门店信息一致。", tone: "success" },
  { id: "event-2", date: "2026-06-21", title: "楼盘维护加分", description: "中关村小区楼栋信息通过核验。", tone: "success" },
  { id: "event-3", date: "2026-06-12", title: "客户评价更新", description: "买家评价：响应及时，材料清晰。", tone: "info" },
  { id: "event-4", date: "2026-05-30", title: "提醒记录", description: "一条 P1 客源响应超时，已完成复盘。", tone: "warning" },
];

const dealRecords: DealRecord[] = [
  { id: "deal-1", date: "2026-06-18", area: "海淀 · 中关村", priceRange: "260-300 万", rating: 5 },
  { id: "deal-2", date: "2026-05-09", area: "海淀 · 知春路", priceRange: "320-360 万", rating: 4.8 },
  { id: "deal-3", date: "2026-04-22", area: "海淀 · 学院路", priceRange: "240-280 万", rating: 4.7 },
];

const suggestions = [
  "连续 30 天内保持 P1 客源 4 小时内响应，可提升活跃度分。",
  "补充 2 个维护楼盘的楼栋图片，可提升楼盘维护可信度。",
  "邀请最近成交双方补充评价，有机会提升成交评价分。",
];

const trendPoints = [76, 79, 81, 84, 86, 87];

export default function CreditPage() {
  const [state, setState] = useState<PageState>("loading");
  const [expanded, setExpanded] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const user = mockUsers[0];
  const agent = mockAgents[0];
  const creditScore = user?.creditScore ?? 87;
  const grade = creditScore >= 90 ? "A+" : creditScore >= 85 ? "A" : creditScore >= 75 ? "B" : "C";
  const totalDimensionScore = useMemo(() => dimensions.reduce((sum, item) => sum + item.score, 0), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setState(mockTransactions.length > 0 ? "ready" : "empty"), 500);
    return () => window.clearTimeout(timer);
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile/me" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">我的</p>
            <h1 className="truncate text-h3">信用档案</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")} aria-label="模拟错误">
            <RefreshCcw className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? (
          <ErrorState title="信用数据同步失败" code="CREDIT_PROFILE_SYNC" description="显示最近缓存档案，可重试拉取评分、事件和成交评价。" onRetry={retry} />
        ) : null}

        {state === "empty" ? (
          <EmptyState title="暂无信用档案" description="完成实名认证或经纪人认证后，将生成完整信用档案。" actionLabel="去经纪人认证" onAction={() => setState("ready")} />
        ) : null}

        {state === "ready" ? (
          <>
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white">
              <div className="flex items-start gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-h1">
                  {user?.name.slice(0, 1) ?? "张"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-h2">{agent?.displayName ?? user?.name ?? "张明"}</h2>
                    <span className="rounded-full bg-white/15 px-2 py-1 text-caption font-semibold">{agent?.level ?? "L2"} 认证经纪人</span>
                  </div>
                  <p className="mt-1 text-body-s text-primary-100">中信公证核验 · 2026-06-20</p>
                  <div className="mt-4 flex items-end gap-3">
                    <div>
                      <p className="text-caption text-primary-300">信用评分</p>
                      <p className="price-nums text-[48px] font-bold leading-none">{creditScore}</p>
                    </div>
                    <div className="mb-1 rounded-xl bg-white/15 px-3 py-2 text-center">
                      <p className="text-caption text-primary-300">等级</p>
                      <p className="text-h2">{grade}</p>
                    </div>
                    <ScoreRing score={creditScore} />
                  </div>
                </div>
              </div>
            </section>

            <Card header={<SectionTitle icon={TrendingUp} title="评分趋势" subtitle="近 6 个月信用分持续上升" />}>
              <div className="flex items-end gap-2 rounded-xl bg-neutral-100 p-3">
                {trendPoints.map((point, index) => (
                  <div key={`${point}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-24 w-full items-end rounded-full bg-white px-1">
                      <div className="w-full rounded-full bg-primary-500" style={{ height: `${point}%` }} />
                    </div>
                    <span className="text-caption text-neutral-500">{index + 1}月</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              header={
                <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setExpanded((current) => !current)}>
                  <SectionTitle icon={LineChart} title="评分维度分解" subtitle={`当前构成合计 ${totalDimensionScore}/100`} />
                  <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} />
                </button>
              }
            >
              {expanded ? (
                <div className="space-y-3">
                  {dimensions.map((dimension) => (
                    <DimensionRow key={dimension.label} dimension={dimension} />
                  ))}
                </div>
              ) : (
                <p className="text-body-s text-neutral-500">点击展开查看基础、成交评价、活跃度和楼盘维护分。</p>
              )}
            </Card>

            <Card header={<SectionTitle icon={CalendarClock} title="信用事件时间线" subtitle="核验、评价、提醒按时间倒序展示" />}>
              <div className="space-y-4">
                {events.map((event) => (
                  <TimelineEvent key={event.id} event={event} />
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={FileCheck2} title="成交记录" subtitle="价格区间与评价已脱敏" />}>
              <div className="space-y-3">
                {dealRecords.map((record) => (
                  <div key={record.id} className="rounded-xl bg-neutral-100 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-body-s font-semibold text-neutral-900">{record.area}</h3>
                        <p className="text-caption text-neutral-500">{record.date} · {record.priceRange}</p>
                      </div>
                      <div className="flex items-center gap-1 text-secondary-600">
                        <Star className="size-4 fill-current" />
                        <span className="price-nums text-body-s font-semibold">{record.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Sparkles} title="提升建议" subtitle="基于当前缺口自动生成" />}>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div key={suggestion} className="flex gap-2 rounded-xl bg-primary-100 p-3 text-body-s text-primary-700">
                    <Award className="mt-0.5 size-4 shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Building2} title="信用认证机构" subtitle="第三方核验与公证存证说明" />}>
              <div className="space-y-3 text-body-s text-neutral-700">
                <p>认证机构：中信公证处 · Fori 合规核验接口</p>
                <p>核验方式：身份、执业资质、门店关系、交易评价交叉核验。</p>
                <Button variant="secondary" className="w-full" onClick={() => showToast("已打开公证机构官网链接占位")}>
                  查看机构说明
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </section>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function ScoreRing({ score }: { score: number }) {
  const degrees = Math.round(score * 3.6);
  return (
    <div
      className="mb-1 flex size-16 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#FDE68A ${degrees}deg, rgba(255,255,255,0.18) 0deg)` }}
      aria-label={`信用评分进度 ${score}%`}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-900 text-caption font-semibold text-white">
        {score}%
      </div>
    </div>
  );
}

function DimensionRow({ dimension }: { dimension: CreditDimension }) {
  const percent = Math.round((dimension.score / dimension.max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-body-s font-semibold text-neutral-900">{dimension.label}</h3>
          <p className="text-caption text-neutral-500">{dimension.description}</p>
        </div>
        <p className="price-nums text-body-s font-semibold text-primary-700">{dimension.score}/{dimension.max}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TimelineEvent({ event }: { event: CreditEvent }) {
  const toneClass = {
    success: "bg-green-50 text-semantic-success",
    info: "bg-blue-50 text-semantic-info",
    warning: "bg-amber-50 text-semantic-warning",
  }[event.tone];

  return (
    <div className="flex gap-3">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", toneClass)}>
        {event.tone === "success" ? <BadgeCheck className="size-5" /> : event.tone === "info" ? <ShieldCheck className="size-5" /> : <CalendarClock className="size-5" />}
      </div>
      <div className="min-w-0 flex-1 border-b border-neutral-200 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-body-s font-semibold text-neutral-900">{event.title}</h3>
          <span className="shrink-0 text-caption text-neutral-500">{event.date}</span>
        </div>
        <p className="mt-1 text-body-s text-neutral-600">{event.description}</p>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof LineChart;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-h3">{title}</h2>
        {subtitle ? <p className="text-caption text-neutral-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
