import type { ActivityType } from "@/features/activities/types/activity.types";
import type { ParticipantProfile, RegistrationStatus, RegistrationType } from "@/features/registrations/types/registration.types";

export type RegistrationSuggestionAudience = "all" | "member" | ParticipantProfile;

export interface RegistrationSuggestionFilters {
  activityId?: string;
  activityType?: ActivityType;
  audience: RegistrationSuggestionAudience;
  page: number;
  query?: string;
}

export interface RegistrationSuggestionItem {
  academic_institution_snapshot: string | null;
  activity: { id: string; title: string; type: ActivityType };
  career_snapshot: string | null;
  company_snapshot: string | null;
  created_at: string;
  future_topics_suggestion: string;
  id: string;
  job_title_snapshot: string | null;
  participant_profile: ParticipantProfile;
  person: {
    document_number: string;
    first_names: string;
    last_names: string;
  };
  registration_type: RegistrationType;
  status: RegistrationStatus;
}

export interface RegistrationSuggestionPage {
  items: RegistrationSuggestionItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface RegistrationSuggestionsPageProps {
  searchParams: Promise<{
    actividad?: string | string[];
    pagina?: string | string[];
    perfil?: string | string[];
    q?: string | string[];
    tipo?: string | string[];
  }>;
}
