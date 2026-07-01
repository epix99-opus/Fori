import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-[52px] w-full rounded-md border border-neutral-200 bg-white px-4 text-body-m text-neutral-900 placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40 aria-[invalid=true]:border-semantic-danger",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
