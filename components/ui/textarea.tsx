import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2", className)} {...props} />;
}
