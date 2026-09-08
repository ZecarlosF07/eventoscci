import type { ParticipantCertificateItem } from "@/features/participants/types/participant.types";

export function selectOutdatedCertificates(
  certificates: ParticipantCertificateItem[],
  participantName: string,
): ParticipantCertificateItem[] {
  const currentName = participantName.trim();
  return certificates.filter((certificate) => (
    certificate.status === "issued"
    && certificate.participant_name_snapshot !== currentName
  ));
}
