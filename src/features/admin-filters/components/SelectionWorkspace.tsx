"use client";

import { createContext, useContext, useId, useMemo, useState } from "react";

import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import type { WorkspaceDraftState, WorkspaceSelectionItem, WorkspaceProps, SelectionCheckboxProps, SelectionSummaryProps, SelectedInputsProps } from "@/features/admin-filters/types/admin-filter.types";
import { removeProcessedSelections, toggleWorkspaceSelection } from "@/features/admin-filters/utils/workspace-selection";
import { classNames } from "@/utils/class-names";

const SelectionContext = createContext<WorkspaceDraftState | null>(null);
export function useSelectionWorkspace() {
  const state = useContext(SelectionContext);
  if (!state) throw new Error("SelectionWorkspace is required.");
  return state;
}
export function SelectionWorkspace({ children }: WorkspaceProps) {
  const [selected, setSelected] = useState<WorkspaceSelectionItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const value = useMemo(() => ({ selected, drafts,
    toggle: (item: WorkspaceSelectionItem, checked: boolean) => setSelected((items) => toggleWorkspaceSelection(items, item, checked)),
    clear: (ids?: string[]) => setSelected((items) => removeProcessedSelections(items, ids)),
    setDraft: (key: string, value: string) => setDrafts((current) => ({ ...current, [key]: value })),
  }), [selected, drafts]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}
export function SelectionCheckbox({ item, disabled }: SelectionCheckboxProps) {
  const { selected, toggle } = useSelectionWorkspace();
  const { busy } = useFilterWorkspace();
  return <input aria-label={`Seleccionar ${item.name}`} checked={selected.some((value) => value.id === item.id)} className="h-5 w-5 accent-cci-950" disabled={disabled || busy} onChange={(event) => toggle(item, event.target.checked)} type="checkbox" />;
}
export function SelectionSummary({ visibleIds, compact = false }: SelectionSummaryProps) {
  const { selected, clear } = useSelectionWorkspace();
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const visible = selected.filter((item) => visibleIds.includes(item.id)).length;
  if (!selected.length) return null;
  if (compact) return <section className="space-y-2" aria-label="Selección conservada">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <p className={classNames("min-w-0 flex-1 basis-full text-sm font-semibold sm:basis-auto", selected.length > visible ? "text-amber-900" : undefined)} role="status">{selected.length} {selected.length === 1 ? "seleccionado" : "seleccionados"} · {visible} {visible === 1 ? "visible" : "visibles"}{selected.length > visible ? ` · ${selected.length - visible} fuera de esta vista` : ""}</p>
      <button aria-controls={listId} aria-expanded={expanded} className="min-h-11 text-sm font-semibold" onClick={() => setExpanded(!expanded)} type="button">Revisar seleccionados <span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
      <button className="min-h-11 px-2 text-sm font-semibold text-cci-700 underline" onClick={() => clear()} type="button">Limpiar selección</button>
    </div>
    <ul className={classNames("max-h-64 grid-cols-1 gap-2 overflow-auto border-t border-cci-200 pt-2 sm:grid-cols-2 lg:grid-cols-3", expanded ? "grid" : "hidden")} id={listId}>{selected.map((item) => <li className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-cci-100 bg-white pl-3 text-sm" key={item.id}><span className="min-w-0 break-words">{item.name}</span><button className="min-h-11 shrink-0 px-3 underline" onClick={() => clear([item.id])} type="button">Quitar</button></li>)}</ul>
  </section>;
  return <section className="space-y-3 rounded-2xl border border-cci-200 bg-cci-50 p-4" aria-label="Selección conservada">
    <p className="text-sm font-semibold" role="status">{selected.length} seleccionados: {visible} visibles y {selected.length - visible} fuera de esta vista.</p>
    <details><summary className="min-h-11 cursor-pointer text-sm font-semibold">Revisar seleccionados</summary><ul className="max-h-64 overflow-auto">{selected.map((item) => <li className="flex items-center justify-between gap-3 text-sm" key={item.id}>{item.name}<button className="min-h-11 px-3 underline" onClick={() => clear([item.id])} type="button">Quitar</button></li>)}</ul></details>
    <button className="min-h-11 rounded-xl border bg-white px-4 text-sm font-semibold" onClick={() => clear()} type="button">Limpiar selección</button>
  </section>;
}
export function SelectedInputs({ name }: SelectedInputsProps) {
  const { selected } = useSelectionWorkspace();
  return selected.map((item) => <input key={item.id} name={name} type="hidden" value={item.id} />);
}
