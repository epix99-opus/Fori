import Link from "next/link";
import { BadgeCheck, Camera, Megaphone, RefreshCw } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { mockListings } from "@/lib/mock";

const listingRows = [
  { status: "在售", note: "28 天未刷新，建议更新价格和图片", action: "刷新" },
  { status: "核验中", note: "产权材料待公证机构回传", action: "查看材料" },
  { status: "可恢复", note: "相似房源成交后可重新激活", action: "恢复上架" },
];

export default function AgentListingsPage() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-5">
      <header className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-caption text-neutral-500">房源管理</p>
        <h1 className="text-h2">真实房源留存与推广入口</h1>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Summary label="在售" value="12" />
          <Summary label="核验中" value="3" />
          <Summary label="可恢复" value="8" />
        </div>
      </header>

      <section className="mt-4 space-y-3">
        {listingRows.map((row) => (
          <Card key={row.status}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-h3">{listing.title}</h2>
                <p className="mt-1 text-body-s text-neutral-500">{listing.communityName} · {listing.areaSqm}㎡ · {listing.priceWan} 万</p>
              </div>
              <span className="rounded-full bg-primary-100 px-2 py-1 text-caption font-semibold text-primary-700">{row.status}</span>
            </div>
            <p className="mt-3 rounded-xl bg-orange-50 p-3 text-body-s text-orange-700">{row.note}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button size="sm" variant="secondary">
                <RefreshCw className="mr-1 size-4" />
                {row.action}
              </Button>
              <Link href="/listing/listing-001">
                <Button size="sm" variant="secondary" className="w-full">
                  <BadgeCheck className="mr-1 size-4" />
                  详情
                </Button>
              </Link>
              <Link href="/workspace/media/generate">
                <Button size="sm" className="w-full">
                  <Megaphone className="mr-1 size-4" />
                  推广
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <Link href="/publish/listing" className="mt-4 block">
        <Button className="w-full">
          <Camera className="mr-1 size-4" />
          发布新房源
        </Button>
      </Link>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <p className="text-h3">{value}</p>
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
    </div>
  );
}
