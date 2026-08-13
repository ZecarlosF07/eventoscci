import Link from "next/link";
import { notFound } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { ROUTES } from "@/constants/routes";
import { CertificateTemplateForm } from "@/features/certificates/components/CertificateTemplateForm";
import { getCertificateTemplateById } from "@/features/certificates/queries/get-certificate-templates";
import type { CertificateTemplateEditPageProps } from "@/features/certificates/types/certificate.types";

export default async function EditCertificateTemplatePage({ params }: CertificateTemplateEditPageProps) {
  const template = await getCertificateTemplateById((await params).id);
  if (!template) notFound();
  return <div className="space-y-6"><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificateTemplates}>← Plantillas</Link><Heading level={1}>Editar plantilla</Heading><CertificateTemplateForm template={template} /></div>;
}
