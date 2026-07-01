"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  FileText,
  History,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Play,
  Save,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Toast } from "@/components/Toast";
import { mockListings } from "@/lib/mock";
import { cn } from "@/lib/utils";

type MaterialType = "poster" | "script" | "description" | "cover";
type GenerationState = "idle" | "generating" | "ready";
type MaterialOption = {
  id: MaterialType;
  label: string;
  description: string;
  icon: typeof ImageIcon;
};
type ResultCard = {
  id: string;
  type: MaterialType;
  title: string;
  preview: string;
  meta: string;
};
type HistoryItem = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
};

const materialOptions: MaterialOption[] = [
  { id: "poster", label: "朋友圈海报", description: "竖版卖点海报", icon: ImageIcon },
  { id: "script", label: "短视频脚本", description: "15-60 秒分镜", icon: Play },
  { id: "description", label: "房源描述", description: "三套文案方向", icon: FileText },
  { id: "cover", label: "头图", description: "平台封面标题图", icon: LayoutTemplate },
];

const styleOptions = ["简约", "商务", "温馨", "年轻化"];
const copyStyles = ["真实克制", "高转化", "社区生活感", "专业经纪人"];
const focusOptions = ["学区", "地铁", "价格", "户型", "装修"];
const historyItems: HistoryItem[] = [
  { id: "history-1", title: "中关村三居朋友圈海报", type: "朋友圈海报", createdAt: "今天 10:24" },
  { id: "history-2", title: "改善客短视频脚本", type: "短视频脚本", createdAt: "昨天 18:40" },
  { id: "history-3", title: "小红书房源描述", type: "房源描述", createdAt: "06-29 09:12" },
];

export default function MarketingGeneratePage() {
  const [selectedTypes, setSelectedTypes] = useState<MaterialType[]>(["poster", "description"]);
  const [style, setStyle] = useState("温馨");
  const [copyStyle, setCopyStyle] = useState("真实克制");
  const [focus, setFocus] = useState<string[]>(["地铁", "户型"]);
  const [targetAudience, setTargetAudience] = useState("改善型家庭");
  const [state, setState] = useState<GenerationState>("ready");
  const [toast, setToast] = useState<string | null>(null);

  const listing = mockListings[0];
  const results: ResultCard[] = useMemo(
    () =>
      selectedTypes.map((type) => ({
        id: type,
        type,
        title: materialOptions.find((item) => item.id === type)?.label ?? "素材",
        preview: buildPreview(type, listing?.title ?? "中关村科技园精装三居", style, copyStyle),
        meta: type === "script" ? "约 45 秒 · 6 个镜头" : type === "poster" ? "1080x1440 · 微信适配" : type === "cover" ? "16:9 · 头图比例" : "约 180 字 · 三段式",
      })),
    [copyStyle, listing?.title, selectedTypes, style],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function toggleType(type: MaterialType) {
    setSelectedTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  }

  function toggleFocus(item: string) {
    setFocus((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  function generate() {
    if (listing.imageCount < 3) {
      showToast("请先为房源上传至少 3 张图片");
      return;
    }
    if (selectedTypes.length === 0) {
      showToast("请至少选择一种素材类型");
      return;
    }
    setState("generating");
    window.setTimeout(() => {
      setState("ready");
      showToast("素材已生成，可复制或保存");
    }, 900);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketing/manage" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">自媒体智能营销</p>
            <h1 className="truncate text-h3">素材生成</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => showToast("历史素材管理占位")} aria-label="历史">
            <History className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
              <Wand2 className="size-7" />
            </div>
            <div>
              <p className="text-caption text-primary-200">AI 一键生成</p>
              <h2 className="text-h2">房源推广素材</h2>
            </div>
          </div>
          <p className="mt-3 text-body-s text-primary-100">图文和文案约 30 秒，短视频脚本支持后台生成，可离开页面后在历史记录查看。</p>
        </section>

        <Card header={<SectionTitle icon={Megaphone} title="选择推广房源" subtitle="复用已核验房源作为素材输入" />}>
          <Input label="搜索 / 选择房源" value={`${listing.communityName} · ${listing.title}`} readOnly />
          <div className="mt-3 rounded-xl bg-neutral-100 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-body-s font-semibold text-neutral-900">{listing.title}</h3>
                <p className="mt-1 text-caption text-neutral-500">{listing.district} · {listing.areaSqm}㎡ · {listing.rooms}室{listing.halls}厅 · {listing.imageCount} 张图</p>
              </div>
              <span className="rounded-full bg-green-50 px-2 py-1 text-caption font-semibold text-semantic-success">已核验</span>
            </div>
          </div>
        </Card>

        <Card header={<SectionTitle icon={LayoutTemplate} title="素材类型选择" subtitle="可多选后统一生成" />}>
          <div className="grid grid-cols-2 gap-3">
            {materialOptions.map((option) => (
              <MaterialTypeCard key={option.id} option={option} active={selectedTypes.includes(option.id)} onClick={() => toggleType(option.id)} />
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={Sparkles} title="输入参数" subtitle="选择风格、文案口吻和推广重点" />}>
          <div className="space-y-4">
            <Input label="目标人群" value={targetAudience} onChange={(event) => setTargetAudience(event.target.value)} />
            <OptionGroup label="视觉风格" options={styleOptions} selected={[style]} onToggle={setStyle} single />
            <OptionGroup label="文案风格" options={copyStyles} selected={[copyStyle]} onToggle={setCopyStyle} single />
            <OptionGroup label="推广重点" options={focusOptions} selected={focus} onToggle={toggleFocus} />
            <Button className="w-full" size="lg" loading={state === "generating"} onClick={generate}>
              <Sparkles className="size-4" />
              AI 一键生成
            </Button>
          </div>
        </Card>

        <Card header={<SectionTitle icon={Send} title="生成结果预览" subtitle={state === "generating" ? "正在生成，可后台继续" : `${results.length} 个素材可用`} />}>
          {state === "generating" ? (
            <div className="rounded-xl bg-blue-50 p-4 text-body-s text-primary-700">
              正在生成素材。短视频脚本约 3-5 分钟，完成后将出现在历史记录。
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <ResultPreview key={result.id} result={result} onCopy={() => showToast("素材内容已复制占位")} onSave={() => showToast("素材已保存到管理页占位")} />
              ))}
            </div>
          )}
        </Card>

        <Card header={<SectionTitle icon={History} title="历史记录" subtitle="最近生成的素材可继续使用" />}>
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 p-3">
                <div className="min-w-0">
                  <h3 className="truncate text-body-s font-semibold text-neutral-900">{item.title}</h3>
                  <p className="text-caption text-neutral-500">{item.type} · {item.createdAt}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => showToast("已载入历史素材占位")}>
                  使用
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function buildPreview(type: MaterialType, title: string, style: string, copyStyle: string) {
  if (type === "script") {
    return `镜头1：小区门口建立信任；镜头2：展示客厅采光；镜头3：强调${style}生活动线；结尾引导私信预约看房。`;
  }
  if (type === "poster") {
    return `${title}\n地铁生活圈 · 精装三居 · 总价清晰\n适合朋友圈发布的${style}海报文案。`;
  }
  if (type === "cover") {
    return `头图标题：海淀中关村精装三居\n副标题：通勤、学区、居住舒适度一次看清。`;
  }
  return `${title}，以${copyStyle}口吻突出真实房况、通勤效率和家庭居住体验，适合小红书、朋友圈和私域客户转发。`;
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Megaphone; title: string; subtitle: string }) {
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

function MaterialTypeCard({ option, active, onClick }: { option: MaterialOption; active: boolean; onClick: () => void }) {
  const Icon = option.icon;
  return (
    <button type="button" className={cn("rounded-xl border p-3 text-left", active ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-neutral-100")} onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <Icon className={cn("size-5", active ? "text-primary-700" : "text-neutral-500")} />
        {active ? <Check className="size-4 text-primary-700" /> : null}
      </div>
      <h3 className="mt-3 text-body-s font-semibold text-neutral-900">{option.label}</h3>
      <p className="mt-1 text-caption text-neutral-500">{option.description}</p>
    </button>
  );
}

function OptionGroup({ label, options, selected, onToggle, single = false }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void; single?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-body-s font-semibold text-neutral-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" className={cn("rounded-full px-3 py-2 text-caption font-semibold", selected.includes(option) ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-600")} onClick={() => onToggle(option)} aria-pressed={selected.includes(option)}>
            {option}
          </button>
        ))}
      </div>
      {single ? <p className="mt-1 text-caption text-neutral-400">单选</p> : null}
    </div>
  );
}

function ResultPreview({ result, onCopy, onSave }: { result: ResultCard; onCopy: () => void; onSave: () => void }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-body-s font-semibold text-neutral-900">{result.title}</h3>
          <p className="text-caption text-neutral-500">{result.meta}</p>
        </div>
        <Bookmark className="size-5 text-primary-700" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-100 p-3 font-sans text-body-s text-neutral-700">{result.preview}</pre>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCopy}>
          <Copy className="size-4" />
          复制
        </Button>
        <Button onClick={onSave}>
          <Save className="size-4" />
          保存
        </Button>
      </div>
    </div>
  );
}
