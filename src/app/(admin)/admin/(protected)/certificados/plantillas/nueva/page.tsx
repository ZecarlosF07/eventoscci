import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { ROUTES } from "@/constants/routes";
import { CertificateTemplateForm } from "@/features/certificates/components/CertificateTemplateForm";

export default function NewCertificateTemplatePage() {
  return <div className="space-y-6"><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificateTemplates}>← Plantillas</Link><Heading level={1}>Nueva plantilla</Heading><CertificateTemplateForm /></div>;
}
