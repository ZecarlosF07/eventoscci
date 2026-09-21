import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { RegistrationFieldGroupProps } from "@/features/registrations/types/registration.types";

export function RegistrationIdentityFields({ errors }: RegistrationFieldGroupProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors.document_type?.[0]} label="Tipo de documento" name="document_type" required>
        <Select aria-invalid={Boolean(errors.document_type?.[0])} defaultValue="dni" id="document_type" name="document_type" required>
          <option value="dni">DNI</option>
          <option value="ce">Carné de Extranjería</option>
        </Select>
      </FormField>
      <FormField error={errors.document_number?.[0]} label="Número de documento" name="document_number" required>
        <Input aria-invalid={Boolean(errors.document_number?.[0])} autoComplete="off" id="document_number" maxLength={FIELD_LIMITS.documentNumber} name="document_number" required />
      </FormField>
      <FormField error={errors.first_names?.[0]} label="Nombres" name="first_names" required>
        <Input aria-invalid={Boolean(errors.first_names?.[0])} autoComplete="given-name" id="first_names" maxLength={FIELD_LIMITS.personName} name="first_names" required />
      </FormField>
      <FormField error={errors.last_names?.[0]} label="Apellidos" name="last_names" required>
        <Input aria-invalid={Boolean(errors.last_names?.[0])} autoComplete="family-name" id="last_names" maxLength={FIELD_LIMITS.personName} name="last_names" required />
      </FormField>
    </div>
  );
}
