import type { CourseListItem } from "@/features/courses/types/course.types";

export function filterCoursesByQuery(courses: CourseListItem[], query?: string): CourseListItem[] {
  const normalizedQuery = query?.trim().toLocaleLowerCase("es-PE");
  if (!normalizedQuery) return courses;

  return courses.filter((course) => {
    const instructors = course.instructors.flatMap(({ speaker }) => [
      speaker.first_names,
      speaker.last_names,
      speaker.organization ?? "",
      speaker.professional_title ?? "",
    ]);
    const searchable = [
      course.title,
      course.short_description ?? "",
      course.duration_text ?? "",
      ...instructors,
    ].join(" ").toLocaleLowerCase("es-PE");

    return searchable.includes(normalizedQuery);
  });
}
