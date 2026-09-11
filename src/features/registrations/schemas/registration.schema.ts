import { z } from "zod";

import { FIELD_LIMITS, maximumCharactersMessage } from "@/constants/field-limits";
import { REGISTRATION_NOTIFICATION_EVENT_TYPES } from "@/features/notifications/constants/notification.constants";

const optionalText = z.string().trim().max(250, "Usa como máximo 250 caracteres.");

export const registrationFormSchema = z
  .object({
    address: optionalText,
    company: optionalText,
    document_number: z.string().trim().max(FIELD_LIMITS.documentNumber, maximumCharactersMessage(FIELD_LIMITS.documentNumber)).toUpperCase(),
    document_type: z.enum(["dni", "ce"]),
    email: z.email("Ingresa un correo electrónico válido.").trim().toLowerCase(),
    first_names: z.string().trim().min(2, "Ingresa tus nombres.").max(FIELD_LIMITS.personName, maximumCharactersMessage(FIELD_LIMITS.personName)),
    job_title: z.string().trim().min(2, "Ingresa tu cargo.").max(150),
    last_names: z.string().trim().min(2, "Ingresa tus apellidos.").max(FIELD_LIMITS.personName, maximumCharactersMessage(FIELD_LIMITS.personName)),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s-]/g, ""))
      .refine((value) => /^\+?[0-9]{7,15}$/.test(value), "Ingresa un celular válido."),
    registration_type: z.enum(["general", "member"]),
    request_certificate: z.boolean(),
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
  certificate_mode: z.enum(["none", "included", "optional_paid"]),
  certificate_price: z.number().nullable(),
  certificate_request_token: z.uuid(),
  certificate_request_notification_id: z.uuid().nullable(),
  certificate_requested_at: z.string().nullable(),
  notification_event: z.enum(REGISTRATION_NOTIFICATION_EVENT_TYPES),
  price_snapshot: z.number(),
  registration_code: z.string(),
  registration_id: z.uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const publicRegistrationResultSchema = z.object({
  activity_modality: z.enum(["in_person", "virtual", "hybrid"]).nullable().default(null),
  activity_sessions: z.array(z.object({
    ends_at: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    starts_at: z.string(),
  })).default([]),
  activity_slug: z.string(),
  activity_title: z.string(),
  activity_type: z.enum(["event", "training"]),
  certificate_mode: z.enum(["none", "included", "optional_paid"]),
  certificate_price: z.number().nullable(),
  certificate_request_token: z.uuid().nullable(),
  certificate_requested_at: z.string().nullable(),
  contact_email: z.string().nullable(),
  contact_name: z.string().nullable(),
  contact_phone: z.string().nullable(),
  is_free: z.boolean(),
  price_snapshot: z.number(),
  registration_code: z.string(),
  registration_type: z.enum(["general", "member"]),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  venue_address: z.string().nullable().default(null),
  venue_name: z.string().nullable().default(null),
  venue_reference: z.string().nullable().default(null),
  virtual_access_url: z.url().nullable().default(null),
});

export const registrationAvailabilitySchema = z.object({
  is_open: z.boolean(),
  reason: z.enum(["available", "cancelled", "closed", "finished", "full", "not_open"]),
  remaining_capacity: z.number().nullable(),
});

export const certificateRequestRpcResultSchema = z.object({
  activity_title: z.string(),
  certificate_price: z.number().positive(),
  contact_whatsapp_phone: z.string(),
  notification_id: z.uuid().nullable(),
  registration_code: z.string(),
  registration_type: z.enum(["general", "member"]),
  requested_at: z.string(),
});

export const registrationAdminItemSchema = z.object({
  activity: z.object({
    certificate_mode: z.enum(["none", "included", "optional_paid"]),
    id: z.uuid(),
    slug: z.string(),
    status: z.enum(["draft", "published", "finished", "archived", "cancelled"]),
    title: z.string(),
    type: z.enum(["event", "training"]),
  }),
  company_snapshot: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  confirmed_by: z.uuid().nullable(),
  cancelled_at: z.string().nullable(),
  cancellation_reason: z.string().nullable(),
  certificate_mode_snapshot: z.enum(["none", "included", "optional_paid"]),
  certificate_payment_verified_at: z.string().nullable(),
  certificate_payment_verified_by: z.uuid().nullable(),
  certificate_price_snapshot: z.number().nullable(),
  certificate_requested_at: z.string().nullable(),
  certificate_requested_by: z.uuid().nullable(),
  certificate: z.array(z.object({
    id: z.uuid(),
    status: z.enum(["issued", "revoked"]),
  })),
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
