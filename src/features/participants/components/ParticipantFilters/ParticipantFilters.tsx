import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { ParticipantFiltersProps } from "@/features/participants/components/ParticipantFilters/types/participant-filters.types";

export function ParticipantFilters({ filters, total }: ParticipantFiltersProps) {
  return (
    <AutoFilterForm total={total} className="grid gap-4 rounded-3xl border border-cci-100 bg-white p-5 md:grid-cols-[1fr_220px]" defaults={{ perfil: "" }}>
      <div className="flex-1">
        <FormField label="Buscar participante" name="q">
          <Input defaultValue={filters.query} id="q" name="q" placeholder="Nombre, documento, correo, empresa, RUC o institución" type="search" />
        </FormField>
      </div>
      <label className="text-sm font-semibold">Perfil<select className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" defaultValue={filters.profile ?? ""} name="perfil"><option value="">Todos</option><option value="professional">Profesional</option><option value="student">Estudiante</option></select></label>
    </AutoFilterForm>
  );
}
