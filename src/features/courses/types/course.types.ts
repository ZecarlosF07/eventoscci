import type { Enums, Tables } from "@/lib/supabase/database.types";

export type CourseStatus = Enums<"course_status">;
export type CourseEnrollmentStatus = Enums<"course_enrollment_status">;
export type MaterialType = Enums<"material_type">;
export type CourseRow = Tables<"courses">;
export type CourseModule = Tables<"course_modules">;
export type Lesson = Tables<"lessons">;
export type CourseMaterial = Tables<"course_materials">;
export type CourseEnrollment = Tables<"course_enrollments">;

export interface CourseInstructor {
  id: string;
  isPrimary: boolean;
  roleLabel: string | null;
  sortOrder: number;
  speaker: Pick<Tables<"speakers">, "bio" | "first_names" | "id" | "last_names" | "organization" | "photo_path" | "professional_title">;
}

export interface CourseInstructorLinkRecord {
  deleted_at: string | null;
  id: string;
  is_primary: boolean;
  role_label: string | null;
  sort_order: number;
  speaker: CourseInstructor["speaker"] | null;
}

export type CourseListRecord = Pick<CourseRow,
  "academic_hours" | "banner_path" | "duration_text" | "general_price" | "id" |
  "is_free" | "member_price" | "published_at" | "short_description" | "slug" |
  "status" | "title" | "updated_at"
> & { instructor_links: CourseInstructorLinkRecord[] };

export interface CourseListItem extends Pick<CourseRow,
  "academic_hours" | "banner_path" | "duration_text" | "general_price" | "id" |
  "is_free" | "member_price" | "published_at" | "short_description" | "slug" |
  "status" | "title" | "updated_at"
> {
  instructors: CourseInstructor[];
}

export interface CourseDetail extends CourseRow {
  instructors: CourseInstructor[];
  modules: CourseModule[];
}

export interface CourseContent extends CourseDetail {
  lessons: Lesson[];
  materials: CourseMaterial[];
}

export interface CourseAdminFilters {
  page: number;
  query?: string;
  status?: CourseStatus;
}

export interface CourseAdminPage {
  courses: CourseListItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface CourseStudent {
  accessGrantedAt: string;
  enrollmentId: string;
  person: Pick<Tables<"people">, "document_number" | "email" | "first_names" | "id" | "last_names">;
  priceSnapshot: number;
  progressPercent: number;
  registrationType: Enums<"registration_type">;
  revocationReason: string | null;
  status: CourseEnrollmentStatus;
}

export interface PersonCourseOption {
  document_number: string;
  email: string;
  first_names: string;
  has_account: boolean;
  id: string;
  last_names: string;
}

export interface MyCourse extends CourseListItem {
  enrollment: Pick<CourseEnrollment, "id" | "progress_percent" | "status">;
}

export interface StudentCourseContent {
  course: CourseRow;
  enrollment: CourseEnrollment;
  instructors: CourseInstructor[];
  lessons: Lesson[];
  materials: CourseMaterial[];
  modules: CourseModule[];
}

export interface MaterialAccess {
  title: string;
  url: string;
}
