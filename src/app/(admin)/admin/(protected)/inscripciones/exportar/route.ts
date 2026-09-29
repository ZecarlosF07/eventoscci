import { getAdminSession } from "@/features/auth/services/admin-session";
import { getRegistrationsForExport } from "@/features/registrations/queries/get-activity-registrations";
import { parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";
import { registrationsToTable } from "@/features/registrations/utils/registrations-export";
import { createXlsxResponse } from "@/utils/xlsx-export";

export async function GET(request: Request): Promise<Response> {
  const session = await getAdminSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const params = new URL(request.url).searchParams;
  const parsed = await parseAdminRegistrationFilters(Promise.resolve({
    actividad: params.get("actividad") ?? undefined,
    asistencia: params.get("asistencia") ?? undefined,
    certificado: params.get("certificado") ?? undefined,
    estado: params.get("estado") ?? undefined,
    perfil: params.get("perfil") ?? undefined,
    q: params.get("q") ?? undefined,
    tipo: params.get("tipo") ?? undefined,
    tipo_actividad: params.get("tipo_actividad") ?? undefined,
  }));
  const filters = {
    activityId: parsed.activityId,
    activityType: parsed.activityType,
    attendanceStatus: parsed.attendanceStatus,
    certificateRequest: parsed.certificateRequest,
    query: parsed.query,
    profile: parsed.profile,
    registrationType: parsed.registrationType,
    status: parsed.status,
    statusScope: params.get("estado") === "active" ? "active" as const : undefined,
  };
  const registrations = await getRegistrationsForExport(filters);
  const date = new Date().toISOString().slice(0, 10);
  return createXlsxResponse(registrationsToTable(registrations), `inscripciones-${date}`, "Inscripciones");
}
