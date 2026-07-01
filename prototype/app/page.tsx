import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { Stepper } from "@/components/Stepper";
import { TabBar } from "@/components/TabBar";
import { Toast } from "@/components/Toast";
import { mockListings } from "@/lib/mock";

export default function Home() {
  const listing = mockListings[0];

  return (
    <main className="mobile-shell pb-28">
      <section className="space-y-5 px-4 py-6">
        <div className="rounded-2xl bg-primary-900 px-5 py-6 text-white shadow-card">
          <p className="text-body-s text-primary-300">Fori Prototype</p>
          <h1 className="mt-2 text-h1">真实房源，可信交易</h1>
          <p className="mt-2 text-body-m text-primary-100">
            Next.js 14 + Tailwind + shadcn/ui 移动端原型脚手架已就绪。
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button>立即看房</Button>
            <Button variant="secondary">发布房源</Button>
          </div>
        </div>

        <Input label="搜索" placeholder="搜索小区名、地址、地铁站" hint="375px 移动端基准布局" />

        <Card
          header={
            <div>
              <p className="text-body-s text-neutral-500">推荐房源</p>
              <h2 className="text-h2">{listing.title}</h2>
            </div>
          }
          footer={<Button className="w-full">查看详情</Button>}
        >
          <div className="aspect-[343/200] rounded-xl bg-gradient-to-br from-primary-100 to-secondary-200" />
          <p className="price-nums mt-4 text-price-l text-secondary-500">
            {listing.priceWan}
            <span className="ml-1 text-[70%]">万</span>
          </p>
          <p className="text-body-m text-neutral-700">
            精装 {listing.rooms}室{listing.halls}厅 | {listing.areaSqm}㎡ | {listing.floor}/
            {listing.totalFloors}层
          </p>
          <p className="text-body-s text-neutral-500">
            {listing.district} {listing.communityName}
          </p>
        </Card>

        <Stepper
          steps={[
            { label: "选择楼盘", status: "complete" },
            { label: "填写房屋参数", status: "current" },
            { label: "上传材料", status: "pending" },
          ]}
        />

        <Toast type="success" title="已更新" description="骨架屏、Toast、状态组件可复用。" />
        <Skeleton variant="list" />
        <EmptyState title="暂无更多房源" description="调整筛选条件后可查看新的推荐。" />
      </section>
      <TabBar active="home" />
    </main>
  );
}
