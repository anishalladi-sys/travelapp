"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  defaultValues?: Record<string, string>;
  submitLabel: string;
  onSuccess?: () => void;
};

export function ItineraryForm({ action, defaultValues, submitLabel, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = (await (action as unknown as (p: unknown, f: FormData) => Promise<unknown>)(prev, fd)) as { ok?: boolean; error?: string } | undefined;
    if (res?.ok && onSuccess) onSuccess();
    return res as never;
  }, null as never);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4 bg-zinc-50">
      {err ? <div role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{err}</div> : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" name="date" type="date" required defaultValue={defaultValues?.date ?? ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="time">Time</Label>
          <Input id="time" name="time" type="time" defaultValue={defaultValues?.time ?? ""} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="activity">Activity *</Label>
        <Input id="activity" name="activity" required defaultValue={defaultValues?.activity ?? ""} placeholder="Visit Senso-ji" maxLength={200} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={defaultValues?.location ?? ""} placeholder="Asakusa, Tokyo" maxLength={200} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} placeholder="Notes, duration, etc." maxLength={1000} />
      </div>
      <Button type="submit" disabled={pending as boolean} size="sm">{pending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}
