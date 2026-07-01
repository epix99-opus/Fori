import { CircleAlert } from "lucide-react";

import { Button } from "@/components/Button";

export function ErrorState({
  title,
  code,
  description,
  onRetry,
}: {
  title: string;
  code?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-white p-6 text-center shadow-card">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-semantic-danger">
        <CircleAlert className="size-7" />
      </div>
      <h3 className="mt-4 text-h3">{title}</h3>
      {code ? <p className="mt-1 text-caption text-neutral-500">错误码：{code}</p> : null}
      {description ? <p className="mt-2 text-body-s text-neutral-500">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" className="mt-5 w-full" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  );
}
