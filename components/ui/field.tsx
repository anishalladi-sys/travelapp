import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/* eslint-disable react/prop-types */
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
      {children}
    </div>
  )
);
Field.displayName = "Field";

export const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }>(
  ({ className, children, htmlFor, required, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }, ref) => (
    <Label
      ref={ref}
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
    </Label>
  )
);
FieldLabel.displayName = "FieldLabel";

export const FieldInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { as?: "input" }>(
  ({ className, id, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        className={cn(
          "flex h-10 w-full rounded-clay border-clay-border bg-clay-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-clay transition-all duration-150 shadow-clay-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clay-pressed disabled:shadow-none min-h-[44px]",
          ariaInvalid && "border-destructive focus-visible:ring-destructive",
          className
        )}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        {...props}
      />
    );
  }
);
FieldInput.displayName = "FieldInput";

export const FieldTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, id, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      id={id}
      className={cn(
        "flex min-h-[100px] w-full rounded-clay border-clay-border bg-clay-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-clay transition-all duration-150 shadow-clay-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clay-pressed disabled:shadow-none min-h-[44px] resize-y",
        ariaInvalid && "border-destructive focus-visible:ring-destructive",
        className
      )}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      {...props}
    />
  )
);
FieldTextarea.displayName = "FieldTextarea";

export const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>, ref) => (
    <p
      ref={ref}
      id={id}
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
FieldDescription.displayName = "FieldDescription";

// eslint-disable-next-line react/prop-types
export const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>, ref) => (
    <p
      ref={ref}
      id={id}
      className={cn("text-body-sm text-destructive", className)}
      role="alert"
      {...props}
    />
  )
);
FieldError.displayName = "FieldError";