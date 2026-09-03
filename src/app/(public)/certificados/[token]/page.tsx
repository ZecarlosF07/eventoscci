import { notFound } from "next/navigation";

import { CertificatePublicTemplate } from "@/components/templates/CertificatePublicTemplate";
import { ROUTES } from "@/constants/routes";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getCertificateRecommendationsSafely } from "@/features/certificates/queries/get-certificate-recommendations";
import { getPublicCertificate } from "@/features/certificates/queries/get-public-certificate";
import type { CertificateRouteProps } from "@/features/certificates/types/certificate.types";

export default async function PublicCertificatePage({ params }: CertificateRouteProps) {
  const { token } = await params;
  const [account, certificate] = await Promise.all([getCurrentAccount(), getPublicCertificate(token)]);
  if (!certificate) notFound();
  const context = certificate.source_activity_id && certificate.source_activity_type ? {
    source_activity_id: certificate.source_activity_id,
    source_activity_type: certificate.source_activity_type,
    source_category_id: certificate.source_category_id,
  } : null;
  const recommendations = await getCertificateRecommendationsSafely(context);
  const hasActiveAccount = Boolean(account?.isActive);
  const accountHref = hasActiveAccount ? ROUTES.campusCertificates : `${ROUTES.register}?next=${encodeURIComponent(ROUTES.campusCertificates)}`;
  return <CertificatePublicTemplate accountHref={accountHref} accountLabel={hasActiveAccount ? "Ver en Mi Campus" : "Crear cuenta en el Campus"} certificate={certificate} recommendations={recommendations} token={token} />;
}
