"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Home,
  Landmark,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AgentAssistFab } from "@/components/AgentAssistFab";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Toast } from "@/components/Toast";
import { mockAgents, mockListings, mockTransactions, mockUsers } from "@/lib/mock";
import { cn } from "@/lib/utils";

type FlowStatus = "done" | "current" | "pending";
type TransactionStep = {
  id: string;
  label: string;
  description: string;
  timestamp?: string;
  status: FlowStatus;
  owner: "买家" | "卖家" | "经纪人" | "平台";
  action?: string;
  document?: string;
  materials: string[];
  windowInfo?: string;
};

type Party = {
  role: string;
  name: string;
  description: string;
  verified: boolean;
};

const steps: TransactionStep[] = [
  {
    id: "contract",
    label: "签约",
    description: "买卖双方已确认合同核心条款，电子签章完成。",
    timestamp: "2026-06-27 14:32",
    status: "done",
    owner: "平台",
    document: "查看合同",
    materials: ["购房意向书", "买卖双方实名信息", "合同版本 v3"],
  },
  {
    id: "deposit",
    label: "定金",
    description: "定金已进入资金监管账户，平台完成入账核验。",
    timestamp: "2026-06-28 10:15",
    status: "done",
    owner: "买家",
    document: "查看监管流水",
    materials: ["监管账户回单", "定金支付凭证"],
  },
  {
    id: "loan",
    label: "贷款",
    description: "银行正在复核收入证明和征信授权，预计 1 个工作日内反馈。",
    status: "current",
    owner: "买家",
    action: "上传补充流水",
    document: "查看进度",
    materials: ["收入证明", "银行流水", "征信授权书"],
    windowInfo: "招商银行中关村支行 · 工作日 09:00-17:00",
  },
  {
    id: "transfer",
    label: "过户",
    description: "贷款批复后预约不动产登记中心提交过户材料。",
    status: "pending",
    owner: "经纪人",
    materials: ["网签合同", "完税凭证", "买卖双方身份证明"],
    windowInfo: "海淀不动产登记中心 · 需提前 2 天预约",
  },
  {
    id: "handover",
    label: "交房",
    description: "完成物业、水电燃气和钥匙交接，上传交割确认单。",
    status: "pending",
    owner: "卖家",
    materials: ["物业结清单", "水电燃气读数", "钥匙交接单"],
  },
  {
    id: "done",
    label: "完成",
    description: "交易完成后自动归档合同、流水、过户凭证和公证存证。",
    status: "pending",
    owner: "平台",
    materials: ["电子存证证书", "资金释放确认", "交易评价"],
  },
];

const riskTips = [
  "贷款步骤超过 48 小时未反馈时，平台将自动提醒经纪人跟进。",
  "资金监管账户未确认前，请勿线下转账或补签私下协议。",
  "过户材料如被驳回，将回到当前步骤并列出逐项修复要求。",
];

const revenueTotal = 60000;
const revenueShares = [
  { label: "经纪人服务池", amount: 48000, percent: 80, receiver: "主成交经纪人 + 带看协作", tone: "bg-blue-500" },
  { label: "平台运营", amount: 9000, percent: 15, receiver: "Fori 平台", tone: "bg-emerald-500" },
  { label: "字典贡献奖励", amount: 3000, percent: 5, receiver: "首建者与团队维护者", tone: "bg-secondary-500", expandable: true },
];
const informationShareChildren = [
  { label: "首建者", amount: 1200, percent: 40, receiver: "李建国" },
  { label: "团队维护者", amount: 900, percent: 30, receiver: "王芳" },
  { label: "团队维护者", amount: 900, percent: 30, receiver: "张明" },
];

export default function TransactionPage() {
  const [expandedStep, setExpandedStep] = useState("loan");
  const [revenueExpanded, setRevenueExpanded] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const transaction = mockTransactions[0];
  const listing = mockListings.find((item) => item.id === transaction?.listingId) ?? mockListings[0];
  const agent = mockAgents.find((item) => item.id === transaction?.agentId) ?? mockAgents[0];
  const seller = mockUsers.find((item) => item.id === transaction?.sellerId) ?? mockUsers[0];
  const currentStep = steps.find((step) => step.status === "current") ?? steps[0];

  const parties: Party[] = useMemo(
    () => [
      { role: "买家", name: "陈先生", description: "实名买家 · 贷款材料待补充", verified: true },
      { role: "卖家", name: seller?.name ?? "林女士", description: seller?.phoneMasked ?? "已完成实名核验", verified: true },
      { role: "经纪人", name: agent?.displayName ?? "张明", description: `${agent?.level ?? "L2"} 认证 · ${agent?.storeName ?? "安心门店"}`, verified: true },
    ],
    [agent, seller],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mobile-shell pb-28">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">全链路合规交易</p>
            <h1 className="truncate text-h3">交易流程</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={() => showToast("纠纷入口与更多操作占位")} aria-label="更多">
            <MoreHorizontal className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-primary-900 p-4 text-white">
          <div className="flex gap-3">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Home className="size-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-s text-primary-100">{listing?.communityName ?? "中关村小区"}</p>
              <h2 className="mt-1 line-clamp-2 text-h2">{listing?.title ?? "中关村科技园精装三居"}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-caption font-semibold text-primary-700">当前：{currentStep.label}</span>
                <span className="price-nums text-h2">¥ {listing?.priceWan ?? 280}万</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-body-s">
            <InfoPill label="交易编号" value="FO-2026-001234" />
            <InfoPill label="资金监管" value="已开启" />
          </div>
        </section>

        <Card header={<SectionTitle icon={Clock3} title="交易进度时间线" subtitle="签约到完成全流程可追踪" />}>
          <div className="space-y-1">
            {steps.map((step, index) => (
              <TimelineStep key={step.id} step={step} index={index} expanded={expandedStep === step.id} onToggle={() => setExpandedStep((current) => (current === step.id ? "" : step.id))} />
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={FileCheck2} title="下一步操作" subtitle={`责任方：${currentStep.owner}`} />}>
          <div className="rounded-xl bg-blue-50 p-4">
            <h2 className="text-h3 text-primary-700">{currentStep.label}进行中</h2>
            <p className="mt-2 text-body-s text-neutral-700">{currentStep.description}</p>
            <Button className="mt-4 w-full" onClick={() => showToast("已进入材料上传占位流程")}>
              {currentStep.action ?? "查看当前进度"}
            </Button>
          </div>
        </Card>

        <Card header={<SectionTitle icon={UserRound} title="参与方信息" subtitle="仅展示关联交易成员" />}>
          <div className="space-y-3">
            {parties.map((party) => (
              <div key={party.role} className="flex items-center gap-3 rounded-xl bg-neutral-100 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white">
                  <UserRound className="size-5 text-primary-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-body-s font-semibold text-neutral-900">{party.role} · {party.name}</h3>
                    {party.verified ? <BadgeCheck className="size-4 text-semantic-success" /> : null}
                  </div>
                  <p className="truncate text-caption text-neutral-500">{party.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={Banknote} title="税费与资金监管" subtitle="金额按当前合同价预估" />}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <FeeBox label="契税" value="2.8万" />
            <FeeBox label="增值税" value="0元" />
            <FeeBox label="个税" value="1.4万" />
          </div>
          <div className="mt-3 rounded-xl bg-green-50 p-3 text-body-s text-semantic-success">
            <ShieldCheck className="mr-2 inline size-4" />
            资金进入银行监管账户后，过户完成前不会释放给卖方。
          </div>
        </Card>

        <Card header={<SectionTitle icon={Banknote} title="收益分成" subtitle="成交价 300 万 · 佣金 2% · 按 80% 经纪人 / 15% 平台 / 5% 字典贡献展示" />}>
          <div className="rounded-xl bg-neutral-100 p-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-caption text-neutral-500">成交服务费</p>
                <p className="price-nums text-h2">¥{revenueTotal.toLocaleString("zh-CN")}</p>
              </div>
              <div className="text-right text-caption text-neutral-500">
                <p>经纪人 80% · 平台 15%</p>
                <p>字典贡献 5%</p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            {revenueShares.map((share) => (
              <div key={share.label} className="rounded-xl border border-neutral-200 p-3">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => share.expandable && setRevenueExpanded((value) => !value)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-s font-semibold">{share.label}</p>
                      <p className="mt-1 text-caption text-neutral-500">{share.receiver}</p>
                    </div>
                    <p className="price-nums text-body-s font-semibold">¥{share.amount.toLocaleString("zh-CN")} · {share.percent}%</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full ${share.tone}`} style={{ width: `${Math.max(share.percent, 5)}%` }} />
                  </div>
                </button>
                {share.expandable && revenueExpanded ? (
                  <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3">
                    {informationShareChildren.map((child) => (
                      <div key={`${child.label}-${child.receiver}`} className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-caption">
                        <span>{child.label} · {child.receiver}</span>
                        <span className="font-semibold">¥{child.amount.toLocaleString("zh-CN")} · {child.percent}%</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={ShieldAlert} title="风险提示" subtitle="异常状态将回到当前节点处理" />}>
          <div className="space-y-2">
            {riskTips.map((tip) => (
              <div key={tip} className="flex gap-2 rounded-xl bg-amber-50 p-3 text-body-s text-amber-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white p-4">
        <div className="flex gap-3">
          <Button variant="secondary" className="w-28" onClick={() => showToast("已打开交易消息占位")}>
            联系
          </Button>
          <Button className="flex-1" onClick={() => showToast("已进入下一步操作占位")}>
            {currentStep.action ?? "推进下一步"}
          </Button>
        </div>
      </div>

      {toast ? <Toast title={toast} /> : null}
      <AgentAssistFab
        pageContext="交易流程与分成结算"
        suggestedPrompts={["帮我确认税费", "下一步需要做什么？", "分成计算有问题吗？"]}
      />
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-caption text-primary-200">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Clock3; title: string; subtitle: string }) {
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

function TimelineStep({ step, index, expanded, onToggle }: { step: TransactionStep; index: number; expanded: boolean; onToggle: () => void }) {
  const statusClass = {
    done: "bg-semantic-success text-white",
    current: "bg-primary-600 text-white ring-4 ring-primary-100",
    pending: "border border-neutral-300 bg-white text-neutral-400",
  }[step.status];

  return (
    <button type="button" className="w-full text-left" onClick={onToggle}>
      <div className="grid grid-cols-[32px_1fr] gap-3">
        <div className="flex flex-col items-center">
          <div className={cn("flex size-8 items-center justify-center rounded-full", statusClass)}>
            {step.status === "done" ? <CheckCircle2 className="size-5" /> : step.status === "current" ? <Clock3 className="size-5" /> : index + 1}
          </div>
          {index < steps.length - 1 ? <div className={cn("h-full min-h-8 w-px", step.status === "done" ? "bg-semantic-success" : "bg-neutral-200")} /> : null}
        </div>
        <div className={cn("mb-3 rounded-xl p-3", step.status === "current" ? "bg-blue-50" : "bg-neutral-100")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-body-s font-semibold text-neutral-900">{index + 1}. {step.label}</h3>
              <p className="text-caption text-neutral-500">{step.timestamp ?? (step.status === "current" ? "进行中" : "待处理")}</p>
            </div>
            {step.document ? <span className="text-caption font-semibold text-primary-700">{step.document}</span> : null}
          </div>
          {expanded ? (
            <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-body-s text-neutral-700">
              <p>{step.description}</p>
              <p>当前责任：{step.owner}{step.action ? ` · ${step.action}` : " · 等待流程推进"}</p>
              <div className="flex flex-wrap gap-2">
                {step.materials.map((material) => (
                  <span key={material} className="rounded-full bg-white px-2 py-1 text-caption text-neutral-600">{material}</span>
                ))}
              </div>
              {step.windowInfo ? (
                <p className="flex gap-1 text-caption text-neutral-500">
                  <Landmark className="size-4 shrink-0" />
                  {step.windowInfo}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function FeeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <p className="text-caption text-neutral-500">{label}</p>
      <p className="price-nums mt-1 text-body-s font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
