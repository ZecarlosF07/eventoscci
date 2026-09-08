import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { CertificateActivityFiltersProps } from "@/features/certificates/components/CertificateActivityFilters/types/certificate-activity-filters.types";

export function CertificateActivityFilters({ filters }: CertificateActivityFiltersProps) {
  return (
    <form className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
      <FormField label="Buscar actividad" name="q">
        <Input defaultValue={filters.query} id="q" name="q" placeholder="Nombre del evento o capacitación" type="search" />
      </FormField>
      <FormField label="Tipo" name="tipo">
        <Select defaultValue={filters.type ?? ""} id="tipo" name="tipo">
          <option value="">Todos</option>
          <option value="event">Eventos</option>
          <option value="training">Capacitaciones</option>
        </Select>
      </FormField>
      <div className="flex items-end"><Button className="w-full" type="submit">Buscar</Button></div>
    </form>
  );
}
