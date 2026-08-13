import type { CourseFormInput, CourseInstructorInput } from "@/features/courses/types/course-form.types";

function stringValue(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function parseInstructors(formData: FormData): CourseInstructorInput[] {
  const primaryId = stringValue(formData, "primary_instructor_id");
  return formData.getAll("instructor_id").map(String).map((speakerId, index) => ({
    is_primary: speakerId === primaryId,
    role_label: stringValue(formData, `instructor_role_${speakerId}`),
    sort_order: Number(stringValue(formData, `instructor_order_${speakerId}`)) || index,
    speaker_id: speakerId,
  }));
}

export function parseCourseFormData(formData: FormData): CourseFormInput {
  return {
    academic_hours: stringValue(formData, "academic_hours"),
    banner_path: stringValue(formData, "banner_path"),
    contents_overview: stringValue(formData, "contents_overview"),
    description: stringValue(formData, "description"),
    duration_text: stringValue(formData, "duration_text"),
    general_price: stringValue(formData, "general_price"),
    id: stringValue(formData, "id"),
    instructors: parseInstructors(formData),
    is_free: formData.get("is_free") === "on",
    member_price: stringValue(formData, "member_price"),
    objectives: stringValue(formData, "objectives"),
    short_description: stringValue(formData, "short_description"),
    slug: stringValue(formData, "slug"),
    status: stringValue(formData, "status") as CourseFormInput["status"],
    title: stringValue(formData, "title"),
  };
}
