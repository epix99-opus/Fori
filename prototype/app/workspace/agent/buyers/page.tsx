import Link from "next/link";
import { BadgePercent, Coins, Flame, PhoneCall } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockBuyerDemands } from "@/lib/mock";

const buyers = [
  { name: "周先生", need: "海淀三居 · 260-320 万", probability: 78, commission: "2.8-3.6 万", risk: "P1 2小时后超时" },
  { name: "何女士", need: "知春路两居 · 近地铁", probability: 64, commission: "1.9-2.4 万", risk: "看房后待回访" },
  { name: "陈先生", need: "改善三居 · 学区优先", probability: 52, commission: "3.2-4.1 万", risk: "需补资格材料" },
];

export default function AgentBuyersPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <header className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">买家快速视图</p>
        <h1 className="text-h2">跟进 {mockBuyerDemands.length + buyers.length} 位有效买家</h1>
        <p className="mt-2 text-body-s text-neutral-500">按响应超时、成交概率和预计佣金综合排序。</p>
        <Link href="/workspace/agent/leads" className="mt-3 block rounded-xl bg-primary-50 px-3 py-2 text-center text-caption font-semibold text-primary-700">
          查看完整 CRM 漏斗 →
        </Link>
      </header>

      <section className="mt-4 space-y-3">
        {buyers.map((buyer) => (
          <Card key={buyer.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-h3">{buyer.name}</h2>
                <p className="mt-1 text-body-s text-neutral-500">{buyer.need}</p>
              </div>
              <span className="rounded-full bg-red-50 px-2 py-1 text-caption font-semibold text-semantic-danger">{buyer.risk}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={BadgePercent} label="成交概率" value={`${buyer.probability}%`} />
              <Metric icon={Coins} label="预计佣金" value={buyer.commission} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1">
                <PhoneCall className="mr-1 size-4" />
                立即跟进
              </Button>
              <Link href="/workspace/agent/matches" className="flex-1">
                <Button size="sm" variant="secondary" className="w-full">查看匹配</Button>
              </Link>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <Icon className="size-5 text-primary-700" />
      <p className="mt-2 text-caption text-neutral-500">{label}</p>
      <p className="mt-1 text-body-s font-semibold">{value}</p>
    </div>
  );
}
