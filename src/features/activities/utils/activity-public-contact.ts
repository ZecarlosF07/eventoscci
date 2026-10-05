import { ROUTES } from "@/constants/routes";
import type { ActivityType } from "@/features/activities/types/activity.types";

export function canShowActivityPublicContact(type: ActivityType, membersOnly: boolean): boolean {
  return type !== "event" || !membersOnly;
}

export function isEventContactPage(pathname: string): boolean {
  const eventPrefix = `${ROUTES.events}/`;
  if (!pathname.startsWith(eventPrefix)) return false;
  const segments = pathname.slice(eventPrefix.length).split("/").filter(Boolean);
  if (`${eventPrefix}${segments[0]}` === ROUTES.eventHistory) return false;
  return segments.length === 1 || (segments.length === 2 && segments[1] === "inscripcion");
}
