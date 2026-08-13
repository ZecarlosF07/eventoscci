import type { CourseMaterial, CourseModule, Lesson, MaterialType } from "@/features/courses/types/course.types";

export interface ModuleFormState {
  errors?: Record<string, string[]>;
  message?: string;
}

export type LessonFormState = ModuleFormState;

export interface MaterialFormState extends ModuleFormState {
  success?: boolean;
}

export interface CourseContentManagerProps {
  courseId: string;
  lessons: Lesson[];
  modules: CourseModule[];
}

export interface ModuleEditorProps {
  courseId: string;
  lessons: Lesson[];
  module: CourseModule;
}

export interface LessonEditorProps {
  courseId: string;
  lesson: Lesson;
}

export interface CourseMaterialsManagerProps {
  courseId: string;
  materials: CourseMaterial[];
}

export interface MaterialMetadataInput {
  courseId: string;
  description: string;
  externalUrl: string;
  fileSizeBytes: number | null;
  materialId: string;
  materialType: MaterialType;
  mimeType: string;
  sortOrder: number;
  storagePath: string;
  title: string;
}

export interface VideoSource {
  kind: "embed" | "native";
  url: string;
}
