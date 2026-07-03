import Link from "next/link";
import { ArrowLeft, BarChart3, MousePointerClick, TrendingUp, Users } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockChannelReach, mockReachLeads } from "@/lib/mock-reach";

export default function MarketingReachPage() {
  const totals = mockChannelReach.reduce(
    (sum, item) => ({ exposure: sum.exposure + item.exposure, clicks: sum.clicks + item.clicks, leads: sum.leads + item.leads }),
    { exposure: 0, clicks: 0, leads: 0 },
  );

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketing/manage" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-caption text-neutral-500">自媒体营销</p>
            <h1 className="text-h3">触达分析</h1>
          </div>
          <BarChart3 className="size-6 text-primary-700" />
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <p className="text-caption text-primary-200">本周推广触达 · 2026-06-28 ~ 07-04</p>
          <h2 className="mt-1 text-h1">曝光 {totals.exposure.toLocaleString()} · 点击 {totals.clicks.toLocaleString()} · 线索 {totals.leads}</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-caption">
            <Metric icon={TrendingUp} label="曝光" value={totals.exposure.toLocaleString()} />
            <Metric icon={MousePointerClick} label="点击" value={totals.clicks.toLocaleString()} />
            <Metric icon={Users} label="线索" value={`${totals.leads}`} />
          </div>
        </section>

        <div className="space-y-3">
          {mockChannelReach.filter((item) => item.exposure > 0 || item.channel === "manual").map((channel) => (
            <Card key={channel.channel}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-h3">{channel.channelIcon} {channel.channelName}</h2>
                  <p className="mt-1 text-caption text-neutral-500">{channel.apiSupported ? `最优发布时间：${channel.topPostTime}（点击率 ${channel.bestClickRate}%）` : "平台无数据回传，展示估算和手动录入线索"}</p>
                </div>
                <span className="rounded-full bg-primary-50 px-2 py-1 text-caption font-semibold text-primary-700">{channel.leads} 条线索</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <SmallMetric label={channel.apiSupported ? "曝光" : "预计覆盖"} value={channel.exposure ? channel.exposure.toLocaleString() : "~200"} />
                <SmallMetric label="点击" value={channel.apiSupported ? channel.clicks.toLocaleString() : "无回传"} />
                <SmallMetric label="互动" value={`${channel.interactions.likes}赞`} />
              </div>
              <p className="mt-3 text-caption text-neutral-500">
                互动：{channel.interactions.likes} 点赞 · {channel.interactions.comments} 评论 · {channel.interactions.shares} 分享
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">查看发布内容</Button>
                <Link href="/workspace/agent/leads" className="flex-1"><Button size="sm" className="w-full">线索详情</Button></Link>
              </div>
            </Card>
          ))}
        </div>

        <Card header={<div><h2 className="text-h3">触达产生的线索 · 共 {mockReachLeads.length} 条</h2><p className="text-caption text-neutral-500">点击跟进进入 CRM 详情</p></div>}>
          <div className="space-y-3">
            {mockReachLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 p-3">
                <div className="min-w-0">
                  <h3 className="text-body-s font-semibold">{lead.name}</h3>
                  <p className="truncate text-caption text-neutral-500">来自{lead.channel} · {lead.need} · {lead.createdAt}</p>
                </div>
                <Link href={`/workspace/agent/leads/${lead.id}`}><Button size="sm">跟进</Button></Link>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <AgentAssistFab pageContext="触达分析" suggestedPrompts={["哪个渠道效果最好？", "如何提升点击转化率？", "手动录入一条来自朋友圈的线索"]} />
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <Icon className="mx-auto mb-2 size-5" />
      <p>{label}</p>
      <p className="price-nums font-semibold">{value}</p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <p className="text-caption text-neutral-500">{label}</p>
      <p className="price-nums mt-1 text-body-s font-semibold">{value}</p>
    </div>
  );
}
