import { z } from "zod";

const publicCourseCurriculumLessonSchema = z.object({
  duration_seconds: z.number().int().positive().nullable(),
  is_required: z.boolean(),
  sort_order: z.number().int(),
  title: z.string(),
}).strict();

export const publicCourseCurriculumSchema = z.array(z.object({
  description: z.string().nullable(),
  id: z.string().uuid(),
  lessons: z.array(publicCourseCurriculumLessonSchema),
  sort_order: z.number().int(),
  title: z.string(),
}).strict());
