"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  GitCompareArrows,
  Lock,
  Plus,
  Save,
  Send,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Stepper, type StepperStep } from "@/components/Stepper";
import { Toast } from "@/components/Toast";
import { mockAgents, mockListings } from "@/lib/mock";
import { cn } from "@/lib/utils";

type DictEditPageProps = {
  params: {
    communityId: string;
  };
};

type SaveState = "idle" | "saving" | "submitted";
type QualityGrade = "A" | "B" | "C" | "D";

type CommunityForm = {
  name: string;
  address: string;
  developer: string;
  propertyCompany: string;
  completedYear: string;
  propertyFee: string;
  plotRatio: string;
  greenRate: string;
  parkingRatio: string;
  totalBuildings: string;
  totalHomes: string;
  grade: QualityGrade;
  gradeReason: string;
};

type BuildingForm = {
  id: string;
  name: string;
  floors: string;
  units: string;
  type: string;
  elevator: string;
};

const baseListing = mockListings[0];

const initialForm: CommunityForm = {
  name: baseListing?.communityName ?? "中关村小区",
  address: baseListing?.address ?? "中关村南路 18 号",
  developer: "北京城市建设开发",
  propertyCompany: "安心物业服务",
  completedYear: "2010",
  propertyFee: "4.8 元/㎡/月",
  plotRatio: "2.60",
  greenRate: "32%",
  parkingRatio: "1:0.8",
  totalBuildings: "12",
  totalHomes: "1480",
  grade: "A",
  gradeReason: "地段成熟、核验数据完整、成交流动性高。",
};

const initialBuildings: BuildingForm[] = [
  { id: "building-1", name: "1 号楼", floors: "18", units: "3", type: "板楼", elevator: "有电梯" },
  { id: "building-2", name: "2 号楼", floors: "24", units: "2", type: "塔楼", elevator: "有电梯" },
];

const facilities = ["地铁", "学区", "商场", "医院", "游泳池", "健身房"];

export default function DictEditPage({ params }: DictEditPageProps) {
  const [authorized, setAuthorized] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<CommunityForm>(initialForm);
  const [buildings, setBuildings] = useState<BuildingForm[]>(initialBuildings);
  const [selectedFacilities, setSelectedFacilities] = useState(["地铁", "学区", "商场"]);

  const currentAgent = mockAgents[0];
  const collaboratorCount = 5;

  const steps: StepperStep[] = useMemo(
    () =>
      ["基础信息", "物业配置", "地理位置", "层级评定"].map((label, index) => ({
        label,
        status: index < activeStep ? "complete" : index === activeStep ? "current" : "pending",
      })),
    [activeStep],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function updateForm<Key extends keyof CommunityForm>(key: Key, value: CommunityForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateBuilding(id: string, key: keyof BuildingForm, value: string) {
    setBuildings((current) => current.map((building) => (building.id === id ? { ...building, [key]: value } : building)));
  }

  function saveDraft() {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("idle");
      showToast("草稿已保存");
    }, 650);
  }

  function submitForReview() {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("submitted");
      showToast("提交成功，进入核验队列");
    }, 750);
  }

  if (!authorized) {
    return (
      <main className="mobile-shell flex min-h-dvh flex-col bg-neutral-100">
        <EditHeader communityId={params.communityId} />
        <section className="flex flex-1 items-center px-4">
          <div className="w-full rounded-xl bg-white p-6 text-center shadow-card">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <Lock className="size-7" />
            </div>
            <h1 className="mt-4 text-h2">非认证经纪人不可编辑</h1>
            <p className="mt-2 text-body-s text-neutral-500">
              楼盘字典共建需要 L2+ 认证经纪人或门店管理员权限。游客和普通用户可浏览基础字段并提交纠错建议。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setAuthorized(true)}>
                切换认证演示
              </Button>
              <Button>去认证</Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-shell bg-neutral-100 pb-28">
      <EditHeader communityId={params.communityId} />

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-900 shadow-card">
          <div className="flex items-start gap-2">
            <Clock3 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-body-s font-semibold">当前版本 v12 · 由张明于 3 小时前更新</p>
              <p className="mt-1 text-caption">当前 {collaboratorCount} 人共同维护，{currentAgent?.displayName ?? "认证经纪人"} 正在编辑物业配置。</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-caption text-neutral-500">编辑进度</p>
              <h1 className="text-h2">维护楼盘字典</h1>
            </div>
            <button type="button" className="rounded-full bg-neutral-100 px-3 py-2 text-caption font-semibold text-neutral-700" onClick={() => setAuthorized(false)}>
              权限演示
            </button>
          </div>
          <div className="mt-4">
            <Stepper steps={steps} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => (
            <button
              key={step.label}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-caption font-semibold",
                activeStep === index ? "bg-primary-700 text-white" : "bg-white text-neutral-700 shadow-card",
              )}
              onClick={() => setActiveStep(index)}
            >
              {index + 1}. {step.label}
            </button>
          ))}
        </div>

        {activeStep === 0 ? (
          <section className="space-y-4 rounded-xl bg-white p-4 shadow-card">
            <SectionTitle title="小区基础信息" description="小区名会做去重校验，必填字段用于版本提交。" />
            <Input label="小区名称" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
            <Input label="地址" value={form.address} onChange={(event) => updateForm("address", event.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="开发商" value={form.developer} onChange={(event) => updateForm("developer", event.target.value)} />
              <Input label="物业公司" value={form.propertyCompany} onChange={(event) => updateForm("propertyCompany", event.target.value)} />
              <Input label="竣工年份" value={form.completedYear} inputMode="numeric" onChange={(event) => updateForm("completedYear", event.target.value)} />
              <Input label="总楼栋数" value={form.totalBuildings} inputMode="numeric" onChange={(event) => updateForm("totalBuildings", event.target.value)} />
            </div>
            <Input label="总户数" value={form.totalHomes} inputMode="numeric" onChange={(event) => updateForm("totalHomes", event.target.value)} />
          </section>
        ) : null}

        {activeStep === 1 ? (
          <section className="space-y-4 rounded-xl bg-white p-4 shadow-card">
            <SectionTitle title="物业配置" description="录入容积率、绿化率、物业费和配套设施。" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="物业费" value={form.propertyFee} onChange={(event) => updateForm("propertyFee", event.target.value)} />
              <Input label="容积率" value={form.plotRatio} inputMode="decimal" onChange={(event) => updateForm("plotRatio", event.target.value)} />
              <Input label="绿化率" value={form.greenRate} onChange={(event) => updateForm("greenRate", event.target.value)} />
              <Input label="车位比" value={form.parkingRatio} onChange={(event) => updateForm("parkingRatio", event.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-body-s font-semibold">配套设施</p>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => {
                  const active = selectedFacilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      className={cn("rounded-full px-3 py-2 text-caption font-semibold", active ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700")}
                      onClick={() =>
                        setSelectedFacilities((current) =>
                          current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility],
                        )
                      }
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {activeStep === 2 ? (
          <section className="space-y-4 rounded-xl bg-white p-4 shadow-card">
            <SectionTitle title="地理位置与楼栋" description="确认地图门口坐标，并维护楼栋基础字段。" />
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-body-s font-semibold">地图 Pin 确认</p>
              <div className="mt-3 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 via-white to-blue-100 text-caption font-semibold text-primary-700">
                高德地图缩略图 · 可拖动 Pin
              </div>
              <p className="mt-2 text-caption text-neutral-500">系统匹配片区：海淀 · 中关村</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-h3">楼栋信息编辑</h2>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setBuildings((current) => [
                      ...current,
                      { id: `building-${current.length + 1}`, name: `${current.length + 1} 号楼`, floors: "18", units: "2", type: "板楼", elevator: "有电梯" },
                    ])
                  }
                >
                  <Plus className="mr-1 size-4" />
                  新增
                </Button>
              </div>
              {buildings.map((building) => (
                <div key={building.id} className="space-y-3 rounded-xl border border-neutral-200 p-3">
                  <Input label="楼栋号" value={building.name} onChange={(event) => updateBuilding(building.id, "name", event.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="层数" value={building.floors} inputMode="numeric" onChange={(event) => updateBuilding(building.id, "floors", event.target.value)} />
                    <Input label="单元数" value={building.units} inputMode="numeric" onChange={(event) => updateBuilding(building.id, "units", event.target.value)} />
                    <Input label="建筑类型" value={building.type} onChange={(event) => updateBuilding(building.id, "type", event.target.value)} />
                    <Input label="电梯" value={building.elevator} onChange={(event) => updateBuilding(building.id, "elevator", event.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeStep === 3 ? (
          <section className="space-y-4 rounded-xl bg-white p-4 shadow-card">
            <SectionTitle title="层级评定" description="AI 给出建议层级，经纪人可覆盖并说明理由。" />
            <div className="rounded-xl bg-primary-100 p-3 text-primary-900">
              <p className="text-body-s font-semibold">AI 建议：A 级</p>
              <p className="mt-1 text-caption">交通、成交活跃度和数据完整度得分均高于片区均值。</p>
            </div>
            <div>
              <p className="mb-2 text-body-s font-semibold">人工层级</p>
              <div className="grid grid-cols-4 gap-2">
                {(["A", "B", "C", "D"] as QualityGrade[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    className={cn("rounded-xl px-3 py-3 text-body-s font-bold", form.grade === grade ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700")}
                    onClick={() => updateForm("grade", grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="text-body-s font-semibold">调整理由</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-body-s outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={form.gradeReason}
                onChange={(event) => updateForm("gradeReason", event.target.value)}
              />
            </label>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="flex items-center gap-2 text-body-s font-semibold">
                <GitCompareArrows className="size-4" />
                提交前差异检查
              </p>
              <p className="mt-1 text-caption">绿化率、车位比、楼栋 2 个字段较 v12 有更新，提交后进入核验队列。</p>
            </div>
          </section>
        ) : null}
      </section>

      <footer className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-neutral-200 bg-white px-4 pt-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-caption text-neutral-600">
          <UsersRound className="size-4" />
          {collaboratorCount} 人正在协同维护，系统会在提交时检测版本冲突。
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" loading={saveState === "saving"} onClick={saveDraft}>
            <Save className="mr-1 size-4" />
            保存草稿
          </Button>
          <Button loading={saveState === "saving"} onClick={submitForReview}>
            <Send className="mr-1 size-4" />
            提交核验
          </Button>
        </div>
      </footer>

      {saveState === "submitted" ? (
        <div className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-[390px] rounded-xl border border-emerald-100 bg-white p-3 text-body-s shadow-card">
          <p className="font-semibold text-semantic-success">提交成功，核验中</p>
          <p className="mt-1 text-caption text-neutral-500">维护积分 +8，版本 v13 已生成待审核记录。</p>
        </div>
      ) : null}

      {toast ? <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-[390px] px-4"><Toast type="success" title={toast} /></div> : null}
    </main>
  );
}

function EditHeader({ communityId }: { communityId: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Link href="/explore/dict" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900" aria-label="返回楼盘字典">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-h3">维护楼盘字典</h1>
          <p className="truncate text-caption text-neutral-500">社区 ID：{communityId}</p>
        </div>
        <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700" aria-label="历史版本">
          <Clock3 className="size-5" />
        </button>
      </div>
    </header>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-5 text-primary-700" />
        <h2 className="text-h3">{title}</h2>
      </div>
      <p className="mt-1 text-caption text-neutral-500">{description}</p>
    </div>
  );
}
