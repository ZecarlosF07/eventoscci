"use client";

import { ActiveFilterSummary } from "@/features/admin-filters/components/ActiveFilterSummary";
import { MoreFilters } from "@/features/admin-filters/components/MoreFilters";
import { useAutoFilter } from "@/features/admin-filters/hooks/use-auto-filter";
import type { AutoFilterFormProps } from "@/features/admin-filters/types/admin-filter.types";
import { classNames } from "@/utils/class-names";

export function AutoFilterForm(props: AutoFilterFormProps) {
  const { form, change, compositionStart, compositionEnd, apply, clear, remove, busy, error, edited } = useAutoFilter(props);
  const toolbar = <>
    <ActiveFilterSummary defaults={props.defaults ?? {}} remove={remove} valueLabels={props.valueLabels} />
    <p aria-live="polite" role="status" className={classNames("min-w-0 flex-1 text-sm text-slate-600", props.moreFilters ? "order-last basis-full sm:order-none sm:basis-auto" : undefined)}>{busy ? "Actualizando… Los resultados anteriores están pendientes." : error ? "Filtros sin aplicar." : edited ? `Resultados actualizados${props.total === undefined ? "." : `: ${props.total} coincidencias.`}` : "Búsqueda automática"}</p>
    <button className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-cci-800 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-600" onClick={clear} type="button">Limpiar filtros</button>
  </>;
  return <form className={classNames("grid gap-x-3 gap-y-2 rounded-2xl border border-cci-100 bg-white p-3", props.className)} method="get" ref={form} onChange={change}
    onCompositionStart={compositionStart} onCompositionEnd={compositionEnd}
    onSubmit={(event) => { event.preventDefault(); apply("q"); }}>
    {props.children}
    {props.moreFilters ? <MoreFilters {...props.moreFilters} defaults={props.defaults} toolbar={toolbar} /> : <div className="col-span-full flex flex-wrap items-center gap-x-3 gap-y-1">{toolbar}</div>}
    {error ? <p className="col-span-full text-sm text-red-700" id="admin-filter-date-error" role="alert">{error}</p> : null}
  </form>;
}
