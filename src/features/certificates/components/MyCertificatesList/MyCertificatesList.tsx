import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CertificateGenerationStatus } from "@/features/certificates/components/CertificateGenerationStatus";
import type { MyCertificatesListProps } from "@/features/certificates/types/certificate.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

export function MyCertificatesList({ certificates }: MyCertificatesListProps) {
  if (!certificates.length) {
    return <div className="rounded-2xl border border-dashed p-10 text-center"><Text>Aún no tienes certificados emitidos.</Text></div>;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {certificates.map((certificate) => {
        const revoked = certificate.status === "revoked";
        return (
          <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6" key={certificate.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge>{certificate.certificateType === "course" ? "Curso" : "Actividad"}</Badge>
              <Badge variant={revoked ? "warning" : "success"}>{revoked ? "Revocado" : "Vigente"}</Badge>
            </div>
            <div>
              <Heading level={2}>{certificate.title}</Heading>
              <Text className="mt-1" size="sm">{certificate.certificateCode}</Text>
            </div>
            <Text size="sm">Emitido el {formatRegistrationDate(certificate.issuedAt)}</Text>
            {revoked ? (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                Este certificado ya no es válido. {certificate.revocationReason ?? ""}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {certificate.fileReady ? (
                  <>
                    <Link className="font-semibold underline" href={`/certificados/${certificate.accessToken}`}>Ver certificado</Link>
                    <a className="font-semibold underline" href={`/certificados/${certificate.accessToken}/descargar`}>Descargar PDF</a>
                  </>
                ) : null}
                {certificate.certificateType === "course" ? (
                  <CertificateGenerationStatus certificateId={certificate.id} fileReady={certificate.fileReady} />
                ) : null}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
