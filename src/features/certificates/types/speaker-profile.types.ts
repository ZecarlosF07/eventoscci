import type { SpeakerAdminRecord } from "@/features/catalogs/types/catalog.types";
import type { SpeakerCertificateCandidate } from "@/features/certificates/types/speaker-certificate.types";

export interface SpeakerProfileLoadResult {
  message?: string;
  record?: SpeakerAdminRecord;
}

export interface SpeakerProfileEditorProps {
  activityId: string;
  candidate: SpeakerCertificateCandidate;
  disabled: boolean;
}

export interface SpeakerProfileDialogProps {
  activityId: string;
  onClose: () => void;
  speakerId: string;
}
