"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  Clock3,
  Filter,
  Home,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockAgents, mockBuyerDemands, mockListings, type BuyerDemand, type Listing } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error";
type MatchFilter = "all" | "P1" | "P2" | "history";
type IntentLevel = "高" | "中" | "低";
type MatchStatus = "pending" | "accepted" | "deferred" | "rejected" | "expired";
type FlowKey = "matched" | "agent_responded" | "viewing_scheduled" | "negotiating" | "contracting";

type MatchLead = {
  id: string;
  demand: BuyerDemand;
  listing: Listing;
  matchScore: number;
  reasons: string[];
  intentLevel: IntentLevel;
  responseDeadline: string;
  status: MatchStatus;
  buyerPhoneMasked: string;
  source: string;
};

const filterTabs: Array<{ key: MatchFilter; label: string }> = [
  { key: "all", label: "全部" },
  { key: "P1", label: "P1 优先" },
  { key: "P2", label: "P2 待响应" },
  { key: "history", label: "历史" },
];

const matchFlowSteps: Array<{ key: FlowKey; label: string }> = [
  { key: "matched", label: "匹配" },
  { key: "agent_responded", label: "响应" },
  { key: "viewing_scheduled", label: "带看" },
  { key: "negotiating", label: "议价" },
  { key: "contracting", label: "签约" },
];

const seedLeads: MatchLead[] = Array.from({ length: 5 }, (_, index) => {
  const demand = mockBuyerDemands[index % mockBuyerDemands.length] ?? mockBuyerDemands[0];
  const listing = mockListings[index % mockListings.length] ?? mockListings[0];
  const priority = index === 0 ? "P1" : index < 3 ? "P2" : "normal";
  return {
    id: `match-${index + 1}`,
    demand: { ...demand, id: `${demand.id}-${index}`, priority, status: index === 4 ? "matched" : "open" },
    listing: {
      ...listing,
      id: `${listing.id}-match-${index}`,
      title: index % 2 === 0 ? `${listing.communityName} 可约看三居` : `${listing.communityName} 满五精装房`,
      priceWan: listing.priceWan + index * 18,
      areaSqm: listing.areaSqm + index * 4,
    },
    matchScore: [92, 87, 81, 76, 68][index] ?? 72,
    reasons: [
      ["预算命中", "三居刚需", "近地铁"],
      ["维护楼盘", "面积合适", "可快速约看"],
      ["同片区偏好", "价格接近", "信用已核验"],
      ["户型匹配", "通勤较优", "学区标签"],
      ["历史沟通", "预算偏低", "待复访"],
    ][index] ?? ["需求匹配"],
    intentLevel: (["高", "高", "中", "中", "低"][index] ?? "中") as IntentLevel,
    responseDeadline: index === 0 ? "04:00:00" : index === 1 ? "07:15:00" : index === 2 ? "1 天 4 小时" : "已转分配",
    status: index === 3 ? "expired" : index === 4 ? "accepted" : "pending",
    buyerPhoneMasked: ["136****9102", "185****2248", "139****4731", "150****8820", "137****1966"][index] ?? "138****0000",
    source: index < 2 ? "Push 新客源" : "匹配池刷新",
  };
});

export default function MatchPage() {
  const [state, setState] = useState<PageState>("loading");
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [showOnlyHighIntent, setShowOnlyHighIntent] = useState(false);
  const [leads, setLeads] = useState<MatchLead[]>(seedLeads);
  const [flowStatus, setFlowStatus] = useState<FlowKey>("matched");
  const [p1Countdown, setP1Countdown] = useState("04:00:00");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setState(leads.length > 0 ? "ready" : "empty"), 520);
    return () => window.clearTimeout(timer);
  }, [leads.length]);

  useEffect(() => {
    const deadline = Date.now() + 4 * 60 * 60 * 1000;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setP1Countdown([hours, minutes, seconds].map((item) => String(item).padStart(2, "0")).join(":"));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (showOnlyHighIntent && lead.intentLevel !== "高") return false;
      if (filter === "P1") return lead.demand.priority === "P1" && lead.status === "pending";
      if (filter === "P2") return lead.demand.priority === "P2" && lead.status === "pending";
      if (filter === "history") return lead.status !== "pending";
      return lead.status === "pending";
    });
  }, [filter, leads, showOnlyHighIntent]);

  const p1Count = leads.filter((lead) => lead.demand.priority === "P1" && lead.status === "pending").length;
  const agent = mockAgents[0];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function updateLead(id: string, status: MatchStatus) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  }

  function acceptLead(lead: MatchLead) {
    updateLead(lead.id, "accepted");
    setFlowStatus("agent_responded");
    showToast(`已解锁 ${lead.buyerPhoneMasked}，可进入站内沟通`);
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">经纪人工作台</p>
            <h1 className="truncate text-h3">智能匹配推荐</h1>
          </div>
          <button type="button" className="relative flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")}>
            <BellRing className="size-5" />
            {p1Count > 0 ? <span className="absolute right-2 top-2 size-2 rounded-full bg-semantic-danger" /> : null}
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? (
          <ErrorState title="匹配池同步失败" code="MATCH_MOCK_SYNC" description="保留最近一次缓存，可重试刷新客源和倒计时。" onRetry={retry} />
        ) : null}

        {state === "empty" ? (
          <EmptyState title="暂无匹配客源" description="维护楼盘标签并开启 Push 后，系统会推送高匹配买家需求。" actionLabel="模拟刷新客源" onAction={() => setState("ready")} />
        ) : null}

        {state === "ready" ? (
          <>
            <section className="rounded-2xl bg-primary-900 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-caption text-primary-300">买家需求摘要</p>
                  <h2 className="mt-1 text-h2">海淀中关村 · 三居 · 240-320 万</h2>
                  <p className="mt-2 text-body-s text-primary-100">服务经纪人：{agent?.displayName ?? "张明"} · {agent?.level ?? "L2"} · {agent?.storeName ?? "安心门店"}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <p className="text-caption text-primary-300">P1</p>
                  <p className="text-h2">{p1Count}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Metric label="预算命中" value="94%" />
                <Metric label="响应 SLA" value="4h" />
                <Metric label="客源信用" value="A" />
              </div>
            </section>

            <Card header={<div><h2 className="text-h3">撮合状态机</h2><p className="text-caption text-neutral-500">匹配 → 响应 → 带看 → 议价 → 签约</p></div>}>
              <div className="flex items-center justify-between gap-1">
                {matchFlowSteps.map((step, index) => {
                  const activeIndex = matchFlowSteps.findIndex((item) => item.key === flowStatus);
                  const status = index < activeIndex ? "done" : index === activeIndex ? "current" : "pending";
                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-1 flex-col items-center gap-2">
                        <span
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full text-caption font-bold",
                            status === "done" ? "bg-semantic-success text-white" : status === "current" ? "bg-primary-700 text-white" : "bg-neutral-200 text-neutral-500",
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-600">{step.label}</span>
                      </div>
                      {index < matchFlowSteps.length - 1 ? <div className={cn("h-px flex-1", status === "done" ? "bg-semantic-success" : "bg-neutral-200")} /> : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-body-s text-amber-900">
                P1 客源响应窗口：剩余 <span className="price-nums font-semibold">{p1Countdown}</span>。低于 30 分钟进入红色提醒，超时自动转分配并扣信用分 5 分。
              </div>
            </Card>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-caption font-semibold",
                    filter === tab.key ? "border-primary-500 bg-primary-500 text-white" : "border-neutral-200 bg-white text-neutral-700",
                  )}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                className={cn(
                  "ml-auto flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-caption font-semibold",
                  showOnlyHighIntent ? "border-secondary-500 bg-secondary-200 text-secondary-600" : "border-neutral-200 bg-white text-neutral-700",
                )}
                onClick={() => setShowOnlyHighIntent((current) => !current)}
              >
                <Filter className="size-3.5" />
                高意向
              </button>
            </div>

            {filteredLeads.length === 0 ? (
              <EmptyState title="当前筛选无结果" description="可切回全部客源，或关闭高意向筛选。" actionLabel="查看全部" onAction={() => { setFilter("all"); setShowOnlyHighIntent(false); }} />
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <MatchCard
                    key={lead.id}
                    lead={lead}
                    onAccept={() => acceptLead(lead)}
                    onDefer={() => { updateLead(lead.id, "deferred"); showToast("已暂不处理，将 2 小时后再次提醒"); }}
                    onReject={() => { updateLead(lead.id, "rejected"); setFlowStatus("matched"); showToast("已拒绝该客源，系统将减少同类推荐"); }}
                    p1Countdown={lead.demand.priority === "P1" ? p1Countdown : lead.responseDeadline}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>

      {toast ? <Toast title={toast} /> : null}
      <AgentAssistFab
        pageContext="经纪人撮合匹配"
        suggestedPrompts={["帮我判断这个 P1 客源是否该立即响应", "生成拒绝该客源的礼貌话术", "总结下一步带看安排"]}
      />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-2 py-3">
      <p className="text-caption text-primary-300">{label}</p>
      <p className="mt-1 text-h3">{value}</p>
    </div>
  );
}

function MatchCard({
  lead,
  onAccept,
  onDefer,
  onReject,
  p1Countdown,
}: {
  lead: MatchLead;
  onAccept: () => void;
  onDefer: () => void;
  onReject: () => void;
  p1Countdown: string;
}) {
  const isP1 = lead.demand.priority === "P1";
  const priorityLabel = lead.demand.priority === "normal" ? "P3" : lead.demand.priority;
  const isExpired = lead.status === "expired";

  return (
    <Card className={cn(isP1 && "border-l-4 border-l-secondary-500", isExpired && "opacity-70 grayscale")}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", isP1 ? "bg-amber-100 text-secondary-600" : "bg-primary-100 text-primary-700")}>
                {priorityLabel} {isP1 ? "优先" : ""}
              </span>
              <span className="rounded-full bg-green-50 px-2 py-1 text-caption font-semibold text-semantic-success">意向{lead.intentLevel}</span>
            </div>
            <h2 className="mt-2 text-h3">{lead.demand.districts.join(" / ")} · {lead.demand.rooms ?? 3}居 · {lead.demand.budgetMinWan}-{lead.demand.budgetMaxWan} 万</h2>
            <p className="mt-1 text-body-s text-neutral-500">{lead.listing.title} · {lead.listing.areaSqm}㎡ · ¥{lead.listing.priceWan}万</p>
          </div>
          <div className="text-right">
            <p className="text-caption text-neutral-500">匹配度</p>
            <p className="price-nums text-price-m text-primary-700">{lead.matchScore}%</p>
          </div>
        </div>

        <div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${lead.matchScore}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lead.reasons.map((reason) => (
              <span key={reason} className="rounded-full bg-neutral-100 px-2 py-1 text-caption text-neutral-700">
                {reason}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoPill icon={Clock3} label="剩余响应" value={isExpired ? "已转分配" : p1Countdown} warning={isP1} />
          <InfoPill icon={ShieldCheck} label="来源" value={lead.source} />
          <InfoPill icon={Home} label="关联房源" value={lead.listing.communityName} />
          <InfoPill icon={UserRoundCheck} label="买家联系" value={lead.status === "accepted" ? lead.buyerPhoneMasked : "接受后解锁"} />
        </div>

        {isExpired ? (
          <div className="rounded-xl bg-neutral-100 p-3 text-body-s text-neutral-500">
            4h 未响应，已自动转分配；原经纪人信用分 -5。
          </div>
        ) : lead.status === "accepted" ? (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-body-s text-semantic-success">
            <MessageCircle className="size-5" />
            已接受跟进，可进入消息中心建立沟通。
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-2">
            <Button variant="ghost" size="sm" onClick={onReject}>拒绝</Button>
            <Button variant="secondary" size="sm" onClick={onDefer}>暂不处理</Button>
            <Button size="sm" onClick={onAccept}>
              <Sparkles className="size-4" />
              立即响应
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
  warning = false,
}: {
  icon: typeof Loader2;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <div className="flex items-center gap-1 text-caption text-neutral-500">
        <Icon className={cn("size-3.5", warning && "text-semantic-warning")} />
        {label}
      </div>
      <p className="mt-1 truncate text-body-s font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
