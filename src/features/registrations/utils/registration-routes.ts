import { ROUTES } from "@/constants/routes";
import type { ActivityType } from "@/features/activities/types/activity.types";

export function getRegistrationRoute(type: ActivityType, slug: string): string {
  const baseRoute = type === "event" ? ROUTES.events : ROUTES.trainings;
  return `${baseRoute}/${slug}/inscripcion`;
}

export function getRegistrationResultRoute(
  type: ActivityType,
  slug: string,
  registrationCode: string,
  requestToken?: string,
): string {
  const route = `${getRegistrationRoute(type, slug)}/resultado`;
  const params = new URLSearchParams({ codigo: registrationCode });
  if (requestToken) params.set("solicitud", requestToken);
  return `${route}?${params.toString()}`;
}
