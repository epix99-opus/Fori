import * as React from "react";

import {
  Card as UiCard,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({
  header,
  footer,
  children,
  className,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <UiCard className={cn("overflow-hidden rounded-xl", className)}>
      {header ? <CardHeader>{header}</CardHeader> : null}
      <CardContent className={header ? undefined : "pt-4"}>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </UiCard>
  );
}
