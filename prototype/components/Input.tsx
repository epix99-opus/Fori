import * as React from "react";

import { Input as UiInput, type InputProps as UiInputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface InputProps extends UiInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, hint, className, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="space-y-2">
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <UiInput
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? helperId : undefined}
          className={cn(error && "border-semantic-danger", className)}
          {...props}
        />
        {error ? (
          <p id={helperId} className="text-body-s text-semantic-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={helperId} className="text-body-s text-neutral-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
