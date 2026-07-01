import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-body-m font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-900",
        secondary:
          "border border-primary-500 bg-white text-primary-500 hover:bg-primary-100",
        ghost: "bg-transparent text-primary-700 hover:bg-primary-100",
        destructive:
          "bg-semantic-danger text-white hover:bg-red-700 active:bg-red-800",
        outline: "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100",
        link: "h-auto min-h-0 p-0 text-primary-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] px-4",
        sm: "h-11 rounded-sm px-3 text-body-s",
        lg: "h-[52px] rounded-lg px-6 text-body-l",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
