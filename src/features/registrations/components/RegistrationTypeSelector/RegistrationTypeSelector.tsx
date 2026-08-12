import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { RegistrationTypeSelectorProps } from "@/features/registrations/types/registration.types";

export function RegistrationTypeSelector({
  membersOnly,
  onChange,
  value,
}: RegistrationTypeSelectorProps) {
  if (membersOnly) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <input name="registration_type" type="hidden" value="member" />
        <Badge variant="warning">Exclusiva para asociados</Badge>
        <Text className="mt-2" size="sm">
          Deberás declarar la empresa asociada y su RUC para continuar.
        </Text>
      </div>
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">
        Tipo de inscripción
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          ["general", "Público general"],
          ["member", "Asociado CCI"],
        ] as const).map(([type, label]) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium"
            key={type}
          >
            <input
              checked={value === type}
              name="registration_type"
              onChange={() => onChange(type)}
              type="radio"
              value={type}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
