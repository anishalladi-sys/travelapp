import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // eslint-disable-next-line react/prop-types
  ({ className, type, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-clay border-clay-border bg-clay-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-clay transition-all duration-150 shadow-clay-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clay-pressed disabled:shadow-none min-h-[44px]",
          ariaInvalid && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  // eslint-disable-next-line react/prop-types
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-clay border-clay-border bg-clay-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-clay transition-all duration-150 shadow-clay-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clay-pressed disabled:shadow-none min-h-[44px] resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";