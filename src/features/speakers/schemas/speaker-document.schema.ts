import { z } from "zod";

import { publicCertificateDniSchema } from "@/features/certificates/schemas/public-certificate-search.schema";

export const optionalSpeakerDniSchema = z.union([publicCertificateDniSchema, z.literal("")]);
export const speakerDocumentSchema = z.object({
  confirmHistory: z.boolean(),
  documentNumber: optionalSpeakerDniSchema,
  expectedDocument: optionalSpeakerDniSchema,
  reason: z.string().trim().max(500, "El motivo admite hasta 500 caracteres."),
  speakerId: z.uuid(),
});

export const speakerDocumentContextSchema = z.object({
  can_correct: z.boolean(),
  document_number: publicCertificateDniSchema.nullable(),
  has_certificates: z.boolean(),
  speaker_id: z.uuid(),
});

export const speakerDocumentConflictSchema = z.object({ name: z.string(), speakerId: z.uuid() });
