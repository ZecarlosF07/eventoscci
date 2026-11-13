import Link from "next/link";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateTemplatesTable } from "@/features/certificates/components/CertificateTemplatesTable";
import { getCertificateTemplates } from "@/features/certificates/queries/get-certificate-templates";

export default async function CertificateTemplatesPage() {
  const [account, templates] = await Promise.all([requireAdmin(), getCertificateTemplates()]);
  const canManage = account.role === "administrator";
  return <div className="space-y-7">
    <Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCatalogs}>← Catálogos</Link>
    <SectionHeading description="Configura el fondo, el reconocimiento y las firmas que se usan al emitir." title="Tipos de certificados" />
    {canManage ? <Link className="inline-flex min-h-11 items-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white"
      href={`${ROUTES.adminCertificateTemplates}/nueva`}>Nuevo modelo</Link> : null}
    <CertificateTemplatesTable canManage={canManage} templates={templates} />
  </div>;
}
