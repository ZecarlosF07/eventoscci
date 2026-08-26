"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import type { CertificateTemplateFormProps } from "@/features/certificates/components/CertificateTemplateForm/types/certificate-template-form.types";
import { saveCertificateTemplateAction } from "@/features/certificates/mutations/certificate-template.actions";
import type { CertificateTemplateFormState } from "@/features/certificates/types/certificate.types";
import { certificateTemplateShowsDate } from "@/features/certificates/utils/certificate-template-config";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: CertificateTemplateFormState = {};

export function CertificateTemplateForm({ template }: CertificateTemplateFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveCertificateTemplateAction, INITIAL_STATE);
  const [scope, setScope] = useState(template?.scope ?? "activity");
  const signers = template?.signers.length ? template.signers : [{ id: "new", signer_name: "Eduardo Ojeda Davila", signer_title: "Presidente Institucional", signature_path: null, sort_order: 0 }];
  return <form className="space-y-6 rounded-3xl border border-cci-100 bg-white p-6" encType="multipart/form-data" method="post" onSubmit={onSubmit}>
    <input name="id" type="hidden" value={template?.id ?? ""} /><input name="existing_background_path" type="hidden" value={template?.background_path ?? ""} />
    <div className="grid gap-5 md:grid-cols-2"><FormField error={state.errors?.name?.[0]} label="Nombre" name="name" required><Input defaultValue={template?.name ?? ""} id="name" name="name" required /></FormField><FormField error={state.errors?.scope?.[0]} label="Alcance" name="scope"><Select defaultValue={scope} id="scope" name="scope" onChange={(event) => setScope(event.target.value as "activity" | "course")}><option value="activity">Actividades</option><option value="course">Cursos virtuales</option></Select></FormField><FormField error={state.errors?.background?.[0]} hint="Si no cargas uno, se usa el fondo institucional incluido." label="Fondo" name="background"><Input accept="image/png,image/jpeg,image/webp" id="background" name="background" type="file" /></FormField><div className="flex flex-wrap items-center gap-5 pt-8"><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template?.is_active ?? true} name="is_active" />Activa</label><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template?.is_default ?? false} name="is_default" />Predeterminada</label><label className="flex items-center gap-2 text-sm font-medium"><Checkbox defaultChecked={template ? certificateTemplateShowsDate(template.template_config) : true} disabled={scope === "course"} name="show_date" />Mostrar fechas</label></div></div>
    {scope === "course" ? <p className="text-sm text-slate-600">Los certificados de cursos virtuales omiten siempre las fechas.</p> : null}
    <div className="space-y-4"><h2 className="text-lg font-semibold">Firmantes</h2><p className="text-sm text-slate-600">Puedes configurar hasta tres firmantes por plantilla.</p>{Array.from({ length: 3 }, (_, index) => { const signer = signers[index]; return <div className="grid gap-4 rounded-2xl bg-cci-50 p-4 md:grid-cols-3" key={index}><input name={`existing_signature_path_${index}`} type="hidden" value={signer?.signature_path ?? ""} /><FormField error={state.errors?.[`signer_name_${index}`]?.[0]} label={`Firmante ${index + 1}`} name={`signer_name_${index}`}><Input defaultValue={signer?.signer_name ?? ""} id={`signer_name_${index}`} name={`signer_name_${index}`} /></FormField><FormField error={state.errors?.[`signer_title_${index}`]?.[0]} label="Cargo" name={`signer_title_${index}`}><Input defaultValue={signer?.signer_title ?? ""} id={`signer_title_${index}`} name={`signer_title_${index}`} /></FormField><FormField error={state.errors?.[`signature_${index}`]?.[0]} label="Firma" name={`signature_${index}`}><Input accept="image/png,image/jpeg,image/webp" id={`signature_${index}`} name={`signature_${index}`} type="file" /></FormField></div>; })}</div>
    <FormActionNotice message={state.message} success={state.success} /><Button disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar plantilla"}</Button>
  </form>;
}
