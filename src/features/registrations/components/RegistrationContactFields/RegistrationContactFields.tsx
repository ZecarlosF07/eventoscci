import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { RegistrationFieldGroupProps } from "@/features/registrations/types/registration.types";

export function RegistrationContactFields({
  errors,
  isMember = false,
}: RegistrationFieldGroupProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors.email?.[0]} label="Correo electrónico" name="email" required>
        <Input autoComplete="email" id="email" name="email" required type="email" />
      </FormField>
      <FormField error={errors.phone?.[0]} label="Celular" name="phone" required>
        <Input autoComplete="tel" id="phone" inputMode="tel" maxLength={16} name="phone" required />
      </FormField>
      <FormField error={errors.job_title?.[0]} label="Cargo" name="job_title" required>
        <Input autoComplete="organization-title" id="job_title" maxLength={150} name="job_title" required />
      </FormField>
      <FormField error={errors.address?.[0]} label="Dirección" name="address">
        <Input autoComplete="street-address" id="address" maxLength={250} name="address" />
      </FormField>
      <FormField error={errors.company?.[0]} label="Empresa" name="company" required={isMember}>
        <Input autoComplete="organization" id="company" maxLength={250} name="company" required={isMember} />
      </FormField>
      <FormField error={errors.ruc?.[0]} hint="11 dígitos" label="RUC" name="ruc" required={isMember}>
        <Input id="ruc" inputMode="numeric" maxLength={11} name="ruc" pattern="[0-9]{11}" required={isMember} />
      </FormField>
    </div>
  );
}
