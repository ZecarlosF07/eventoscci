import type { SpeakerCertificateCandidate } from "@/features/certificates/types/speaker-certificate.types";

export function getSpeakerCertificateNames(
  candidates: Pick<SpeakerCertificateCandidate, "certificateName" | "firstNames" | "lastNames" | "speakerId">[],
  overrides: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(candidates.map((candidate) => [candidate.speakerId,
    candidate.certificateName ?? overrides[candidate.speakerId] ?? `${candidate.firstNames} ${candidate.lastNames}`]));
}
