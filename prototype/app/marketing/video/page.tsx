"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Film, ImageIcon, Music, Sparkles, Subtitles } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockListings } from "@/lib/mock";
import { mockStoryboardScenes } from "@/lib/mock-reach";
import { cn } from "@/lib/utils";

const videoTypes = [
  { id: "overview", label: "房源概览视频", desc: "15-30 秒 · 关键参数展示" },
  { id: "immersive", label: "沉浸式浏览视频", desc: "30-60 秒 · 空间全景体验" },
  { id: "talking", label: "经纪人口播脚本", desc: "仅文字 · 供经纪人自录" },
];

export default function MarketingVideoPage() {
  const [videoType, setVideoType] = useState("immersive");
  const [state, setState] = useState<"idle" | "loading" | "ready">("ready");
  const [paramsOpen, setParamsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const listing = mockListings[0];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function generate() {
    setState("loading");
    window.setTimeout(() => {
      setState("ready");
      showToast("分镜脚本已生成");
    }, 900);
  }

  return (
    <main className="mobile-shell pb-28">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketing/generate" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-caption text-neutral-500">自媒体营销</p>
            <h1 className="text-h3">短视频制作工作台</h1>
          </div>
          <Film className="size-6 text-primary-700" />
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white shadow-card">
          <p className="text-caption text-primary-200">AI 分镜 + 合规引导</p>
          <h2 className="mt-1 text-h1">把已核验房源生成可发布短视频</h2>
          <p className="mt-2 text-body-s text-primary-100">默认隐藏手机号，引导客户通过 Fori 站内消息预约。</p>
        </section>

        <Card header={<SectionTitle icon={CheckCircle2} title="已选房源" subtitle="复用核验图片、户型和价格信息" />}>
          <div className="rounded-xl bg-neutral-100 p-3">
            <h3 className="text-body-s font-semibold">{listing.communityName} 精装三居</h3>
            <p className="mt-1 text-caption text-neutral-500">{listing.areaSqm}㎡ · {listing.priceWan}万 · {listing.imageCount} 张实拍 · 已核验</p>
          </div>
          <div className="mt-3 grid gap-2">
            {videoTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn("rounded-xl border p-3 text-left", videoType === item.id ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white")}
                onClick={() => setVideoType(item.id)}
              >
                <p className="text-body-s font-semibold">{videoType === item.id ? "● " : "○ "}{item.label}</p>
                <p className="mt-1 text-caption text-neutral-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={Sparkles} title="分镜脚本" subtitle="沉浸式浏览视频 · 约 45 秒 · 6 个镜头" />}>
          {state === "idle" ? (
            <Button className="w-full" onClick={generate}><Sparkles className="size-4" />AI 生成分镜脚本</Button>
          ) : null}
          {state === "loading" ? (
            <div>
              <p className="mb-3 text-body-s text-primary-700">正在生成分镜，约 30 秒</p>
              <Skeleton variant="list" />
            </div>
          ) : null}
          {state === "ready" ? (
            <div className="space-y-3">
              {mockStoryboardScenes.map((scene) => (
                <div key={scene.index} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-caption font-semibold text-neutral-500">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-700">{scene.index}</span>
                    {scene.label}
                    <span className="ml-auto text-neutral-400">{scene.time}</span>
                  </div>
                  <p className="mt-2 text-body-s text-neutral-900">{scene.caption}</p>
                  <p className="mt-1 text-caption text-neutral-400">运镜：{scene.cameraMove}</p>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" size="sm" onClick={() => showToast("进入分镜编辑占位")}>编辑分镜</Button>
                <Button variant="secondary" size="sm" onClick={generate}>重新生成</Button>
                <Link href="/marketing/publish"><Button size="sm" className="w-full">下一步</Button></Link>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setParamsOpen((open) => !open)}>
            <SectionTitle icon={Music} title="视频参数" subtitle="背景音乐、字幕和画质" />
            <span className="text-caption font-semibold text-primary-700">{paramsOpen ? "收起" : "展开"}</span>
          </button>
          {paramsOpen ? (
            <div className="mt-3 grid gap-2 text-body-s">
              <ParamRow icon={Music} label="背景音乐" value="轻松生活 · 无版权" />
              <ParamRow icon={Subtitles} label="字幕样式" value="白色描边 · 居中" />
              <ParamRow icon={ImageIcon} label="画质" value="1080p（抖音推荐）" />
            </div>
          ) : null}
        </Card>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-3">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={() => showToast("预览草稿占位")}>预览草稿</Button>
          <Button variant="secondary" onClick={() => showToast("草稿已保存")}>保存草稿</Button>
          <Link href="/marketing/publish"><Button className="w-full">发布渠道</Button></Link>
        </div>
      </div>

      <AgentAssistFab pageContext="短视频制作工作台" suggestedPrompts={["帮我生成一个 30 秒的沉浸式浏览脚本", "这套房最适合哪种推广方向？", "分镜需要调整节奏，怎么改？"]} />
      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Film; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 text-primary-700" />
      <div>
        <h2 className="text-body-s font-semibold">{title}</h2>
        <p className="text-caption text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ParamRow({ icon: Icon, label, value }: { icon: typeof Music; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
      <span className="flex items-center gap-2 text-neutral-600"><Icon className="size-4" />{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
