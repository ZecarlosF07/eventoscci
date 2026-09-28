import { Input } from "@/components/atoms/Input";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { MemberRosterFiltersProps } from "@/features/member-roster/types/member-roster.types";

export function MemberRosterFilters({ query, total }: MemberRosterFiltersProps) {
  return <AutoFilterForm className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4" total={total}>
    <label className="text-sm font-semibold">Buscar empresa activa<Input defaultValue={query} maxLength={150} name="q" placeholder="RUC o razón social" type="search" /></label>
  </AutoFilterForm>;
}
