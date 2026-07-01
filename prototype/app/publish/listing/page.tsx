"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  FileCheck2,
  GripVertical,
  ImagePlus,
  Megaphone,
  ShieldAlert,
  Star,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Stepper, type StepperStep } from "@/components/Stepper";
import { Toast } from "@/components/Toast";
import { mockListings, mockUsers } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PublishStep = 0 | 1 | 2 | 3 | 4;
type PublishState = "ready" | "empty" | "error";
type DraftStatus = "idle" | "saving" | "saved";

type ListingDraft = {
  communityName: string;
  building: string;
  room: string;
  areaSqm: string;
  innerAreaSqm: string;
  floor: string;
  totalFloors: string;
  rooms: number;
  halls: number;
  baths: number;
  orientation: string;
  decoration: string;
  propertyYears: string;
  listingPriceWan: string;
  taxMode: string;
  visitTime: string[];
  contactPhone: string;
  promotionChannels: string[];
  ownerName: string;
  propertyAddress: string;
  coOwnerStatement: string;
  agreed: boolean;
};

type UploadImage = {
  id: string;
  label: string;
  progress: number;
  isCover: boolean;
  tone: string;
};

const stepLabels = ["房源信息", "上传图片", "价格评估", "推广设置", "确认发布"];
const communities = [
  { name: "中关村小区", zone: "中关村北区", builtYear: 2008 },
  { name: "知春里", zone: "知春路", builtYear: 1999 },
  { name: "学院南路 32 号院", zone: "学院路", builtYear: 2003 },
];
const promotionChannels = ["微信朋友圈", "小红书笔记", "抖音短视频", "经纪人私域", "Fori 推荐流"];
const visitOptions = ["工作日晚 7 点后", "周六上午", "周日下午", "提前一天预约"];

const initialDraft: ListingDraft = {
  communityName: "中关村小区",
  building: "3 号楼",
  room: "802",
  areaSqm: "92",
  innerAreaSqm: "78",
  floor: "8",
  totalFloors: "18",
  rooms: 3,
  halls: 2,
  baths: 1,
  orientation: "南北通透",
  decoration: "精装",
  propertyYears: "70年",
  listingPriceWan: "280",
  taxMode: "各自承担",
  visitTime: ["周六上午"],
  contactPhone: mockUsers[0]?.phoneMasked ?? "138****8201",
  promotionChannels: ["Fori 推荐流", "经纪人私域"],
  ownerName: "林女士",
  propertyAddress: "中关村南路 18 号 3-802",
  coOwnerStatement: "无共有产权",
  agreed: false,
};

const initialImages: UploadImage[] = [
  { id: "img-1", label: "客厅", progress: 100, isCover: true, tone: "from-primary-100 to-secondary-200" },
  { id: "img-2", label: "主卧", progress: 100, isCover: false, tone: "from-blue-100 to-emerald-100" },
  { id: "img-3", label: "厨房", progress: 82, isCover: false, tone: "from-amber-100 to-primary-100" },
  { id: "img-4", label: "阳台", progress: 64, isCover: false, tone: "from-neutral-200 to-blue-100" },
];

function getAssessment(areaSqm: string, listingPriceWan: string) {
  const area = Number(areaSqm) || mockListings[0].areaSqm;
  const price = Number(listingPriceWan) || mockListings[0].priceWan;
  const unitPrice = Math.round((price * 10000) / area);
  const referenceMin = 32000;
  const referenceMax = 38000;
  const status = unitPrice < referenceMin ? "偏低" : unitPrice > referenceMax ? "偏高" : "合理";
  return { unitPrice, referenceMin, referenceMax, status };
}

export default function PublishListingPage() {
  const [step, setStep] = useState<PublishStep>(0);
  const [state, setState] = useState<PublishState>("ready");
  const [draft, setDraft] = useState<ListingDraft>(initialDraft);
  const [images, setImages] = useState<UploadImage[]>(initialImages);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("saved");
  const [isVerified, setIsVerified] = useState(mockUsers[0]?.verificationStatus === "verified");
  const [toast, setToast] = useState<string | null>(null);

  const assessment = useMemo(() => getAssessment(draft.areaSqm, draft.listingPriceWan), [draft.areaSqm, draft.listingPriceWan]);
  const canPublish = isVerified && draft.agreed && images.length >= 3;

  const stepperSteps: StepperStep[] = stepLabels.map((label, index) => ({
    label,
    status: index < step ? "complete" : index === step ? "current" : "pending",
  }));

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function saveDraft() {
    setDraftStatus("saving");
    window.setTimeout(() => {
      setDraftStatus("saved");
      showToast(`第 ${step + 1} 步草稿已保存`);
    }, 450);
  }

  function patchDraft<Key extends keyof ListingDraft>(key: Key, value: ListingDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDraftStatus("idle");
  }

  function nextStep() {
    saveDraft();
    setStep((current) => (Math.min(current + 1, 4) as PublishStep));
  }

  function previousStep() {
    setStep((current) => (Math.max(current - 1, 0) as PublishStep));
  }

  function toggleArray<Key extends "visitTime" | "promotionChannels">(key: Key, value: string) {
    patchDraft(
      key,
      (draft[key].includes(value) ? draft[key].filter((item) => item !== value) : [...draft[key], value]) as ListingDraft[Key],
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(targetIndex, 0, item);
      return next.map((image, nextIndex) => ({ ...image, isCover: nextIndex === 0 }));
    });
    setDraftStatus("idle");
  }

  function addImage() {
    setImages((current) => [
      ...current,
      {
        id: `img-${current.length + 1}`,
        label: `新增图片 ${current.length + 1}`,
        progress: 100,
        isCover: false,
        tone: "from-primary-100 to-neutral-200",
      },
    ]);
    setDraftStatus("idle");
  }

  function submitListing() {
    if (!isVerified) {
      showToast("请先完成实名认证");
      return;
    }
    if (!canPublish) {
      showToast("请补齐图片并勾选发布协议");
      return;
    }
    showToast("已提交核验队列，预计 24 小时内完成");
  }

  return (
    <main className="mobile-shell pb-28">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">房东发布</p>
            <h1 className="truncate text-h3">发布真实核验房源</h1>
          </div>
          <button type="button" className="rounded-xl bg-neutral-100 px-3 py-2 text-caption font-semibold" onClick={saveDraft}>
            保存
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {!isVerified ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <ShieldAlert className="size-5 shrink-0 text-semantic-warning" />
              <div>
                <h2 className="text-h3">未认证不可发布</h2>
                <p className="mt-1 text-body-s text-neutral-700">可先填写并保存草稿，完成实名认证后才能提交核验队列。</p>
                <Button className="mt-3" size="sm" onClick={() => setIsVerified(true)}>模拟完成认证</Button>
              </div>
            </div>
          </div>
        ) : null}

        <Card>
          <div className="flex items-start justify-between gap-4">
            <Stepper steps={stepperSteps} />
            <div className="rounded-xl bg-neutral-100 px-3 py-2 text-right text-caption text-neutral-500">
              草稿状态
              <p className="font-semibold text-neutral-900">{draftStatus === "saving" ? "保存中" : draftStatus === "saved" ? "已保存" : "有改动"}</p>
            </div>
          </div>
        </Card>

        {state === "empty" ? (
          <EmptyState title="暂无草稿" description="可从选择楼盘开始创建新房源。" actionLabel="新建草稿" onAction={() => setState("ready")} />
        ) : null}

        {state === "error" ? (
          <ErrorState title="草稿恢复失败" code="LISTING_DRAFT_MOCK_ERROR" description="可重新加载本地 mock 草稿。" onRetry={() => setState("ready")} />
        ) : null}

        {state === "ready" ? (
          <Card header={<StepHeader step={step} />}>
            {step === 0 ? <CommunityStep draft={draft} patchDraft={patchDraft} /> : null}
            {step === 1 ? <ImageStep images={images} onAdd={addImage} onMove={moveImage} /> : null}
            {step === 2 ? <PriceStep draft={draft} patchDraft={patchDraft} assessment={assessment} toggleArray={toggleArray} /> : null}
            {step === 3 ? <PromotionStep draft={draft} toggleArray={toggleArray} /> : null}
            {step === 4 ? <ConfirmStep draft={draft} images={images} assessment={assessment} isVerified={isVerified} patchDraft={patchDraft} /> : null}
          </Card>
        ) : null}
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-3">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={previousStep} disabled={step === 0}>
            上一步
          </Button>
          {step < 4 ? (
            <Button className="flex-1" onClick={nextStep}>
              下一步
              <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={submitListing} disabled={!canPublish}>
              立即发布
            </Button>
          )}
        </div>
      </div>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function StepHeader({ step }: { step: PublishStep }) {
  const descriptions = [
    "关联楼盘字典并确认楼栋室号",
    "至少 3 张图片，首图自动作为封面",
    "调用 mock 评估结果联动挂牌价",
    "选择自媒体与平台分发渠道",
    "汇总信息并提交核验队列",
  ];

  return (
    <div>
      <p className="text-caption text-neutral-500">Step {step + 1} / 5</p>
      <h2 className="text-h3">{stepLabels[step]}</h2>
      <p className="mt-1 text-body-s text-neutral-500">{descriptions[step]}</p>
    </div>
  );
}

function CommunityStep({ draft, patchDraft }: { draft: ListingDraft; patchDraft: <Key extends keyof ListingDraft>(key: Key, value: ListingDraft[Key]) => void }) {
  const selected = communities.find((community) => community.name === draft.communityName) ?? communities[0];

  return (
    <div className="space-y-4">
      <Input label="搜索楼盘" value={draft.communityName} onChange={(event) => patchDraft("communityName", event.target.value)} placeholder="输入小区名" />
      <div className="space-y-2">
        {communities.map((community) => (
          <button
            key={community.name}
            type="button"
            className={cn("w-full rounded-xl border p-3 text-left", draft.communityName === community.name ? "border-primary-500 bg-primary-100" : "border-neutral-200")}
            onClick={() => patchDraft("communityName", community.name)}
          >
            <p className="font-semibold">{community.name}</p>
            <p className="text-body-s text-neutral-500">{community.zone} · {community.builtYear} 年建成</p>
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-neutral-100 p-3 text-body-s">
        已选：{selected.name} · {selected.zone} · 楼盘字典已核验
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="楼栋号" value={draft.building} onChange={(event) => patchDraft("building", event.target.value)} />
        <Input label="室号" value={draft.room} onChange={(event) => patchDraft("room", event.target.value)} />
      </div>
      <Button variant="ghost" className="w-full">楼盘字典无此小区，内嵌新增</Button>
    </div>
  );
}

function ImageStep({ images, onAdd, onMove }: { images: UploadImage[]; onAdd: () => void; onMove: (index: number, direction: -1 | 1) => void }) {
  return (
    <div className="space-y-4">
      <button type="button" className="flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-100 text-primary-700" onClick={onAdd}>
        <ImagePlus className="size-7" />
        <span className="mt-2 text-body-s font-semibold">点击拍照或从相册选择</span>
      </button>
      <div className="grid grid-cols-2 gap-3">
        {images.map((image, index) => (
          <div key={image.id} className="overflow-hidden rounded-xl bg-white shadow-card">
            <div className={cn("relative h-28 bg-gradient-to-br", image.tone)}>
              {image.isCover ? (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-secondary-600">
                  <Star className="size-3 fill-secondary-500" />封面
                </span>
              ) : null}
              <Camera className="absolute bottom-3 right-3 size-6 text-white/80" />
            </div>
            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <p className="text-body-s font-semibold">{image.label}</p>
                <GripVertical className="size-4 text-neutral-500" />
              </div>
              <div className="h-1.5 rounded-full bg-neutral-200">
                <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${image.progress}%` }} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-8 flex-1" onClick={() => onMove(index, -1)} disabled={index === 0}>上移</Button>
                <Button size="sm" variant="ghost" className="h-8 flex-1" onClick={() => onMove(index, 1)} disabled={index === images.length - 1}>下移</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-body-s text-neutral-500">已上传 {images.length} 张，满足至少 3 张要求；原型用上移/下移模拟拖动排序。</p>
    </div>
  );
}

function PriceStep({
  draft,
  patchDraft,
  assessment,
  toggleArray,
}: {
  draft: ListingDraft;
  patchDraft: <Key extends keyof ListingDraft>(key: Key, value: ListingDraft[Key]) => void;
  assessment: ReturnType<typeof getAssessment>;
  toggleArray: (key: "visitTime" | "promotionChannels", value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="建筑面积（㎡）" inputMode="decimal" value={draft.areaSqm} onChange={(event) => patchDraft("areaSqm", event.target.value)} />
        <Input label="套内面积（㎡）" inputMode="decimal" value={draft.innerAreaSqm} onChange={(event) => patchDraft("innerAreaSqm", event.target.value)} />
        <Input label="楼层" inputMode="numeric" value={draft.floor} onChange={(event) => patchDraft("floor", event.target.value)} />
        <Input label="总层数" inputMode="numeric" value={draft.totalFloors} onChange={(event) => patchDraft("totalFloors", event.target.value)} />
      </div>
      <CounterRow label="户型" values={[["室", draft.rooms, (value) => patchDraft("rooms", value)], ["厅", draft.halls, (value) => patchDraft("halls", value)], ["卫", draft.baths, (value) => patchDraft("baths", value)]]} />
      <SelectRow label="朝向" value={draft.orientation} options={["南", "北", "东", "西", "南北通透", "东西通透"]} onChange={(value) => patchDraft("orientation", value)} />
      <SelectRow label="装修情况" value={draft.decoration} options={["毛坯", "简装", "精装", "豪装"]} onChange={(value) => patchDraft("decoration", value)} />
      <SelectRow label="产权年限" value={draft.propertyYears} options={["70年", "50年", "40年"]} onChange={(value) => patchDraft("propertyYears", value)} />
      <Input label="挂牌价（万元）" inputMode="numeric" value={draft.listingPriceWan} onChange={(event) => patchDraft("listingPriceWan", event.target.value)} hint="当前片区参考均价 3.2-3.8 万/㎡" />
      <div className="rounded-xl bg-primary-100 p-3">
        <p className="text-caption font-semibold text-primary-700">价格评估联动</p>
        <p className="mt-1 text-h3 price-nums">{assessment.unitPrice.toLocaleString("zh-CN")} 元/㎡ · {assessment.status}</p>
        <p className="mt-1 text-body-s text-neutral-700">参考区间 {assessment.referenceMin.toLocaleString("zh-CN")}-{assessment.referenceMax.toLocaleString("zh-CN")} 元/㎡，来自 mock 在地分层评估结果。</p>
      </div>
      <SelectRow label="税费承担方式" value={draft.taxMode} options={["买家承担", "卖家承担", "各自承担"]} onChange={(value) => patchDraft("taxMode", value)} />
      <TagGroup label="可看房时间" values={visitOptions} selected={draft.visitTime} onToggle={(value) => toggleArray("visitTime", value)} />
      <Input label="联系方式" value={draft.contactPhone} onChange={(event) => patchDraft("contactPhone", event.target.value)} />
    </div>
  );
}

function PromotionStep({ draft, toggleArray }: { draft: ListingDraft; toggleArray: (key: "visitTime" | "promotionChannels", value: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-neutral-100 p-3">
        <div className="flex gap-3">
          <Megaphone className="size-5 text-primary-700" />
          <p className="text-body-s text-neutral-700">选择发布后同步分发的自媒体渠道。经纪人私域会在核验通过后自动生成素材草稿。</p>
        </div>
      </div>
      <TagGroup label="推广渠道" values={promotionChannels} selected={draft.promotionChannels} onToggle={(value) => toggleArray("promotionChannels", value)} />
      <div className="grid grid-cols-2 gap-3">
        {draft.promotionChannels.map((channel) => (
          <div key={channel} className="rounded-xl border border-neutral-200 p-3">
            <p className="font-semibold">{channel}</p>
            <p className="mt-1 text-caption text-neutral-500">核验后生成素材并排队发布</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmStep({
  draft,
  images,
  assessment,
  isVerified,
  patchDraft,
}: {
  draft: ListingDraft;
  images: UploadImage[];
  assessment: ReturnType<typeof getAssessment>;
  isVerified: boolean;
  patchDraft: <Key extends keyof ListingDraft>(key: Key, value: ListingDraft[Key]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-green-50 p-3">
        <div className="flex gap-3">
          <FileCheck2 className="size-5 text-semantic-success" />
          <p className="text-body-s text-neutral-700">提交后将进入核验队列，预计 24 小时内完成核验。</p>
        </div>
      </div>
      <SummaryRow label="楼盘房号" value={`${draft.communityName} ${draft.building}-${draft.room}`} />
      <SummaryRow label="户型面积" value={`${draft.rooms}室${draft.halls}厅${draft.baths}卫 · ${draft.areaSqm}㎡ · ${draft.orientation}`} />
      <SummaryRow label="挂牌价格" value={`${draft.listingPriceWan} 万 · ${assessment.unitPrice.toLocaleString("zh-CN")} 元/㎡ · ${assessment.status}`} />
      <SummaryRow label="图片材料" value={`${images.length} 张图片 · 房产证 OCR 已识别`} />
      <SummaryRow label="推广渠道" value={draft.promotionChannels.join("、") || "未选择"} />
      <div className="rounded-xl border border-neutral-200 p-3">
        <div className="flex items-center gap-2">
          {isVerified ? <BadgeCheck className="size-5 text-semantic-success" /> : <ShieldAlert className="size-5 text-semantic-warning" />}
          <span className="font-semibold">{isVerified ? "实名认证已完成" : "实名认证未完成"}</span>
        </div>
        <div className="mt-3 space-y-2 text-body-s text-neutral-700">
          <p>产权人：{draft.ownerName}</p>
          <p>证载地址：{draft.propertyAddress}</p>
          <p>共有产权声明：{draft.coOwnerStatement}</p>
        </div>
      </div>
      <label className="flex items-start gap-2 rounded-xl bg-neutral-100 p-3 text-body-s">
        <input type="checkbox" className="mt-1" checked={draft.agreed} onChange={(event) => patchDraft("agreed", event.target.checked)} />
        <span>我同意平台发布协议，确认房源信息、产权材料和委托发布内容真实有效。</span>
      </label>
    </div>
  );
}

function CounterRow({
  label,
  values,
}: {
  label: string;
  values: Array<[string, number, (value: number) => void]>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-body-s font-semibold">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {values.map(([unit, value, onChange]) => (
          <div key={unit} className="rounded-xl border border-neutral-200 p-2 text-center">
            <div className="flex items-center justify-between">
              <button type="button" className="size-8 rounded-full bg-neutral-100" onClick={() => onChange(Math.max(0, value - 1))}>-</button>
              <span className="font-semibold">{value}{unit}</span>
              <button type="button" className="size-8 rounded-full bg-primary-100 text-primary-700" onClick={() => onChange(value + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-body-s font-semibold">
      <span>{label}</span>
      <select className="h-11 w-full rounded-lg border border-input bg-white px-3 text-body-m font-normal" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TagGroup({ label, values, selected, onToggle }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-body-s font-semibold">{label}</p>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-3 text-body-s last:border-b-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span className="max-w-[210px] text-right font-semibold">{value}</span>
    </div>
  );
}
