"use client";

import { useRouter } from "next/navigation";
import { Compass, Home, MessageCircle, PlusCircle, User } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { key: "home", label: "首页", icon: Home },
  { key: "explore", label: "探索", icon: Compass },
  { key: "publish", label: "发布", icon: PlusCircle },
  { key: "messages", label: "消息", icon: MessageCircle },
  { key: "profile", label: "我的", icon: User },
];

const tabRoutes: Record<string, string> = {
  home: "/home",
  explore: "/explore/dict",
  publish: "/publish/listing",
  messages: "/messages",
  profile: "/profile",
};

export function TabBar({
  active = "home",
  onChange,
}: {
  active?: string;
  onChange?: (key: string) => void;
}) {
  const router = useRouter();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-neutral-200 bg-white px-2 pt-2">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-sm text-caption font-semibold text-neutral-500",
                selected && "text-primary-700",
              )}
              onClick={() => {
                router.push(tabRoutes[tab.key]);
                onChange?.(tab.key);
              }}
            >
              <Icon className="size-6" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
