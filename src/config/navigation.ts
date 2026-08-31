import { ROUTES } from "@/constants/routes";
import type { NavigationItem } from "@/types/navigation.types";

export const PUBLIC_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.home, label: "Inicio" },
  { href: ROUTES.events, label: "Eventos" },
  { href: ROUTES.trainings, label: "Capacitaciones" },
  { href: ROUTES.courses, label: "Cursos" },
];

export const ADMIN_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.admin, label: "Resumen" },
  { href: ROUTES.adminEvents, label: "Eventos" },
  { href: ROUTES.adminTrainings, label: "Capacitaciones" },
  { href: ROUTES.adminCourses, label: "Cursos" },
  { href: ROUTES.adminRegistrations, label: "Inscripciones" },
  { href: ROUTES.adminParticipants, label: "Participantes" },
  { href: ROUTES.adminAttendance, label: "Asistencia" },
  { href: ROUTES.adminCertificates, label: "Certificados" },
  { href: ROUTES.adminNotifications, label: "Notificaciones" },
];

export const CAMPUS_NAVIGATION: NavigationItem[] = [
  { href: ROUTES.campus, label: "Inicio" },
  { href: ROUTES.campusCourses, label: "Mis cursos" },
  { href: ROUTES.campusCertificates, label: "Certificados" },
  { href: ROUTES.campusProfile, label: "Mi perfil" },
];
