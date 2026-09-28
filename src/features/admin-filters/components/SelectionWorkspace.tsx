"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import type { WorkspaceDraftState, WorkspaceSelectionItem, WorkspaceProps, SelectionCheckboxProps, SelectionSummaryProps, SelectedInputsProps } from "@/features/admin-filters/types/admin-filter.types";
import { removeProcessedSelections, toggleWorkspaceSelection } from "@/features/admin-filters/utils/workspace-selection";

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
export function SelectionSummary({ visibleIds }: SelectionSummaryProps) {
  const { selected, clear } = useSelectionWorkspace();
  const visible = selected.filter((item) => visibleIds.includes(item.id)).length;
  if (!selected.length) return null;
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
