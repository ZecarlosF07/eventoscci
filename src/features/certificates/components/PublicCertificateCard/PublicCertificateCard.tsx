import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { PublicCertificateCardProps } from "@/features/certificates/components/PublicCertificateCard/types/public-certificate-card.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

export function PublicCertificateCard({ certificate }: PublicCertificateCardProps) {
  const revoked = certificate.status === "revoked";
  const detailHref = `/certificados/${certificate.access_token}`;
  return (
    <article className="flex h-full flex-col rounded-3xl border border-cci-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge>{certificate.certificate_type === "course" ? "Curso" : "Actividad"}</Badge>
        <Badge variant={revoked ? "warning" : "success"}>{revoked ? "Revocado" : "Vigente"}</Badge>
      </div>
      <div className="mt-5">
        <Heading level={3}>{certificate.title}</Heading>
        <Text className="mt-2 font-mono" size="sm">{certificate.certificate_code}</Text>
      </div>
      <dl className="mt-5 grid gap-3 border-y border-cci-100 py-5 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Emitido</dt><dd className="mt-1 font-semibold text-cci-950">{formatRegistrationDate(certificate.issued_at)}</dd></div>
        <div><dt className="text-slate-500">Condición</dt><dd className="mt-1 font-semibold text-cci-950">{certificate.condition ?? "Participó"}</dd></div>
        {certificate.date_text ? <div><dt className="text-slate-500">Fecha certificada</dt><dd className="mt-1 font-semibold text-cci-950">{certificate.date_text}</dd></div> : null}
        {certificate.academic_hours !== null ? <div><dt className="text-slate-500">Horas académicas</dt><dd className="mt-1 font-semibold text-cci-950">{certificate.academic_hours}</dd></div> : null}
      </dl>
      {revoked ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No disponible para descarga. {certificate.revocation_reason ?? "Consulta con la Cámara para más información."}</p> : null}
      {!revoked && !certificate.download_available ? <p className="mt-4 rounded-xl bg-cci-50 p-3 text-sm text-slate-600">El archivo todavía está siendo preparado.</p> : null}
      <div className="mt-auto flex flex-wrap gap-3 pt-5">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cci-200 px-4 text-sm font-semibold text-cci-950 hover:bg-cci-50" href={detailHref}>Ver certificado</Link>
        {certificate.download_available ? <a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white hover:bg-cci-800" href={`${detailHref}/descargar`}>Descargar PDF</a> : null}
      </div>
    </article>
  );
}
