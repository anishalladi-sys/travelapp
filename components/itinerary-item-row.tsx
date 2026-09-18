"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItineraryForm } from "@/components/itinerary-form";
import { updateItineraryAction, deleteItineraryAction } from "@/app/trips/actions";
import { Clock, MapPin, FileText, Edit, Trash2 } from "lucide-react";

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
    <li className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:border-accent/30">
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
            <div className="flex items-center gap-3">
              {item.time && (
                <Badge variant="secondary" className="shrink-0">
                  <Clock className="mr-1.5 h-3 w-3" />
                  {item.time.slice(0, 5)}
                </Badge>
              )}
              <span className="font-medium text-foreground truncate">{item.activity}</span>
            </div>
            {item.location && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{item.location}</span>
              </div>
            )}
            {item.notes && (
              <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap break-words">{item.notes}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            <form action={deleteItineraryAction.bind(null, item.id, tripId)}>
              <Button variant="ghost" size="sm" type="submit" aria-label={`Delete ${item.activity}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </li>
  );
}