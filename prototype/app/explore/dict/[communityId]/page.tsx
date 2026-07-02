import Link from "next/link";
import { BadgeCheck, Building2, Home, LineChart, Pencil, ShieldCheck } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockListings } from "@/lib/mock";

const buildings = [
  { name: "1 号楼", units: "2 单元", homes: 108, quality: "A" },
  { name: "2 号楼", units: "3 单元", homes: 162, quality: "B" },
  { name: "3 号楼", units: "2 单元", homes: 144, quality: "B" },
];

export default function CommunityDetailPage({ params }: { params: { communityId: string } }) {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <header className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">楼盘字典详情 · {params.communityId}</p>
        <h1 className="text-h1">{listing.communityName}</h1>
        <p className="mt-2 text-body-s text-neutral-500">海淀 · 中关村北区 · 2008 年建成 · 五级数据共建版本 v24</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag icon={ShieldCheck} text="L2 经纪人维护" />
          <Tag icon={BadgeCheck} text="Top3 贡献权益" />
        </div>
      </header>

      <section className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Summary icon={Building2} label="楼栋" value="12" />
        <Summary icon={Home} label="住宅" value="1,286" />
        <Summary icon={LineChart} label="成交样本" value="86" />
      </section>

      <Card className="mt-4" header={<h2 className="text-h3">楼栋数据</h2>}>
        <div className="space-y-3">
          {buildings.map((building) => (
            <div key={building.name} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
              <div>
                <p className="text-body-s font-semibold">{building.name}</p>
                <p className="mt-1 text-caption text-neutral-500">{building.units} · {building.homes} 户</p>
              </div>
              <span className="rounded-full bg-primary-100 px-2 py-1 text-caption font-semibold text-primary-700">{building.quality} 层级</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/explore/dict/community-001/edit">
          <Button variant="secondary" className="w-full">
            <Pencil className="mr-1 size-4" />
            维护字典
          </Button>
        </Link>
        <Link href="/price/community-001">
          <Button className="w-full">查看价格图谱</Button>
        </Link>
      </div>
    </main>
  );
}

function Tag({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">
      <Icon className="size-4" />
      {text}
    </span>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-card">
      <Icon className="mx-auto size-5 text-primary-700" />
      <p className="mt-2 text-h3">{value}</p>
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
    </div>
  );
}
