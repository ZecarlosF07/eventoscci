export interface ActivityMediaInput {
  bannerStagedPath: string | null;
  programStagedPaths: string[];
  retainedProgramPaths: string[];
}

export type ActivityMediaErrors = Record<"banner" | "program_images", string[]>;

export interface ActivityMediaUploadProgress {
  current: number;
  total: number;
}

export type ActivityMediaUploadResult =
  | { errors: Partial<ActivityMediaErrors>; ok: false }
  | { formData: FormData; ok: true; stagedPaths: string[] };
