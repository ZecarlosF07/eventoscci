import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateTemplateForm } from "@/features/certificates/components/CertificateTemplateForm";
import { getCertificateTemplateById } from "@/features/certificates/queries/get-certificate-templates";
import type { CertificateTemplateEditPageProps } from "@/features/certificates/types/certificate.types";

export default async function EditCertificateTemplatePage({ params }: CertificateTemplateEditPageProps) {
  if ((await requireAdmin()).role !== "administrator") redirect(ROUTES.adminCertificateTemplates);
  const template = await getCertificateTemplateById((await params).id);
  if (!template) notFound();
  return <div className="space-y-6"><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificateTemplates}>← Tipos de certificados</Link><Heading level={1}>{template.name}</Heading><CertificateTemplateForm key={template.updated_at} template={template} /></div>;
}
