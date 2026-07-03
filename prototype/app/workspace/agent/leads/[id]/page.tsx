"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Home, MessageSquareText, Plus, Search } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Toast } from "@/components/Toast";
import { BUYER_STAGE_META, getLeadStageMeta, LANDLORD_STAGE_META, mockLeads } from "@/lib/mock-leads";
import { cn } from "@/lib/utils";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = mockLeads.find((item) => item.id === params.id) ?? mockLeads[0];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const meta = getLeadStageMeta(lead);
  const stages = lead.type === "buyer" ? Object.entries(BUYER_STAGE_META) : Object.entries(LANDLORD_STAGE_META);
  const currentIndex = Math.max(0, stages.findIndex(([stage]) => stage === lead.stage));

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mobile-shell pb-32">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/workspace/agent/leads" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-caption text-neutral-500">线索详情</p>
            <h1 className="text-h3">{lead.name}</h1>
          </div>
          <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", meta.color)}>{meta.label}</span>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <p className="text-caption text-primary-200">来自：{lead.sourceDetail}</p>
          <h2 className="mt-1 text-h1">{lead.need}</h2>
          <p className="mt-2 text-body-s text-primary-100">联系方式：{lead.phone} · 预计价值：{lead.expectedValue}</p>
          <div className="mt-4">
            <div className="flex justify-between text-caption"><span>意向强度</span><span>{lead.probability}%</span></div>
            <div className="mt-1 h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-secondary-400" style={{ width: `${lead.probability}%` }} /></div>
          </div>
        </section>

        <Card header={<div><h2 className="text-h3">漏斗进度</h2><p className="text-caption text-neutral-500">当前阶段高亮，后续动作可直接触发</p></div>}>
          <div className="space-y-3">
            {stages.map(([stage, item], index) => (
              <div key={stage} className="grid grid-cols-[24px_1fr] gap-3">
                <span className={cn("mt-1 size-4 rounded-full", index <= currentIndex ? "bg-primary-700" : "bg-neutral-200")} />
                <div>
                  <p className={cn("text-body-s font-semibold", index === currentIndex ? "text-primary-700" : "text-neutral-900")}>{item.label}</p>
                  <p className="text-caption text-neutral-500">{index < currentIndex ? "已完成" : index === currentIndex ? "当前阶段" : "待操作"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<div><h2 className="text-h3">跟进记录</h2><p className="text-caption text-neutral-500">时间线记录每次沟通和平台动作</p></div>}>
          <div className="space-y-3">
            {(lead.activities.length ? lead.activities : [{ id: "empty", type: "note" as const, time: lead.lastContact, summary: "待记录首次跟进。" }]).map((activity) => (
              <div key={activity.id} className="rounded-xl bg-neutral-100 p-3">
                <p className="text-caption font-semibold text-primary-700">{activity.time} · {activity.type}</p>
                <p className="mt-1 text-body-s text-neutral-800">{activity.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-3">
        <div className="grid grid-cols-4 gap-2">
          <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}><MessageSquareText className="size-4" />记录</Button>
          <Button size="sm" variant="secondary" onClick={() => showToast("约看房占位")}><CalendarCheck className="size-4" />约看</Button>
          <Button size="sm" variant="secondary" onClick={() => showToast("推荐房源占位")}><Home className="size-4" />房源</Button>
          <Link href="/match"><Button size="sm" className="w-full"><Search className="size-4" />匹配</Button></Link>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="记录跟进">
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {["电话", "微信", "面谈", "看房"].map((item) => (
              <button key={item} type="button" className="rounded-xl bg-neutral-100 px-2 py-3 text-caption font-semibold">{item}</button>
            ))}
          </div>
          <Input label="时间" value="2026-07-03 18:00" readOnly />
          <Input label="备注" placeholder="记录本次沟通重点、客户异议和下一步动作" />
          <Input label="下次跟进" placeholder="2026-07-05 15:00" />
          <Button className="w-full" onClick={() => { setSheetOpen(false); showToast("跟进记录已保存"); }}><Plus className="size-4" />保存跟进记录</Button>
        </div>
      </BottomSheet>

      <AgentAssistFab pageContext="线索详情" suggestedPrompts={["帮我准备一个约看房的话术", "这个客户的购房意向评分是多少？", "记录一条电话跟进"]} />
      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}
