import { z } from "zod";

import { CERTIFICATE_FULL_NAME_MAX_LENGTH } from "@/features/certificates/constants/certificate.constants";

export const speakerCertificateRecipientSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa el nombre completo para el certificado.")
    .max(CERTIFICATE_FULL_NAME_MAX_LENGTH, `El nombre no puede superar ${CERTIFICATE_FULL_NAME_MAX_LENGTH} caracteres.`).optional(),
  role: z.string().trim().min(2, "Indica el rol del ponente.").max(120, "El rol no puede superar 120 caracteres."),
  speakerId: z.uuid(),
});

const preparedSpeakerCertificateSchema = z.object({
  certificate_id: z.uuid(),
  speaker_id: z.uuid(),
});

export const prepareSpeakerCertificateResultSchema = z.object({
  existing: z.array(preparedSpeakerCertificateSchema.extend({ file_ready: z.boolean() })),
  prepared: z.array(preparedSpeakerCertificateSchema),
  rejected: z.array(z.object({ reason: z.string(), speaker_id: z.uuid() })),
});

export const finalizeSpeakerCertificateResultSchema = z.object({
  certificate_id: z.uuid(),
  changed: z.boolean(),
  notification_queued: z.boolean(),
});
