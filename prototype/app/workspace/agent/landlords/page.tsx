"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Plus, UserRoundCheck } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Toast } from "@/components/Toast";
import { getLeadStageMeta, mockLeads } from "@/lib/mock-leads";
import { cn } from "@/lib/utils";

export default function LandlordLeadsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const landlords = mockLeads.filter((lead) => lead.type === "landlord");
  const interested = landlords.filter((lead) => ["interested", "agreed_list", "listing_review"].includes(lead.stage)).length;
  const listed = landlords.filter((lead) => ["listed", "sold"].includes(lead.stage)).length;
  const sourceGroups = ["platform_match", "media_reach", "manual", "referral"].map((source) => ({
    source,
    count: landlords.filter((lead) => lead.source === source).length,
  }));

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/workspace/agent" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-caption text-neutral-500">经纪人 CRM</p>
            <h1 className="text-h3">房东线索</h1>
          </div>
          <UserRoundCheck className="size-6 text-primary-700" />
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <p className="text-caption text-primary-200">房东客户</p>
          <h2 className="mt-1 text-h1">本月接触 {landlords.length} · 有意向 {interested} · 已上架 {listed}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sourceGroups.map((item) => (
              <span key={item.source} className="rounded-full bg-white/10 px-3 py-1 text-caption">
                {sourceLabel(item.source)} {item.count} 条
              </span>
            ))}
          </div>
        </section>

        <Button className="w-full" onClick={() => showToast("手动录入房东线索占位")}><Plus className="size-4" />手动录入房东线索</Button>

        <div className="space-y-3">
          {landlords.map((lead) => {
            const meta = getLeadStageMeta(lead);
            return (
              <Card key={lead.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-h3">{lead.name}</h2>
                    <p className="mt-1 text-caption text-neutral-500">{lead.lastContact} · {lead.sourceDetail}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", meta.color)}>{meta.label}</span>
                </div>
                <p className="mt-3 text-body-s text-neutral-700">房源：{lead.need}</p>
                <p className="mt-1 text-caption text-neutral-500">意向：{lead.expectedValue} · 概率 {lead.probability}%</p>
                <div className="mt-3 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-primary-700" style={{ width: `${lead.probability}%` }} /></div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button size="sm" variant="secondary">跟进</Button>
                  <Button size="sm" variant="secondary"><Home className="size-4" />促成上架</Button>
                  <Link href={`/workspace/agent/leads/${lead.id}`}><Button size="sm" className="w-full">详情</Button></Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <AgentAssistFab pageContext="房东线索" suggestedPrompts={["哪个房东最近最有可能挂牌？", "帮我写一个拜访话术", "有多少房东还没有录入房源？"]} />
      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    platform_match: "平台推送",
    media_reach: "自媒体触达",
    manual: "手动录入",
    referral: "转介绍",
  };
  return labels[source] ?? source;
}
