import Link from "next/link";
import { ArrowRight, Building2, Calculator, Home, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { mockListings } from "@/lib/mock";

export default function PriceEntryPage() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">独立价格评估入口</p>
        <h1 className="mt-1 text-h1">输入小区或房源，生成在地分层价格图谱</h1>
        <div className="mt-4 space-y-3">
          <Input label="目标小区" defaultValue={listing.communityName} placeholder="搜索小区、楼栋或地址" />
          <Input label="建筑面积" defaultValue={`${listing.areaSqm}`} placeholder="平方米" />
          <Input label="挂牌总价" defaultValue={`${listing.priceWan}`} placeholder="万元" />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        <ModeCard icon={Building2} title="小区均价" text="成交样本" />
        <ModeCard icon={Home} title="单套估价" text="户型修正" />
        <ModeCard icon={SlidersHorizontal} title="手动参数" text="无房源也可评估" />
      </section>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-h3">当前片区参考均价</h2>
            <p className="mt-1 text-body-s text-neutral-500">3.2-3.8 万/㎡，认证后可查看成交明细。</p>
          </div>
          <Calculator className="size-8 text-primary-700" />
        </div>
      </Card>

      <Link href="/price/community-001" className="mt-4 block">
        <Button className="w-full">
          生成评估
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </Link>
    </main>
  );
}

function ModeCard({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-card">
      <Icon className="mx-auto size-6 text-primary-700" />
      <p className="mt-2 text-caption font-semibold">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-neutral-500">{text}</p>
    </div>
  );
}
