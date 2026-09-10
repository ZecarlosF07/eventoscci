import { ROUTES } from "@/constants/routes";

export function getActivityParticipationRoute(activityId: string): string {
  return `${ROUTES.adminRegistrations}/${activityId}`;
}

export function getActivityAttendanceRoute(activityId: string): string {
  return `${getActivityParticipationRoute(activityId)}/asistencia`;
}
