"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { CertificateStatusBadge } from "@/features/certificates/components/CertificateStatusBadge";
import { issueSpeakerCertificatesAction } from "@/features/certificates/mutations/speaker-certificate.actions";
import type {
  SpeakerCertificateIssueState,
  SpeakerCertificateTableProps,
} from "@/features/certificates/types/speaker-certificate.types";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";
import { getSpeakerCertificateNames } from "@/features/certificates/utils/speaker-certificate-names";
import { canIssueSpeakerCertificate } from "@/features/certificates/utils/speaker-certificate-eligibility";
import { usePersistentAction } from "@/hooks/use-persistent-action";

import { SpeakerCertificateActions } from "./SpeakerCertificateActions";
import { SpeakerCertificateNameField } from "./SpeakerCertificateNameField";
import { SpeakerProfileEditor } from "./SpeakerProfileEditor";

const INITIAL_STATE: SpeakerCertificateIssueState = {};

export function SpeakerCertificateTable({ activityId, candidates, templates, readOnly = false }: SpeakerCertificateTableProps) {
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const certificateNames = getSpeakerCertificateNames(candidates, names);
  const [roles, setRoles] = useState<Record<string, string>>(
    Object.fromEntries(candidates.map((candidate) => [candidate.speakerId, candidate.roleLabel || "Ponente"])),
  );
  const action = async (previous: SpeakerCertificateIssueState, formData: FormData) => {
    const ids = formData.getAll("speaker_ids").map(String);
    const processed: string[] = [];
    let errors = 0;
    let failureMessage = "";
    for (const [index, id] of ids.entries()) {
      setFeedback(`Procesando ${index + 1} de ${ids.length}…`);
      const single = new FormData();
      single.set("template_id", String(formData.get("template_id")));
      single.set("speaker_ids", id);
      single.set(`role_${id}`, String(formData.get(`role_${id}`)));
      single.set(`full_name_${id}`, String(formData.get(`full_name_${id}`)));
      try {
        const result = await issueSpeakerCertificatesAction(activityId, previous, single);
        processed.push(...result.processedSpeakerIds ?? []);
        if (!result.success) { errors += 1; failureMessage = result.message ?? ""; }
      } catch { errors += 1; }
    }
    setSelected((current) => current.filter((id) => !processed.includes(id)));
    setFeedback("");
    return { success: errors === 0, errorCount: errors, message: `${processed.length} certificados disponibles. ${errors ? `${errors} pendientes. ${failureMessage || "Conserva la selección y reintenta en unos minutos."}` : ""}` };
  };
  const { onSubmit, pending, state } = usePersistentAction(action, INITIAL_STATE);
  const selectable = candidates.filter((candidate) => canIssueSpeakerCertificate(candidate, readOnly));
  const selectedForEmission = selectable.filter((candidate) => selected.includes(candidate.speakerId)).map((candidate) => candidate.speakerId);
  const allSelected = selectable.length > 0 && selectable.every((candidate) => selected.includes(candidate.speakerId));

  function toggle(speakerId: string) {
    setSelected((current) => current.includes(speakerId) ? current.filter((id) => id !== speakerId) : [...current, speakerId]);
  }

  return <form className="space-y-4" method="post" onSubmit={(event) => {
    if (!selectedForEmission.length) { event.preventDefault(); return; }
    if (!window.confirm(`Se prepararán ${selectedForEmission.length} certificados con los roles indicados y se notificará por correo. ¿Confirmar emisión?`)) { event.preventDefault(); return; }
    onSubmit(event);
  }}>
    {readOnly ? <p role="status" className="rounded-xl bg-cci-50 p-4">Actividad archivada. Solo lectura.</p> : null}
    {feedback ? <p role="status" className="text-sm text-cci-800">{feedback}</p> : null}
    {selectedForEmission.map((speakerId) => <div key={speakerId}>
      <input name="speaker_ids" type="hidden" value={speakerId} />
      <input name={`role_${speakerId}`} type="hidden" value={roles[speakerId] ?? "Ponente"} />
      <input name={`full_name_${speakerId}`} type="hidden" value={certificateNames[speakerId] ?? ""} />
    </div>)}
    <div className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <label className="text-sm font-semibold">Plantilla institucional
        <select className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" defaultValue={templates.find((template) => template.is_default)?.id ?? templates[0]?.id ?? ""} name="template_id">
          <option disabled value="">Selecciona plantilla</option>
          {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
      </label>
      <Button className="w-full lg:w-auto" disabled={readOnly || pending || !selectedForEmission.length} type="submit">{pending ? "Generando PDF…" : `Emitir / recuperar (${selectedForEmission.length})`}</Button>
    </div>
    <p className="text-sm text-slate-600">Para emitir necesitas DNI y correo electrónico válido. Complétalos en «Datos del ponente». «Editar nombre» cambia solo el texto impreso.</p>
    {!templates.length ? <p role="status" className="text-sm text-amber-800">No hay plantillas activas. Puedes recuperar certificados preparados; para nuevas emisiones activa una plantilla.</p> : null}
    {!candidates.length ? <p className="rounded-xl border border-dashed p-6">Esta actividad no tiene ponentes asignados ni certificados anteriores.</p> : null}
    <FormActionNotice message={state.message} success={state.success} warning={Boolean(state.errorCount)} />
    <ResponsiveTableFrame className="rounded-3xl [&>p]:hidden" label="Ponentes candidatos a certificado">
      <table className="block w-full text-left text-sm md:table md:min-w-[1050px]">
        <thead className="hidden border-b border-cci-100 bg-cci-50 text-slate-600 md:table-header-group"><tr>
          <th className="px-4 py-4"><input aria-label="Seleccionar todos los pendientes" checked={allSelected} disabled={!selectable.length || pending} onChange={() => setSelected(allSelected ? [] : selectable.map((candidate) => candidate.speakerId))} type="checkbox" /></th>
          <th className="px-4 py-4">Ponente</th><th className="px-4 py-4">Datos del ponente</th><th className="px-4 py-4">Rol en certificado</th><th className="px-4 py-4">Certificado</th>
        </tr></thead>
        <tbody className="block divide-y divide-slate-100 md:table-row-group">{candidates.map((candidate) => {
          const imageUrl = getSpeakerImageUrl(candidate.photoPath);
          return <tr className="grid grid-cols-[44px_minmax(0,1fr)] p-3 md:table-row md:p-0" key={candidate.speakerId}>
            <td className="block md:table-cell md:px-4 md:py-4"><label className="grid min-h-11 min-w-11 place-items-center"><input aria-label={`Seleccionar a ${candidate.firstNames} ${candidate.lastNames}`} checked={selectedForEmission.includes(candidate.speakerId)} disabled={!selectable.includes(candidate) || pending} onChange={() => toggle(candidate.speakerId)} type="checkbox" /></label></td>
            <td className="block p-2 md:table-cell md:px-4 md:py-4"><div className="flex items-center gap-3">{imageUrl ? <Image alt="" className="size-12 shrink-0 rounded-xl object-cover" height={48} src={imageUrl} width={48} /> : <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-cci-950 font-bold text-cci-lime">{candidate.firstNames[0]}{candidate.lastNames[0]}</span>}<div className="min-w-0 flex-1"><SpeakerCertificateNameField disabled={pending} editable={!readOnly && !candidate.certificateId} onChange={(name) => setNames((current) => ({ ...current, [candidate.speakerId]: name }))} speakerId={candidate.speakerId} value={certificateNames[candidate.speakerId]} /><p className="text-xs text-slate-600">{candidate.organization || "Sin organización"}</p></div></div></td>
            <td className="col-span-2 block p-2 md:table-cell md:px-4 md:py-4"><span className="mb-1 block text-xs text-slate-600 md:hidden">Datos del ponente</span><SpeakerProfileEditor activityId={activityId} candidate={candidate} disabled={readOnly || pending} /></td>
            <td className="col-span-2 block p-2 md:table-cell md:px-4 md:py-4"><span className="mb-1 block text-xs text-slate-600 md:hidden">Rol en certificado</span><Input aria-label={`Rol de ${candidate.firstNames} ${candidate.lastNames}`} disabled={readOnly || Boolean(candidate.certificateId) || pending} maxLength={120} onChange={(event) => setRoles((current) => ({ ...current, [candidate.speakerId]: event.target.value }))} required={selectedForEmission.includes(candidate.speakerId)} value={roles[candidate.speakerId] ?? "Ponente"} /></td>
            <td className="col-span-2 block p-2 md:table-cell md:px-4 md:py-4">{candidate.certificateId && candidate.certificateStatus ? <div className="space-y-2"><CertificateStatusBadge status={candidate.certificateStatus} /><p className="font-mono text-xs">{candidate.certificateCode}</p><SpeakerCertificateActions activityId={activityId} candidate={candidate} readOnly={readOnly} /></div> : "Pendiente"}</td>
          </tr>;
        })}</tbody>
      </table>
    </ResponsiveTableFrame>
  </form>;
}
