"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldInput, FieldTextarea, FieldDescription, FieldError } from "@/components/ui/field";

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
    <form action={formAction} className="space-y-4 rounded-clay-lg border border-clay-border p-4 bg-clay-surface">
      {err ? (
        <FieldError role="alert" className="rounded-clay border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">{err}</FieldError>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="date" required>Date *</FieldLabel>
          <FieldDescription>When is this activity?</FieldDescription>
          <FieldInput id="date" name="date" type="date" required defaultValue={defaultValues?.date ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor="time">Time</FieldLabel>
          <FieldDescription>What time? (optional)</FieldDescription>
          <FieldInput id="time" name="time" type="time" defaultValue={defaultValues?.time ?? ""} />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="activity" required>Activity *</FieldLabel>
        <FieldDescription>What will you be doing?</FieldDescription>
        <FieldInput id="activity" name="activity" required defaultValue={defaultValues?.activity ?? ""} placeholder="Visit Senso-ji" maxLength={200} />
      </Field>
      <Field>
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <FieldDescription>Where is it? (optional)</FieldDescription>
        <FieldInput id="location" name="location" defaultValue={defaultValues?.location ?? ""} placeholder="Asakusa, Tokyo" maxLength={200} />
      </Field>
      <Field>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <FieldDescription>Additional details (optional)</FieldDescription>
        <FieldTextarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} placeholder="Notes, duration, etc." maxLength={1000} />
      </Field>
      <Button type="submit" disabled={pending as boolean} size="sm">{pending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}