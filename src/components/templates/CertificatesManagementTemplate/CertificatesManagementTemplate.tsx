import Link from "next/link";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { CertificatesManagementTemplateProps } from "@/components/templates/CertificatesManagementTemplate/types/certificates-management-template.types";
import { ROUTES } from "@/constants/routes";
import { CertificatesTable } from "@/features/certificates/components/CertificatesTable";

export function CertificatesManagementTemplate({ data }: CertificatesManagementTemplateProps) {
  return <div className="space-y-7"><SectionHeading description={`${data.total} certificados históricos de eventos y capacitaciones.`} eyebrow="Emisión institucional" title="Certificados" /><nav className="flex flex-wrap gap-2"><Link className="rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white" href={ROUTES.adminCertificatesActivities}>Emitir por actividad</Link><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" href={ROUTES.adminCertificateTemplates}>Plantillas y firmantes</Link></nav><CertificatesTable certificates={data.certificates} /><Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCertificates} /></div>;
}
