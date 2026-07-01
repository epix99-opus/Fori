import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepperStatus = "pending" | "current" | "complete" | "error" | "saved";

export type StepperStep = {
  label: string;
  status?: StepperStatus;
};

export function Stepper({ steps }: { steps: StepperStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const status = step.status ?? "pending";
        const complete = status === "complete";
        const current = status === "current";
        const error = status === "error";

        return (
          <li key={step.label} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-caption font-bold",
                complete && "border-semantic-success bg-semantic-success text-white",
                current && "border-primary-500 bg-primary-500 text-white",
                error && "border-semantic-danger bg-red-50 text-semantic-danger",
                status === "pending" && "border-neutral-200 bg-white text-neutral-500",
                status === "saved" && "border-secondary-500 bg-secondary-200 text-secondary-600",
              )}
            >
              {complete ? <Check className="size-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-body-s text-neutral-500",
                (current || complete) && "font-semibold text-neutral-900",
                error && "font-semibold text-semantic-danger",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
