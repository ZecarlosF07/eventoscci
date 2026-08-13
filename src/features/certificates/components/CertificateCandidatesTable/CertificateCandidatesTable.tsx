"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Text } from "@/components/atoms/Text";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import { CertificateStatusBadge } from "@/features/certificates/components/CertificateStatusBadge";
import type { CertificateCandidatesTableProps } from "@/features/certificates/components/CertificateCandidatesTable/types/certificate-candidates-table.types";
import { issueCertificatesAction } from "@/features/certificates/mutations/certificate.actions";
import type { CertificateIssueState } from "@/features/certificates/types/certificate.types";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";

const INITIAL_STATE: CertificateIssueState = {};

export function CertificateCandidatesTable({ activityId, candidates, templates }: CertificateCandidatesTableProps) {
  const [state, action, pending] = useActionState(issueCertificatesAction.bind(null, activityId), INITIAL_STATE);
  if (!candidates.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>Esta actividad todavía no tiene inscripciones.</Text></div>;
  return <form action={action} className="space-y-4">
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
      <Select aria-label="Plantilla" defaultValue={templates.find((template) => template.is_default)?.id ?? templates[0]?.id} name="template_id" required><option disabled value="">Selecciona plantilla</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</Select>
      <Input aria-label="Condición" defaultValue="Participó" maxLength={120} name="condition" placeholder="Participó, culminó o aprobó" required />
      <Button disabled={pending || !templates.length} type="submit">{pending ? "Generando PDF…" : "Emitir seleccionados"}</Button>
    </div>
    {state.message ? <p className={`rounded-xl px-4 py-3 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`} role="status">{state.message}</p> : null}
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr><th className="px-4 py-4">Sel.</th><th className="px-4 py-4">Participante</th><th className="px-4 py-4">Inscripción</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Asistencia</th><th className="px-4 py-4">Elegibilidad</th><th className="px-4 py-4">Certificado</th></tr></thead><tbody className="divide-y divide-slate-100">{candidates.map((candidate) => {
      const eligible = candidate.status === "confirmed" && candidate.attendance.status === "attended" && !candidate.certificate;
      return <tr key={candidate.id}><td className="px-4 py-4"><Checkbox aria-label={`Seleccionar ${candidate.person.first_names}`} disabled={!eligible} name="registration_ids" value={candidate.id} /></td><td className="px-4 py-4"><p className="font-semibold text-slate-950">{candidate.person.first_names} {candidate.person.last_names}</p><Text size="sm">{candidate.person.document_number} · {candidate.person.email}</Text></td><td className="px-4 py-4 font-mono">{candidate.registration_code}</td><td className="px-4 py-4"><RegistrationStatusBadge status={candidate.status} /></td><td className="px-4 py-4"><AttendanceStatusBadge status={candidate.attendance.status} /></td><td className="px-4 py-4 text-slate-700">{eligible ? "Listo para emitir" : candidate.certificate ? "Ya emitido" : "No cumple condiciones"}</td><td className="px-4 py-4">{candidate.certificate ? <div className="space-y-1"><CertificateStatusBadge status={candidate.certificate.status} /><p className="font-mono text-xs">{candidate.certificate.certificate_code}</p></div> : "—"}</td></tr>;
    })}</tbody></table></div>
  </form>;
}
