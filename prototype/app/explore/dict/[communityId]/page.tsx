"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, BadgeCheck, Building2, Bus, CheckCircle2, Crown, Home, LineChart, Pencil, ShieldCheck, Train, Trophy, XCircle } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ViewerRoleSwitcher } from "@/components/ViewerRoleSwitcher";
import { mockListings } from "@/lib/mock";
import { maskValue, type ViewerRole } from "@/lib/viewer-role";

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

type DetailTab = "overview" | "facility" | "transport" | "price" | "transaction" | "cocreation";

const detailTabs: Array<{ key: DetailTab; label: string }> = [
  { key: "overview", label: "概况" },
  { key: "facility", label: "设施" },
  { key: "transport", label: "交通" },
  { key: "price", label: "价格" },
  { key: "transaction", label: "成交" },
  { key: "cocreation", label: "共建" },
];

const overviewFields = [
  { label: "小区名称", value: "中关村小区" },
  { label: "所在城市", value: "北京市 · 海淀区 · 中关村北区" },
  { label: "开发商", value: "北京城建集团" },
  { label: "物业公司", value: "金地物业" },
  { label: "建成年份", value: "2005 年" },
  { label: "总楼栋数", value: "8 栋" },
  { label: "总户数", value: "456 户" },
  { label: "容积率", value: "2.8" },
  { label: "绿化率", value: "31%" },
  { label: "车位比", value: "0.85:1" },
];

const overviewTags = ["B 中端圈层", "品质刚需", "地铁近", "部分学区"];

const facilityData = {
  internal: [
    { name: "健身房", available: true, note: "免费" },
    { name: "游泳池", available: false },
    { name: "幼儿园", available: true, note: "园内" },
    { name: "人防车库", available: true },
  ],
  nearby: [
    { category: "学校", items: ["XX 小学（500m）", "YY 中学（1.2km）"] },
    { category: "医院", items: ["ZZ 医院（800m）"] },
    { category: "购物", items: ["沃尔玛（400m）", "苏宁（200m）"] },
  ],
};

const transportData = {
  metro: [
    { line: "地铁 4 号线", station: "中关村站", walkMin: 8, distanceM: 640 },
    { line: "地铁 13 号线", station: "五道口站", walkMin: 15, distanceM: 1200 },
  ],
  bus: ["22路", "331路", "365路（门口站）"],
};

const communityTransactions = [
  { date: "2025-12", floor: 4, type: "2室1厅", area: 89, price: 302, condition: "南北通透" },
  { date: "2025-11", floor: 8, type: "3室2厅", area: 118, price: 385, condition: "精装改善" },
  { date: "2025-10", floor: 12, type: "2室1厅", area: 91, price: 299, condition: "普通装修" },
];

export default function CommunityDetailPage({ params }: { params: { communityId: string } }) {
  const listing = mockListings[0];
  const [viewerRole, setViewerRole] = useState<ViewerRole>("guest");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

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

      <ViewerRoleSwitcher value={viewerRole} onChange={setViewerRole} className="mt-4" />

      <Card className="mt-4" header={<SectionTitle icon={ShieldCheck} title="SUUMO 式披露模板" subtitle="概况、设施、交通、价格、成交、共建六栏" />}>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-1">
          {detailTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-lg px-3 py-2 text-caption font-semibold ${activeTab === tab.key ? "bg-primary-700 text-white shadow-sm" : "text-neutral-700"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <TabPanel activeTab={activeTab} viewerRole={viewerRole} communityId={params.communityId} />
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href={`/explore/dict/${params.communityId}/edit`}>
          <Button variant="secondary" className="w-full">
            <Pencil className="mr-1 size-4" />
            维护字典
          </Button>
        </Link>
        <Link href={`/price/${params.communityId}`}>
          <Button className="w-full">查看价格图谱</Button>
        </Link>
      </div>

      <Link
        href={`/explore/dict/${params.communityId}/edit?intent=correction`}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3 text-body-s font-semibold text-neutral-700 shadow-card transition hover:border-primary-300 hover:text-primary-700"
      >
        <AlertCircle className="size-4 shrink-0 text-semantic-warning" />
        发现信息有误？提交纠错
      </Link>
      <p className="mt-2 text-center text-caption text-neutral-500">业主/买家可提交字段纠错，平台审核后计入贡献积分（M1-12 Mock）</p>
      <AgentAssistFab
        pageContext={`楼盘字典详情 · ${params.communityId}`}
        suggestedPrompts={["解释这个小区哪些字段被脱敏", "总结首建者和维护者权益", "帮我生成纠错提交说明"]}
      />
    </main>
  );
}

function TabPanel({ activeTab, viewerRole, communityId }: { activeTab: DetailTab; viewerRole: ViewerRole; communityId: string }) {
  if (activeTab === "overview") return <OverviewPanel />;
  if (activeTab === "facility") return <FacilityPanel />;
  if (activeTab === "transport") return <TransportPanel />;
  if (activeTab === "price") return <PricePanel viewerRole={viewerRole} />;
  if (activeTab === "transaction") return <TransactionPanel viewerRole={viewerRole} />;
  return <CocreationPanel communityId={communityId} />;
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {overviewFields.map((field) => (
          <div key={field.label} className="rounded-xl bg-neutral-100 p-3">
            <p className="text-caption text-neutral-500">{field.label}</p>
            <p className="mt-1 text-body-s font-semibold text-neutral-900">{field.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {overviewTags.map((tag) => (
          <span key={tag} className="rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">{tag}</span>
        ))}
      </div>
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
    </div>
  );
}

function FacilityPanel() {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-body-s font-semibold text-neutral-900">小区内部设施</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {facilityData.internal.map((facility) => (
            <div key={facility.name} className="flex items-center gap-2 rounded-xl bg-neutral-100 p-3">
              {facility.available ? <CheckCircle2 className="size-4 text-semantic-success" /> : <XCircle className="size-4 text-neutral-400" />}
              <div>
                <p className="text-body-s font-semibold">{facility.name}</p>
                <p className="text-caption text-neutral-500">{facility.available ? facility.note ?? "可用" : "暂无"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-body-s font-semibold text-neutral-900">周边配套</h3>
        {facilityData.nearby.map((group) => (
          <div key={group.category} className="rounded-xl bg-neutral-100 p-3">
            <p className="text-caption font-semibold text-primary-700">{group.category}</p>
            <p className="mt-1 text-body-s text-neutral-700">{group.items.join(" · ")}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function TransportPanel() {
  return (
    <div className="space-y-3">
      {transportData.metro.map((item) => (
        <div key={item.station} className="flex items-start gap-3 rounded-xl bg-neutral-100 p-3">
          <Train className="mt-0.5 size-5 text-primary-700" />
          <div>
            <p className="text-body-s font-semibold">{item.line} · {item.station}</p>
            <p className="mt-1 text-caption text-neutral-500">步行约 {item.walkMin} 分钟 · {item.distanceM}m</p>
          </div>
        </div>
      ))}
      <div className="flex items-start gap-3 rounded-xl bg-neutral-100 p-3">
        <Bus className="mt-0.5 size-5 text-primary-700" />
        <div>
          <p className="text-body-s font-semibold">公交线路</p>
          <p className="mt-1 text-caption text-neutral-500">{transportData.bus.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}

function PricePanel({ viewerRole }: { viewerRole: ViewerRole }) {
  const canViewListingPrice = viewerRole !== "guest";
  const canViewExact = viewerRole === "kyc" || viewerRole === "agent" || viewerRole === "staff";
  const canViewHistory = viewerRole === "agent" || viewerRole === "staff";

  return (
    <div className="space-y-3">
      <DisclosureRow label="参考单价区间" value="¥32,000 - ¥38,000 /㎡" note="游客可见模糊区间" />
      <DisclosureRow label="挂牌总价区间" value={canViewListingPrice ? "¥300 万 - ¥450 万" : "手机验证后可见"} note="手机验证及以上可见" locked={!canViewListingPrice} cta="验证手机查看 →" href="/auth/login" />
      <DisclosureRow label="精确楼层/房号" value={canViewExact ? "6-12 层 · 房号实名后展示" : maskValue(viewerRole, "exactFloor", "精确楼层/房号")} note="实名用户可见" locked={!canViewExact} />
      <DisclosureRow label="历史成交明细" value={canViewHistory ? "近 12 月 86 套，经纪人可查看明细" : maskValue(viewerRole, "dealHistory", "历史成交明细")} note="经纪人认证可见" locked={!canViewHistory} />
      {canViewHistory ? null : (
        <Link href="/profile/agent-cert" className="block rounded-xl border border-dashed border-primary-300 bg-primary-100 px-3 py-2 text-center text-caption font-semibold text-primary-700">
          解锁成交明细与经纪人权益 →
        </Link>
      )}
    </div>
  );
}

function TransactionPanel({ viewerRole }: { viewerRole: ViewerRole }) {
  const canView = viewerRole === "agent" || viewerRole === "staff";

  if (!canView) {
    return (
      <div className="rounded-xl bg-neutral-100 p-4 text-center">
        <p className="text-body-s font-semibold text-neutral-900">🔒 成交明细仅认证经纪人可见</p>
        <p className="mt-2 text-caption text-neutral-500">完成经纪人认证后，可查看楼层、户型、成交价和装修条件。</p>
        <Link href="/profile/agent-cert" className="mt-3 inline-flex rounded-xl bg-primary-700 px-4 py-2 text-caption font-semibold text-white">
          了解经纪人入驻 →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-200 rounded-xl bg-neutral-100">
      {communityTransactions.map((transaction) => (
        <div key={`${transaction.date}-${transaction.floor}`} className="flex items-center justify-between gap-3 p-3 text-body-s">
          <div>
            <p className="font-semibold">{transaction.date} · {transaction.type} · {transaction.area}㎡</p>
            <p className="mt-1 text-caption text-neutral-500">{transaction.floor} 层 · {transaction.condition}</p>
          </div>
          <p className="price-nums font-semibold text-primary-700">¥{transaction.price}万</p>
        </div>
      ))}
    </div>
  );
}

function CocreationPanel({ communityId }: { communityId: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-secondary-200 p-3">
        <p className="text-body-s font-semibold text-secondary-700">首建者 · {founder.name}</p>
        <p className="mt-1 text-caption text-neutral-600">{founder.date} 首建 · {founder.rights}</p>
      </div>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-body-s font-semibold text-neutral-900">Top3 维护者排行</h3>
          <span className="text-caption text-neutral-500">近 90 天</span>
        </div>
        <div className="space-y-2">
          {maintainers.map((maintainer, index) => (
            <div key={maintainer.name} className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
              <div className="flex items-center gap-3">
                <span className={`flex size-8 items-center justify-center rounded-full text-caption font-bold ${index === 0 ? "bg-secondary-200 text-secondary-700" : "bg-white text-neutral-700"}`}>#{index + 1}</span>
                <div>
                  <p className="text-body-s font-semibold">{maintainer.name}</p>
                  <p className="mt-1 text-caption text-neutral-500">{maintainer.benefit}</p>
                </div>
              </div>
              <p className="price-nums text-body-s font-semibold text-primary-700">{maintainer.points} 分</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl bg-neutral-100 p-3">
        <div className="flex items-center justify-between text-caption">
          <span className="font-semibold text-neutral-700">维护超过 50 分解锁 P1 客源</span>
          <span className="price-nums text-primary-700">42/50</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[84%] rounded-full bg-primary-500" />
        </div>
        <Link href={`/explore/dict/${communityId}/edit`} className="mt-3 inline-flex text-caption font-semibold text-primary-700">继续维护楼盘 →</Link>
      </section>
      <section>
        <h3 className="text-body-s font-semibold text-neutral-900">贡献时间线</h3>
        <div className="mt-2 divide-y divide-neutral-200">
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
      </section>
    </div>
  );
}

function DisclosureRow({ label, value, note, locked = false, cta, href = "/profile/agent-cert" }: { label: string; value: string; note: string; locked?: boolean; cta?: string; href?: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption text-neutral-500">{label}</p>
          <p className="mt-1 text-body-s font-semibold text-neutral-900">{locked ? `🔒 ${value}` : value}</p>
        </div>
        {locked ? <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-primary-700">升级查看</span> : null}
      </div>
      <p className="mt-1 text-caption text-neutral-500">{note}</p>
      {locked && cta ? (
        <Link href={href} className="mt-2 inline-flex text-caption font-semibold text-primary-700">
          {cta}
        </Link>
      ) : null}
    </div>
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
