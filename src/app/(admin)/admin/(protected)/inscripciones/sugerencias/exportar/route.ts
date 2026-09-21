import { getAdminSession } from "@/features/auth/services/admin-session";
import { getRegistrationSuggestionsForExport } from "@/features/registrations/queries/get-registration-suggestions";
import { registrationSuggestionsToCsv } from "@/features/registrations/utils/registration-suggestions-csv";
import { parseRegistrationSuggestionFilters } from "@/features/registrations/utils/registration-suggestion-filters";

export async function GET(request: Request): Promise<Response> {
  const session = await getAdminSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const params = new URL(request.url).searchParams;
  const parsed = await parseRegistrationSuggestionFilters(Promise.resolve({
    actividad: params.get("actividad") ?? undefined,
    perfil: params.get("perfil") ?? undefined,
    q: params.get("q") ?? undefined,
    tipo: params.get("tipo") ?? undefined,
  }));
  const items = await getRegistrationSuggestionsForExport({
    activityId: parsed.activityId,
    activityType: parsed.activityType,
    audience: parsed.audience,
    query: parsed.query,
  });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(registrationSuggestionsToCsv(items), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="sugerencias-${date}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
