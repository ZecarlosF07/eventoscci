import type { RegistrationSuggestionItem } from "@/features/registrations/types/registration-suggestion.types";

function csvCell(value: string | null): string {
  let text = value ?? "";
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function registrationSuggestionsToCsv(items: RegistrationSuggestionItem[]): string {
  const headers = ["Fecha", "Actividad", "Tipo", "Participante", "Documento", "Perfil", "Contexto", "Sugerencia"];
  const rows = items.map((item) => [
    item.created_at,
    item.activity.title,
    item.activity.type === "event" ? "Evento" : "Capacitación",
    `${item.person.first_names} ${item.person.last_names}`,
    item.person.document_number,
    item.registration_type === "member" ? "Asociado CCI" : item.participant_profile === "student" ? "Estudiante" : "Profesional o independiente",
    item.participant_profile === "student" ? `${item.academic_institution_snapshot ?? ""} · ${item.career_snapshot ?? ""}` : `${item.job_title_snapshot ?? ""} · ${item.company_snapshot ?? ""}`,
    item.future_topics_suggestion,
  ]);
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
