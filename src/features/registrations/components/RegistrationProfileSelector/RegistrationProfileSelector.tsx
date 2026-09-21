import { Text } from "@/components/atoms/Text";
import type { RegistrationProfileSelectorProps } from "@/features/registrations/components/RegistrationProfileSelector/types/registration-profile-selector.types";

const PROFILES = [
  {
    description: "Trabajo, emprendimiento o actividad independiente.",
    label: "Profesional o independiente",
    value: "professional",
  },
  {
    description: "Actualmente estudio en una universidad o instituto.",
    label: "Estudiante",
    value: "student",
  },
] as const;

export function RegistrationProfileSelector({ onChange, value }: RegistrationProfileSelectorProps) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-cci-100 bg-cci-50/70 p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-slate-900">¿Cuál es tu perfil?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILES.map((profile) => (
          <label
            className="flex min-h-20 cursor-pointer items-start gap-3 rounded-xl border border-slate-300 bg-white p-4 transition hover:border-cci-500 has-[:checked]:border-cci-700 has-[:checked]:ring-2 has-[:checked]:ring-cci-100"
            key={profile.value}
          >
            <input checked={value === profile.value} className="mt-1" name="participant_profile" onChange={() => onChange(profile.value)} type="radio" value={profile.value} />
            <span>
              <span className="block text-sm font-bold text-cci-950">{profile.label}</span>
              <Text className="mt-1" size="sm">{profile.description}</Text>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
