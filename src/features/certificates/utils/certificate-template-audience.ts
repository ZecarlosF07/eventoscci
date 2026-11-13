import type { CertificateRecipientType, CertificateTemplate } from "@/features/certificates/types/certificate.types";

export const CERTIFICATE_MODEL_LABELS = {
  participant: "Participación",
  shared: "Participación y Ponentes",
  speaker: "Ponentes",
  student: "Cursos",
} as const;

export function templatesForRecipient(templates: CertificateTemplate[], recipient: CertificateRecipientType): CertificateTemplate[] {
  return templates.filter((template) => template.is_active && (recipient === "student"
    ? template.scope === "course"
    : template.scope === "activity" && (template.audience == null || template.audience === recipient)))
    .toSorted((left, right) => {
      const rank = (item: CertificateTemplate) => item.is_default ? (item.audience === recipient ? 0 : 1) : 2;
      return rank(left) - rank(right);
    });
}
