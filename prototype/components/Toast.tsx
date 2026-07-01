"use client";

import { Toast as UiToast, type ToastTone } from "@/components/ui/toast";

export type ToastType = ToastTone;

export function Toast({
  type = "info",
  title,
  description,
}: {
  type?: ToastType;
  title: string;
  description?: string;
}) {
  return <UiToast tone={type} title={title} description={description} />;
}
