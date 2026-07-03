"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, PhoneCall } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { type BuyerStage, getLeadStageMeta, type Lead, type LeadType, mockLeads } from "@/lib/mock-leads";
import { cn } from "@/lib/utils";

const funnelStages: { stage: BuyerStage; label: string }[] = [
  { stage: "new", label: "新线索" },
  { stage: "following", label: "跟进中" },
  { stage: "appointed", label: "已约看" },
  { stage: "converted", label: "转化" },
  { stage: "lost", label: "流失" },
];

export default function AgentLeadsPage() {
  const [tab, setTab] = useState<LeadType | "all">("buyer");
  const [stageFilter, setStageFilter] = useState<BuyerStage | "all">("all");
  const buyerLeads = mockLeads.filter((lead) => lead.type === "buyer");
  const landlordLeads = mockLeads.filter((lead) => lead.type === "landlord");
  const leads = useMemo(
    () =>
      mockLeads.filter((lead) => {
        const tabMatch = tab === "all" || lead.type === tab;
        const stageMatch = stageFilter === "all" || lead.stage === stageFilter;
        return tabMatch && stageMatch;
      }),
    [stageFilter, tab],
  );
  const following = mockLeads.filter((lead) => ["following", "appointed", "interested", "agreed_list"].includes(lead.stage)).length;
  const converted = mockLeads.filter((lead) => ["converted", "sold"].includes(lead.stage)).length;

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <p className="text-caption text-neutral-500">经纪人 CRM</p>
        <h1 className="text-h3">线索总台</h1>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <p className="text-caption text-primary-200">我的线索漏斗</p>
          <h2 className="mt-1 text-h1">本月新增 {mockLeads.length} · 跟进中 {following} · 已成交 {converted}</h2>
          <div className="mt-4 space-y-2">
            {funnelStages.map((item) => {
              const count = buyerLeads.filter((lead) => lead.stage === item.stage).length;
              return <FunnelRow key={item.stage} label={item.label} count={count} max={buyerLeads.length} />;
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-caption">
            <div className="rounded-xl bg-white/10 p-3">转化率 <span className="price-nums font-semibold">16.7%</span></div>
            <div className="rounded-xl bg-white/10 p-3">平均跟进 <span className="price-nums font-semibold">8.3 天</span></div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <TabButton active={tab === "buyer"} onClick={() => setTab("buyer")}>买家线索 ({buyerLeads.length})</TabButton>
          <TabButton active={tab === "landlord"} onClick={() => setTab("landlord")}>房东线索 ({landlordLeads.length})</TabButton>
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>全部</TabButton>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <TabButton active={stageFilter === "all"} onClick={() => setStageFilter("all")}>全部</TabButton>
          {funnelStages.map((item) => (
            <TabButton key={item.stage} active={stageFilter === item.stage} onClick={() => setStageFilter(item.stage)}>{item.label}</TabButton>
          ))}
        </div>

        {leads.length === 0 ? (
          <EmptyState title="还没有客户线索" description="从平台匹配接受客源后，线索将自动出现在这里。" actionLabel="手动录入线索" />
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        )}
      </section>

      <AgentAssistFab pageContext="线索总台" suggestedPrompts={["哪几个线索最有可能近期成交？", "跟进中的客户多久没联系了？", "帮我分析转化率偏低的原因"]} />
    </main>
  );
}

function FunnelRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="grid grid-cols-[64px_1fr_48px] items-center gap-2 text-caption">
      <span>{label}</span>
      <div className="h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-secondary-400" style={{ width: `${Math.max(8, (count / max) * 100)}%` }} /></div>
      <span className="text-right">{count} 条</span>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={cn("shrink-0 rounded-xl px-3 py-2 text-caption font-semibold", active ? "bg-primary-700 text-white" : "bg-white text-neutral-600")} onClick={onClick}>
      {children}
    </button>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const meta = getLeadStageMeta(lead);
  const lastActivity = lead.activities.at(-1);
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-h3">{lead.name}</h2>
          <p className="mt-1 text-caption text-neutral-500">来源：{lead.sourceDetail} · {lead.lastContact}</p>
        </div>
        <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", meta.color)}>{meta.label}</span>
      </div>
      <p className="mt-3 text-body-s text-neutral-700">需求：{lead.need}</p>
      <p className="mt-1 text-caption text-neutral-500">上次跟进：{lastActivity?.summary ?? "待首次联系"}</p>
      <div className="mt-3">
        <div className="flex justify-between text-caption"><span>成交概率</span><span>{lead.probability}%</span></div>
        <div className="mt-1 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-primary-700" style={{ width: `${lead.probability}%` }} /></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary"><PhoneCall className="size-4" />记录</Button>
        <Button size="sm" variant="secondary"><CalendarCheck className="size-4" />约看</Button>
        <Link href={`/workspace/agent/leads/${lead.id}`}><Button size="sm" className="w-full">详情</Button></Link>
      </div>
    </Card>
  );
}
