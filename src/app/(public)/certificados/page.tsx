import type { Metadata } from "next";

import { CertificateLookupTemplate } from "@/components/templates/CertificateLookupTemplate";
import { ROUTES } from "@/constants/routes";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export const metadata: Metadata = {
  description: "Consulta y descarga tus certificados emitidos por la Cámara de Comercio de Ica.",
  title: "Mis certificados",
};

export default async function PublicCertificatesPage() {
  const account = await getCurrentAccount();
  const hasActiveAccount = Boolean(account?.isActive);
  const accountHref = hasActiveAccount
    ? ROUTES.campusCertificates
    : `${ROUTES.register}?next=${encodeURIComponent(ROUTES.campusCertificates)}`;
  return <CertificateLookupTemplate accountHref={accountHref} accountLabel={hasActiveAccount ? "Ver en Mi Campus" : "Crear cuenta en el Campus"} />;
}
