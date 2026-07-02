import Link from "next/link";
import { BadgeCheck, Camera, FileText, ShieldCheck, UserCheck } from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper, type StepperStep } from "@/components/Stepper";

const steps: StepperStep[] = [
  { label: "证件上传", status: "complete" },
  { label: "活体核验", status: "current" },
  { label: "资格确认", status: "pending" },
];

export default function KycPage() {
  return (
    <main className="mobile-shell min-h-dvh bg-neutral-100 pb-8">
      <header className="bg-white px-4 py-4 shadow-card">
        <p className="text-caption text-neutral-500">实名认证</p>
        <h1 className="text-h2">完成 L1 认证后可发布与发起交易</h1>
      </header>

      <section className="space-y-4 px-4 py-4">
        <Card>
          <Stepper steps={steps} />
          <div className="mt-5 rounded-xl bg-primary-100 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-6 text-primary-700" />
              <div>
                <h2 className="text-h3">当前待完成：活体核验</h2>
                <p className="mt-1 text-body-s text-neutral-700">核验结果仅用于实名认证、公证前置检查和交易责任确认。</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <KycCard icon={FileText} title="身份证 OCR" text="已识别姓名与证件号" />
          <KycCard icon={Camera} title="活体拍摄" text="需打开摄像头授权" />
          <KycCard icon={UserCheck} title="购房资格" text="买方交易前补充" />
          <KycCard icon={BadgeCheck} title="经纪人升级" text="通过后可申请 L2" />
        </div>

        <Button className="w-full">开始活体核验</Button>
        <Link href="/profile/agent-cert" className="block text-center text-body-s font-semibold text-primary-700">查看经纪人认证</Link>
      </section>
    </main>
  );
}

function KycCard({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return (
    <Card>
      <Icon className="size-6 text-primary-700" />
      <p className="mt-3 text-body-s font-semibold">{title}</p>
      <p className="mt-1 text-caption text-neutral-500">{text}</p>
    </Card>
  );
}
