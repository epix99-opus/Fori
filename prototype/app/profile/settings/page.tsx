"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleHelp,
  Eye,
  FileText,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Moon,
  RefreshCcw,
  Shield,
  Smartphone,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { mockUsers } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "ready" | "loading" | "error";
type SwitchKey = "push" | "customer" | "transaction" | "system" | "marketing" | "doNotDisturb" | "profileVisible";

const version = "Fori Prototype 0.1.0";

export default function SettingsPage() {
  const [state, setState] = useState<PageState>("ready");
  const [toast, setToast] = useState<string | null>(null);
  const [switches, setSwitches] = useState<Record<SwitchKey, boolean>>({
    push: true,
    customer: true,
    transaction: true,
    system: true,
    marketing: false,
    doNotDisturb: true,
    profileVisible: false,
  });

  const user = mockUsers[0];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  function toggle(key: SwitchKey) {
    setSwitches((current) => ({ ...current, [key]: !current[key] }));
    showToast("设置已保存");
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">我的</p>
            <h1 className="truncate text-h3">设置</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => setState("error")} aria-label="模拟错误">
            <RefreshCcw className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? <ErrorState title="设置同步失败" code="SETTINGS_SAVE" description="通知开关保存失败时会回滚，当前可重试拉取最新账号偏好。" onRetry={retry} /> : null}

        {state === "ready" ? (
          <>
            <section className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <UserRound className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-h3">{user?.name ?? "林女士"}</h2>
                  <p className="text-body-s text-neutral-500">{user?.phoneMasked ?? "138****8201"} · 已登录</p>
                </div>
              </div>
            </section>

            <Card header={<SectionTitle icon={Smartphone} title="账号设置" subtitle="手机号、密码与绑定账号" />}>
              <div className="divide-y divide-neutral-100">
                <ActionRow icon={Smartphone} label="手机号" value={user?.phoneMasked ?? "138****8201"} onClick={() => showToast("短信验证修改手机号入口占位")} />
                <ActionRow icon={LockKeyhole} label="登录密码" value="已设置" onClick={() => showToast("密码修改入口占位")} />
                <ActionRow icon={UserRound} label="头像 / 昵称" value="可编辑" onClick={() => showToast("资料编辑入口占位")} />
                <ActionRow icon={WalletCards} label="绑定微信 / 支付宝" value="未绑定" onClick={() => showToast("第三方账号绑定入口占位")} />
              </div>
            </Card>

            <Card header={<SectionTitle icon={Bell} title="通知设置" subtitle="总开关、分类提醒和免打扰" />}>
              <div className="space-y-2">
                <SwitchRow label="推送通知" description="控制所有 App 角标和系统推送" checked={switches.push} onChange={() => toggle("push")} />
                <SwitchRow label="客户消息" description="P1/P2/P3 客源推送" checked={switches.customer} disabled={!switches.push} onChange={() => toggle("customer")} />
                <SwitchRow label="交易消息" description="合同、公证、资金监管进度" checked={switches.transaction} disabled={!switches.push} onChange={() => toggle("transaction")} />
                <SwitchRow label="系统公告" description="认证、楼盘核验和平台公告" checked={switches.system} disabled={!switches.push} onChange={() => toggle("system")} />
                <SwitchRow label="营销通知" description="精选房源与推广活动" checked={switches.marketing} disabled={!switches.push} onChange={() => toggle("marketing")} />
                <SwitchRow label="免打扰时段" description="22:00-08:00，仅保留关键提醒" checked={switches.doNotDisturb} onChange={() => toggle("doNotDisturb")} />
              </div>
            </Card>

            <Card header={<SectionTitle icon={Eye} title="隐私与安全" subtitle="手机号可见范围和账户安全" />}>
              <div className="space-y-3">
                <SwitchRow label="对经纪人显示完整手机号" description="关闭后默认显示脱敏号码" checked={switches.profileVisible} onChange={() => toggle("profileVisible")} />
                <ActionRow icon={Shield} label="手机号可见设置" value="脱敏显示" onClick={() => showToast("可见范围选择入口占位")} />
                <ActionRow icon={Trash2} label="账户注销" value="需二次确认" danger onClick={() => showToast("账户注销需本人二次验证")} />
              </div>
            </Card>

            <Card header={<SectionTitle icon={Moon} title="外观与数据" subtitle="显示模式、语言、缓存和离线数据" />}>
              <div className="divide-y divide-neutral-100">
                <ActionRow icon={Moon} label="外观模式" value="跟随系统" onClick={() => showToast("当前仅支持跟随系统")} />
                <ActionRow icon={MessageSquare} label="语言" value="简体中文" onClick={() => showToast("当前仅支持简体中文")} />
                <ActionRow icon={Trash2} label="清除缓存" value="24.8 MB" onClick={() => showToast("缓存已清除")} />
                <ActionRow icon={FileText} label="离线数据管理" value="楼盘字典 3 个片区" onClick={() => showToast("离线数据管理入口占位")} />
              </div>
            </Card>

            <Card header={<SectionTitle icon={CircleHelp} title="关于" subtitle={version} />}>
              <div className="divide-y divide-neutral-100">
                <LinkRow label="用户协议" href="/profile/settings" />
                <LinkRow label="隐私政策" href="/profile/settings" />
                <LinkRow label="意见反馈" href="/messages" />
              </div>
            </Card>

            <Button variant="danger" className="w-full" onClick={() => showToast("退出登录需确认后返回登录页")}>
              <LogOut className="size-4" />
              退出登录
            </Button>
          </>
        ) : null}
      </section>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Bell; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-5 text-primary-700" />
      <div>
        <h2 className="text-h3">{title}</h2>
        <p className="text-caption text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, value, danger = false, onClick }: { icon: typeof Bell; label: string; value: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0" onClick={onClick}>
      <span className={cn("flex size-10 items-center justify-center rounded-xl bg-neutral-100", danger ? "text-semantic-danger" : "text-neutral-700")}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-body-s font-semibold", danger ? "text-semantic-danger" : "text-neutral-900")}>{label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-caption text-neutral-500">
        {value}
        <ChevronRight className="size-4" />
      </span>
    </button>
  );
}

function SwitchRow({ label, description, checked, disabled = false, onChange }: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button type="button" className={cn("flex w-full items-center justify-between gap-4 rounded-xl bg-neutral-100 p-3 text-left", disabled && "opacity-50")} onClick={disabled ? undefined : onChange} aria-pressed={checked} disabled={disabled}>
      <span className="min-w-0">
        <span className="block text-body-s font-semibold text-neutral-900">{label}</span>
        <span className="block text-caption text-neutral-500">{description}</span>
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-primary-600" : "bg-neutral-300")}>
        <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </span>
    </button>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between py-3 text-body-s font-semibold text-neutral-900 first:pt-0 last:pb-0">
      {label}
      <ChevronRight className="size-4 text-neutral-400" />
    </Link>
  );
}
