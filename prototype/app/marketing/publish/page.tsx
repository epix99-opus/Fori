"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Clipboard, Radio, Send, ShieldCheck } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Toast } from "@/components/Toast";
import { mockChannelReach } from "@/lib/mock-reach";
import { cn } from "@/lib/utils";

export default function MarketingPublishPage() {
  const [step, setStep] = useState(2);
  const [selected, setSelected] = useState(["douyin", "weixin_video"]);
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function publish() {
    setPublished(true);
    setStep(4);
    showToast("发布任务已创建");
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketing/video" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-caption text-neutral-500">短视频分发</p>
            <h1 className="text-h3">渠道发布流程</h1>
          </div>
          <Send className="size-6 text-primary-700" />
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-4 gap-2">
          {["选素材", "选渠道", "发布设置", "状态"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={cn("rounded-xl px-2 py-2 text-caption font-semibold", step === index + 1 ? "bg-primary-700 text-white" : "bg-white text-neutral-600")}
              onClick={() => setStep(index + 1)}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        <Card header={<SectionTitle icon={Radio} title="Step 1 · 选择素材" subtitle="中关村三居沉浸视频" />}>
          <div className="rounded-xl bg-neutral-100 p-3">
            <h2 className="text-body-s font-semibold">中关村三居沉浸视频</h2>
            <p className="mt-1 text-caption text-neutral-500">45 秒 · 1080p · 6 个分镜 · 已通过违规词检查</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => showToast("视频预览占位")}>预览</Button>
              <Button size="sm" variant="secondary" onClick={() => showToast("更换素材占位")}>更换</Button>
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-caption">
            {["朋友圈海报（1080×1440）", "小红书房源描述（180 字）", "头条图文（待生成）"].map((item, index) => (
              <label key={item} className="flex items-center gap-2 rounded-xl bg-neutral-100 p-3">
                <input type="checkbox" defaultChecked={index < 2} />
                {item}
              </label>
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={ShieldCheck} title="Step 2 · 选择渠道" subtitle={`当前可发布 ${selected.length} 个渠道`} />}>
          <div className="space-y-3">
            {mockChannelReach.map((channel) => {
              const active = selected.includes(channel.channel);
              return (
                <button
                  key={channel.channel}
                  type="button"
                  className={cn("w-full rounded-xl border p-3 text-left", active ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white")}
                  onClick={() => {
                    if (!channel.isAuthorized) {
                      showToast(`${channel.channelName} 需要先授权`);
                      return;
                    }
                    setSelected((current) => (active ? current.filter((item) => item !== channel.channel) : [...current, channel.channel]));
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-body-s font-semibold">{channel.isAuthorized ? "✅" : "🔴"} {channel.channelIcon} {channel.channelName}</span>
                    <span className="text-caption font-semibold text-primary-700">{channel.isAuthorized ? "更换账号" : "授权登录"}</span>
                  </div>
                  <p className="mt-1 text-caption text-neutral-500">
                    {channel.isAuthorized ? `已授权 · ${channel.accountName}` : "未授权"}
                    {!channel.apiSupported ? " · 仅支持复制文案后手动发布" : ""}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl bg-neutral-100 p-3 text-caption text-neutral-500">未授权渠道可生成素材包，由您复制后手动发布。合规分发边界说明 →</p>
        </Card>

        <Card header={<SectionTitle icon={CalendarClock} title="Step 3 · 发布设置" subtitle="立即发布 + 站内联系" />}>
          <div className="space-y-3 text-body-s">
            <label className="block rounded-xl bg-neutral-100 p-3"><input type="radio" defaultChecked /> 立即发布</label>
            <label className="block rounded-xl bg-neutral-100 p-3"><input type="radio" /> 定时发布 2026-07-03 20:00</label>
            <label className="block rounded-xl bg-neutral-100 p-3"><input type="radio" defaultChecked /> 平台内联系（隐藏手机号）</label>
            <label className="block rounded-xl bg-neutral-100 p-3"><input type="checkbox" defaultChecked /> 我确认内容不含虚假承诺、夸大宣传或违规词汇</label>
            <Button className="w-full" onClick={publish}>预览并发布</Button>
          </div>
        </Card>

        <Card header={<SectionTitle icon={CheckCircle2} title="Step 4 · 发布状态" subtitle={published ? "任务已提交" : "发布后展示各渠道状态"} />}>
          <div className="space-y-3">
            <StatusRow name="抖音" status={published ? "发布中..." : "待发布"} tone="blue" />
            <StatusRow name="微信视频号" status={published ? "发布成功 · 查看" : "待发布"} tone="green" />
            <StatusRow name="小红书" status="素材已复制 · 请在 App 手动发布" tone="orange" />
          </div>
          <div className="mt-3 rounded-xl bg-orange-50 p-3 text-caption text-orange-700">
            <p className="font-semibold">小红书手动发布引导</p>
            <p className="mt-1">复制文案 → 打开小红书 App → 发新帖 → 上传封面图 → 添加 #海淀房产 #中关村小区。</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => showToast("文案已复制")}><Clipboard className="size-4" />复制文案</Button>
              <Button size="sm" variant="secondary" onClick={() => showToast("素材包下载占位")}>下载素材包</Button>
            </div>
          </div>
          <Link href="/marketing/reach" className="mt-3 block"><Button className="w-full">查看触达分析</Button></Link>
        </Card>
      </section>

      <AgentAssistFab pageContext="渠道发布流程" suggestedPrompts={["抖音发布最佳时间是什么时候？", "小红书没有 API 怎么手动发？", "如何让视频号获得更多曝光？"]} />
      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Radio; title: string; subtitle: string }) {
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

function StatusRow({ name, status, tone }: { name: string; status: string; tone: "blue" | "green" | "orange" }) {
  const className = tone === "green" ? "bg-green-50 text-semantic-success" : tone === "orange" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-primary-700";
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-100 p-3">
      <span className="text-body-s font-semibold">{name}</span>
      <span className={cn("rounded-full px-2 py-1 text-caption font-semibold", className)}>{status}</span>
    </div>
  );
}
