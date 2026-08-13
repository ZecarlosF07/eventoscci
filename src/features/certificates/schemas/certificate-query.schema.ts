import { z } from "zod";

export const certificateSignerSchema = z.object({
  id: z.uuid(),
  signature_path: z.string().nullable(),
  signer_name: z.string(),
  signer_title: z.string().nullable(),
  sort_order: z.number(),
});

export const certificateTemplateSchema = z.object({
  background_path: z.string().nullable(),
  id: z.uuid(),
  is_active: z.boolean(),
  is_default: z.boolean(),
  name: z.string(),
  scope: z.enum(["activity", "course"]),
  signers: z.array(certificateSignerSchema),
  template_config: z.json(),
  updated_at: z.string(),
});

export const certificateGenerationSchema = z.object({
  access_token: z.uuid(),
  academic_hours_snapshot: z.number().nullable(),
  certificate_code: z.string(),
  certificate_type: z.enum(["activity", "course"]),
  condition_snapshot: z.string().nullable(),
  date_text_snapshot: z.string().nullable(),
  file_path: z.string().nullable(),
  id: z.uuid(),
  participant_name_snapshot: z.string(),
  status: z.enum(["issued", "revoked"]),
  title_snapshot: z.string(),
});

export const certificateCandidateRegistrationSchema = z.object({
  attendance: z.array(z.object({ status: z.enum(["pending", "attended", "absent"]) })),
  company_snapshot: z.string().nullable(),
  id: z.uuid(),
  person: z.object({
    document_number: z.string(),
    email: z.string(),
    first_names: z.string(),
    last_names: z.string(),
  }),
  registration_code: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const certificateAdminItemSchema = z.object({
  certificate_code: z.string(),
  condition_snapshot: z.string().nullable(),
  file_path: z.string().nullable(),
  id: z.uuid(),
  issued_at: z.string(),
  participant_name_snapshot: z.string(),
  registration: z.object({ activity_id: z.uuid() }).nullable(),
  revocation_reason: z.string().nullable(),
  status: z.enum(["issued", "revoked"]),
  title_snapshot: z.string(),
});
