import { z } from "zod";

import { FIELD_LIMITS, maximumCharactersMessage } from "@/constants/field-limits";

const nonnegativeNumber = z.string().refine(
  (value) => !value || Number(value) >= 0,
  "Debe ser cero o mayor.",
);

export const courseFormSchema = z.object({
  academic_hours: nonnegativeNumber,
  banner_path: z.string().trim(),
  contents_overview: z.string().trim(),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres."),
  duration_text: z.string().trim().max(FIELD_LIMITS.courseDuration, maximumCharactersMessage(FIELD_LIMITS.courseDuration)),
  general_price: nonnegativeNumber,
  id: z.union([z.uuid(), z.literal("")]),
  instructors: z.array(z.object({
    is_primary: z.boolean(),
    role_label: z.string().trim(),
    sort_order: z.number().int().nonnegative(),
    speaker_id: z.uuid(),
  })).refine(
    (items) => items.filter((item) => item.is_primary).length <= 1,
    "Selecciona como máximo un instructor principal.",
  ),
  is_free: z.boolean(),
  member_price: nonnegativeNumber,
  objectives: z.string().trim(),
  short_description: z.string().trim().max(280, "Usa como máximo 280 caracteres."),
  slug: z.string().trim().max(FIELD_LIMITS.courseSlug, maximumCharactersMessage(FIELD_LIMITS.courseSlug)),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres.").max(FIELD_LIMITS.courseTitle, maximumCharactersMessage(FIELD_LIMITS.courseTitle)),
}).superRefine((data, context) => {
  if (data.is_free && (Number(data.general_price) !== 0 || Number(data.member_price) !== 0)) {
    context.addIssue({ code: "custom", message: "Un curso gratuito debe tener precios en cero.", path: ["general_price"] });
  }
});

export const courseStatusSchema = z.object({
  courseId: z.uuid(),
  status: z.enum(["draft", "published", "archived"]),
});
