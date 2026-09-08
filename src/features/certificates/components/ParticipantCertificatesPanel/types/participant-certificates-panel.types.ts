import type { ParticipantCertificateItem } from "@/features/participants/types/participant.types";

export interface ParticipantCertificatesPanelProps {
  certificates: ParticipantCertificateItem[];
  participantId: string;
  participantName: string;
}
