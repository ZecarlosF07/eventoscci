"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { Text } from "@/components/atoms/Text";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { ROUTES } from "@/constants/routes";
import { CertificateRegenerationDialog } from "@/features/certificates/components/CertificateRegenerationDialog";
import { CertificateStatusBadge } from "@/features/certificates/components/CertificateStatusBadge";
import type { ParticipantCertificatesPanelProps } from "@/features/certificates/components/ParticipantCertificatesPanel/types/participant-certificates-panel.types";
import {
  regenerateParticipantCertificatesAction,
  revokeCertificateAction,
} from "@/features/certificates/mutations/certificate.actions";
import type { CertificateRegenerationState } from "@/features/certificates/types/certificate.types";
import { selectOutdatedCertificates } from "@/features/certificates/utils/select-outdated-certificates";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: CertificateRegenerationState = {};

export function ParticipantCertificatesPanel({ certificates, participantId, participantName }: ParticipantCertificatesPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const action = regenerateParticipantCertificatesAction.bind(null, participantId);
  const { onSubmit, pending, state } = usePersistentAction(action, INITIAL_STATE);
  const outdated = selectOutdatedCertificates(certificates, participantName);
  const returnPath = `${ROUTES.adminParticipants}/${participantId}`;
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  function submitRegeneration(event: FormEvent<HTMLFormElement>) {
    onSubmit(event);
    setDialogOpen(false);
  }

  if (!certificates.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Text>Este participante todavía no tiene certificados.</Text></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-cci-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-cci-950">{certificates.length} certificados registrados</p>
          <Text size="sm">{outdated.length ? `${outdated.length} necesitan actualizar el nombre impreso.` : "Todos muestran el nombre actual."}</Text>
        </div>
        {outdated.length ? <Button disabled={pending} onClick={() => setDialogOpen(true)}>{pending ? "Regenerando…" : "Regenerar certificados"}</Button> : null}
      </div>
      <FormActionNotice message={state.message} success={state.success} warning={state.warning} />
      <ResponsiveTableFrame className="rounded-3xl" label="Certificados del participante">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-4">Código</th><th className="px-4 py-4">Certificado</th><th className="px-4 py-4">Nombre impreso</th><th className="px-4 py-4">Emisión</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Acción</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {certificates.map((certificate) => (
              <tr key={certificate.id}>
                <td className="px-4 py-4 font-mono font-semibold">{certificate.certificate_code}</td>
                <td className="px-4 py-4"><p className="font-medium text-cci-950">{certificate.title_snapshot}</p><Text size="sm">{certificate.certificate_type === "course" ? "Curso" : "Actividad"}</Text></td>
                <td className="px-4 py-4">{certificate.participant_name_snapshot}</td>
                <td className="px-4 py-4">{formatRegistrationDate(certificate.issued_at)}</td>
                <td className="px-4 py-4"><CertificateStatusBadge status={certificate.status} /></td>
                <td className="px-4 py-4">{certificate.status === "issued" ? <form action={revokeCertificateAction.bind(null, certificate.id, returnPath)} className="flex gap-2"><Input aria-label={`Motivo para revocar ${certificate.certificate_code}`} maxLength={500} name="revocation_reason" placeholder="Motivo obligatorio" required /><SubmitButton pendingLabel="Revocando…" variant="subtle">Revocar</SubmitButton></form> : <Text size="sm">{certificate.revocation_reason ?? "Sin motivo registrado"}</Text>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTableFrame>
      {dialogOpen ? <CertificateRegenerationDialog certificates={outdated} onClose={closeDialog} onSubmit={submitRegeneration} participantName={participantName} pending={pending} /> : null}
    </div>
  );
}
