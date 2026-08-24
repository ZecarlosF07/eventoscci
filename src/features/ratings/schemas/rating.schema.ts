import { z } from "zod";

export const courseRatingSchema = z.object({
  comment: z.string().nullable(),
  course_id: z.uuid(),
  created_at: z.string(),
  enrollment_id: z.uuid(),
  id: z.uuid(),
  rating: z.number().int().min(1).max(5),
  updated_at: z.string(),
});

export const courseRatingFormSchema = z.object({
  comment: z.string().trim().max(2000, "El comentario no puede exceder 2000 caracteres."),
  courseId: z.uuid(),
  rating: z.number().int().min(1, "Selecciona una valoración.").max(5),
});
