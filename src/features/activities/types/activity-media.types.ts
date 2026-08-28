export interface ActivityMediaInput {
  banner: File | null;
  programImages: File[];
  retainedProgramPaths: string[];
}

export type ActivityMediaErrors = Record<"banner" | "program_images", string[]>;
