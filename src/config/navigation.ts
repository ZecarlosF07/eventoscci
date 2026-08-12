import { ROUTES } from "@/constants/routes";
import type { NavigationItem } from "@/types/navigation.types";

export const PUBLIC_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.home, label: "Inicio" },
  { href: ROUTES.campus, label: "Campus" },
  { href: ROUTES.admin, label: "Administración" },
];
