import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { Card } from "@/components/Card";
import { mockListings, mockTransactions } from "@/lib/mock";

const rows = [
  { id: "txn-001", title: "中关村科技园精装三居", status: "公证机构核验", role: "买卖双方 + 经纪人", due: "今天 15:00 前补齐材料" },
  { id: "txn-002", title: "知春路两居", status: "意向确认", role: "买方待确认", due: "4 小时响应窗口剩 1 小时" },
  { id: "txn-003", title: "学院南路 32 号院", status: "资金监管", role: "平台监管户", due: "等待银行回传" },
];

export default function TransactionsPage() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <header className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">我的交易</p>
        <h1 className="text-h2">全链路合规交易列表</h1>
        <p className="mt-2 text-body-s text-neutral-500">关联房源：{listing.communityName}；当前活跃交易 {mockTransactions.length + 2} 笔。</p>
      </header>

      <section className="mt-4 space-y-3">
        {rows.map((row) => (
          <Link key={row.id} href={`/profile/transactions/${row.id}`} className="block">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-h3">{row.title}</h2>
                  <p className="mt-1 text-body-s text-neutral-500">{row.role}</p>
                </div>
                <ArrowRight className="size-5 text-neutral-400" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info icon={ShieldCheck} label="当前状态" value={row.status} />
                <Info icon={Clock3} label="处理时限" value={row.due} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-caption text-primary-700">
                <BadgeCheck className="size-4" />
                公证存证、合同、资金监管状态可追溯
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof FileCheck2; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <Icon className="size-5 text-primary-700" />
      <p className="mt-2 text-caption text-neutral-500">{label}</p>
      <p className="mt-1 text-body-s font-semibold">{value}</p>
    </div>
  );
}
