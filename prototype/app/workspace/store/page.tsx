"use client";

import { useState } from "react";
import {
  Bell,
  Crown,
  Medal,
  Megaphone,
  MinusCircle,
  Plus,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  UserMinus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockAgents } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type OnlineStatus = "online" | "busy" | "offline";
type StoreMember = {
  id: string;
  name: string;
  level: string;
  status: OnlineStatus;
  deals: number;
  commissionWan: number;
  rating: number;
};

const members: StoreMember[] = [
  { id: "member-1", name: mockAgents[0].displayName, level: mockAgents[0].level, status: "online", deals: 5, commissionWan: 18.6, rating: mockAgents[0].rating },
  { id: "member-2", name: "李娜", level: "L3", status: "busy", deals: 4, commissionWan: 15.2, rating: 4.9 },
  { id: "member-3", name: "王航", level: "L2", status: "offline", deals: 3, commissionWan: 10.8, rating: 4.7 },
  { id: "member-4", name: "赵琪", level: "L2", status: "online", deals: 2, commissionWan: 7.4, rating: 4.6 },
];

const statusMeta: Record<OnlineStatus, { label: string; className: string; dot: string }> = {
  online: { label: "在线", className: "text-semantic-success", dot: "bg-semantic-success" },
  busy: { label: "忙碌", className: "text-orange-600", dot: "bg-orange-500" },
  offline: { label: "离线", className: "text-neutral-500", dot: "bg-neutral-400" },
};

export default function StoreWorkspacePage() {
  const [pageState, setPageState] = useState<PageState>("ready");
  const [toast, setToast] = useState<string | null>(null);
  const totalDeals = members.reduce((sum, item) => sum + item.deals, 0);
  const totalCommission = members.reduce((sum, item) => sum + item.commissionWan, 0);

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
            <p className="text-caption text-neutral-500">门店管理</p>
            <h1 className="text-h3">中关村安心门店</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => showToast("门店通知占位")} aria-label="公告">
            <Bell className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <Store className="size-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-h2">中关村安心门店</h2>
                <span className="rounded-full bg-green-50 px-2 py-1 text-caption font-semibold text-semantic-success">已认证</span>
              </div>
              <p className="mt-1 text-body-s text-neutral-500">海淀区中关村南路 18 号 · 信用评级 A</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StoreMetric label="成员" value={`${members.length}`} />
            <StoreMetric label="本月成交" value={`${totalDeals}`} />
            <StoreMetric label="总佣金" value={`${totalCommission.toFixed(1)}万`} />
          </div>
        </section>

        {pageState === "loading" ? <Skeleton variant="list" /> : null}
        {pageState === "error" ? (
          <ErrorState title="门店数据加载失败" code="STORE_WORKSPACE_MOCK_ERROR" description="可重试恢复成员、统计和公告数据。" onRetry={restoreReady} />
        ) : null}
        {pageState === "empty" ? (
          <EmptyState title="暂无门店成员" description="通过手机号或邀请码添加第一位成员。" actionLabel="添加成员" onAction={() => showToast("添加成员占位")} />
        ) : null}

        {pageState === "ready" ? (
          <>
            <Card header={<SectionTitle icon={TrendingUp} title="门店数据统计" action="本月" />}>
              <div className="grid grid-cols-3 gap-2">
                <StoreMetric label="带看" value="42" light />
                <StoreMetric label="新增客源" value="31" light />
                <StoreMetric label="转化率" value="18%" light />
              </div>
              <div className="mt-4 flex items-end gap-2 rounded-xl bg-neutral-100 p-3">
                {[44, 68, 52, 86, 74, 92].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height }} />
                    <span className="text-[10px] text-neutral-500">{index + 1}周</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Users} title="经纪人列表" action={`${members.length} 人`} />}>
              <Input label="搜索成员" placeholder="输入姓名、手机号" />
              <div className="mt-3 space-y-3">
                {members.map((member) => (
                  <MemberRow key={member.id} member={member} onRemove={() => showToast("移除成员占位")} />
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={Plus} title="成员管理" action="占位操作" />}>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full" onClick={() => showToast("手机号邀请占位")}>
                  <Plus className="size-4" />
                  添加成员
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => showToast("批量移除占位")}>
                  <UserMinus className="size-4" />
                  移除成员
                </Button>
              </div>
              <p className="mt-3 text-caption text-neutral-500">成员权限调整、踢出门店和邀请链接将在后续流程页承载。</p>
            </Card>

            <Card header={<SectionTitle icon={Megaphone} title="门店公告" action="编辑" />}>
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-body-s font-semibold text-primary-900">本周优先维护中关村、知春路片区楼盘字典。</p>
                <p className="mt-2 text-caption text-primary-700">请各成员在周五 18:00 前完成负责楼盘的价格层级核验和户型信息补充。</p>
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

function StoreMetric({ label, value, light = false }: { label: string; value: string; light?: boolean }) {
  return (
    <div className={cn("rounded-xl px-2 py-3 text-center", light ? "bg-neutral-100" : "bg-primary-50")}>
      <p className="price-nums text-h3">{value}</p>
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
    </div>
  );
}

function MemberRow({ member, onRemove }: { member: StoreMember; onRemove: () => void }) {
  const status = statusMeta[member.status];

  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary-700">
            <Crown className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-body-s font-semibold text-neutral-900">{member.name}</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600">{member.level}</span>
            </div>
            <div className={cn("mt-1 flex items-center gap-1 text-caption font-semibold", status.className)}>
              <span className={cn("size-2 rounded-full", status.dot)} />
              {status.label}
            </div>
          </div>
        </div>
        <button type="button" className="flex size-9 items-center justify-center rounded-lg bg-white text-neutral-500" onClick={onRemove} aria-label="移除成员">
          <MinusCircle className="size-5" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MemberMetric icon={Medal} label="成交" value={`${member.deals}套`} />
        <MemberMetric icon={ShieldCheck} label="佣金" value={`${member.commissionWan}万`} />
        <MemberMetric icon={Star} label="评级" value={member.rating.toFixed(1)} />
      </div>
    </div>
  );
}

function MemberMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-2 py-2">
      <Icon className="mx-auto size-4 text-primary-700" />
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
      <p className="price-nums text-caption font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
