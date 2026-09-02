import { z } from "zod";

export const itinerarySchema = z.object({
  trip_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "time must be HH:MM")
    .optional()
    .nullable()
    .or(z.literal("")),
  activity: z.string().min(1, "Activity is required").max(200),
  location: z.string().max(200).optional().nullable().or(z.literal("")),
  notes: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
});

export const itineraryUpdateSchema = itinerarySchema.omit({ trip_id: true }).partial();

export type ItineraryInput = z.infer<typeof itinerarySchema>;
