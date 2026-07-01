"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/40" onClick={onClose}>
      <section
        className={cn(
          "safe-bottom absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl bg-white p-4 shadow-card",
          "animate-in slide-in-from-bottom duration-200",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h2 className="text-h3">{title}</h2> : <span />}
          <Button variant="ghost" size="sm" aria-label="关闭" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
