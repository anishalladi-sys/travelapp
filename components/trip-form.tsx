"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: Record<string, string | number>;
  submitLabel: string;
};

export function TripForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action as never, null as never);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction} className="space-y-4">
      {err ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title ?? ""} placeholder="Japan 2026" maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="destination">Destination *</Label>
        <Input id="destination" name="destination" required defaultValue={defaultValues?.destination ?? ""} placeholder="Tokyo, Kyoto" maxLength={100} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date *</Label>
          <Input id="start_date" name="start_date" type="date" required defaultValue={String(defaultValues?.start_date ?? "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End date *</Label>
          <Input id="end_date" name="end_date" type="date" required defaultValue={String(defaultValues?.end_date ?? "")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trip_type">Type</Label>
          <NativeSelect id="trip_type" name="trip_type" defaultValue={String(defaultValues?.trip_type ?? "leisure")}>
            <option value="leisure">Leisure</option>
            <option value="business">Business</option>
            <option value="adventure">Adventure</option>
            <option value="family">Family</option>
            <option value="other">Other</option>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="traveler_count">Travelers</Label>
          <Input id="traveler_count" name="traveler_count" type="number" min={1} defaultValue={String(defaultValues?.traveler_count ?? "1")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <NativeSelect id="status" name="status" defaultValue={String(defaultValues?.status ?? "planning")}>
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </NativeSelect>
        </div>
      </div>
      <Button type="submit" disabled={pending as boolean} className="w-full sm:w-auto">{pending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}