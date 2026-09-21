import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ProfessionalRegistrationFieldsProps } from "@/features/registrations/components/ProfessionalRegistrationFields/types/professional-registration-fields.types";

export function ProfessionalRegistrationFields({ active, errors, isMember }: ProfessionalRegistrationFieldsProps) {
  return (
    <fieldset disabled={!active} hidden={!active}>
      <legend className="mb-4 text-base font-bold text-cci-950">Información profesional</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.job_title?.[0]} label="Cargo" name="job_title" required>
          <Input aria-invalid={Boolean(errors.job_title?.[0])} autoComplete="organization-title" id="job_title" maxLength={150} name="job_title" required={active} />
        </FormField>
        <FormField error={errors.address?.[0]} label="Dirección" name="address">
          <Input aria-invalid={Boolean(errors.address?.[0])} autoComplete="street-address" id="address" maxLength={250} name="address" />
        </FormField>
        <FormField error={errors.company?.[0]} label="Empresa" name="company" required={isMember}>
          <Input aria-invalid={Boolean(errors.company?.[0])} autoComplete="organization" id="company" maxLength={250} name="company" required={active && isMember} />
        </FormField>
        <FormField error={errors.ruc?.[0]} hint="11 dígitos" label="RUC" name="ruc" required={isMember}>
          <Input aria-invalid={Boolean(errors.ruc?.[0])} id="ruc" inputMode="numeric" maxLength={11} name="ruc" pattern="[0-9]{11}" required={active && isMember} />
        </FormField>
      </div>
    </fieldset>
  );
}
