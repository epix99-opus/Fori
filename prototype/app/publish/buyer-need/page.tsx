"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  CircleDollarSign,
  Home,
  Loader2,
  MapPin,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockBuyerDemands, mockListings, mockUsers, type Listing } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "loading" | "ready" | "empty" | "error" | "submitting";
type BuyerNeedForm = {
  city: string;
  districts: string[];
  layouts: string[];
  budgetMinWan: string;
  budgetMaxWan: string;
  areaMinSqm: string;
  areaMaxSqm: string;
  orientations: string[];
  floors: string[];
  timeline: string;
  tags: string[];
  qualificationChecked: string;
  downPayment: string;
};

type RecommendedListing = Listing & {
  matchScore: number;
  reason: string;
  tone: string;
};

const districtOptions = ["中关村", "知春路", "万柳", "学院路", "上地"];
const layoutOptions = ["1室", "2室", "3室", "4室+"];
const orientationOptions = ["南", "南北", "东南", "西南"];
const floorOptions = ["低楼层", "中楼层", "高楼层", "非顶层"];
const specialTags = ["学区", "近地铁", "满 5 年", "不要中间层", "精装", "车位"];
const timelineOptions = ["1 个月内", "3 个月内", "半年内", "一年内"];

const initialForm: BuyerNeedForm = {
  city: "北京",
  districts: ["中关村", "知春路"],
  layouts: ["3室"],
  budgetMinWan: "240",
  budgetMaxWan: "320",
  areaMinSqm: "80",
  areaMaxSqm: "110",
  orientations: ["南北"],
  floors: ["中楼层"],
  timeline: "3 个月内",
  tags: ["近地铁", "满 5 年"],
  qualificationChecked: "是",
  downPayment: "40%",
};

function buildRecommendations(form: BuyerNeedForm): RecommendedListing[] {
  const minBudget = Number(form.budgetMinWan) || 0;
  const maxBudget = Number(form.budgetMaxWan) || 9999;
  return Array.from({ length: 5 }, (_, index) => {
    const base = mockListings[index % mockListings.length];
    const priceWan = base.priceWan + index * 14;
    return {
      ...base,
      id: index === 0 ? base.id : `${base.id}-buyer-${index}`,
      title: index % 2 === 0 ? `${base.communityName} 南北通透三居` : `${base.communityName} 近地铁精装房`,
      priceWan,
      areaSqm: base.areaSqm + (index % 3) * 7,
      tags: index % 2 === 0 ? ["已核验", "近地铁", "满5年"] : ["已核验", "学区", "精装"],
      matchScore: Math.max(72, 96 - index * 5 - (priceWan > maxBudget || priceWan < minBudget ? 8 : 0)),
      reason: index % 2 === 0 ? "预算、户型、通勤要求均匹配" : "价格接近上限，但满足特殊标签",
      tone: ["from-primary-100 to-secondary-200", "from-blue-100 to-emerald-100", "from-amber-100 to-primary-100"][index % 3] ?? "from-neutral-200 to-blue-100",
    };
  }).filter((listing) => listing.priceWan >= minBudget * 0.75 && listing.priceWan <= maxBudget * 1.25);
}

export default function BuyerNeedPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [form, setForm] = useState<BuyerNeedForm>(initialForm);
  const [isVerified, setIsVerified] = useState(mockUsers[0]?.verificationStatus === "verified");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setState(mockBuyerDemands.length > 0 ? "ready" : "empty"), 550);
    return () => window.clearTimeout(timer);
  }, []);

  const recommendations = useMemo(() => buildRecommendations(form), [form]);
  const budgetWarning = useMemo(() => {
    const min = Number(form.budgetMinWan);
    const max = Number(form.budgetMaxWan);
    if (!min || !max) return "请输入完整预算范围";
    if (max < min) return "预算上限不能低于下限";
    if (max < 180) return "预算低于目标区域最低均价 50%，匹配结果可能较少";
    return null;
  }, [form.budgetMaxWan, form.budgetMinWan]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function patchForm<Key extends keyof BuyerNeedForm>(key: Key, value: BuyerNeedForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray<Key extends "districts" | "layouts" | "orientations" | "floors" | "tags">(key: Key, value: string, limit?: number) {
    setForm((current) => {
      const values = current[key];
      const exists = values.includes(value);
      if (!exists && limit && values.length >= limit) {
        showToast(`最多选择 ${limit} 项`);
        return current;
      }
      return {
        ...current,
        [key]: exists ? values.filter((item) => item !== value) : [...values, value],
      };
    });
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  function submitNeed() {
    if (!isVerified) {
      showToast("请先完成实名认证后进入精准匹配池");
      return;
    }
    if (budgetWarning?.includes("不能") || !form.districts.length || !form.layouts.length) {
      showToast("请补齐必填项并修正预算");
      return;
    }
    setState("submitting");
    window.setTimeout(() => {
      router.push("/workspace/agent/matches?source=buyer-need");
    }, 700);
  }

  return (
    <main className="mobile-shell pb-28">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">买家需求</p>
            <h1 className="truncate text-h3">发布购房需求</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")}>
            <BellRing className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? (
          <ErrorState title="表单选项加载失败" code="BUYER_NEED_MOCK_ERROR" description="可重试恢复区域、标签和匹配预览数据。" onRetry={retry} />
        ) : null}

        {state === "empty" ? (
          <EmptyState title="暂无历史需求" description="创建第一条需求后，将进入 Fori 精准匹配池。" actionLabel="创建需求" onAction={() => setState("ready")} />
        ) : null}

        {(state === "ready" || state === "submitting") ? (
          <>
            {!isVerified ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="size-5 shrink-0 text-semantic-warning" />
                  <div>
                    <h2 className="text-h3">未实名不可入池</h2>
                    <p className="mt-1 text-body-s text-neutral-700">可先填写需求并查看匹配预览，提交前需完成实名认证。</p>
                    <Button size="sm" className="mt-3" onClick={() => setIsVerified(true)}>模拟完成实名认证</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-body-s text-neutral-700">
                <BadgeCheck className="size-5 text-semantic-success" />
                已实名买家，可提交进入精准匹配池
              </div>
            )}

            <Card header={<SectionTitle icon={MapPin} title="区域意向" subtitle="最多选择 3 个目标片区" />}>
              <div className="space-y-4">
                <Input label="城市" value={form.city} onChange={(event) => patchForm("city", event.target.value)} />
                <TagGroup values={districtOptions} selected={form.districts} onToggle={(value) => toggleArray("districts", value, 3)} />
                <div className="rounded-xl bg-primary-100 p-3 text-body-s text-primary-700">地图辅助选择：已圈选 {form.districts.join("、") || "未选择"}，原型用片区标签模拟。</div>
              </div>
            </Card>

            <Card header={<SectionTitle icon={Home} title="户型与面积" subtitle="用于过滤基础匹配池" />}>
              <div className="space-y-4">
                <TagGroup values={layoutOptions} selected={form.layouts} onToggle={(value) => toggleArray("layouts", value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="面积下限（㎡）" inputMode="numeric" value={form.areaMinSqm} onChange={(event) => patchForm("areaMinSqm", event.target.value)} />
                  <Input label="面积上限（㎡）" inputMode="numeric" value={form.areaMaxSqm} onChange={(event) => patchForm("areaMaxSqm", event.target.value)} />
                </div>
              </div>
            </Card>

            <Card header={<SectionTitle icon={CircleDollarSign} title="预算范围" subtitle="预算异常会影响匹配质量" />}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="下限（万元）" inputMode="numeric" value={form.budgetMinWan} onChange={(event) => patchForm("budgetMinWan", event.target.value)} />
                  <Input label="上限（万元）" inputMode="numeric" value={form.budgetMaxWan} onChange={(event) => patchForm("budgetMaxWan", event.target.value)} />
                </div>
                {budgetWarning ? <p className="rounded-xl bg-amber-50 p-3 text-body-s text-semantic-warning">{budgetWarning}</p> : <p className="rounded-xl bg-green-50 p-3 text-body-s text-semantic-success">预算与目标区域均价匹配，预计可获得较高质量推荐。</p>}
              </div>
            </Card>

            <Card header={<SectionTitle icon={SlidersHorizontal} title="偏好与资格" subtitle="特殊需求标签越准确，推荐越稳定" />}>
              <div className="space-y-4">
                <RadioGroup label="购房时间线" values={timelineOptions} value={form.timeline} onChange={(value) => patchForm("timeline", value)} />
                <TagGroup label="朝向" values={orientationOptions} selected={form.orientations} onToggle={(value) => toggleArray("orientations", value)} />
                <TagGroup label="楼层" values={floorOptions} selected={form.floors} onToggle={(value) => toggleArray("floors", value)} />
                <TagGroup label="特殊要求" values={specialTags} selected={form.tags} onToggle={(value) => toggleArray("tags", value)} />
                <RadioGroup label="是否已核查限购资格" values={["是", "否", "不清楚"]} value={form.qualificationChecked} onChange={(value) => patchForm("qualificationChecked", value)} />
                <RadioGroup label="首付比例预计" values={["30%", "40%", "50%", "全款"]} value={form.downPayment} onChange={(value) => patchForm("downPayment", value)} />
              </div>
            </Card>

            <Card header={<SectionTitle icon={Sparkles} title="智能匹配预览" subtitle="基于 mock 房源池实时计算" />}>
              <div className="space-y-3">
                <div className="rounded-xl bg-primary-900 p-4 text-white">
                  <p className="text-caption text-primary-300">预计可匹配</p>
                  <p className="mt-1 text-price-l price-nums">{recommendations.length * 7 + form.districts.length} 套</p>
                  <p className="mt-1 text-body-s text-primary-100">推荐经纪人将优先看到高匹配需求摘要。</p>
                </div>
                {recommendations.length === 0 ? (
                  <EmptyState title="暂无推荐房源" description="可放宽预算或减少特殊标签后重试。" />
                ) : (
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((listing) => (
                      <RecommendedCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : null}
      </section>

      {(state === "ready" || state === "submitting") ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-3">
          <Button className="w-full" onClick={submitNeed} loading={state === "submitting"} disabled={state === "submitting"}>
            {state === "submitting" ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Send className="mr-1 size-4" />}
            提交并查看匹配推荐
          </Button>
        </div>
      ) : null}

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-h3">{title}</h2>
        <p className="text-body-s text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function TagGroup({ label, values, selected, onToggle }: { label?: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="space-y-2">
      {label ? <p className="text-body-s font-semibold">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            className={cn("rounded-full px-3 py-2 text-caption font-semibold", selected.includes(value) ? "bg-primary-500 text-white" : "bg-neutral-100 text-neutral-700")}
            onClick={() => onToggle(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-body-s font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            className={cn("rounded-xl border px-3 py-2 text-body-s", value === item ? "border-primary-500 bg-primary-100 text-primary-700" : "border-neutral-200 bg-white")}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecommendedCard({ listing }: { listing: RecommendedListing }) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-200 p-3">
      <div className={cn("h-20 w-24 shrink-0 rounded-xl bg-gradient-to-br", listing.tone)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-body-s font-semibold">{listing.title}</h3>
          <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-semantic-success">{listing.matchScore}%</span>
        </div>
        <p className="mt-1 text-caption text-neutral-500">{listing.areaSqm}㎡ · {listing.rooms}室 · {listing.district}</p>
        <p className="mt-1 text-caption text-primary-700">{listing.reason}</p>
      </div>
    </div>
  );
}
