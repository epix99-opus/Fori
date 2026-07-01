"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  ChevronDown,
  Clock3,
  Megaphone,
  MessageCircle,
  RefreshCcw,
  UserRoundCheck,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockBuyerDemands, mockMessages, mockTransactions } from "@/lib/mock";
import type { Message } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type MessageTab = "system" | "transaction" | "customer";
type MessageCategory = Message["type"] | "customer";
type Priority = "P1" | "P2" | "P3";

type MessageItem = Message & {
  category: MessageCategory;
  preview: string;
  priority?: Priority;
  transactionCode?: string;
  actionLabel?: string;
};

const seedMessages: MessageItem[] = [
  {
    id: "system-verify",
    userId: "user-001",
    type: "system",
    category: "system",
    title: "实名认证已通过",
    body: "您的实名信息已完成平台与公证接口核验，可继续发布房源和查看信用档案。",
    preview: "实名信息已通过，可继续发布房源。",
    read: false,
    createdAt: "2026-07-01T10:18:00-07:00",
  },
  {
    id: "system-notice",
    userId: "user-001",
    type: "system",
    category: "system",
    title: "平台服务协议更新",
    body: "Fori 对交易存证和资金监管说明进行了更新，请在设置页查看最新协议。",
    preview: "交易存证和资金监管说明已更新。",
    read: true,
    createdAt: "2026-06-30T18:20:00-07:00",
  },
  {
    ...mockMessages[0],
    category: "transaction",
    preview: "公证机构已收到核验材料。",
    transactionCode: mockTransactions[0]?.id ?? "txn-001",
    actionLabel: "查看交易",
  },
  {
    id: "txn-fund",
    userId: "user-001",
    type: "transaction",
    category: "transaction",
    title: "资金监管状态变更",
    body: "买方定金已进入监管账户，平台将在完成公证确认后释放下一步材料清单。",
    preview: "定金已进入监管账户。",
    read: true,
    createdAt: "2026-06-30T09:40:00-07:00",
    transactionCode: "FO-2026-001234",
    actionLabel: "查看流水",
  },
  {
    id: "customer-p1",
    userId: "user-001",
    type: "match",
    category: "customer",
    title: "P1 高意向客户推送",
    body: "客户关注中关村三居，预算 240-320 万，4 小时内响应可获得优先跟进资格。",
    preview: "中关村三居，预算 240-320 万。",
    read: false,
    createdAt: "2026-07-01T09:12:00-07:00",
    priority: "P1",
    actionLabel: "接受跟进",
  },
  {
    id: "customer-p2",
    userId: "user-001",
    type: "match",
    category: "customer",
    title: "客户需求更新",
    body: "买家补充了学区与通勤要求，建议推荐知春路和中关村片区的核验房源。",
    preview: "买家补充了学区与通勤要求。",
    read: true,
    createdAt: "2026-06-29T13:30:00-07:00",
    priority: "P2",
    actionLabel: "查看需求",
  },
];

const tabs: Array<{ key: MessageTab; label: string }> = [
  { key: "system", label: "系统通知" },
  { key: "transaction", label: "交易消息" },
  { key: "customer", label: "客户消息" },
];

export default function MessagesPage() {
  const [state, setState] = useState<PageState>("ready");
  const [activeTab, setActiveTab] = useState<MessageTab>("system");
  const [messages, setMessages] = useState<MessageItem[]>(seedMessages);
  const [expandedId, setExpandedId] = useState<string | null>("system-verify");
  const [toast, setToast] = useState<string | null>(null);

  const visibleMessages = useMemo(() => messages.filter((message) => message.category === activeTab), [activeTab, messages]);
  const unreadTotal = messages.filter((message) => !message.read).length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  function markAllRead() {
    setMessages((current) => current.map((message) => (message.category === activeTab ? { ...message, read: true } : message)));
    showToast("当前分类已全部标记为已读");
  }

  function markRead(id: string) {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, read: true } : message)));
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-caption text-neutral-500">全局消息</p>
            <h1 className="text-h2">消息中心</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-xl bg-neutral-100 px-3 py-2 text-caption font-semibold" onClick={() => setState("empty")}>
              空
            </button>
            <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")} aria-label="模拟错误">
              <RefreshCcw className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">未读 {unreadTotal}</div>
          <Button size="sm" variant="secondary" onClick={markAllRead}>
            <CheckCheck className="size-4" />
            全部已读
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-1">
          {tabs.map((tab) => {
            const unread = messages.filter((message) => message.category === tab.key && !message.read).length;
            return (
              <button
                key={tab.key}
                type="button"
                className={cn("relative rounded-lg px-2 py-2 text-caption font-semibold text-neutral-500", activeTab === tab.key && "bg-white text-primary-700 shadow-sm")}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {unread > 0 ? <span className="ml-1 rounded-full bg-semantic-danger px-1.5 py-0.5 text-[10px] leading-none text-white">{unread}</span> : null}
              </button>
            );
          })}
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? <ErrorState title="消息拉取失败" code="MESSAGE_SYNC" description="可重试拉取最新通知，当前页面保留本地缓存入口。" onRetry={retry} /> : null}

        {state === "empty" ? <EmptyState title="暂无消息" description="开启通知后，系统通知、交易进度和客户消息会聚合在这里。" actionLabel="查看通知设置" onAction={() => setState("ready")} /> : null}

        {state === "ready" ? (
          <>
            <section className="rounded-xl bg-white p-3 shadow-card">
              <div className="flex items-center gap-2 text-body-s text-neutral-600">
                <Bell className="size-4 text-primary-700" />
                <span>主动进入消息中心时展示通知权限横幅，不弹系统权限框。</span>
              </div>
            </section>

            {visibleMessages.length === 0 ? (
              <EmptyState title="当前分类暂无消息" description="稍后有新的通知或业务进度时会自动出现在这里。" />
            ) : (
              <div className="space-y-5">
                <MessageGroup
                  title="今天"
                  messages={visibleMessages.filter((message) => message.createdAt.startsWith("2026-07-01"))}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onMarkRead={markRead}
                />
                <MessageGroup
                  title="更早"
                  messages={visibleMessages.filter((message) => !message.createdAt.startsWith("2026-07-01"))}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onMarkRead={markRead}
                />
              </div>
            )}

            {activeTab === "customer" ? (
              <Card header={<SectionTitle icon={UserRoundCheck} title="客源响应规则" subtitle={`当前开放需求 ${mockBuyerDemands.length} 个`} />}>
                <p className="text-body-s text-neutral-600">P1 客源需要在 4 小时内响应。原型中提供接受 / 拒绝按钮占位，后续接入真实滑动操作。</p>
              </Card>
            ) : null}
          </>
        ) : null}
      </section>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function MessageGroup({
  title,
  messages,
  expandedId,
  setExpandedId,
  onMarkRead,
}: {
  title: string;
  messages: MessageItem[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onMarkRead: (id: string) => void;
}) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-caption font-semibold text-neutral-500">{title}</h2>
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} expanded={expandedId === message.id} onToggle={() => setExpandedId(expandedId === message.id ? null : message.id)} onMarkRead={() => onMarkRead(message.id)} />
        ))}
      </div>
    </section>
  );
}

function MessageCard({ message, expanded, onToggle, onMarkRead }: { message: MessageItem; expanded: boolean; onToggle: () => void; onMarkRead: () => void }) {
  const Icon = message.category === "system" ? Megaphone : message.category === "transaction" ? BriefcaseBusiness : MessageCircle;
  const time = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt));

  return (
    <article className={cn("rounded-xl bg-white p-4 shadow-card", !message.read && "ring-1 ring-primary-100")}>
      <button type="button" className="flex w-full gap-3 text-left" onClick={onToggle}>
        <span className={cn("mt-1 size-2 rounded-full", message.read ? "bg-transparent" : "bg-primary-600")} />
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-body-s font-semibold text-neutral-900">{message.title}</span>
            <span className="shrink-0 text-caption text-neutral-400">{time}</span>
          </span>
          <span className="mt-1 line-clamp-2 text-body-s text-neutral-500">{message.preview}</span>
          {message.priority ? <span className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 text-caption font-semibold", message.priority === "P1" ? "bg-red-50 text-semantic-danger" : "bg-primary-100 text-primary-700")}>{message.priority}</span> : null}
        </span>
        <ChevronDown className={cn("mt-1 size-4 shrink-0 text-neutral-400 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded ? (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <p className="text-body-s text-neutral-700">{message.body}</p>
          {message.transactionCode ? <p className="mt-2 text-caption text-neutral-500">交易编号：{message.transactionCode}</p> : null}
          <div className="mt-3 flex items-center gap-2">
            {!message.read ? (
              <Button size="sm" variant="secondary" onClick={onMarkRead}>
                标记已读
              </Button>
            ) : null}
            {message.actionLabel ? (
              <Link href={message.category === "transaction" ? "/transaction/txn-001" : "/match"} className="rounded-lg bg-primary-600 px-3 py-2 text-caption font-semibold text-white">
                {message.actionLabel}
              </Link>
            ) : null}
            {message.category === "customer" ? (
              <Button size="sm" variant="ghost">
                拒绝
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Clock3; title: string; subtitle: string }) {
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
