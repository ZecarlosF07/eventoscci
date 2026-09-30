import { PARTICIPANT_PROFILE_LABELS } from "@/features/registrations/constants/registration.constants";
import type { RegistrationSuggestionItem } from "@/features/registrations/types/registration-suggestion.types";
import type { ExportTable } from "@/utils/xlsx-export";

export function registrationSuggestionsToTable(items: RegistrationSuggestionItem[]): ExportTable {
  const headers = ["Fecha", "Actividad", "Tipo", "Participante", "Documento", "Perfil", "Contexto", "Sugerencia"];
  const rows = items.map((item) => [
    item.created_at,
    item.activity.title,
    item.activity.type === "event" ? "Evento" : "Capacitación",
    `${item.person.first_names} ${item.person.last_names}`,
    item.person.document_number,
    item.registration_type === "member" ? "Asociado CCI" : PARTICIPANT_PROFILE_LABELS[item.participant_profile],
    item.participant_profile === "student" ? `${item.academic_institution_snapshot ?? ""} · ${item.career_snapshot ?? ""}` : `${item.job_title_snapshot ?? ""} · ${item.company_snapshot ?? ""}`,
    item.future_topics_suggestion,
  ]);
  return { headers, rows };
}
