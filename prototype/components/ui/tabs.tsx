"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;

  return (
    <TabsContext.Provider
      value={{
        value: selectedValue,
        onValueChange: (nextValue) => {
          setInternalValue(nextValue);
          onValueChange?.(nextValue);
        },
      }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex min-h-11 items-center rounded-lg bg-neutral-100 p-1", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  const selected = context?.value === value;

  return (
    <button
      role="tab"
      aria-selected={selected}
      className={cn(
        "min-h-9 rounded-sm px-3 text-body-s font-semibold text-neutral-500 transition-colors aria-selected:bg-white aria-selected:text-primary-700 aria-selected:shadow-sm disabled:opacity-40",
        className,
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    />
  );
}

function TabsContent({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;

  return <div className={cn("mt-4", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
