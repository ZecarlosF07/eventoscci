"use client";

import { ActiveFilterSummary } from "@/features/admin-filters/components/ActiveFilterSummary";
import { useAutoFilter } from "@/features/admin-filters/hooks/use-auto-filter";
import type { AutoFilterFormProps } from "@/features/admin-filters/types/admin-filter.types";

export function AutoFilterForm(props: AutoFilterFormProps) {
  const { form, change, compositionStart, compositionEnd, apply, clear, remove, busy, error, edited } = useAutoFilter(props);
  return <form className={props.className} method="get" ref={form} onChange={change}
    onCompositionStart={compositionStart} onCompositionEnd={compositionEnd}
    onSubmit={(event) => { event.preventDefault(); apply("q"); }}>
    {props.children}
    <ActiveFilterSummary defaults={props.defaults ?? {}} remove={remove} valueLabels={props.valueLabels} />
    <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-t border-cci-100 pt-3">
      <p aria-live="polite" role="status" className="text-sm text-slate-600">{busy ? "Actualizando resultados… Los anteriores aún no corresponden a los cambios." : error ? "Filtros sin aplicar." : edited ? `Resultados actualizados${props.total === undefined ? "." : `: ${props.total} coincidencias.`}` : "Los filtros se aplican automáticamente."}</p>
      <button className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 text-sm font-semibold hover:bg-cci-50" onClick={clear} type="button">Limpiar filtros</button>
    </div>
    {error ? <p className="col-span-full text-sm text-red-700" id="admin-filter-date-error" role="alert">{error}</p> : null}
  </form>;
}
