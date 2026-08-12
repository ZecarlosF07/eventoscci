import { ROUTES } from "@/constants/routes";
import type { ActivityType } from "@/features/activities/types/activity.types";

export function getPublicActivityRoute(type: ActivityType, slug?: string): string {
  const base = type === "event" ? ROUTES.events : ROUTES.trainings;
  return slug ? `${base}/${slug}` : base;
}

export function getAdminActivityRoute(type: ActivityType, id?: string): string {
  const base = type === "event" ? ROUTES.adminEvents : ROUTES.adminTrainings;
  return id ? `${base}/${id}/editar` : base;
}

export function getNewActivityRoute(type: ActivityType): string {
  return type === "event"
    ? `${ROUTES.adminEvents}/nuevo`
    : `${ROUTES.adminTrainings}/nueva`;
}
