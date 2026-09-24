export interface MemberCompanyInput {
  legal_name: string;
  ruc: string;
}

export interface MemberRosterRowError {
  message: string;
  row: number;
}

export interface ParsedMemberRoster {
  errors: MemberRosterRowError[];
  fileHash: string;
  fileName: string;
  rows: MemberCompanyInput[];
}

export interface MemberRosterPreview {
  added_count: number;
  base_version: number;
  changed_count: number;
  id: string;
  removed_count: number;
  row_count: number;
}

export interface MemberRosterImportFormProps {
  activeCount: number;
  version: number;
}
