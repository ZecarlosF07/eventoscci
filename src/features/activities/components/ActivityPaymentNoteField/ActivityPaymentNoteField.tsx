import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { ActivityPaymentNoteFieldProps } from "@/features/activities/components/ActivityPaymentNoteField/types/activity-payment-note-field.types";

export function ActivityPaymentNoteField({
  error,
  isFree,
  isPublished,
  onChange,
  value,
}: ActivityPaymentNoteFieldProps) {
  if (isFree) return null;

  return (
    <FormField
      error={error}
      hint="Este texto será público en el formulario de inscripción. Indica cómo coordinar el pago, sin incluir datos privados. Máximo 600 caracteres."
      label="Indicaciones para realizar el pago"
      name="payment_note"
      required={isPublished}
    >
      <Textarea
        id="payment_note"
        maxLength={FIELD_LIMITS.activityPaymentNote}
        name="payment_note"
        onChange={(event) => onChange(event.target.value)}
        required={isPublished}
        rows={4}
        value={value}
      />
    </FormField>
  );
}
