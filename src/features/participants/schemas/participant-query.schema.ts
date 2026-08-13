import { z } from "zod";

const documentType = z.enum(["dni", "ce"]);
const attendanceStatus = z.enum(["pending", "attended", "absent"]);
const registrationStatus = z.enum(["pending", "confirmed", "cancelled"]);
const registrationType = z.enum(["general", "member"]);

export const participantListItemSchema = z.object({
  company: z.string().nullable(),
  document_number: z.string(),
  document_type: documentType,
  email: z.string(),
  first_names: z.string(),
  id: z.uuid(),
  job_title: z.string(),
  last_names: z.string(),
  phone: z.string(),
  registrations: z.array(z.object({ id: z.uuid() })),
  ruc: z.string().nullable(),
});

export const participantDetailSchema = participantListItemSchema.omit({ registrations: true }).extend({
  address: z.string().nullable(),
  created_at: z.string(),
  registrations: z.array(z.object({
    activity: z.object({
      id: z.uuid(),
      slug: z.string(),
      title: z.string(),
      type: z.enum(["event", "training"]),
    }),
    attendance: z.array(z.object({ status: attendanceStatus })),
    company_snapshot: z.string().nullable(),
    created_at: z.string(),
    id: z.uuid(),
    price_snapshot: z.number(),
    registration_code: z.string(),
    registration_type: registrationType,
    ruc_snapshot: z.string().nullable(),
    status: registrationStatus,
  })),
});
