import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import { CertificateStatusBadge } from "@/features/certificates/components/CertificateStatusBadge";
import type { CertificatesTableProps } from "@/features/certificates/components/CertificatesTable/types/certificates-table.types";
import { revokeCertificateAction } from "@/features/certificates/mutations/certificate.actions";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

export function CertificatesTable({ certificates }: CertificatesTableProps) {
  if (!certificates.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay certificados emitidos.</Text></div>;
  return <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white"><table className="w-full min-w-[1300px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr><th className="px-4 py-4">Código</th><th className="px-4 py-4">Participante</th><th className="px-4 py-4">Origen</th><th className="px-4 py-4">Título</th><th className="px-4 py-4">Emisión</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{certificates.map((certificate) => <tr key={certificate.id}><td className="px-4 py-4 font-mono font-semibold">{certificate.certificate_code}</td><td className="px-4 py-4">{certificate.participant_name_snapshot}</td><td className="px-4 py-4">{certificate.certificate_type === "course" ? "Curso" : "Actividad"}</td><td className="px-4 py-4">{certificate.title_snapshot}</td><td className="px-4 py-4">{formatRegistrationDate(certificate.issued_at)}</td><td className="px-4 py-4"><CertificateStatusBadge status={certificate.status} /></td><td className="px-4 py-4"><div className="flex gap-2">{certificate.registration ? <Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 font-semibold" href={`${ROUTES.adminCertificatesActivities}/${certificate.registration.activity_id}`}>Actividad</Link> : null}{certificate.status === "issued" ? <form action={revokeCertificateAction.bind(null, certificate.id, ROUTES.adminCertificates)} className="flex gap-2"><Input aria-label="Motivo de revocación" maxLength={500} name="revocation_reason" placeholder="Motivo obligatorio" required /><SubmitButton pendingLabel="Revocando…" variant="subtle">Revocar</SubmitButton></form> : <Text size="sm">{certificate.revocation_reason}</Text>}</div></td></tr>)}</tbody></table></div>;
}
