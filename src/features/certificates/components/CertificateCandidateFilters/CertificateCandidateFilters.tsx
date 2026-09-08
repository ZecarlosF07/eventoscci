import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { CertificateCandidateFiltersProps } from "@/features/certificates/components/CertificateCandidateFilters/types/certificate-candidate-filters.types";

export function CertificateCandidateFilters({ filters }: CertificateCandidateFiltersProps) {
  return (
    <form className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_auto]">
      <FormField label="Buscar participante" name="q">
        <Input
          defaultValue={filters.query}
          id="q"
          name="q"
          placeholder="Nombre, documento, correo o código de inscripción"
          type="search"
        />
      </FormField>
      <div className="flex items-end"><Button className="w-full" type="submit">Buscar</Button></div>
    </form>
  );
}
