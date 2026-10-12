export interface StagedImageField {
  field: string;
  label: string;
  stagedField: string;
}

export interface StagedImageUpload {
  field: string;
  path: string;
}

export type StageFormImagesResult =
  | { errors: Record<string, string[]>; ok: false }
  | { formData: FormData; ok: true; paths: string[] };

