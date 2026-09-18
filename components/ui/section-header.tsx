import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, lede, action, className }: SectionHeaderProps) {
  return (
    <header className={cn("section-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", className)}>
      <div className="space-y-2">
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2 className="section-title font-serif">{title}</h2>
        {lede && <p className="section-lede">{lede}</p>}
      </div>
      {action && <div className="flex-shrink-0 mt-4 sm:mt-0">{action}</div>}
    </header>
  );
}