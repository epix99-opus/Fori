"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  Fingerprint,
  Gavel,
  Link2,
  RefreshCcw,
  Share2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Toast } from "@/components/Toast";
import { mockListings, mockTransactions } from "@/lib/mock";

type VerificationState = "valid" | "checking" | "failed";
type EvidenceFile = {
  id: string;
  name: string;
  hash: string;
  timestamp: string;
  blockchainTxId: string;
  status: VerificationState;
};

const evidenceFiles: EvidenceFile[] = [
  {
    id: "contract",
    name: "合同原文哈希",
    hash: "sha256: 0f4e9b6d8c3a5e21b7a9f2d4c0a91e7b12d8a40f3c9e6a5d1b7f8c22e5a0b19c",
    timestamp: "2026-07-01T15:32:01+08:00",
    blockchainTxId: "0x7a91f0b2c4e68913d45c2f890aab7cbb6de9204c5f1a827e9c8f336b42d18a20",
    status: "valid",
  },
  {
    id: "sign",
    name: "买卖双方签名时间戳",
    hash: "sha256: 8d3b7c3e0f22a94b1f5e91876ad40a7fdd6cbd9014f18b82a0e9c51f7b671e28",
    timestamp: "2026-07-01T15:34:18+08:00",
    blockchainTxId: "0x1f6d772e9bb40d817935b9f9283e2b101a2dc016f4e8efba04c8701d8f7c6a91",
    status: "valid",
  },
  {
    id: "credit",
    name: "经纪人信用档案快照",
    hash: "sha256: 45b0d7112d670eb5c8e3ab9d1a30f6ec2a02d13e9791cbd0d5fc5cc6a917d4ef",
    timestamp: "2026-07-01T15:35:42+08:00",
    blockchainTxId: "0x9de23bcde47219db7312ef28a8f90bbef70aee86dd35fd4b2b78b95fe857c006",
    status: "checking",
  },
  {
    id: "escrow",
    name: "资金监管流水编号",
    hash: "sha256: c21b43133d74bc5a9c0cc6bc19503177fd409e22d93fba3e051f85779b6f3a90",
    timestamp: "2026-07-01T15:38:09+08:00",
    blockchainTxId: "0x3c88f094f144739ac7c76090c7c6dd24a21fdd7b58481e88e997c119af05a0ba",
    status: "valid",
  },
  {
    id: "transfer",
    name: "过户完成凭证哈希",
    hash: "sha256: 待交易完成后自动写入",
    timestamp: "待归档",
    blockchainTxId: "待上链",
    status: "checking",
  },
];

export default function EvidencePage() {
  const [verification, setVerification] = useState<VerificationState>("valid");
  const [selectedFile, setSelectedFile] = useState(evidenceFiles[0]);
  const [toast, setToast] = useState<string | null>(null);

  const transaction = mockTransactions[0];
  const listing = mockListings.find((item) => item.id === transaction?.listingId) ?? mockListings[0];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function recheck() {
    setVerification("checking");
    window.setTimeout(() => {
      setVerification("valid");
      showToast("验签完成，证书状态有效");
    }, 900);
  }

  return (
    <main className="mobile-shell pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/transaction/txn-001" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" aria-label="返回">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-caption text-neutral-500">第三方公证存证</p>
            <h1 className="truncate text-h3">电子存证证书</h1>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl bg-neutral-100" onClick={recheck} aria-label="重新验签">
            <RefreshCcw className="size-5" />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <section className="overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-sm">
          <div className="bg-primary-900 px-4 py-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
                  <Gavel className="size-7" />
                </div>
                <div>
                  <p className="text-caption text-primary-200">中信公证处 · Fori 合规链</p>
                  <h2 className="text-h2">电子存证证书</h2>
                </div>
              </div>
              <StatusBadge state={verification} />
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <CertificateField label="存证编号" value="ZC-2026-BJ-00012345" />
              <CertificateField label="交易编号" value="FO-2026-001234" />
              <CertificateField label="房源摘要" value={`${listing?.communityName ?? "中关村小区"} · ¥${listing?.priceWan ?? 280}万`} />
              <CertificateField label="当事人" value="陈** / 林** / 张*" />
            </div>
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-caption text-neutral-500">内容哈希值 SHA-256</p>
              <p className="mt-1 break-all font-mono text-caption text-neutral-900">0f4e9b6d8c3a5e21b7a9f2d4c0a91e7b12d8a40f3c9e6a5d1b7f8c22e5a0b19c</p>
            </div>
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-caption text-neutral-500">RFC 3161 时间戳</p>
              <p className="price-nums mt-1 text-body-s font-semibold text-neutral-900">2026-07-01T15:32:01+08:00</p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 p-3">
              <div>
                <p className="text-caption text-primary-700">公证机构数字签名</p>
                <p className="font-mono text-caption text-neutral-700">MEUCIQD8...b91a</p>
              </div>
              <button type="button" className="text-caption font-semibold text-primary-700" onClick={() => showToast("完整签名查看占位")}>
                查看完整签名
              </button>
            </div>
          </div>
        </section>

        <Card header={<SectionTitle icon={FileArchive} title="存证文件列表" subtitle="每项材料独立哈希、时间戳和链上 TxID" />}>
          <div className="space-y-3">
            {evidenceFiles.map((file) => (
              <button key={file.id} type="button" className="w-full rounded-xl bg-neutral-100 p-3 text-left" onClick={() => setSelectedFile(file)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-s font-semibold text-neutral-900">{file.name}</h3>
                      <FileStatus state={file.status} />
                    </div>
                    <p className="mt-1 truncate font-mono text-caption text-neutral-500">{file.hash}</p>
                    <p className="mt-1 truncate font-mono text-caption text-neutral-500">TxID {file.blockchainTxId}</p>
                  </div>
                  <ExternalLink className="size-4 shrink-0 text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card header={<SectionTitle icon={Fingerprint} title="存证详情" subtitle={selectedFile.name} />}>
          <div className="space-y-3 text-body-s">
            <DetailRow label="哈希值" value={selectedFile.hash} mono />
            <DetailRow label="时间戳" value={selectedFile.timestamp} />
            <DetailRow label="区块链 TxID" value={selectedFile.blockchainTxId} mono />
            <Button variant="secondary" className="w-full" onClick={() => showToast("哈希值已复制到剪贴板占位")}>
              <Copy className="size-4" />
              复制哈希
            </Button>
          </div>
        </Card>

        <Card header={<SectionTitle icon={ShieldCheck} title="永久性说明" subtitle="三重备份和只读脱敏分享" />}>
          <p className="text-body-s text-neutral-700">本存证数据三重备份，永久保存，依据《电子签名法》可作为法律凭证。分享链接仅展示脱敏摘要与验签状态。</p>
        </Card>

        <section className="grid grid-cols-3 gap-3">
          <ActionButton icon={Download} label="下载PDF" onClick={() => showToast("下载存证证书 PDF 占位")} />
          <ActionButton icon={Share2} label="分享" onClick={() => showToast("只读分享链接生成占位")} />
          <ActionButton icon={Link2} label="申请纠纷" onClick={() => showToast("纠纷申请入口占位")} />
        </section>
      </section>

      {toast ? <Toast title={toast} /> : null}
    </main>
  );
}

function CertificateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <p className="text-caption text-neutral-500">{label}</p>
      <p className="mt-1 text-body-s font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof FileArchive; title: string; subtitle: string }) {
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

function StatusBadge({ state }: { state: VerificationState }) {
  const label = state === "valid" ? "验签有效" : state === "checking" ? "验签中" : "验签失败";
  return <span className="rounded-full bg-white px-3 py-1 text-caption font-semibold text-primary-700">{label}</span>;
}

function FileStatus({ state }: { state: VerificationState }) {
  if (state === "valid") {
    return <CheckCircle2 className="size-4 text-semantic-success" />;
  }
  if (state === "checking") {
    return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-caption text-primary-700">验签中</span>;
  }
  return <span className="rounded-full bg-red-50 px-2 py-0.5 text-caption text-semantic-danger">失败</span>;
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-3">
      <p className="text-caption text-neutral-500">{label}</p>
      <p className={mono ? "mt-1 break-all font-mono text-caption text-neutral-900" : "mt-1 text-body-s font-semibold text-neutral-900"}>{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Download; label: string; onClick: () => void }) {
  return (
    <button type="button" className="rounded-xl bg-white p-3 text-center shadow-sm" onClick={onClick}>
      <Icon className="mx-auto size-5 text-primary-700" />
      <span className="mt-2 block text-caption font-semibold text-neutral-700">{label}</span>
    </button>
  );
}
