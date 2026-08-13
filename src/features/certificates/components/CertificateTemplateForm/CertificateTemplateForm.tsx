"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { CertificateTemplateFormProps } from "@/features/certificates/components/CertificateTemplateForm/types/certificate-template-form.types";
import { saveCertificateTemplateAction } from "@/features/certificates/mutations/certificate-template.actions";
import type { CertificateTemplateFormState } from "@/features/certificates/types/certificate.types";
import { certificateTemplateShowsDate } from "@/features/certificates/utils/certificate-template-config";

const INITIAL_STATE: CertificateTemplateFormState = {};

export function CertificateTemplateForm({ template }: CertificateTemplateFormProps) {
  const [state, action, pending] = useActionState(saveCertificateTemplateAction, INITIAL_STATE);
  const [scope, setScope] = useState(template?.scope ?? "activity");
  const signers = template?.signers.length ? template.signers : [{ id: "new", signer_name: "Eduardo Ojeda Davila", signer_title: "Presidente Institucional", signature_path: null, sort_order: 0 }];
  return <form action={action} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6" encType="multipart/form-data">
    <input name="id" type="hidden" value={template?.id ?? ""} /><input name="existing_background_path" type="hidden" value={template?.background_path ?? ""} />
    <div className="grid gap-5 md:grid-cols-2"><FormField error={state.errors?.name?.[0]} label="Nombre" name="name" required><Input defaultValue={template?.name ?? ""} id="name" name="name" required /></FormField><FormField label="Alcance" name="scope"><Select defaultValue={scope} id="scope" name="scope" onChange={(event) => setScope(event.target.value as "activity" | "course")}><option value="activity">Actividades</option><option value="course">Cursos virtuales</option></Select></FormField><FormField hint="Si no cargas uno, se usa el fondo institucional incluido." label="Fondo" name="background"><Input accept="image/png,image/jpeg,image/webp" id="background" name="background" type="file" /></FormField><div className="flex flex-wrap items-center gap-5 pt-8"><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template?.is_active ?? true} name="is_active" />Activa</label><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template?.is_default ?? false} name="is_default" />Predeterminada</label><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template ? certificateTemplateShowsDate(template.template_config) : true} disabled={scope === "course"} name="show_date" />Mostrar fechas</label></div></div>
    {scope === "course" ? <p className="text-sm text-slate-600">Los certificados de cursos virtuales omiten siempre las fechas.</p> : null}
    <div className="space-y-4"><h2 className="text-lg font-semibold">Firmantes</h2><p className="text-sm text-slate-600">Puedes configurar hasta tres firmantes por plantilla.</p>{Array.from({ length: 3 }, (_, index) => { const signer = signers[index]; return <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" key={index}><input name={`existing_signature_path_${index}`} type="hidden" value={signer?.signature_path ?? ""} /><FormField label={`Firmante ${index + 1}`} name={`signer_name_${index}`}><Input defaultValue={signer?.signer_name ?? ""} id={`signer_name_${index}`} name={`signer_name_${index}`} /></FormField><FormField label="Cargo" name={`signer_title_${index}`}><Input defaultValue={signer?.signer_title ?? ""} id={`signer_title_${index}`} name={`signer_title_${index}`} /></FormField><FormField label="Firma" name={`signature_${index}`}><Input accept="image/png,image/jpeg,image/webp" id={`signature_${index}`} name={`signature_${index}`} type="file" /></FormField></div>; })}</div>
    {state.message ? <p className={`text-sm font-medium ${state.success ? "text-emerald-700" : "text-rose-700"}`} role="status">{state.message}</p> : null}<Button disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar plantilla"}</Button>
  </form>;
}
