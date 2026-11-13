import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { CertificateSignerFieldsProps } from "./types/certificate-template-form.types";

export function CertificateSignerFields({ signer, index, count, errors, move, remove }: CertificateSignerFieldsProps) {
  const name = `signer_name_${index}`;
  const title = `signer_title_${index}`;
  const signature = `signature_${index}`;
  const position = index + 1;
  const imageHint = signer?.signature_path ? "Firma guardada. Selecciona un archivo para reemplazarla."
    : signer ? "Firma histórica sin imagen. Puedes agregar una." : "Se recomienda PNG transparente. Máximo 5 MB.";

  return <div className="space-y-4 rounded-2xl bg-cci-50 p-4">
    <input type="hidden" name={`signer_id_${index}`} value={signer?.id ?? ""} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">Firmante {position}</h3>
      <div className="flex flex-wrap gap-2">
        <Button aria-label={`Subir firmante ${position}`} disabled={index === 0} onClick={() => move(index, index - 1)} variant="secondary">Subir</Button>
        <Button aria-label={`Bajar firmante ${position}`} disabled={index === count - 1} onClick={() => move(index, index + 1)} variant="secondary">Bajar</Button>
        <Button aria-label={`Quitar firmante ${position}`} disabled={count === 1} onClick={remove} variant="secondary">Quitar</Button>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <FormField error={errors?.[name]?.[0]} label="Nombre" name={name} required>
        <Input defaultValue={signer?.signer_name} id={name} maxLength={FIELD_LIMITS.certificateSignerName} name={name} required />
      </FormField>
      <FormField error={errors?.[title]?.[0]} label="Cargo" name={title}>
        <Input defaultValue={signer?.signer_title ?? ""} id={title} maxLength={200} name={title} />
      </FormField>
      <FormField error={errors?.[signature]?.[0]} hint={imageHint} label="Imagen de la firma" name={signature} required={!signer}>
        <Input accept="image/png,image/jpeg,image/webp" id={signature} name={signature} required={!signer} type="file" />
      </FormField>
    </div>
  </div>;
}
