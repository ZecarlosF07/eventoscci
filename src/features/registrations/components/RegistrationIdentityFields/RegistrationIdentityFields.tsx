import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { RegistrationFieldGroupProps } from "@/features/registrations/types/registration.types";

export function RegistrationIdentityFields({ errors }: RegistrationFieldGroupProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors.document_type?.[0]} label="Tipo de documento" name="document_type" required>
        <Select defaultValue="dni" id="document_type" name="document_type" required>
          <option value="dni">DNI</option>
          <option value="ce">Carné de Extranjería</option>
        </Select>
      </FormField>
      <FormField error={errors.document_number?.[0]} label="Número de documento" name="document_number" required>
        <Input autoComplete="off" id="document_number" maxLength={20} name="document_number" required />
      </FormField>
      <FormField error={errors.first_names?.[0]} label="Nombres" name="first_names" required>
        <Input autoComplete="given-name" id="first_names" maxLength={120} name="first_names" required />
      </FormField>
      <FormField error={errors.last_names?.[0]} label="Apellidos" name="last_names" required>
        <Input autoComplete="family-name" id="last_names" maxLength={120} name="last_names" required />
      </FormField>
    </div>
  );
}
