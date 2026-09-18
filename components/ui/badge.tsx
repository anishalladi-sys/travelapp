import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "accent";
  size?: "default" | "sm" | "lg";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-clay-raised text-foreground shadow-clay",
      secondary: "bg-clay-pressed text-muted-foreground shadow-clay",
      outline: "border-2 border-clay-border bg-transparent shadow-clay",
      success: "bg-green-500 text-white shadow-clay",
      warning: "bg-yellow-500 text-white shadow-clay",
      destructive: "bg-red-500 text-white shadow-clay",
      accent: "bg-primary text-primary-foreground shadow-clay",
    };

    const sizes = {
      default: "px-2.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-[11px]",
      lg: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-clay-full font-medium transition-all",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";