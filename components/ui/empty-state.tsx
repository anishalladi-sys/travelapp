import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  illustration?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, illustration, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-clay-lg border border-clay-border bg-clay-surface p-12 text-center", className)}>
      {illustration && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-clay-full bg-clay-pressed mx-auto">
          {illustration}
        </div>
      )}
      <h3 className="text-heading-md font-serif text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-body-md text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant={action.variant ?? "default"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}