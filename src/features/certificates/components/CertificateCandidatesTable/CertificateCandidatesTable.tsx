"use client";

import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { ROUTES } from "@/constants/routes";
import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import { SelectedInputs, SelectionCheckbox, SelectionSummary, useSelectionWorkspace } from "@/features/admin-filters/components/SelectionWorkspace";
import { WorkspaceDraftInput, WorkspaceDraftSelect } from "@/features/admin-filters/components/WorkspaceDraftControls";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import type { CertificateCandidatesTableProps } from "@/features/certificates/components/CertificateCandidatesTable/types/certificate-candidates-table.types";
import { CertificateStatusBadge } from "@/features/certificates/components/CertificateStatusBadge";
import { issueCertificatesAction } from "@/features/certificates/mutations/certificate.actions";
import type { CertificateIssueState } from "@/features/certificates/types/certificate.types";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import type { CertificateCommercialStatus } from "@/features/registrations/types/certificate-commercial-status.types";
import {
  CERTIFICATE_COMMERCIAL_STATUS_LABELS,
  getCertificateCommercialStatus,
} from "@/features/registrations/utils/certificate-commercial-status";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: CertificateIssueState = {};

function commercialBadgeVariant(status: CertificateCommercialStatus): "neutral" | "success" | "warning" {
  if (status === "issued" || status === "ready_to_issue") return "success";
  if (status === "payment_pending" || status === "payment_verified_pending_attendance") return "warning";
  return "neutral";
}

export function CertificateCandidatesTable({
  activityId,
  candidates,
  certificateMode,
  templates,
}: CertificateCandidatesTableProps) {
  const { selected, clear } = useSelectionWorkspace();
  const { busy } = useFilterWorkspace();
  const visibleIds = candidates.map((item) => item.id);
  const issueAction = async (previous: CertificateIssueState, data: FormData) => {
    try {
      const result = await issueCertificatesAction(activityId, previous, data);
      if (result.processedRegistrationIds?.length) clear(result.processedRegistrationIds);
      return result;
    } catch {
      return { success: false, message: "No se pudo completar la emisión. Conservamos la selección; revisa el estado antes de reintentar." };
    }
  };
  const { onSubmit, pending, state } = usePersistentAction(issueAction, INITIAL_STATE);
  return (
    <form className="space-y-4" method="post" onSubmit={(event) => {
      const hidden = selected.filter((item) => !visibleIds.includes(item.id)).length;
      if (hidden && !window.confirm(`Se emitirán certificados para ${selected.length} seleccionados, incluidos ${hidden} fuera de esta vista. ¿Confirmar?`)) { event.preventDefault(); return; }
      onSubmit(event);
    }}>
      <SelectionSummary visibleIds={visibleIds} />
      <SelectedInputs name="registration_ids" />
      <div className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <WorkspaceDraftSelect draftKey="certificate-template" aria-label="Plantilla" defaultValue={templates.find((template) => template.is_default)?.id ?? templates[0]?.id} name="template_id" required>
          <option disabled value="">Selecciona plantilla</option>
          {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </WorkspaceDraftSelect>
        <WorkspaceDraftInput draftKey="certificate-condition" aria-label="Condición" defaultValue="Participó" maxLength={120} name="condition" placeholder="Participó, culminó o aprobó" required />
        <Button className="w-full lg:w-auto" disabled={pending || busy || !templates.length || !selected.length} type="submit">{pending ? "Generando PDF…" : "Emitir seleccionados"}</Button>
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">La selección continúa siendo manual. En certificados con costo, verifica el estado comercial antes de emitir.</p>
      <FormActionNotice message={state.message} success={state.success} />
      {state.failedRegistrationIds?.length ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm" role="status">Sin procesar: {state.failedRegistrationIds.map((id) => selected.find((item) => item.id === id)?.name ?? id).join(", ")}. Permanecen seleccionados para revisarlos.</p> : null}
      {!candidates.length ? <p className="rounded-xl border border-dashed p-6">No hay participantes con estos filtros. La selección anterior se conserva.</p> : null}
      <ResponsiveTableFrame className="rounded-3xl" label="Candidatos a certificados">
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-4">Sel.</th><th className="px-4 py-4">Participante</th><th className="px-4 py-4">Inscripción</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Asistencia</th><th className="px-4 py-4">Estado comercial</th><th className="px-4 py-4">Emisión manual</th><th className="px-4 py-4">Certificado</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{candidates.map((candidate) => {
            const selectable = candidate.status === "confirmed" && candidate.attendance.status === "attended" && !candidate.certificate;
            const commercialStatus = getCertificateCommercialStatus({
              attendanceStatus: candidate.attendance.status,
              certificateMode: candidate.certificateMode,
              certificatePaymentVerifiedAt: candidate.certificatePaymentVerifiedAt,
              certificateRequestedAt: candidate.certificateRequestedAt,
              certificateStatus: candidate.certificate?.status,
              currentMode: certificateMode,
              registrationStatus: candidate.status,
            });
            const emissionLabel = candidate.certificate
              ? "Ya emitido"
              : selectable ? "Selección disponible" : "No cumple inscripción y asistencia";
            return (
              <tr key={candidate.id}>
                <td className="px-4 py-4"><SelectionCheckbox item={{ id: candidate.id, name: `${candidate.person.first_names} ${candidate.person.last_names}` }} disabled={!selectable || commercialStatus !== "ready_to_issue" || pending} /></td>
                <td className="px-4 py-4"><Link className="font-semibold text-cci-950 hover:underline" href={`${ROUTES.adminParticipants}/${candidate.person.id}`}>{candidate.person.first_names} {candidate.person.last_names}</Link><Text size="sm">{candidate.person.document_number} · {candidate.person.email}</Text></td>
                <td className="px-4 py-4 font-mono">{candidate.registration_code}</td>
                <td className="px-4 py-4"><RegistrationStatusBadge status={candidate.status} /></td>
                <td className="px-4 py-4"><AttendanceStatusBadge status={candidate.attendance.status} /></td>
                <td className="px-4 py-4"><div className="space-y-2"><Badge variant={commercialBadgeVariant(commercialStatus)}>{CERTIFICATE_COMMERCIAL_STATUS_LABELS[commercialStatus]}</Badge>{candidate.certificateMode === "optional_paid" && candidate.certificatePrice ? <p className="text-xs text-slate-600">{formatRegistrationPrice(candidate.certificatePrice)}</p> : null}</div></td>
                <td className="px-4 py-4 text-slate-700">{emissionLabel}</td>
                <td className="px-4 py-4">{candidate.certificate ? <div className="space-y-1"><CertificateStatusBadge status={candidate.certificate.status} /><p className="font-mono text-xs">{candidate.certificate.certificate_code}</p></div> : "—"}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </ResponsiveTableFrame>
    </form>
  );
}
