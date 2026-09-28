"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { FilterExportLinkProps, FilterWorkspaceState, WorkspaceProps } from "@/features/admin-filters/types/admin-filter.types";

const WorkspaceContext = createContext<FilterWorkspaceState>({ busy: false, setBusy: () => undefined });
export const useFilterWorkspace = () => useContext(WorkspaceContext);

export function FilterWorkspace({ children }: WorkspaceProps) {
  const [busy, setBusy] = useState(false);
  const state = useMemo(() => ({ busy, setBusy }), [busy]);
  return <WorkspaceContext.Provider value={state}><div className="group/filters" data-filter-busy={busy}>{children}</div></WorkspaceContext.Provider>;
}

export function FilterResults({ children }: WorkspaceProps) {
  const { busy } = useFilterWorkspace();
  return <div aria-busy={busy} className={busy ? "opacity-60 transition-opacity" : "transition-opacity"}>{children}</div>;
}

export function FilterExportLink({ children, className, href }: FilterExportLinkProps) {
  const { busy } = useFilterWorkspace();
  return <a aria-disabled={busy} className={`${className ?? ""} ${busy ? "cursor-wait opacity-50" : ""}`} href={href}
    onClick={(event) => { if (busy) event.preventDefault(); }}>{children}</a>;
}
