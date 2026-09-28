import type { WorkspaceSelectionItem } from "@/features/admin-filters/types/admin-filter.types";

export function toggleWorkspaceSelection(items: WorkspaceSelectionItem[], item: WorkspaceSelectionItem, checked: boolean): WorkspaceSelectionItem[] {
  if (!checked) return items.filter((value) => value.id !== item.id);
  return items.some((value) => value.id === item.id) ? items : [...items, item];
}

export function removeProcessedSelections(items: WorkspaceSelectionItem[], ids?: string[]): WorkspaceSelectionItem[] {
  return ids ? items.filter((item) => !ids.includes(item.id)) : [];
}
