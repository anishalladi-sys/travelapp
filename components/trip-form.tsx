"use client";
import { useActionState } from "react";
import { NativeSelect } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldInput, FieldDescription, FieldError } from "@/components/ui/field";

type Props = {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: Record<string, string | number>;
  submitLabel: string;
};

export function TripForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action as never, null as never);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction} className="space-y-6">
      {err ? (
        <FieldError role="alert" className="rounded-clay border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{err}</FieldError>
      ) : null}
      <Field>
        <FieldLabel htmlFor="title" required>Title *</FieldLabel>
        <FieldDescription>Give your trip a memorable name</FieldDescription>
        <FieldInput id="title" name="title" required defaultValue={defaultValues?.title ?? ""} placeholder="Japan 2026" maxLength={100} />
      </Field>
      <Field>
        <FieldLabel htmlFor="destination" required>Destination *</FieldLabel>
        <FieldDescription>Where are you headed?</FieldDescription>
        <FieldInput id="destination" name="destination" required defaultValue={defaultValues?.destination ?? ""} placeholder="Tokyo, Kyoto" maxLength={100} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field>
          <FieldLabel htmlFor="start_date" required>Start date *</FieldLabel>
          <FieldDescription>When does your trip begin?</FieldDescription>
          <FieldInput id="start_date" name="start_date" type="date" required defaultValue={String(defaultValues?.start_date ?? "")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="end_date" required>End date *</FieldLabel>
          <FieldDescription>When does your trip end?</FieldDescription>
          <FieldInput id="end_date" name="end_date" type="date" required defaultValue={String(defaultValues?.end_date ?? "")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Field>
          <FieldLabel htmlFor="trip_type">Type</FieldLabel>
          <FieldDescription>What kind of trip is this?</FieldDescription>
          <NativeSelect id="trip_type" name="trip_type" defaultValue={String(defaultValues?.trip_type ?? "leisure")} className="rounded-clay border-clay-border bg-clay-surface h-10 px-3 py-2 text-sm focus-clay shadow-clay-inset min-h-[44px]">
            <option value="leisure">Leisure</option>
            <option value="business">Business</option>
            <option value="adventure">Adventure</option>
            <option value="family">Family</option>
            <option value="other">Other</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="traveler_count">Travelers</FieldLabel>
          <FieldDescription>How many people are going?</FieldDescription>
          <FieldInput id="traveler_count" name="traveler_count" type="number" min={1} defaultValue={String(defaultValues?.traveler_count ?? "1")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <FieldDescription>Current trip status</FieldDescription>
          <NativeSelect id="status" name="status" defaultValue={String(defaultValues?.status ?? "planning")} className="rounded-clay border-clay-border bg-clay-surface h-10 px-3 py-2 text-sm focus-clay shadow-clay-inset min-h-[44px]">
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </NativeSelect>
        </Field>
      </div>
      <Button type="submit" disabled={pending as boolean} className="w-full sm:w-auto">{pending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}