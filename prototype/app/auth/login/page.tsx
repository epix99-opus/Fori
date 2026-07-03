import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, LockKeyhole, MessageSquareText, Smartphone } from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";

const loginTiers = [
  {
    tier: "未验证 / 游客",
    scope: "小区名、片区、公开图片、建筑年代",
    blocked: "挂牌价、房号、楼层、业主联系方式、成交价",
    action: "浏览公开字典",
    cta: { label: "立即浏览", href: "/explore/dict" },
  },
  {
    tier: "手机验证",
    scope: "挂牌价、户型面积、小区配套标签",
    blocked: "精确楼层房号、历史成交明细、业主联系方式",
    action: "一般性查询、收藏、预约看房",
    cta: { label: "立即升级", href: "#phone-login" },
  },
  {
    tier: "实名认证",
    scope: "楼层朝向、估价参考、交易进度（己方）",
    blocked: "其他用户联系方式、经纪人内部分成",
    action: "发布房源/购房需求、确认购买意向",
    cta: { label: "立即升级", href: "/auth/kyc" },
  },
  {
    tier: "经纪人认证",
    scope: "成交价、维护记录、客源匹配、分成预览",
    blocked: "平台审核后台、原始证件影像",
    action: "共建字典、带看、撮合交易",
    cta: { label: "立即升级", href: "/profile/agent-cert" },
  },
  {
    tier: "平台工作人员",
    scope: "审核队列、异常交易、字段变更、风控日志",
    blocked: "非任务相关原始证件影像、无授权私聊内容",
    action: "处理审核、纠纷、分成复核",
    cta: { label: "请联系平台管理员", href: "/messages" },
  },
];

export default function LoginPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-6">
      <section className="rounded-2xl bg-primary-900 p-5 text-white shadow-card">
        <p className="text-caption text-primary-200">Fori 账号 · 分级可见</p>
        <h1 className="mt-2 text-h1">登录后继续真实交易流程</h1>
        <p className="mt-3 text-body-s text-primary-100">
          一般性查询仅需手机号验证；更多真实信息按必要最小原则逐级解锁，敏感字段默认保密隔离。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        <Card>
          <div className="space-y-4">
            <Input id="phone-login" label="手机号" placeholder="请输入手机号" defaultValue="138****8201" />
            <Input label="验证码" placeholder="6 位短信验证码" />
            <Button className="w-full">
              登录 / 注册
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-primary-700" />
            <h2 className="text-h3">未验证 / 手机 / KYC 可见矩阵</h2>
          </div>
          <div className="mt-3 space-y-3">
            {loginTiers.map((item) => (
              <div key={item.tier} className="rounded-xl border border-neutral-200 p-3">
                <p className="text-body-s font-semibold text-neutral-900">{item.tier}</p>
                <p className="mt-1 text-caption text-neutral-600">
                  <span className="font-semibold text-emerald-700">可见：</span>
                  {item.scope}
                </p>
                <p className="mt-1 text-caption text-neutral-500">
                  <span className="font-semibold text-amber-700">保密：</span>
                  {item.blocked}
                </p>
                <p className="mt-1 text-caption text-primary-700">可执行：{item.action}</p>
                <Link href={item.cta.href} className="mt-3 inline-flex rounded-lg px-3 py-2 text-caption font-semibold text-primary-700 hover:bg-primary-50">
                  {item.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            <TrustItem icon={Smartphone} title="短信验证" text="无密码登录" />
            <TrustItem icon={BadgeCheck} title="实名认证" text="发布前置" />
            <TrustItem icon={LockKeyhole} title="隐私保护" text="分级授权" />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/auth/kyc" className="rounded-xl bg-white p-4 shadow-card">
            <BadgeCheck className="size-6 text-primary-700" />
            <p className="mt-2 text-body-s font-semibold">去实名认证</p>
          </Link>
          <Link href="/messages" className="rounded-xl bg-white p-4 shadow-card">
            <MessageSquareText className="size-6 text-primary-700" />
            <p className="mt-2 text-body-s font-semibold">查看通知入口</p>
          </Link>
        </div>
      </section>
      <AgentAssistFab
        pageContext="登录与认证分级"
        suggestedPrompts={["我只想查小区需要哪级认证？", "解释 KYC 后能看到哪些字段", "平台工作人员能查看什么？"]}
      />
    </main>
  );
}

function TrustItem({ icon: Icon, title, text }: { icon: typeof Smartphone; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <Icon className="mx-auto size-5 text-primary-700" />
      <p className="mt-2 text-caption font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-neutral-500">{text}</p>
    </div>
  );
}
