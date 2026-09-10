import type {
  ActivityModality,
  ActivityStatus,
  ActivityType,
} from "@/features/activities/types/activity.types";
import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export const ACTIVITY_IMAGE_BUCKET = "activity-images";
export const ACTIVITY_PAGE_SIZE = 10;
export const PUBLIC_ACTIVITY_PAGE_SIZE = 12;
export const PUBLIC_ACTIVITY_HISTORY_DAYS = 10;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  event: "Evento",
  training: "Capacitación",
};

export const ACTIVITY_MODALITY_LABELS: Record<ActivityModality, string> = {
  hybrid: "Híbrida",
  in_person: "Presencial",
  virtual: "Virtual",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  archived: "Archivada",
  cancelled: "Cancelada",
  draft: "Borrador",
  finished: "Finalizada",
  published: "Publicada",
};

export const PUBLIC_ACTIVITY_STATUSES: ActivityStatus[] = [
  "published",
  "finished",
  "cancelled",
];

export const ACTIVITY_CERTIFICATE_MODE_LABELS: Record<ActivityCertificateMode, string> = {
  included: "Certificado incluido en la participación",
  none: "Sin certificado",
  optional_paid: "Certificado opcional con costo",
};
