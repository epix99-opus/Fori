"use client";

import { viewerRoles, type ViewerRole } from "@/lib/viewer-role";
import { cn } from "@/lib/utils";

type ViewerRoleSwitcherProps = {
  value: ViewerRole;
  onChange: (role: ViewerRole) => void;
  className?: string;
};

/** 原型演示：切换浏览者身份以展示差异化信息呈现 */
export function ViewerRoleSwitcher({ value, onChange, className }: ViewerRoleSwitcherProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-primary-300 bg-primary-50 p-3", className)}>
      <p className="text-caption font-semibold text-primary-800">演示：当前浏览身份</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {viewerRoles.map((role) => (
          <button
            key={role.id}
            type="button"
            className={cn(
              "rounded-full px-3 py-1.5 text-caption font-semibold transition-colors",
              value === role.id ? "bg-primary-700 text-white" : "bg-white text-neutral-700",
            )}
            onClick={() => onChange(role.id)}
          >
            {role.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-primary-700">
        {viewerRoles.find((r) => r.id === value)?.description}
      </p>
    </div>
  );
}
