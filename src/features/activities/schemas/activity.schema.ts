import { z } from "zod";

const optionalText = z.string().trim();
const nonnegativeNumber = z
  .string()
  .refine((value) => !value || Number(value) >= 0, "Debe ser cero o mayor.");

const activityDateSchema = z
  .object({
    ends_at: optionalText,
    label: optionalText,
    sort_order: z.number().int().nonnegative(),
    starts_at: z.string().min(1, "Indica la fecha y hora de inicio."),
  })
  .refine(
    ({ ends_at, starts_at }) =>
      !ends_at || new Date(ends_at) > new Date(starts_at),
    { message: "La hora final debe ser posterior al inicio.", path: ["ends_at"] },
  );

export const activityFormSchema = z
  .object({
    academic_hours: nonnegativeNumber,
    additional_info: optionalText,
    banner_path: optionalText,
    capacity: z
      .string()
      .refine((value) => !value || Number.isInteger(Number(value)), "Debe ser un número entero.")
      .refine((value) => !value || Number(value) > 0, "Debe ser mayor que cero."),
    category_id: z.union([z.uuid(), z.literal("")]),
    contact_id: z.union([z.uuid(), z.literal("")]),
    dates: z.array(activityDateSchema).min(1, "Agrega al menos una fecha."),
    description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres."),
    duration_text: optionalText,
    general_price: nonnegativeNumber,
    id: z.union([z.uuid(), z.literal("")]),
    is_free: z.boolean(),
    member_price: nonnegativeNumber,
    members_only: z.boolean(),
    modality: z.enum(["in_person", "virtual", "hybrid"]),
    objective: optionalText,
    program: optionalText,
    program_image_paths: z.array(z.string().min(1)).max(10),
    registration_close_at: optionalText,
    registration_open_at: optionalText,
    registrations_closed_manually: z.boolean(),
    short_description: z.string().trim().max(280, "Usa como máximo 280 caracteres."),
    slug: optionalText,
    speakers: z.array(
      z.object({
        role_label: optionalText,
        sort_order: z.number().int().nonnegative(),
        speaker_id: z.uuid(),
      }),
    ),
    status: z.enum(["draft", "published", "finished", "archived", "cancelled"]),
    syllabus: optionalText,
    target_audience: optionalText,
    title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
    type: z.enum(["event", "training"]),
    venue_id: z.union([z.uuid(), z.literal("")]),
    virtual_url: z.union([z.url("Ingresa una URL válida."), z.literal("")]),
  })
  .superRefine((data, context) => {
    if (data.is_free && (Number(data.general_price) !== 0 || Number(data.member_price) !== 0)) {
      context.addIssue({ code: "custom", message: "Una actividad gratuita debe tener precios en cero.", path: ["general_price"] });
    }
    if (
      data.registration_open_at &&
      data.registration_close_at &&
      new Date(data.registration_close_at) <= new Date(data.registration_open_at)
    ) {
      context.addIssue({ code: "custom", message: "El cierre debe ser posterior a la apertura.", path: ["registration_close_at"] });
    }
    if (data.modality === "virtual" && !data.virtual_url) {
      context.addIssue({ code: "custom", message: "Indica el enlace de la actividad virtual.", path: ["virtual_url"] });
    }
    if (
      data.status === "published" &&
      data.modality !== "virtual" &&
      !data.venue_id
    ) {
      context.addIssue({
        code: "custom",
        message: "Selecciona un lugar activo antes de publicar una actividad presencial o híbrida.",
        path: ["venue_id"],
      });
    }
    if (data.status === "published" && !data.contact_id) {
      context.addIssue({
        code: "custom",
        message: "Selecciona un contacto antes de publicar.",
        path: ["contact_id"],
      });
    }
  });
