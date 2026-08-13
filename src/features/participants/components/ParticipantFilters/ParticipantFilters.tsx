import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { ROUTES } from "@/constants/routes";
import type { ParticipantFiltersProps } from "@/features/participants/components/ParticipantFilters/types/participant-filters.types";

export function ParticipantFilters({ filters }: ParticipantFiltersProps) {
  return (
    <form className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:flex-row md:items-end">
      <div className="flex-1">
        <FormField label="Buscar participante" name="q">
          <Input defaultValue={filters.query} id="q" name="q" placeholder="Documento, nombres, correo o teléfono" type="search" />
        </FormField>
      </div>
      <Button type="submit">Buscar</Button>
      {filters.query ? <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold" href={ROUTES.adminParticipants}>Limpiar</Link> : null}
    </form>
  );
}
