"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItineraryForm } from "@/components/itinerary-form";
import { updateItineraryAction, deleteItineraryAction } from "@/app/trips/actions";

type Item = {
  id: string;
  date: string;
  time: string | null;
  activity: string;
  location: string | null;
  notes: string | null;
};

export function ItineraryItemRow({ item, tripId }: { item: Item; tripId: string }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border p-3 bg-white">
      {editing ? (
        <div className="flex-1">
          <ItineraryForm
            action={updateItineraryAction.bind(null, item.id, tripId) as never}
            defaultValues={{
              date: item.date,
              time: item.time ?? "",
              activity: item.activity,
              location: item.location ?? "",
              notes: item.notes ?? "",
            }}
            submitLabel="Save"
            onSuccess={() => setEditing(false)}
          />
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mt-2">Cancel</Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {item.time ? <span className="text-xs font-mono bg-zinc-100 px-1.5 py-0.5 rounded">{item.time.slice(0,5)}</span> : null}
              <span className="font-medium truncate">{item.activity}</span>
            </div>
            {item.location ? <div className="text-sm text-zinc-600 truncate">{item.location}</div> : null}
            {item.notes ? <div className="text-sm text-zinc-500 mt-1 whitespace-pre-wrap break-words">{item.notes}</div> : null}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            <form action={deleteItineraryAction.bind(null, item.id, tripId)}>
              <Button variant="ghost" size="sm" type="submit" aria-label={`Delete ${item.activity}`}>Delete</Button>
            </form>
          </div>
        </>
      )}
    </li>
  );
}
