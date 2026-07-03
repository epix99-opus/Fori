"use client";

import { LayoutGrid, List, Map } from "lucide-react";

import { cn } from "@/lib/utils";

export type DictViewMode = "card" | "list" | "map";

type ViewModeToggleProps = {
  value: DictViewMode;
  onChange: (mode: DictViewMode) => void;
};

const modes: { id: DictViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "card", label: "卡片", icon: LayoutGrid },
  { id: "list", label: "列表", icon: List },
  { id: "map", label: "地图", icon: Map },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="房源字典呈现方式">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={value === mode.id}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-caption font-semibold transition-colors",
              value === mode.id ? "bg-white text-primary-700 shadow-sm" : "text-neutral-600",
            )}
            onClick={() => onChange(mode.id)}
          >
            <Icon className="size-4" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
