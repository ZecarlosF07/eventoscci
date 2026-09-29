import type { ReactNode } from "react";

import type { InputProps } from "@/components/atoms/Input/types/input.types";
import type { SelectProps } from "@/components/atoms/Select/types/select.types";

export interface WorkspaceProps { children: ReactNode }
export interface SelectionCheckboxProps { item: WorkspaceSelectionItem; disabled?: boolean }
export interface SelectionSummaryProps { visibleIds: string[]; compact?: boolean }
export interface SelectedInputsProps { name: string }
export interface ActiveFilterSummaryProps { defaults: Record<string, string>; remove: (name: string) => void; valueLabels?: Record<string, string> }
export interface MoreFiltersProps { children: ReactNode; names: string[]; toolbar?: ReactNode; defaults?: Record<string, string> }
export type WorkspaceDraftInputProps = InputProps & { draftKey: string };
export type WorkspaceDraftSelectProps = SelectProps & { draftKey: string };

export interface AutoFilterFormProps {
  children?: ReactNode;
  className?: string;
  defaults?: Record<string, string>;
  resetPages?: Record<string, string[]>;
  total?: number;
  valueLabels?: Record<string, string>;
  moreFilters?: Omit<MoreFiltersProps, "toolbar">;
}
export interface FilterWorkspaceState {
  busy: boolean;
  setBusy: (busy: boolean) => void;
}
export interface FilterExportLinkProps {
  children: ReactNode;
  className?: string;
  href: string;
}
export interface WorkspaceSelectionItem { id: string; name: string }
export interface WorkspaceDraftState {
  selected: WorkspaceSelectionItem[];
  toggle: (item: WorkspaceSelectionItem, checked: boolean) => void;
  clear: (ids?: string[]) => void;
  drafts: Record<string, string>;
  setDraft: (key: string, value: string) => void;
}
