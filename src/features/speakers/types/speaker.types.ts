import type { Database } from "@/lib/supabase/database.types";

type SpeakerRow = Database["public"]["Tables"]["speakers"]["Row"];

export type SpeakerSummary = Pick<
  SpeakerRow,
  | "first_names"
  | "id"
  | "last_names"
  | "organization"
  | "professional_title"
>;
