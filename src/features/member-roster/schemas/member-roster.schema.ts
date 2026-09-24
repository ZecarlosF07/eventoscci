import { z } from "zod";

export const memberRosterPreviewSchema = z.object({
  added_count: z.number().int().nonnegative(),
  base_version: z.number().int().nonnegative(),
  changed_count: z.number().int().nonnegative(),
  id: z.uuid(),
  removed_count: z.number().int().nonnegative(),
  row_count: z.number().int().positive(),
});
