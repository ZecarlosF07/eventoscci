export interface PublicCourseCurriculumLesson {
  durationSeconds: number | null;
  isRequired: boolean;
  sortOrder: number;
  title: string;
}

export interface PublicCourseCurriculumModule {
  description: string | null;
  id: string;
  lessons: PublicCourseCurriculumLesson[];
  sortOrder: number;
  title: string;
}
