import { z } from "zod";

const attendeeSchema = z.object({
  document_type: z.enum(["dni", "ce"]),
  document_number: z.string().trim().toUpperCase(),
  first_names: z.string().trim().min(2).max(120),
  last_names: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase().max(320),
  phone: z.string().trim().transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^\+?\d{7,15}$/.test(value)),
  job_title: z.string().trim().min(2).max(150),
  request_certificate: z.boolean(),
}).superRefine((attendee, context) => {
  const valid = attendee.document_type === "dni"
    ? /^\d{8}$/.test(attendee.document_number)
    : /^[A-Z0-9]{6,20}$/.test(attendee.document_number);
  if (!valid) context.addIssue({ code: "custom", message: "Revisa el número de documento.", path: ["document_number"] });
});

const billingSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("boleta"), document: z.string().regex(/^\d{8}$/), name: z.string().trim().min(2).max(250), address: z.string().optional() }),
  z.object({ type: z.literal("factura"), document: z.string().regex(/^\d{11}$/), name: z.string().trim().min(2).max(250), address: z.string().trim().min(2).max(250) }),
]);

export const memberGroupInputSchema = z.object({
  attendees: z.array(attendeeSchema).min(1).max(500),
  billing: billingSchema.nullable(),
  expected_free_count: z.number().int().min(0).max(500),
  future_topics_suggestion: z.string().trim().max(500),
  ruc: z.string().regex(/^\d{11}$/),
}).superRefine((input, context) => {
  const documents = new Set<string>();
  input.attendees.forEach((attendee, index) => {
    const key = `${attendee.document_type}:${attendee.document_number}`;
    if (documents.has(key)) context.addIssue({ code: "custom", message: "Esta persona ya figura en la solicitud.", path: ["attendees", index, "document_number"] });
    documents.add(key);
  });
});

export const memberCompanyLookupSchema = z.object({ legal_name: z.string(), ruc: z.string() });
export const memberPassAvailabilitySchema = z.object({ quota: z.number(), used: z.number(), remaining: z.number() });

export const memberGroupResultSchema = z.object({
  activity_slug: z.string(),
  activity_title: z.string(),
  activity_type: z.literal("event"),
  attendees: z.array(z.object({
    first_names: z.string(), last_names: z.string(), price: z.number(),
    is_complimentary: z.boolean(),
    registration_code: z.string(), status: z.enum(["pending", "confirmed", "cancelled"]),
  })),
  company_name: z.string(),
  company_ruc: z.string(),
  confirmed_amount: z.number(),
  confirmed_count: z.number(),
  contact_whatsapp_phone: z.string().nullable(),
  is_free: z.boolean(),
  complimentary_count: z.number(),
  pending_amount: z.number(),
  pending_count: z.number(),
  request_code: z.string(),
  request_id: z.uuid(),
  total: z.number(),
});

export const memberGroupSubmissionSchema = memberGroupResultSchema.extend({
  access_token: z.uuid(),
  replayed: z.boolean(),
});

export const memberGroupAdminListSchema = z.object({
  items: z.array(z.object({
    id: z.uuid(), activity_id: z.uuid(), activity_title: z.string(), age_days: z.number(),
    billing_document: z.string().nullable(), billing_type: z.string().nullable(),
    company_name_snapshot: z.string(), company_ruc: z.string(),
    complimentary_quota: z.number(), complimentary_used: z.number(),
    confirmed_amount: z.number(), confirmed_count: z.number(),
    coordinator_email: z.string().nullable(), coordinator_name: z.string(), created_at: z.string(),
    group_status: z.enum(["pending", "partial", "complete"]),
    pending_amount: z.number(), pending_count: z.number(), request_code: z.string(),
    seat_count: z.number(), total: z.number(),
  })),
  total: z.number(),
  ruc_summary: z.object({ requests: z.number(), seats: z.number(), total: z.number(), pending: z.number() }).nullable(),
});
