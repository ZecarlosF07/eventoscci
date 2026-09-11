import { z } from "zod";

export const attendanceActivityOptionSchema = z.object({
  id: z.uuid(),
  registrations: z.array(z.object({ id: z.uuid() })),
  status: z.enum(["draft", "published", "finished", "archived", "cancelled"]),
  title: z.string(),
  type: z.enum(["event", "training"]),
});

export const attendanceRegistrationSchema = z.object({
  activity: z.object({
    certificate_mode: z.enum(["none", "included", "optional_paid"]),
    id: z.uuid(),
    status: z.enum(["draft", "published", "finished", "archived", "cancelled"]),
  }),
  attendance: z.array(z.object({
    id: z.uuid(),
    marked_at: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.enum(["pending", "attended", "absent"]),
  })),
  company_snapshot: z.string().nullable(),
  certificate: z.array(z.object({ id: z.uuid(), status: z.enum(["issued", "revoked"]) })),
  certificate_mode_snapshot: z.enum(["none", "included", "optional_paid"]),
  certificate_payment_verified_at: z.string().nullable(),
  certificate_payment_verified_by: z.string().nullable(),
  certificate_price_snapshot: z.number().nullable(),
  certificate_requested_at: z.string().nullable(),
  certificate_requested_by: z.string().nullable(),
  id: z.uuid(),
  person: z.object({
    document_number: z.string(),
    email: z.string(),
    first_names: z.string(),
    last_names: z.string(),
    phone: z.string(),
  }),
  registration_code: z.string(),
  registration_type: z.enum(["general", "member"]),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
