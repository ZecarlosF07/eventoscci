import { ROUTES } from "@/constants/routes";

const ALLOWED_PREFIXES = [ROUTES.admin, ROUTES.campus];

export function safeAuthRedirect(value: string | null | undefined, fallback: string = ROUTES.campus): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  return ALLOWED_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}/`))
    ? value
    : fallback;
}

export function safeAdminRedirect(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return ROUTES.admin;
  return value === ROUTES.admin || value.startsWith(`${ROUTES.admin}/`)
    ? value
    : ROUTES.admin;
}
