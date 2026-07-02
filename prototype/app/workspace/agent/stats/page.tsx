import Link from "next/link";
import { ArrowRight, BarChart3, Coins, Target, TrendingUp } from "lucide-react";

import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

const stats = [
  { label: "本月成交", value: "5 套", note: "目标完成 63%" },
  { label: "预计佣金", value: "18.6 万", note: "已结算 11.2 万" },
  { label: "转化率", value: "12.8%", note: "较上月 +2.1%" },
];

export default function AgentStatsPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <header className="rounded-2xl bg-primary-900 p-4 text-white shadow-card">
        <p className="text-caption text-primary-200">成交统计</p>
        <h1 className="text-h1">业绩、佣金与转化漏斗</h1>
      </header>

      <section className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-3 shadow-card">
            <p className="text-caption text-neutral-500">{item.label}</p>
            <p className="mt-2 text-h3 price-nums">{item.value}</p>
            <p className="mt-1 text-[11px] leading-4 text-semantic-success">{item.note}</p>
          </div>
        ))}
      </section>

      <Card className="mt-4" header={<h2 className="text-h3">成交漏斗</h2>}>
        <div className="space-y-3">
          <Funnel icon={Target} label="有效客源" value="62" width="100%" />
          <Funnel icon={TrendingUp} label="带看" value="28" width="72%" />
          <Funnel icon={BarChart3} label="意向确认" value="11" width="46%" />
          <Funnel icon={Coins} label="成交" value="5" width="28%" />
        </div>
      </Card>

      <Link href="/profile/transactions/txn-001" className="mt-4 block">
        <Button className="w-full">
          查看交易明细
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </Link>
    </main>
  );
}

function Funnel({ icon: Icon, label, value, width }: { icon: typeof Target; label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-body-s">
        <span className="flex items-center gap-2 font-semibold"><Icon className="size-4 text-primary-700" />{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 rounded-full bg-neutral-100">
        <div className="h-3 rounded-full bg-primary-500" style={{ width }} />
      </div>
    </div>
  );
}
