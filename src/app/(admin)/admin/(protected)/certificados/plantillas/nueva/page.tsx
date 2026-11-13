import Link from "next/link";
import { redirect } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateTemplateForm } from "@/features/certificates/components/CertificateTemplateForm";

export default async function NewCertificateTemplatePage() {
  if ((await requireAdmin()).role !== "administrator") redirect(ROUTES.adminCertificateTemplates);
  return <div className="space-y-6"><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificateTemplates}>← Tipos de certificados</Link><Heading level={1}>Nuevo modelo de certificado</Heading><CertificateTemplateForm /></div>;
}
