import type { Database } from "@/lib/supabase/database.types";

type SpeakerRow = Database["public"]["Tables"]["speakers"]["Row"];

export type SpeakerSummary = Pick<
  SpeakerRow,
  | "first_names"
  | "id"
  | "is_active"
  | "last_names"
  | "linkedin_url"
  | "organization"
  | "photo_path"
  | "professional_title"
  | "specialties"
  | "website_url"
>;
