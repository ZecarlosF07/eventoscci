import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { CertificateQueryLogFiltersProps } from "@/features/certificates/components/CertificateQueryLogFilters/types/certificate-query-log-filters.types";

export function CertificateQueryLogFilters({ filters, total }: CertificateQueryLogFiltersProps) {
  return (
    <AutoFilterForm total={total} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-5" defaults={{}}>
      <FormField label="DNI" name="dni"><Input defaultValue={filters.documentNumber} id="dni" inputMode="numeric" maxLength={8} name="dni" /></FormField>
      <FormField label="Resultado" name="resultado"><select className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" defaultValue={filters.outcome ?? ""} id="resultado" name="resultado"><option value="">Todos</option><option value="found">Con resultados</option><option value="not_found">Sin resultados</option><option value="invalid">DNI inválido</option><option value="rate_limited">Bloqueado</option></select></FormField>
      <FormField label="Desde" name="desde"><Input defaultValue={filters.dateFrom} id="desde" name="desde" type="date" /></FormField>
      <FormField label="Hasta" name="hasta"><Input defaultValue={filters.dateTo} id="hasta" name="hasta" type="date" /></FormField>
    </AutoFilterForm>
  );
}
