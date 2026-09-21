import assert from "node:assert/strict";
import test from "node:test";

import { parseRegistrationSuggestionFilters } from "@/features/registrations/utils/registration-suggestion-filters";
import { registrationSuggestionsToCsv } from "@/features/registrations/utils/registration-suggestions-csv";

test("normaliza filtros del reporte de sugerencias", async () => {
  const filters = await parseRegistrationSuggestionFilters(Promise.resolve({ pagina: "2", perfil: "student", q: "  ventas  ", tipo: "training" }));
  assert.deepEqual(filters, { activityId: undefined, activityType: "training", audience: "student", page: 2, query: "ventas" });
});

test("protege el CSV de sugerencias contra fórmulas", () => {
  const csv = registrationSuggestionsToCsv([{
    academic_institution_snapshot: "Universidad de Ica",
    activity: { id: "10000000-0000-4000-8000-000000000001", title: "Evento", type: "event" },
    career_snapshot: "Administración",
    company_snapshot: null,
    created_at: "2026-09-21T12:00:00Z",
    future_topics_suggestion: "=IMPORTXML(\"https://example.test\")",
    id: "20000000-0000-4000-8000-000000000001",
    job_title_snapshot: null,
    participant_profile: "student",
    person: { document_number: "12345678", first_names: "Ana", last_names: "Prueba" },
    registration_type: "general",
    status: "confirmed",
  }]);
  assert.match(csv, /"'=IMPORTXML/);
});
