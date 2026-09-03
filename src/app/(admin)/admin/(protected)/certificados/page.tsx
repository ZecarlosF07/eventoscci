import { CertificatesManagementTemplate } from "@/components/templates/CertificatesManagementTemplate";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { getCertificates } from "@/features/certificates/queries/get-certificates";
import type { CertificatesAdminPageProps } from "@/features/certificates/types/certificate.types";

function first(value?: string | string[]): string | undefined { return Array.isArray(value) ? value[0] : value; }

export default async function CertificatesPage({ searchParams }: CertificatesAdminPageProps) {
  const pageValue = Number(first((await searchParams).pagina));
  const [account, data] = await Promise.all([
    requireAdmin(),
    getCertificates(Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1),
  ]);
  return <CertificatesManagementTemplate canViewAudit={account.role === "administrator"} data={data} />;
}
