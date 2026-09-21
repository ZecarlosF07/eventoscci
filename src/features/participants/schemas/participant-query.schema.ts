import { z } from "zod";

const documentType = z.enum(["dni", "ce"]);
const attendanceStatus = z.enum(["pending", "attended", "absent"]);
const registrationStatus = z.enum(["pending", "confirmed", "cancelled"]);
const registrationType = z.enum(["general", "member"]);
const participantProfile = z.enum(["professional", "student"]);

export const participantListItemSchema = z.object({
  academic_institution: z.string().nullable(),
  career: z.string().nullable(),
  company: z.string().nullable(),
  document_number: z.string(),
  document_type: documentType,
  email: z.string(),
  first_names: z.string(),
  id: z.uuid(),
  job_title: z.string().nullable(),
  last_names: z.string(),
  phone: z.string(),
  participant_profile: participantProfile,
  registrations: z.array(z.object({ id: z.uuid() })),
  ruc: z.string().nullable(),
});

export const participantDetailSchema = participantListItemSchema.omit({ registrations: true }).extend({
  address: z.string().nullable(),
  certificates: z.array(z.object({
    certificate_code: z.string(),
    certificate_type: z.enum(["activity", "course"]),
    id: z.uuid(),
    issued_at: z.string(),
    participant_name_snapshot: z.string(),
    revocation_reason: z.string().nullable(),
    status: z.enum(["issued", "revoked"]),
    title_snapshot: z.string(),
  })),
  created_at: z.string(),
  registrations: z.array(z.object({
    academic_institution_snapshot: z.string().nullable(),
    activity: z.object({
      id: z.uuid(),
      slug: z.string(),
      title: z.string(),
      type: z.enum(["event", "training"]),
    }),
    attendance: z.array(z.object({ status: attendanceStatus })),
    company_snapshot: z.string().nullable(),
    career_snapshot: z.string().nullable(),
    created_at: z.string(),
    id: z.uuid(),
    job_title_snapshot: z.string().nullable(),
    participant_profile: participantProfile,
    price_snapshot: z.number(),
    registration_code: z.string(),
    registration_type: registrationType,
    ruc_snapshot: z.string().nullable(),
    status: registrationStatus,
  })),
});
