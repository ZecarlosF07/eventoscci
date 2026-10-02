import { z } from "zod";

import { FIELD_LIMITS, maximumCharactersMessage } from "@/constants/field-limits";
import { ACTIVITY_MAX_ACADEMIC_HOURS } from "@/features/activities/constants/activity.constants";
import { presaleDateToTimestamp } from "@/features/activities/utils/activity-pricing";

const optionalPresalePrice = z.string().trim().refine(
  (value) => !value || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) < 100_000_000),
  "Indica un precio positivo con máximo dos decimales.",
).optional();

const optionalText = z.string().trim();
const nonnegativeNumber = z
  .string()
  .refine((value) => !value || Number(value) >= 0, "Debe ser cero o mayor.");
const optionalSecureUrl = z.union([
  z.url("Ingresa una URL válida.").refine(
    (value) => value.startsWith("https://"),
    "El enlace debe comenzar con https://.",
  ),
  z.literal(""),
]);

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
    allows_student_registration: z.boolean().optional(),
    additional_info: optionalText,
    banner_path: optionalText,
    capacity: z
      .string()
      .refine((value) => !value || Number.isInteger(Number(value)), "Debe ser un número entero.")
      .refine((value) => !value || Number(value) > 0, "Debe ser mayor que cero."),
    category_id: z.union([z.uuid(), z.literal("")]),
    certificate_general_price: nonnegativeNumber,
    certificate_member_price: nonnegativeNumber,
    certificate_mode: z.enum(["none", "included", "optional_paid"]),
    contact_id: z.union([z.uuid(), z.literal("")]),
    dates: z.array(activityDateSchema).min(1, "Agrega al menos una fecha."),
    description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres."),
    duration_text: optionalText.max(FIELD_LIMITS.activityDuration, maximumCharactersMessage(FIELD_LIMITS.activityDuration)),
    general_price: nonnegativeNumber,
    presale_general_price: optionalPresalePrice,
    presale_member_price: optionalPresalePrice,
    presale_ends_at: z.string().trim().optional(),
    id: z.union([z.uuid(), z.literal("")]),
    is_free: z.boolean(),
    is_listed: z.boolean(),
    member_price: nonnegativeNumber,
    member_free_passes_per_company: z.string().refine(
      (value) => /^\d+$/.test(value || "0") && Number(value || "0") <= 999999999,
      "Indica un número entero de pases, desde cero.",
    ),
    members_only: z.boolean(),
    modality: z.enum(["in_person", "virtual", "hybrid"]),
    objective: optionalText,
    payment_note: optionalText.max(FIELD_LIMITS.activityPaymentNote, maximumCharactersMessage(FIELD_LIMITS.activityPaymentNote)),
    program: optionalText,
    program_image_paths: z.array(z.string().min(1)).max(10),
    registration_close_at: optionalText,
    registration_open_at: optionalText,
    registrations_closed_manually: z.boolean(),
    short_description: z.string().trim().max(280, "Usa como máximo 280 caracteres."),
    slug: optionalText.max(FIELD_LIMITS.activitySlug, maximumCharactersMessage(FIELD_LIMITS.activitySlug)),
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
    title: z.string().trim()
      .min(3, "El título debe tener al menos 3 caracteres.")
      .max(FIELD_LIMITS.activityTitle, maximumCharactersMessage(FIELD_LIMITS.activityTitle)),
    type: z.enum(["event", "training"]),
    venue_id: z.union([z.uuid(), z.literal("")]),
    virtual_url: optionalSecureUrl,
  })
  .superRefine((data, context) => {
    const hasPresale = Boolean(data.presale_general_price || data.presale_member_price);
    if (hasPresale && (data.type !== "event" || data.is_free)) {
      context.addIssue({ code: "custom", message: "La preventa solo corresponde a eventos pagados.", path: ["presale_member_price"] });
    }
    if (data.members_only && data.presale_general_price) {
      context.addIssue({ code: "custom", message: "Un evento exclusivo solo tiene preventa para asociados.", path: ["presale_general_price"] });
    }
    if ((data.presale_ends_at || (hasPresale && data.status === "published")) && !presaleDateToTimestamp(data.presale_ends_at ?? "")) {
      context.addIssue({ code: "custom", message: "Indica una fecha válida para el último día de preventa.", path: ["presale_ends_at"] });
    }
    for (const audience of ["general", "member"] as const) {
      const field = audience === "general" ? "presale_general_price" : "presale_member_price";
      const regular = Number(audience === "general" ? data.general_price : data.member_price);
      if (data[field] && (regular > 0 || data.status === "published") && Number(data[field]) >= regular) {
        context.addIssue({ code: "custom", message: "La preventa debe ser menor que el precio regular.", path: [field] });
      }
    }
    const hours = Number(data.academic_hours);
    if (data.certificate_mode !== "none" && (!Number.isFinite(hours) || hours <= 0 || hours > ACTIVITY_MAX_ACADEMIC_HOURS)) {
      context.addIssue({ code: "custom", message: "Indica horas académicas mayores que cero (máximo 9999.99).", path: ["academic_hours"] });
    }
    const certificateGeneralPrice = Number(data.certificate_general_price);
    const certificateMemberPrice = Number(data.certificate_member_price);
    if (
      data.certificate_mode !== "optional_paid" &&
      (certificateGeneralPrice !== 0 || certificateMemberPrice !== 0)
    ) {
      context.addIssue({ code: "custom", message: "Esta modalidad no admite un precio adicional.", path: ["certificate_general_price"] });
    }
    if (data.certificate_mode === "optional_paid" && !data.members_only && certificateGeneralPrice <= 0) {
      context.addIssue({ code: "custom", message: "Indica un precio general mayor que cero.", path: ["certificate_general_price"] });
    }
    if (data.certificate_mode === "optional_paid" && certificateMemberPrice <= 0) {
      context.addIssue({ code: "custom", message: "Indica un precio para asociados mayor que cero.", path: ["certificate_member_price"] });
    }
    if (data.certificate_mode === "optional_paid" && !data.members_only && certificateMemberPrice > certificateGeneralPrice) {
      context.addIssue({ code: "custom", message: "El precio para asociados no puede superar el precio general.", path: ["certificate_member_price"] });
    }
    if (data.is_free && (Number(data.general_price) !== 0 || Number(data.member_price) !== 0)) {
      context.addIssue({ code: "custom", message: "Una actividad gratuita debe tener precios en cero.", path: ["general_price"] });
    }
    if (data.members_only && Number(data.general_price) !== 0) {
      context.addIssue({ code: "custom", message: "Una actividad exclusiva no tiene precio general.", path: ["general_price"] });
    }
    if (data.members_only && data.certificate_mode === "optional_paid"
      && certificateGeneralPrice !== certificateMemberPrice) {
      context.addIssue({ code: "custom", message: "En una actividad exclusiva solo corresponde el precio de certificado para asociados.", path: ["certificate_member_price"] });
    }
    if (data.status === "published" && !data.is_free && !data.payment_note) {
      context.addIssue({ code: "custom", message: "Indica cómo realizar el pago antes de publicar.", path: ["payment_note"] });
    }
    if (data.status === "published" && !data.is_free && Number(data.member_price) <= 0) {
      context.addIssue({ code: "custom", message: "Indica un precio para asociados mayor que cero o marca la actividad como gratuita.", path: ["member_price"] });
    }
    if (data.status === "published" && !data.is_free && !data.members_only && Number(data.general_price) <= 0) {
      context.addIssue({ code: "custom", message: "Indica un precio general mayor que cero o marca la actividad como gratuita.", path: ["general_price"] });
    }
    if (data.type !== "event" && !data.is_listed) {
      context.addIssue({ code: "custom", message: "La opción de no listar solo está disponible para eventos.", path: ["is_listed"] });
    }
    if (
      data.registration_open_at &&
      data.registration_close_at &&
      new Date(data.registration_close_at) <= new Date(data.registration_open_at)
    ) {
      context.addIssue({ code: "custom", message: "El cierre debe ser posterior a la apertura.", path: ["registration_close_at"] });
    }
    if (
      data.status === "published"
      && data.modality !== "in_person"
      && !data.virtual_url
    ) {
      context.addIssue({
        code: "custom",
        message: "Indica el enlace virtual antes de publicar.",
        path: ["virtual_url"],
      });
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
