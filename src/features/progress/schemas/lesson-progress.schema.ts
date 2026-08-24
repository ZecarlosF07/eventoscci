import { z } from "zod";

export const lessonProgressResultSchema = z.object({
  completed_at: z.string().nullable(),
  course_completion_ready: z.boolean(),
  course_progress_percent: z.number(),
  id: z.string().uuid(),
  is_completed: z.boolean(),
  last_position_seconds: z.number().int().nonnegative(),
  progress_percent: z.number().min(0).max(100),
  watched_seconds: z.number().int().nonnegative(),
});

