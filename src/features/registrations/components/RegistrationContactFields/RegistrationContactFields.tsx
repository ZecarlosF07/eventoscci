import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { RegistrationFieldGroupProps } from "@/features/registrations/types/registration.types";

export function RegistrationContactFields({
  errors,
}: RegistrationFieldGroupProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors.email?.[0]} label="Correo electrónico" name="email" required>
        <Input aria-invalid={Boolean(errors.email?.[0])} autoComplete="email" id="email" name="email" required type="email" />
      </FormField>
      <FormField error={errors.phone?.[0]} label="Celular" name="phone" required>
        <Input aria-invalid={Boolean(errors.phone?.[0])} autoComplete="tel" id="phone" inputMode="tel" maxLength={16} name="phone" required />
      </FormField>
    </div>
  );
}
