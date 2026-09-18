import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-clay text-sm font-medium ring-offset-background transition-all duration-150 focus-clay disabled:pointer-events-none disabled:opacity-50 min-h-[44px] touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-clay-raised text-foreground shadow-clay hover:shadow-clay-raised hover:-translate-y-0.5 active:shadow-clay-inset active:translate-y-0.5 active:scale-[0.98]",
        primary: "bg-primary text-primary-foreground shadow-clay hover:shadow-clay-raised hover:-translate-y-0.5 active:shadow-clay-inset active:translate-y-0.5 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground shadow-clay hover:shadow-clay-raised hover:-translate-y-0.5 active:shadow-clay-inset active:translate-y-0.5 active:scale-[0.98]",
        outline: "border-2 border-clay-border bg-transparent shadow-clay hover:bg-clay-pressed hover:shadow-clay-raised active:shadow-clay-inset",
        secondary: "bg-clay-raised text-foreground shadow-clay hover:shadow-clay-raised hover:-translate-y-0.5 active:shadow-clay-inset active:translate-y-0.5 active:scale-[0.98]",
        ghost: "bg-transparent hover:bg-clay-pressed hover:shadow-clay-inset",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-clay px-3",
        lg: "h-11 rounded-clay px-8",
        xl: "h-12 rounded-clay px-10 text-base",
        icon: "h-10 w-10 rounded-clay",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";