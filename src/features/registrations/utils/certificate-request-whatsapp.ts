import { normalizeWhatsAppPhone } from "@/features/activities/utils/activity-contact";
import { REGISTRATION_TYPE_LABELS } from "@/features/registrations/constants/registration.constants";
import type { CertificateRequestWhatsAppInput } from "@/features/registrations/types/certificate-request.types";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function getCertificateRequestWhatsAppUrl({
  activityTitle,
  certificatePrice,
  phone,
  registrationCode,
  registrationType,
}: CertificateRequestWhatsAppInput): string | null {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return null;

  const message = [
    `Hola, deseo solicitar el certificado de “${activityTitle}”.`,
    `Código de inscripción: ${registrationCode}.`,
    `Tarifa aplicable: ${REGISTRATION_TYPE_LABELS[registrationType]} — ${formatRegistrationPrice(certificatePrice)}.`,
  ].join("\n");

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
