import { z } from "zod";

import { REGISTRATION_NOTIFICATION_EVENT_TYPES } from "@/features/notifications/constants/notification.constants";

const optionalText = z.string().trim().max(250, "Usa como máximo 250 caracteres.");

export const registrationFormSchema = z
  .object({
    address: optionalText,
    company: optionalText,
    document_number: z.string().trim().toUpperCase(),
    document_type: z.enum(["dni", "ce"]),
    email: z.email("Ingresa un correo electrónico válido.").trim().toLowerCase(),
    first_names: z.string().trim().min(2, "Ingresa tus nombres.").max(120),
    job_title: z.string().trim().min(2, "Ingresa tu cargo.").max(150),
    last_names: z.string().trim().min(2, "Ingresa tus apellidos.").max(120),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s-]/g, ""))
      .refine((value) => /^\+?[0-9]{7,15}$/.test(value), "Ingresa un celular válido."),
    registration_type: z.enum(["general", "member"]),
    ruc: z.string().trim(),
  })
  .superRefine((data, context) => {
    const validDocument =
      data.document_type === "dni"
        ? /^[0-9]{8}$/.test(data.document_number)
        : /^[A-Z0-9]{6,20}$/.test(data.document_number);

    if (!validDocument) {
      context.addIssue({
        code: "custom",
        message:
          data.document_type === "dni"
            ? "El DNI debe tener 8 dígitos."
            : "El CE debe tener entre 6 y 20 caracteres.",
        path: ["document_number"],
      });
    }

    if (data.ruc && !/^[0-9]{11}$/.test(data.ruc)) {
      context.addIssue({
        code: "custom",
        message: "El RUC debe tener 11 dígitos.",
        path: ["ruc"],
      });
    }

    if (data.registration_type === "member" && !data.company) {
      context.addIssue({
        code: "custom",
        message: "Indica la empresa asociada.",
        path: ["company"],
      });
    }

    if (data.registration_type === "member" && !data.ruc) {
      context.addIssue({
        code: "custom",
        message: "Indica el RUC de la empresa asociada.",
        path: ["ruc"],
      });
    }
  });

export const registrationRpcResultSchema = z.object({
  activity_id: z.uuid(),
  activity_slug: z.string(),
  activity_title: z.string(),
  activity_type: z.enum(["event", "training"]),
  attendance_id: z.uuid(),
  notification_event: z.enum(REGISTRATION_NOTIFICATION_EVENT_TYPES),
  price_snapshot: z.number(),
  registration_code: z.string(),
  registration_id: z.uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const publicRegistrationResultSchema = z.object({
  activity_slug: z.string(),
  activity_title: z.string(),
  activity_type: z.enum(["event", "training"]),
  contact_email: z.string().nullable(),
  contact_name: z.string().nullable(),
  contact_phone: z.string().nullable(),
  is_free: z.boolean(),
  price_snapshot: z.number(),
  registration_code: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const registrationAvailabilitySchema = z.object({
  is_open: z.boolean(),
  reason: z.enum(["available", "cancelled", "closed", "full", "not_open"]),
  remaining_capacity: z.number().nullable(),
});

export const registrationAdminItemSchema = z.object({
  activity: z.object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
    type: z.enum(["event", "training"]),
  }),
  company_snapshot: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  confirmed_by: z.uuid().nullable(),
  cancelled_at: z.string().nullable(),
  cancellation_reason: z.string().nullable(),
  created_at: z.string(),
  id: z.uuid(),
  attendance: z.array(z.object({
    id: z.uuid(),
    status: z.enum(["pending", "attended", "absent"]),
  })),
  person: z.object({
    id: z.uuid(),
    document_number: z.string(),
    document_type: z.enum(["dni", "ce"]),
    email: z.string(),
    first_names: z.string(),
    job_title: z.string(),
    last_names: z.string(),
    phone: z.string(),
  }),
  price_snapshot: z.number(),
  registration_code: z.string(),
  registration_type: z.enum(["general", "member"]),
  ruc_snapshot: z.string().nullable(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
