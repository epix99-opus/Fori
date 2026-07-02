"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Building2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Home,
  Pencil,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { TabBar } from "@/components/TabBar";
import { Toast } from "@/components/Toast";
import { mockAgents, mockListings, mockTransactions, mockUsers } from "@/lib/mock";

type PageState = "loading" | "ready" | "empty" | "error";
type QuickEntry = {
  label: string;
  value: string;
  href: string;
  icon: typeof Home;
  tone: string;
};

const utilityLinks = [
  { label: "设置", description: "账号、安全、通知与隐私", href: "/profile/settings", icon: Settings },
  { label: "联系客服", description: "交易纠纷、资质审核和资金监管咨询", href: "/messages", icon: Headphones },
  { label: "帮助中心", description: "查看发布、认证、交易流程说明", href: "/profile/credit", icon: HelpCircle },
  { label: "关于 Fori", description: "版本、协议与反馈入口", href: "/profile/settings", icon: Bell },
];

export default function ProfilePage() {
  const [state, setState] = useState<PageState>("loading");
  const [toast, setToast] = useState<string | null>(null);

  const user = mockUsers[0];
  const agent = mockAgents[0];
  const creditScore = user?.creditScore ?? 92;

  const quickEntries: QuickEntry[] = useMemo(
    () => [
      { label: "我的房源", value: `${mockListings.length}`, href: "/publish/listing", icon: Building2, tone: "bg-primary-100 text-primary-700" },
      { label: "我的客户", value: "8", href: "/workspace/agent/matches", icon: UsersRound, tone: "bg-blue-50 text-semantic-info" },
      { label: "我的交易", value: `${mockTransactions.length}`, href: "/profile/transactions", icon: FileCheck2, tone: "bg-green-50 text-semantic-success" },
      { label: "我的收藏", value: "12", href: "/explore/search", icon: Bookmark, tone: "bg-red-50 text-semantic-danger" },
    ],
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setState(user ? "ready" : "empty"), 450);
    return () => window.clearTimeout(timer);
  }, [user]);

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-neutral-500">我的</p>
            <h1 className="text-h2">个人中心</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")} aria-label="模拟错误">
            <RefreshCcw className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? <ErrorState title="资料拉取失败" code="PROFILE_SYNC" description="可重试同步头像、认证状态、功能入口和统计数据。" onRetry={retry} /> : null}

        {state === "empty" ? <EmptyState title="暂无个人资料" description="登录并完成实名信息后，可查看房源、交易和信用档案。" actionLabel="重新加载" onAction={retry} /> : null}

        {state === "ready" ? (
          <>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white">
              <Link href="/profile/settings" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl bg-white/15" aria-label="编辑资料">
                <Pencil className="size-4" />
              </Link>
              <div className="flex items-start gap-4">
                <button type="button" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-h1" onClick={() => showToast("头像更换入口占位")}>
                  {user?.avatarUrl ? null : user?.name.slice(0, 1)}
                </button>
                <div className="min-w-0 flex-1 pr-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-h2">{user?.name ?? "林女士"}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-caption font-semibold">
                      <BadgeCheck className="size-3.5" />
                      实名已认证
                    </span>
                  </div>
                  <p className="mt-1 text-body-s text-primary-100">{user?.phoneMasked ?? "138****8201"} · 业主 / 买家</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-caption text-primary-200">信用评分</p>
                      <p className="price-nums text-[44px] font-bold leading-none">{creditScore}</p>
                    </div>
                    <CreditRing score={creditScore} />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-4 gap-3">
              {quickEntries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Link key={entry.label} href={entry.href} className="rounded-xl bg-white p-3 text-center shadow-card">
                    <span className={`mx-auto flex size-10 items-center justify-center rounded-xl ${entry.tone}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="price-nums mt-2 block text-h3">{entry.value}</span>
                    <span className="block text-caption text-neutral-500">{entry.label}</span>
                  </Link>
                );
              })}
            </div>

            <Card header={<SectionTitle icon={Star} title="数据统计" subtitle="近 30 天账户表现" />}>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="房源曝光" value="1.2k" />
                <Stat label="客户跟进" value="16" />
                <Stat label="完成交易" value="2" />
              </div>
            </Card>

            <Card header={<SectionTitle icon={ShieldCheck} title="认证状态" subtitle="实名、经纪人资质和信用档案" />}>
              <div className="space-y-3">
                <StatusRow label="实名认证" value="已通过" href="/profile/credit" />
                <StatusRow label="经纪人认证" value={`${agent?.level ?? "L2"} 审核通过`} href="/profile/agent-cert" />
                <StatusRow label="信用档案" value={`${creditScore} 分`} href="/profile/credit" />
              </div>
            </Card>

            <Card header={<SectionTitle icon={HeartHandshake} title="收益与交易" subtitle="经纪人收益和公证存证入口" />}>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/profile/transactions/txn-001/evidence" className="rounded-xl bg-neutral-100 p-3">
                  <FileCheck2 className="size-5 text-primary-700" />
                  <p className="mt-2 text-body-s font-semibold">公证存证记录</p>
                  <p className="text-caption text-neutral-500">1 条可下载</p>
                </Link>
                <button type="button" className="rounded-xl bg-neutral-100 p-3 text-left" onClick={() => showToast("收益结算入口占位")}>
                  <CircleDollarSign className="size-5 text-secondary-600" />
                  <p className="mt-2 text-body-s font-semibold">收益结算</p>
                  <p className="text-caption text-neutral-500">待结算 ¥2,800</p>
                </button>
              </div>
            </Card>

            <Card>
              <div className="divide-y divide-neutral-100">
                {utilityLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-s font-semibold text-neutral-900">{item.label}</span>
                        <span className="block truncate text-caption text-neutral-500">{item.description}</span>
                      </span>
                      <ChevronRight className="size-4 text-neutral-400" />
                    </Link>
                  );
                })}
              </div>
            </Card>

            <Button variant="secondary" className="w-full" onClick={() => showToast("编辑资料入口占位")}>
              编辑个人资料
            </Button>
          </>
        ) : null}
      </section>

      <TabBar active="profile" />
      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function CreditRing({ score }: { score: number }) {
  const degrees = Math.round(score * 3.6);
  return (
    <div className="grid size-20 place-items-center rounded-full" style={{ background: `conic-gradient(#ffffff ${degrees}deg, rgba(255,255,255,.18) 0deg)` }}>
      <div className="grid size-14 place-items-center rounded-full bg-primary-800 text-center">
        <span className="text-caption text-primary-100">信用</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Home; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-5 text-primary-700" />
      <div>
        <h2 className="text-h3">{title}</h2>
        <p className="text-caption text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3 text-center">
      <p className="price-nums text-h2">{value}</p>
      <p className="text-caption text-neutral-500">{label}</p>
    </div>
  );
}

function StatusRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
      <span className="flex items-center gap-2 text-body-s font-semibold text-neutral-900">
        <UserRound className="size-4 text-primary-700" />
        {label}
      </span>
      <span className="flex items-center gap-1 text-caption font-semibold text-primary-700">
        {value}
        <ChevronRight className="size-4" />
      </span>
    </Link>
  );
}
