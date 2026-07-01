"use client";

import * as React from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "warning" | "info";

const toneStyles: Record<ToastTone, string> = {
  success: "bg-semantic-success text-white",
  error: "bg-semantic-danger text-white",
  warning: "bg-semantic-warning text-white",
  info: "bg-semantic-info text-white",
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

export function Toast({
  tone = "info",
  title,
  description,
  className,
}: {
  tone?: ToastTone;
  title: string;
  description?: string;
  className?: string;
}) {
  const Icon = icons[tone];

  return (
    <div
      role="status"
      className={cn(
        "flex min-h-12 w-full max-w-[343px] items-start gap-2 rounded-md px-4 py-3 shadow-card",
        toneStyles[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-body-s font-semibold">{title}</p>
        {description ? <p className="text-caption opacity-90">{description}</p> : null}
      </div>
    </div>
  );
}
