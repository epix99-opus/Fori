import { Skeleton as UiSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function Skeleton({
  variant = "block",
  className,
}: {
  variant?: "block" | "card" | "list";
  className?: string;
}) {
  if (variant === "card") {
    return (
      <div className={cn("rounded-xl bg-white p-4 shadow-card", className)}>
        <UiSkeleton className="h-[200px] w-full rounded-xl" />
        <UiSkeleton className="mt-4 h-7 w-2/5" />
        <UiSkeleton className="mt-3 h-5 w-4/5" />
        <UiSkeleton className="mt-2 h-5 w-3/5" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <UiSkeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return <UiSkeleton className={cn("h-4 w-full", className)} />;
}
