import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, MessageSquareText, Smartphone } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";

export default function LoginPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 px-4 py-6">
      <section className="rounded-2xl bg-primary-900 p-5 text-white shadow-card">
        <p className="text-caption text-primary-200">Fori 账号</p>
        <h1 className="mt-2 text-h1">登录后继续真实交易流程</h1>
        <p className="mt-3 text-body-s text-primary-100">统一手机号登录，发布、认证、交易和工作台权限会按实名认证状态解锁。</p>
      </section>

      <section className="mt-5 space-y-4">
        <Card>
          <div className="space-y-4">
            <Input label="手机号" placeholder="请输入手机号" defaultValue="138****8201" />
            <Input label="验证码" placeholder="6 位短信验证码" />
            <Button className="w-full">
              登录 / 注册
              <ArrowRight className="ml-1 size-4" />
            </Button>
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
