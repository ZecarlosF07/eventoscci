import { Input } from "@/components/atoms/Input";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { MemberRosterFiltersProps } from "@/features/member-roster/types/member-roster.types";

export function MemberRosterFilters({ query, total }: MemberRosterFiltersProps) {
  return <AutoFilterForm total={total}>
    <label className="text-sm font-semibold">Buscar empresa activa<Input defaultValue={query} maxLength={150} name="q" placeholder="RUC o razón social" type="search" /></label>
  </AutoFilterForm>;
}
