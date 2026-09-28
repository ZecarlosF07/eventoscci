import { ROUTES } from "@/constants/routes";

export function getActivityParticipationRoute(activityId: string): string {
  return `${ROUTES.adminRegistrations}/${activityId}`;
}

export function getActivityAttendanceRoute(activityId: string): string {
  return `${getActivityParticipationRoute(activityId)}/asistencia`;
}

export function getActivityPaymentsRoute(activityId: string, requestId?: string, certificateId?: string): string {
  const params = new URLSearchParams();
  if (requestId) params.set("solicitud", requestId);
  if (certificateId) params.set("certificado", certificateId);
  if (requestId || certificateId) params.set("estado", "all");
  if (certificateId) params.set("estado_certificado", "all");
  const query = params.toString();
  return `${getActivityParticipationRoute(activityId)}/pagos${query ? `?${query}` : ""}`;
}
