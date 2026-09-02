import type { CourseMaterial, CourseModule, Lesson, MaterialType } from "@/features/courses/types/course.types";

export interface ModuleFormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export type LessonFormState = ModuleFormState;

export type MaterialFormState = ModuleFormState;

export interface CourseContentManagerProps {
  courseId: string;
  lessons: Lesson[];
  modules: CourseModule[];
}

export type CourseEditorSelection =
  | { kind: "new_module" }
  | { kind: "module"; moduleId: string }
  | { kind: "new_lesson"; moduleId: string }
  | { kind: "lesson"; lessonId: string; moduleId: string };

export interface CourseContentTreeProps extends CourseContentManagerProps {
  onSelect: (selection: CourseEditorSelection) => void;
  selection: CourseEditorSelection;
}

export interface CourseContentEditorProps extends CourseContentManagerProps {
  onSelect: (selection: CourseEditorSelection) => void;
  selection: CourseEditorSelection;
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
