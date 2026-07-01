import { SearchX } from "lucide-react";

import { Button } from "@/components/Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-card">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <SearchX className="size-7" />
      </div>
      <h3 className="mt-4 text-h3">{title}</h3>
      {description ? <p className="mt-2 text-body-s text-neutral-500">{description}</p> : null}
      {actionLabel ? (
        <Button className="mt-5 w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
