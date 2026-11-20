"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import { ROUTES } from "@/constants/routes";
import type { CertificateSignerRow, CertificateTemplateFormProps } from "@/features/certificates/components/CertificateTemplateForm/types/certificate-template-form.types";
import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { saveCertificateTemplateAction } from "@/features/certificates/mutations/certificate-template.actions";
import type { CertificateTemplateFormState } from "@/features/certificates/types/certificate.types";
import { CERTIFICATE_HEADING_LIMIT, CERTIFICATE_RECOGNITION_LIMIT, CERTIFICATE_SIGNER_LIMIT, getCertificateDesignText } from "@/features/certificates/utils/certificate-design-text";
import { CERTIFICATE_MODEL_LABELS } from "@/features/certificates/utils/certificate-template-audience";
import { certificateTemplateShowsDate } from "@/features/certificates/utils/certificate-template-config";
import { discardStagedFormImages, stageFormImages } from "@/features/media/services/stage-form-images.client";
import { CertificateSignerFields } from "./CertificateSignerFields";

const IMAGE_FIELDS = [
  { field: "background", label: "El fondo", stagedField: "background_staged_path" },
  ...Array.from({ length: CERTIFICATE_SIGNER_LIMIT }, (_, i) => ({
    field: `signature_${i}`, label: `La firma ${i + 1}`, stagedField: `signature_${i}_staged_path`,
  })),
];

export function CertificateTemplateForm({ template }: CertificateTemplateFormProps) {
  const [audience, setAudience] = useState<keyof typeof CERTIFICATE_MODEL_LABELS>(template ? template.audience ?? "shared" : "participant");
  const [rows, setRows] = useState<CertificateSignerRow[]>(() => template?.signers.length
    ? template.signers.map((signer) => ({ key: signer.id, signer }))
    : [{ key: "new-first", signer: undefined }]);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<CertificateTemplateFormState>({});
  const [preview, setPreview] = useState("");
  const previewLink = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const design = getCertificateDesignText(template?.template_config ?? null);
  useEffect(() => {
    if (!preview) return;
    previewLink.current?.focus();
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function moveSigner(from: number, to: number) {
    const reordered = [...rows];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    setRows(reordered);
    setState({});
  }

  function submit(form: FormData, intent: string) {
    setState({});
    setPreview("");
    startTransition(async () => {
      let stagedPaths: string[] = [];
      try {
        const staged = await stageFormImages(form, CERTIFICATE_BUCKET, IMAGE_FIELDS);
        if (!staged.ok) {
          setState({ errors: staged.errors, message: "Revisa las imágenes indicadas." });
          return;
        }
        stagedPaths = staged.paths;
        if (intent.startsWith("preview")) {
          if (intent === "preview-speaker") staged.formData.set("preview_speaker", "1");
          const result = await fetch("/api/admin/certificate-templates/preview", { method: "POST", body: staged.formData });
          if (!result.ok) setState(await result.json());
          else setPreview(URL.createObjectURL(await result.blob()));
        } else {
          const result = await saveCertificateTemplateAction(staged.formData);
          setState(result);
          if (result.success && result.templateId) {
            if (!template) router.replace(`${ROUTES.adminCertificateTemplates}/${result.templateId}`);
            else router.refresh();
          }
        }
      } catch {
        setState({ message: "No se pudo completar la operación. Inténtalo nuevamente." });
      } finally {
        await discardStagedFormImages(CERTIFICATE_BUCKET, stagedPaths);
      }
    });
  }

  return <form className="space-y-6 rounded-3xl border border-cci-100 bg-white p-4 sm:p-6" method="post" onSubmit={(event) => {
    event.preventDefault();
    if (pending) return;
    const trigger = (event.nativeEvent as SubmitEvent).submitter;
    submit(new FormData(event.currentTarget), trigger instanceof HTMLButtonElement ? trigger.value : "save");
  }}>
    <fieldset className="min-w-0 space-y-6" disabled={pending}>
      <input name="id" type="hidden" value={template?.id ?? ""} />
      <input name="expected_updated_at" type="hidden" value={template?.updated_at ?? ""} />
      <input name="signer_count" type="hidden" value={rows.length} />
      <div className="grid gap-5 md:grid-cols-2">
        <FormField error={state.errors?.name?.[0]} label="Nombre interno" name="name" required>
          <Input defaultValue={template?.name} id="name" maxLength={FIELD_LIMITS.certificateTemplateName} name="name" required />
        </FormField>
        <FormField error={state.errors?.audience?.[0]} label="Tipo de certificado" name="audience">
          {template ? <><input name="audience" type="hidden" value={audience} /><p className="py-2 text-sm">{CERTIFICATE_MODEL_LABELS[audience]}</p></>
            : <Select id="audience" name="audience" value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)}>
              <option value="participant">Participación</option><option value="speaker">Ponentes</option><option value="student">Cursos</option>
            </Select>}
        </FormField>
        <FormField error={state.errors?.background?.[0]} label="Fondo" name="background"
          hint={template?.background_path ? "Hay un fondo guardado. Sube otro para reemplazarlo. Máximo 5 MB."
            : "PNG, JPG o WebP de hasta 5 MB. Si lo dejas vacío, se usará el fondo institucional."}>
          <Input accept="image/png,image/jpeg,image/webp" id="background" name="background" type="file" />
        </FormField>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium">
          <label className="flex items-center gap-2"><Checkbox defaultChecked={template?.is_active ?? true} name="is_active" />Activo</label>
          <label className="flex items-center gap-2"><Checkbox defaultChecked={template?.is_default ?? false} name="is_default" />Predeterminado</label>
          {audience !== "student" ? <label className="flex items-center gap-2"><Checkbox defaultChecked={template ? certificateTemplateShowsDate(template.template_config) : true} name="show_date" />Mostrar fechas</label> : null}
        </div>
        <FormField error={state.errors?.heading?.[0]} label="Encabezado" name="heading" hint="Déjalo vacío para usar el encabezado institucional.">
          <Textarea defaultValue={design.heading} id="heading" maxLength={CERTIFICATE_HEADING_LIMIT} name="heading" rows={3} />
        </FormField>
        {audience === "speaker" ? <input name="recognition" type="hidden" value={design.recognition ?? ""} /> : <FormField
          error={state.errors?.recognition?.[0]} label="Texto de reconocimiento" name="recognition"
          hint={audience === "shared" ? "Texto para participación. Incluye {{condicion}} y, si deseas repetir el título, {{titulo}}."
            : "Si escribes un texto propio, incluye {{condicion}}. Puedes usar {{titulo}} para repetir el título."}>
          <Textarea defaultValue={design.recognition} id="recognition" maxLength={CERTIFICATE_RECOGNITION_LIMIT} name="recognition" rows={3} />
        </FormField>}
      </div>
      <section aria-labelledby="certificate-signers" className="space-y-3">
        <h2 className="text-lg font-semibold" id="certificate-signers">Firmantes</h2>
        <p className="text-sm text-slate-600">Agrega hasta cuatro firmas en el orden en que deben aparecer en el PDF.</p>
        {rows.map(({ key, signer }, index) => <CertificateSignerFields key={key} signer={signer} index={index}
          count={rows.length} errors={state.errors} move={moveSigner} remove={() => {
            setRows(rows.filter((row) => row.key !== key));
            setState({});
          }} />)}
        <Button disabled={rows.length >= CERTIFICATE_SIGNER_LIMIT} onClick={() => setRows([...rows, { key: crypto.randomUUID(), signer: undefined }])}
          variant="secondary">Agregar firmante</Button>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" value="save">Guardar modelo</Button>
        <Button type="submit" value="preview" variant="secondary">{audience === "shared" ? "Vista previa PDF · Participación" : "Vista previa PDF"}</Button>
        {audience === "shared" ? <Button type="submit" value="preview-speaker" variant="secondary">Vista previa PDF · Ponentes</Button> : null}
      </div>
    </fieldset>
    {pending ? <p role="status" className="text-sm text-slate-700">Procesando el modelo…</p> : null}
    <FormActionNotice message={state.message} success={state.success} />
    {preview ? <div className="space-y-2 rounded-2xl bg-cci-50 p-4">
      <p role="status" className="text-sm text-cci-950">PDF de muestra listo.</p>
      <a className="inline-flex min-h-11 items-center font-semibold text-cci-800 underline" href={preview} ref={previewLink} target="_blank" rel="noreferrer">Abrir PDF de muestra en otra pestaña</a>
    </div> : null}
  </form>;
}
