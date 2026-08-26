import type { CourseDetail, CourseStatus } from "@/features/courses/types/course.types";

export interface CourseInstructorInput {
  is_primary: boolean;
  role_label: string;
  sort_order: number;
  speaker_id: string;
}

export interface CourseFormInput {
  academic_hours: string;
  banner_path: string;
  contents_overview: string;
  description: string;
  duration_text: string;
  general_price: string;
  id: string;
  instructors: CourseInstructorInput[];
  is_free: boolean;
  member_price: string;
  objectives: string;
  short_description: string;
  slug: string;
  status: CourseStatus;
  title: string;
}

export interface CourseFormState {
  errors?: Record<string, string[]>;
  message?: string;
  savedId?: string;
  success?: boolean;
  warning?: boolean;
}

export interface CourseFormProps {
  course?: CourseDetail;
  speakers: Array<{
    first_names: string;
    id: string;
    last_names: string;
    organization: string | null;
  }>;
}

export interface CourseInstructorFieldsProps {
  initialInstructors: CourseInstructorInput[];
  speakers: CourseFormProps["speakers"];
}

export interface CoursePageParams {
  id: string;
}

export interface CoursePageProps {
  params: Promise<CoursePageParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
