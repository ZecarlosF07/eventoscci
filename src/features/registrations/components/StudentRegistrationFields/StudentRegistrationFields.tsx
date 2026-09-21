import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { StudentRegistrationFieldsProps } from "@/features/registrations/components/StudentRegistrationFields/types/student-registration-fields.types";

export function StudentRegistrationFields({ active, errors }: StudentRegistrationFieldsProps) {
  return (
    <fieldset disabled={!active} hidden={!active}>
      <legend className="mb-4 text-base font-bold text-cci-950">Información académica</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.academic_institution?.[0]} label="Universidad o instituto" name="academic_institution" required>
          <Input aria-invalid={Boolean(errors.academic_institution?.[0])} id="academic_institution" maxLength={FIELD_LIMITS.academicField} name="academic_institution" required={active} />
        </FormField>
        <FormField error={errors.career?.[0]} label="Carrera o especialidad" name="career" required>
          <Input aria-invalid={Boolean(errors.career?.[0])} id="career" maxLength={FIELD_LIMITS.academicField} name="career" required={active} />
        </FormField>
      </div>
    </fieldset>
  );
}
