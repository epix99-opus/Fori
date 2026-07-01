"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Flame,
  Home,
  ListTodo,
  Megaphone,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockAgents, mockBuyerDemands, mockListings, mockTransactions } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type TodoPriority = "P1" | "P2" | "normal";
type Todo = {
  id: string;
  title: string;
  due: string;
  priority: TodoPriority;
};
type FollowUp = {
  id: string;
  name: string;
  need: string;
  lastContact: string;
  temperature: number;
};

const todos: Todo[] = [
  { id: "todo-1", title: "响应 P1 客源：海淀 300 万预算", due: "10:30 前", priority: "P1" },
  { id: "todo-2", title: "补充交易公证材料", due: "今天 15:00", priority: "P2" },
  { id: "todo-3", title: "更新中关村小区楼盘字典", due: "今天", priority: "normal" },
];

const followUps: FollowUp[] = [
  { id: "follow-1", name: "周先生", need: "三居 · 260-320 万 · 中关村", lastContact: "2 小时未回复", temperature: 86 },
  { id: "follow-2", name: "何女士", need: "两居 · 近地铁 · 知春路", lastContact: "昨天看房后待确认", temperature: 72 },
  { id: "follow-3", name: "陈先生", need: "改善三居 · 学区优先", lastContact: "待发送新房源", temperature: 64 },
];

const ranking = [
  { name: "张明", deals: 5, amountWan: 1420 },
  { name: "李娜", deals: 4, amountWan: 1180 },
  { name: "王航", deals: 3, amountWan: 960 },
];

export default function AgentWorkspacePage() {
  const [pageState, setPageState] = useState<PageState>("ready");
  const [toast, setToast] = useState<string | null>(null);

  const todayStats = useMemo(
    () => [
      { label: "带看量", value: "6", suffix: "组", icon: CalendarCheck },
      { label: "新增客源", value: `${mockBuyerDemands.length + 4}`, suffix: "位", icon: Users },
      { label: "成交额", value: "280", suffix: "万", icon: TrendingUp },
    ],
    [],
  );
  const agent = mockAgents[0];
  const listing = mockListings[0];
  const transaction = mockTransactions[0];

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
          <div>
            <p className="text-caption text-neutral-500">经纪人工作台</p>
            <h1 className="text-h3">你好，{agent.displayName}</h1>
          </div>
          <button type="button" className="relative flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => showToast("通知中心占位")} aria-label="通知">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-secondary-500" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-primary-200">本月目标进度</p>
              <h2 className="mt-1 text-h1">成交 5/8 套</h2>
              <p className="mt-2 text-body-s text-primary-100">佣金 18.6 万，距目标还差 3 套。</p>
            </div>
            <GoalRing value={63} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/15">
            <div className="h-2 rounded-full bg-secondary-400" style={{ width: "63%" }} />
          </div>
        </section>

        {pageState === "loading" ? <Skeleton variant="list" /> : null}
        {pageState === "error" ? (
          <ErrorState title="工作台汇总失败" code="AGENT_WORKSPACE_MOCK_ERROR" description="待办和统计可局部重试恢复。" onRetry={restoreReady} />
        ) : null}
        {pageState === "empty" ? (
          <EmptyState title="暂无工作台数据" description="完成认证后可接收客源、维护房源和查看业绩。" actionLabel="查看认证" onAction={() => showToast("认证入口占位")} />
        ) : null}

        {pageState === "ready" ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {todayStats.map((stat) => (
                <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} suffix={stat.suffix} />
              ))}
            </div>

            <Card header={<SectionTitle icon={Briefcase} title="快捷入口" action="全部功能" />}>
              <div className="grid grid-cols-4 gap-3">
                <QuickEntry icon={Users} label="客源" badge="5" href="/workspace/agent/buyers" />
                <QuickEntry icon={Home} label="房源" href="/workspace/agent/listings" />
                <QuickEntry icon={Building2} label="楼盘字典" href="/explore/dict" />
                <QuickEntry icon={Megaphone} label="推广" href="/marketing/generate" />
              </div>
            </Card>

            <Card header={<SectionTitle icon={ListTodo} title="今日待办" action={`${todos.length} 项`} />}>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <TodoRow key={todo.id} todo={todo} onClick={() => showToast("待办处理占位")} />
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Flame} title="客户跟进提醒" action="全部" />}>
              <div className="space-y-3">
                {followUps.map((item) => (
                  <FollowRow key={item.id} item={item} />
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Home} title="房源管理" action="管理" />}>
              <div className="rounded-xl bg-neutral-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-body-s font-semibold text-neutral-900">{listing.title}</h3>
                    <p className="mt-1 text-caption text-neutral-500">{listing.communityName} · {listing.areaSqm}㎡ · {listing.priceWan} 万</p>
                    <p className="mt-2 text-caption font-semibold text-orange-600">已 28 天未刷新，建议本周更新</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => showToast("刷新房源占位")}>刷新</Button>
                </div>
              </div>
            </Card>

            <Card header={<SectionTitle icon={Award} title="业绩排行" action="本月" />}>
              <div className="space-y-3">
                {ranking.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("flex size-8 items-center justify-center rounded-full text-caption font-bold", index === 0 ? "bg-secondary-100 text-secondary-700" : "bg-white text-neutral-600")}>{index + 1}</span>
                      <div>
                        <p className="text-body-s font-semibold text-neutral-900">{item.name}</p>
                        <p className="text-caption text-neutral-500">{item.deals} 套成交</p>
                      </div>
                    </div>
                    <p className="price-nums text-body-s font-semibold text-neutral-900">{item.amountWan} 万</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={CheckCircle2} title="交易进度" action="查看" />}>
              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                <div>
                  <p className="text-body-s font-semibold text-primary-900">{transaction.currentStepLabel}</p>
                  <p className="mt-1 text-caption text-primary-700">交易 {transaction.id} 需要跟进材料状态</p>
                </div>
                <ArrowRight className="size-5 text-primary-700" />
              </div>
            </Card>
          </>
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

function SectionTitle({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <Icon className="size-5" />
        </div>
        <h2 className="text-h3">{title}</h2>
      </div>
      {action ? <span className="text-caption font-semibold text-primary-700">{action}</span> : null}
    </div>
  );
}

function GoalRing({ value }: { value: number }) {
  return (
    <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
      <div className="flex size-12 items-center justify-center rounded-full border-4 border-secondary-400 text-caption font-bold">{value}%</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix }: { icon: LucideIcon; label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-card">
      <Icon className="size-5 text-primary-700" />
      <p className="mt-3 text-caption text-neutral-500">{label}</p>
      <p className="price-nums text-h3">{value}<span className="ml-0.5 text-caption text-neutral-500">{suffix}</span></p>
    </div>
  );
}

function QuickEntry({ icon: Icon, label, href, badge }: { icon: LucideIcon; label: string; href: string; badge?: string }) {
  return (
    <Link href={href} className="relative flex flex-col items-center gap-2 rounded-xl bg-neutral-100 px-2 py-3 text-center">
      <Icon className="size-6 text-primary-700" />
      <span className="text-caption font-semibold text-neutral-700">{label}</span>
      {badge ? <span className="absolute right-2 top-2 rounded-full bg-secondary-500 px-1.5 text-[10px] leading-4 text-white">{badge}</span> : null}
    </Link>
  );
}

function TodoRow({ todo, onClick }: { todo: Todo; onClick: () => void }) {
  const priorityClass = todo.priority === "P1" ? "bg-red-50 text-semantic-danger" : todo.priority === "P2" ? "bg-orange-50 text-orange-600" : "bg-neutral-200 text-neutral-600";

  return (
    <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-neutral-100 p-3 text-left" onClick={onClick}>
      <Clock3 className="size-5 text-neutral-500" />
      <div className="min-w-0 flex-1">
        <p className="text-body-s font-semibold text-neutral-900">{todo.title}</p>
        <p className="text-caption text-neutral-500">{todo.due}</p>
      </div>
      <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", priorityClass)}>{todo.priority}</span>
    </button>
  );
}

function FollowRow({ item }: { item: FollowUp }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-body-s font-semibold text-neutral-900">{item.name}</p>
          <p className="mt-1 text-caption text-neutral-500">{item.need}</p>
        </div>
        <span className="rounded-full bg-green-50 px-2 py-1 text-caption font-semibold text-semantic-success">{item.temperature}</span>
      </div>
      <p className="mt-2 text-caption text-orange-600">{item.lastContact}</p>
    </div>
  );
}
