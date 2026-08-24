import Link from "next/link";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { CertificateTemplatesTable } from "@/features/certificates/components/CertificateTemplatesTable";
import { getCertificateTemplates } from "@/features/certificates/queries/get-certificate-templates";

export default async function CertificateTemplatesPage() {
  const templates = await getCertificateTemplates();
  return <div className="space-y-7"><SectionHeading description="Fondos privados, firmantes y reglas visuales de emisión." eyebrow="Configuración" title="Plantillas de certificados" /><div><Link className="rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white" href={`${ROUTES.adminCertificateTemplates}/nueva`}>Nueva plantilla</Link></div><CertificateTemplatesTable templates={templates} /></div>;
}
