import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { CertificateCandidateFiltersProps } from "@/features/certificates/components/CertificateCandidateFilters/types/certificate-candidate-filters.types";

export function CertificateCandidateFilters({ filters, total }: CertificateCandidateFiltersProps) {
  return (
    <AutoFilterForm total={total} className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_240px]" defaults={{ emision: "all" }}>
      <FormField label="Buscar participante" name="q">
        <Input
          defaultValue={filters.query}
          id="q"
          name="q"
          placeholder="Nombre, documento, correo o código de inscripción"
          type="search"
        />
      </FormField>
      <label className="text-sm font-semibold">Certificación<select className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" defaultValue={filters.emissionState ?? "all"} name="emision"><option value="all">Todos</option><option value="ready">Listos para emitir</option><option value="issued">Emitidos</option><option value="revoked">Revocados</option></select></label>
    </AutoFilterForm>
  );
}
