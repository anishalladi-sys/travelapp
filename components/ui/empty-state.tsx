import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  // A node, not a handler. EmptyState is rendered from Server Components, and
  // React cannot serialise a function prop across the server/client boundary --
  // passing `onClick` here throws "Event handlers cannot be passed to Client
  // Component props" and takes the whole page down. Pass a <Link> or <Button>.
  action?: React.ReactNode;
  illustration?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-clay-lg border border-clay-border bg-clay-surface p-12 text-center",
        className,
      )}
    >
      {illustration && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-clay-full bg-clay-pressed mx-auto">
          {illustration}
        </div>
      )}
      <h3 className="text-heading-md font-serif text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-body-md text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
