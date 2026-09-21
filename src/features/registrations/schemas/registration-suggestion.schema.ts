import { z } from "zod";

export const registrationSuggestionItemSchema = z.object({
  academic_institution_snapshot: z.string().nullable(),
  activity: z.object({
    id: z.uuid(),
    title: z.string(),
    type: z.enum(["event", "training"]),
  }),
  career_snapshot: z.string().nullable(),
  company_snapshot: z.string().nullable(),
  created_at: z.string(),
  future_topics_suggestion: z.string(),
  id: z.uuid(),
  job_title_snapshot: z.string().nullable(),
  participant_profile: z.enum(["professional", "student"]),
  person: z.object({
    document_number: z.string(),
    first_names: z.string(),
    last_names: z.string(),
  }),
  registration_type: z.enum(["general", "member"]),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
