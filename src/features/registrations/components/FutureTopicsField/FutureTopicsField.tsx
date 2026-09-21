import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { FutureTopicsFieldProps } from "@/features/registrations/components/FutureTopicsField/types/future-topics-field.types";

export function FutureTopicsField({ error }: FutureTopicsFieldProps) {
  return (
    <div className="rounded-2xl border border-cci-100 bg-white p-4 sm:p-5">
      <FormField error={error} hint="Opcional. Tu respuesta nos ayudará a preparar actividades más útiles." label="¿Sobre qué temas te gustaría aprender en próximos eventos o capacitaciones?" name="future_topics_suggestion">
        <Textarea aria-invalid={Boolean(error)} id="future_topics_suggestion" maxLength={FIELD_LIMITS.futureTopicsSuggestion} name="future_topics_suggestion" placeholder="Por ejemplo: inteligencia artificial, ventas, tributación…" rows={4} />
      </FormField>
    </div>
  );
}
