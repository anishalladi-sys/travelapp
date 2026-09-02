import { z } from "zod";

const tripBase = z.object({
  title: z.string().min(1, "Title is required").max(100),
  destination: z.string().min(1, "Destination is required").max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be YYYY-MM-DD"),
  trip_type: z.enum(["leisure", "business", "adventure", "family", "other"]).default("leisure"),
  traveler_count: z.coerce.number().int().min(1).default(1),
  status: z.enum(["planning", "upcoming", "ongoing", "completed", "cancelled"]).default("planning"),
});

export const tripSchema = tripBase.refine((d) => d.end_date >= d.start_date, {
  message: "end_date must be on or after start_date",
  path: ["end_date"],
});

export type TripInput = z.infer<typeof tripSchema>;

export const tripUpdateSchema = tripBase.partial().refine(
  (d) => !d.start_date || !d.end_date || d.end_date >= d.start_date,
  { message: "end_date must be on or after start_date", path: ["end_date"] }
);
