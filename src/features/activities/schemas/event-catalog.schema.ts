import { z } from "zod";

export const publicEventPageSchema = z.object({
  activity_ids: z.array(z.uuid()),
  total: z.number().int().nonnegative(),
});

export const publicEventFiltersSchema = z.object({
  category: z.uuid().optional(),
  date: z.iso.date().optional(),
  page: z.number().int().positive().max(2_147_483_647),
});
