import type { Metadata } from "next";

import { CertificateLookupTemplate } from "@/components/templates/CertificateLookupTemplate";
import { ROUTES } from "@/constants/routes";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export const metadata: Metadata = buildPageMetadata({
  description: "Consulta y descarga certificados emitidos por eventos, capacitaciones y cursos de la Cámara de Comercio de Ica.",
  path: ROUTES.certificates,
  title: "Consulta de certificados CCI",
});

export default async function PublicCertificatesPage() {
  const account = await getCurrentAccount();
  const hasActiveAccount = Boolean(account?.isActive);
  const accountHref = hasActiveAccount
    ? ROUTES.campusCertificates
    : `${ROUTES.register}?next=${encodeURIComponent(ROUTES.campusCertificates)}`;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Certificados", path: ROUTES.certificates },
  ], getSiteUrl());
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <CertificateLookupTemplate accountHref={accountHref} accountLabel={hasActiveAccount ? "Ver en Mi Campus" : "Crear cuenta en el Campus"} />
    </>
  );
}
