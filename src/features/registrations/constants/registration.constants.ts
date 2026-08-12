import type {
  RegistrationAvailabilityReason,
  RegistrationErrorCode,
  RegistrationStatus,
  RegistrationType,
} from "@/features/registrations/types/registration.types";

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  cancelled: "Cancelada",
  confirmed: "Confirmada",
  pending: "Preinscrito / No confirmado",
};

export const REGISTRATION_TYPE_LABELS: Record<RegistrationType, string> = {
  general: "Público general",
  member: "Asociado CCI",
};

export const REGISTRATION_AVAILABILITY_LABELS: Record<
  RegistrationAvailabilityReason,
  string
> = {
  available: "Inscribirme",
  cancelled: "Actividad cancelada",
  closed: "Inscripciones cerradas",
  full: "Cupos agotados",
  not_open: "Inscripciones próximamente",
};

export const REGISTRATION_ERROR_MESSAGES: Record<RegistrationErrorCode, string> = {
  ACTIVITY_NOT_FOUND: "La actividad ya no se encuentra disponible.",
  DATABASE_ERROR: "No pudimos procesar la inscripción. Inténtalo nuevamente.",
  DUPLICATE_REGISTRATION: "Ya te encuentras inscrito en esta actividad.",
  INVALID_MEMBER_DATA:
    "Para inscribirte como asociado debes indicar una empresa y un RUC válido.",
  NO_AVAILABLE_CAPACITY: "No quedan cupos disponibles para esta actividad.",
  REGISTRATION_CLOSED: "Las inscripciones para esta actividad están cerradas.",
  VALIDATION_ERROR: "Revisa los datos ingresados antes de continuar.",
};

export const REGISTRATION_PAGE_SIZE = 15;
