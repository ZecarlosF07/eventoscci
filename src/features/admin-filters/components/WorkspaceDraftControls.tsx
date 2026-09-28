"use client";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { useSelectionWorkspace } from "@/features/admin-filters/components/SelectionWorkspace";
import type { WorkspaceDraftInputProps, WorkspaceDraftSelectProps } from "@/features/admin-filters/types/admin-filter.types";

export function WorkspaceDraftInput({ draftKey, ...props }: WorkspaceDraftInputProps) {
  const { drafts, setDraft } = useSelectionWorkspace();
  return <Input {...props} defaultValue={undefined} onChange={(event) => setDraft(draftKey, event.target.value)} value={drafts[draftKey] ?? String(props.defaultValue ?? "")} />;
}
export function WorkspaceDraftSelect({ draftKey, ...props }: WorkspaceDraftSelectProps) {
  const { drafts, setDraft } = useSelectionWorkspace();
  return <Select {...props} defaultValue={undefined} onChange={(event) => setDraft(draftKey, event.target.value)} value={drafts[draftKey] ?? String(props.defaultValue ?? "")} />;
}
