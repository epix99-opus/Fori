import Link from "next/link";
import { BadgeCheck, Building2, Crown, History, Home, LineChart, Pencil, ShieldCheck, Trophy } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockListings } from "@/lib/mock";

const buildings = [
  { name: "1 号楼", units: "2 单元", homes: 108, quality: "A" },
  { name: "2 号楼", units: "3 单元", homes: 162, quality: "B" },
  { name: "3 号楼", units: "2 单元", homes: 144, quality: "B" },
];

const founder = { name: "李四", date: "2026-01-15", rights: "永久维护优先权" };
const maintainers = [
  { name: "李四", points: 428, benefit: "P1 定向推送 · 1.3x" },
  { name: "王五", points: 316, benefit: "P2 优先 · 1.2x" },
  { name: "张明", points: 208, benefit: "推荐维护 · 1.1x" },
];
const contributionLedger = [
  { actor: "李四", action: "首建小区", points: 100, date: "2026-01-15", status: "审核通过" },
  { actor: "王五", action: "修订物业信息", points: 15, date: "2026-02-20", status: "已采纳" },
  { actor: "张明", action: "补充 3 号楼电梯信息", points: 8, date: "2026-03-08", status: "已采纳" },
  { actor: "赵六", action: "纠错车位比", points: 10, date: "2026-04-02", status: "业主纠错" },
  { actor: "李四", action: "上传成交贡献样本", points: 200, date: "2026-06-18", status: "成交归档" },
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
          <Tag icon={Crown} text={`首建者 · ${founder.name} · ${founder.date}`} />
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

      <Card className="mt-4" header={<SectionTitle icon={Trophy} title="Top3 维护者排行" subtitle="近 90 天积分与分成系数 Mock" />}>
        <div className="space-y-3">
          {maintainers.map((maintainer, index) => (
            <div key={maintainer.name} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
              <div className="flex items-center gap-3">
                <span className={`flex size-8 items-center justify-center rounded-full text-caption font-bold ${index === 0 ? "bg-secondary-200 text-secondary-700" : "bg-white text-neutral-700"}`}>
                  #{index + 1}
                </span>
                <div>
                  <p className="text-body-s font-semibold">{maintainer.name}</p>
                  <p className="mt-1 text-caption text-neutral-500">{maintainer.benefit}</p>
                </div>
              </div>
              <p className="price-nums text-body-s font-semibold text-primary-700">{maintainer.points} 分</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4" header={<SectionTitle icon={History} title="贡献账本" subtitle={`首建者权益：${founder.rights}`} />}>
        <div className="divide-y divide-neutral-200">
          {contributionLedger.map((entry) => (
            <div key={`${entry.actor}-${entry.date}-${entry.action}`} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-body-s font-semibold text-neutral-900">{entry.action}</p>
                <p className="mt-1 text-caption text-neutral-500">{entry.actor} · {entry.date} · {entry.status}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-100 px-2 py-1 text-caption font-semibold text-primary-700">+{entry.points}</span>
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

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Trophy; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-h3">{title}</h2>
        <p className="text-caption text-neutral-500">{subtitle}</p>
      </div>
    </div>
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
