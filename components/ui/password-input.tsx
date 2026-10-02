import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

/**
 * Password field with a reveal toggle.
 *
 * Without this, a mistyped password can only be diagnosed by clearing the field
 * and retyping it -- which is exactly what a user cannot do when they cannot
 * see whether the caps-lock key is on. The toggle is a real <button type="button">
 * so it is reachable by keyboard and does not submit the form it sits inside;
 * `aria-pressed` plus a label that flips between "Show" and "Hide" means a screen
 * reader announces the current state rather than a static "Show password" that
 * lies after the first click.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, disabled, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "flex h-10 w-full rounded-clay border-clay-border bg-clay-surface px-3 py-2 pr-12 text-sm placeholder:text-muted-foreground focus-clay transition-all duration-150 shadow-clay-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clay-pressed disabled:shadow-none min-h-[44px]",
          props["aria-invalid"] &&
            "border-destructive focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-clay text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
