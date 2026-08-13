import type {
  CourseInstructor,
  CourseInstructorLinkRecord,
  CourseListItem,
  CourseListRecord,
} from "@/features/courses/types/course.types";

export function mapCourseInstructors(links: CourseInstructorLinkRecord[]): CourseInstructor[] {
  return links
    .filter((link) => !link.deleted_at && link.speaker)
    .map((link) => ({
      id: link.id,
      isPrimary: link.is_primary,
      roleLabel: link.role_label,
      sortOrder: link.sort_order,
      speaker: link.speaker!,
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

export function mapCourseListItem(record: CourseListRecord): CourseListItem {
  const { instructor_links: instructorLinks, ...course } = record;
  return { ...course, instructors: mapCourseInstructors(instructorLinks) };
}
