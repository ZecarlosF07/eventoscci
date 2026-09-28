import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { CertificateActivityFiltersProps } from "@/features/certificates/components/CertificateActivityFilters/types/certificate-activity-filters.types";

export function CertificateActivityFilters({ filters, total }: CertificateActivityFiltersProps) {
  return (
    <AutoFilterForm total={total} className="md:grid-cols-[minmax(0,1fr)_220px]" defaults={{}}>
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
    </AutoFilterForm>
  );
}
