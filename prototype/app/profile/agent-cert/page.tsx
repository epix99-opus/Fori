"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Fingerprint,
  Hourglass,
  IdCard,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { Stepper, type StepperStep } from "@/components/Stepper";
import { Toast } from "@/components/Toast";
import { mockAgents, mockUsers } from "@/lib/mock";
import { cn } from "@/lib/utils";

type PageState = "ready" | "loading" | "empty" | "error";
type CertStatus = "not_started" | "reviewing" | "verified";
type CertStep = 0 | 1 | 2 | 3 | 4;

type UploadSlot = {
  id: string;
  label: string;
  description: string;
  status: "waiting" | "uploaded" | "reviewing";
};

type Permission = {
  name: string;
  l1: boolean;
  l2: boolean;
  l3: boolean;
};

const stepLabels = ["身份", "资质", "门店", "信用授权", "提交"];
const permissionRows: Permission[] = [
  { name: "发布房源", l1: true, l2: true, l3: true },
  { name: "维护楼盘", l1: false, l2: true, l3: true },
  { name: "接收客源", l1: false, l2: true, l3: true },
  { name: "优先匹配", l1: false, l2: false, l3: true },
  { name: "信用徽章", l1: true, l2: true, l3: true },
  { name: "P1 优先级", l1: false, l2: true, l3: true },
];

const initialUploads: UploadSlot[] = [
  { id: "id-front", label: "身份证正面", description: "用于实名认证 OCR", status: "uploaded" },
  { id: "id-back", label: "身份证反面", description: "确认有效期与签发机关", status: "uploaded" },
  { id: "license", label: "从业资格证", description: "L2 执业资质核验", status: "reviewing" },
  { id: "store-proof", label: "门店在职证明", description: "可选，提升门店权限", status: "waiting" },
];

export default function AgentCertPage() {
  const [state, setState] = useState<PageState>("ready");
  const [certStatus, setCertStatus] = useState<CertStatus>("reviewing");
  const [currentStep, setCurrentStep] = useState<CertStep>(3);
  const [uploads, setUploads] = useState<UploadSlot[]>(initialUploads);
  const [creditAuthorized, setCreditAuthorized] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const agent = mockAgents[0];
  const user = mockUsers[0];

  const stepperSteps: StepperStep[] = useMemo(() => {
    return stepLabels.map((label, index) => ({
      label,
      status: index < currentStep ? "complete" : index === currentStep ? "current" : "pending",
    }));
  }, [currentStep]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function setUploadStatus(id: string) {
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, status: "uploaded" } : item)));
    showToast("证件已上传，OCR 识别完成");
  }

  function submitReview() {
    if (!creditAuthorized) {
      showToast("请先完成信用授权");
      return;
    }
    setCertStatus("reviewing");
    setCurrentStep(4);
    showToast("已提交审核，预计 1-3 个工作日完成");
  }

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 450);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile/me" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">信用认证</p>
            <h1 className="truncate text-h3">经纪人入驻 / 认证</h1>
          </div>
          <button type="button" className="rounded-xl bg-neutral-100 px-3 py-2 text-caption font-semibold" onClick={() => setState("error")}>
            状态
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {state === "loading" ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton variant="list" />
            <Skeleton variant="card" />
          </>
        ) : null}

        {state === "error" ? (
          <ErrorState title="认证状态同步失败" code="AGENT_CERT_SYNC" description="可重试刷新审核、证件 OCR 和门店权限状态。" onRetry={retry} />
        ) : null}

        {state === "empty" ? (
          <EmptyState title="暂无申请记录" description="开始认证后，可维护楼盘、接收精准客源并展示信用徽章。" actionLabel="开始 L1 认证" onAction={() => setState("ready")} />
        ) : null}

        {state === "ready" ? (
          <>
            <StatusCard status={certStatus} userName={user?.name ?? "林女士"} agentLevel={agent?.level ?? "L2"} onVerify={() => setCertStatus("verified")} />

            <Card>
              <div className="flex items-start justify-between gap-4">
                <Stepper steps={stepperSteps} />
                <div className="rounded-xl bg-primary-100 px-3 py-2 text-right text-caption text-primary-700">
                  当前步骤
                  <p className="font-semibold">{stepLabels[currentStep]}</p>
                </div>
              </div>
            </Card>

            <Card header={<SectionTitle icon={ClipboardCheck} title="权益与权限状态" subtitle="当前 L2 列高亮，L3 满足信用条件后自动升级" />}>
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-neutral-100 text-caption font-semibold text-neutral-700">
                  <span className="p-2">权益</span>
                  <span className="p-2 text-center">L1</span>
                  <span className="bg-primary-100 p-2 text-center text-primary-700">L2</span>
                  <span className="p-2 text-center">L3</span>
                </div>
                {permissionRows.map((row) => (
                  <div key={row.name} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] border-t border-neutral-200 text-body-s">
                    <span className="p-2 text-neutral-700">{row.name}</span>
                    <PermissionCell enabled={row.l1} />
                    <PermissionCell enabled={row.l2} active />
                    <PermissionCell enabled={row.l3} />
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionTitle icon={IdCard} title="5 步认证材料" subtitle="身份、资质、门店、信用授权、提交" />}>
              <div className="space-y-4">
                <StepPanel step={currentStep} onChangeStep={setCurrentStep} creditAuthorized={creditAuthorized} setCreditAuthorized={setCreditAuthorized} />
                <div className="space-y-3">
                  {uploads.map((upload) => (
                    <UploadPlaceholder key={upload.id} upload={upload} onUpload={() => setUploadStatus(upload.id)} />
                  ))}
                </div>
              </div>
            </Card>

            <Card header={<SectionTitle icon={ShieldCheck} title="审核中状态" subtitle="提交后仍可关闭页面，结果通过 Push 通知" />}>
              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Hourglass className="size-5 shrink-0 text-semantic-info" />
                  <div>
                    <h2 className="text-h3">L2 执业资质审核中</h2>
                    <p className="mt-1 text-body-s text-neutral-700">资格证号已进入资质数据库核验，预计 1-3 个工作日完成。审核期间可查看资料，不可接收 P1 客源。</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </section>

      {state === "ready" ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-4">
          <Button className="w-full" onClick={submitReview}>
            提交认证材料
          </Button>
        </div>
      ) : null}

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function StatusCard({
  status,
  userName,
  agentLevel,
  onVerify,
}: {
  status: CertStatus;
  userName: string;
  agentLevel: string;
  onVerify: () => void;
}) {
  const config = {
    not_started: {
      className: "bg-neutral-200 text-neutral-900",
      title: "未完成经纪人认证",
      description: "认证后可维护楼盘、接收精准客源并展示信用徽章。",
    },
    reviewing: {
      className: "bg-blue-50 text-primary-700",
      title: `${agentLevel} 执业认证审核中`,
      description: "L2 材料已提交，预计 1-3 个工作日完成。",
    },
    verified: {
      className: "bg-green-50 text-semantic-success",
      title: `${agentLevel} 执业认证已通过`,
      description: "2026-06-20 认证，可维护楼盘并接收 P1 客源。",
    },
  }[status];

  return (
    <section className={cn("rounded-2xl p-4", config.className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption opacity-80">{userName} 的认证状态</p>
          <h2 className="mt-1 text-h2">{config.title}</h2>
          <p className="mt-2 text-body-s">{config.description}</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/70">
          {status === "verified" ? <BadgeCheck className="size-7" /> : <FileText className="size-7" />}
        </div>
      </div>
      {status !== "verified" ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onVerify}>
          模拟审核通过
        </Button>
      ) : null}
    </section>
  );
}

function PermissionCell({ enabled, active = false }: { enabled: boolean; active?: boolean }) {
  return (
    <span className={cn("flex items-center justify-center p-2", active && "bg-primary-100")}>
      {enabled ? <CheckCircle2 className="size-4 text-semantic-success" /> : <LockKeyhole className="size-4 text-neutral-500" />}
    </span>
  );
}

function StepPanel({
  step,
  onChangeStep,
  creditAuthorized,
  setCreditAuthorized,
}: {
  step: CertStep;
  onChangeStep: (step: CertStep) => void;
  creditAuthorized: boolean;
  setCreditAuthorized: (value: boolean) => void;
}) {
  const panel = [
    {
      icon: IdCard,
      title: "身份核验",
      body: "手机号已验证，身份证正反面已完成 OCR，活体动作检测待第三方 SDK 回调。",
    },
    {
      icon: FileText,
      title: "执业资质",
      body: "上传从业资格证，系统识别证件号并调用资质数据库核验。",
    },
    {
      icon: Building2,
      title: "门店信息",
      body: "填写所属门店、门店统一社会信用代码和在职证明。",
    },
    {
      icon: Fingerprint,
      title: "信用授权",
      body: "授权平台读取合规交易、楼盘维护和纠纷处理记录，用于生成信用档案。",
    },
    {
      icon: ClipboardCheck,
      title: "提交审核",
      body: "确认材料无误后提交，审核中可继续保存补充材料。",
    },
  ][step];
  const Icon = panel.icon;

  return (
    <div className="rounded-xl bg-neutral-100 p-4">
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-h3">{panel.title}</h3>
          <p className="mt-1 text-body-s text-neutral-600">{panel.body}</p>
        </div>
      </div>

      {step === 2 ? (
        <div className="mt-4 grid grid-cols-1 gap-3">
          <Input label="所属门店" defaultValue="中关村安心门店" />
          <Input label="门店信用代码" defaultValue="91110108MA01FORI26" />
        </div>
      ) : null}

      {step === 3 ? (
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-white p-3 text-body-s text-neutral-700">
          <input className="mt-1" type="checkbox" checked={creditAuthorized} onChange={(event) => setCreditAuthorized(event.target.checked)} />
          <span>我授权 Fori 在认证范围内读取信用、交易和投诉处理记录，用于经纪人信用档案。</span>
        </label>
      ) : null}

      <div className="mt-4 grid grid-cols-5 gap-2">
        {stepLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className={cn("rounded-lg px-2 py-2 text-caption", index === step ? "bg-primary-500 text-white" : "bg-white text-neutral-600")}
            onClick={() => onChangeStep(index as CertStep)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadPlaceholder({ upload, onUpload }: { upload: UploadSlot; onUpload: () => void }) {
  const statusText = upload.status === "uploaded" ? "已上传" : upload.status === "reviewing" ? "审核中" : "待上传";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-white p-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        {upload.status === "waiting" ? <UploadCloud className="size-6" /> : upload.status === "reviewing" ? <Hourglass className="size-6" /> : <Camera className="size-6" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-body-s font-semibold text-neutral-900">{upload.label}</h3>
        <p className="text-caption text-neutral-500">{upload.description}</p>
      </div>
      <Button size="sm" variant={upload.status === "waiting" ? "primary" : "secondary"} onClick={onUpload}>
        {statusText}
      </Button>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof FileText;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-h3">{title}</h2>
        {subtitle ? <p className="text-caption text-neutral-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
