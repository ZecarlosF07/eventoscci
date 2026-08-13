import { ROUTES } from "@/constants/routes";
import type { NavigationItem } from "@/types/navigation.types";

export const PUBLIC_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.home, label: "Inicio" },
  { href: ROUTES.events, label: "Eventos" },
  { href: ROUTES.trainings, label: "Capacitaciones" },
  { href: ROUTES.campus, label: "Campus" },
  { href: ROUTES.admin, label: "Administración" },
];

export const ADMIN_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.admin, label: "Resumen" },
  { href: ROUTES.adminEvents, label: "Eventos" },
  { href: ROUTES.adminTrainings, label: "Capacitaciones" },
  { href: ROUTES.adminRegistrations, label: "Inscripciones" },
  { href: ROUTES.adminParticipants, label: "Participantes" },
  { href: ROUTES.adminAttendance, label: "Asistencia" },
];
