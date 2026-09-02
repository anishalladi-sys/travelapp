import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const variants: Record<string, string> = {
  default: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black",
  outline: "border border-zinc-200 hover:bg-zinc-50",
  ghost: "hover:bg-zinc-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};
const sizes: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none min-h-[44px]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
