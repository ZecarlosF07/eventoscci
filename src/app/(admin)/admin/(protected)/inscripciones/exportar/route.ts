import { getAdminSession } from "@/features/auth/services/admin-session";
import { getRegistrationsForExport } from "@/features/registrations/queries/get-activity-registrations";
import { parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";
import { registrationsToCsv } from "@/features/registrations/utils/registrations-csv";

export async function GET(request: Request): Promise<Response> {
  const session = await getAdminSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const params = new URL(request.url).searchParams;
  const parsed = await parseAdminRegistrationFilters(Promise.resolve({
    actividad: params.get("actividad") ?? undefined,
    asistencia: params.get("asistencia") ?? undefined,
    estado: params.get("estado") ?? undefined,
    q: params.get("q") ?? undefined,
    tipo: params.get("tipo") ?? undefined,
    tipo_actividad: params.get("tipo_actividad") ?? undefined,
  }));
  const filters = {
    activityId: parsed.activityId,
    activityType: parsed.activityType,
    attendanceStatus: parsed.attendanceStatus,
    query: parsed.query,
    registrationType: parsed.registrationType,
    status: parsed.status,
  };
  const registrations = await getRegistrationsForExport(filters);
  const csv = registrationsToCsv(registrations);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="inscripciones-${date}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
