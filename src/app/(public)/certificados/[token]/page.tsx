import { notFound } from "next/navigation";

import { CertificatePublicTemplate } from "@/components/templates/CertificatePublicTemplate";
import { getPublicCertificate } from "@/features/certificates/queries/get-public-certificate";
import type { CertificateRouteProps } from "@/features/certificates/types/certificate.types";

export default async function PublicCertificatePage({ params }: CertificateRouteProps) {
  const { token } = await params;
  const certificate = await getPublicCertificate(token);
  if (!certificate) notFound();
  return <CertificatePublicTemplate certificate={certificate} token={token} />;
}
