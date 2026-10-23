import { z } from "zod";

import type { SpeakerCertificateCandidate } from "@/features/certificates/types/speaker-certificate.types";

export const speakerCertificateEmailSchema = z.string().trim().pipe(z.email());

export function hasValidSpeakerCertificateEmail(email: unknown): boolean {
  return speakerCertificateEmailSchema.safeParse(email).success;
}

export function canIssueSpeakerCertificate(candidate: SpeakerCertificateCandidate, readOnly = false): boolean {
  return !readOnly && Boolean(candidate.documentContext.documentNumber)
    && hasValidSpeakerCertificateEmail(candidate.email)
    && (!candidate.certificateId || (!candidate.filePath && candidate.certificateStatus !== "revoked"));
}
