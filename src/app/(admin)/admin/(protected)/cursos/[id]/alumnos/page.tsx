import { notFound } from "next/navigation";
import { CourseAdminTemplate } from "@/components/templates/CourseAdminTemplate";
import { CourseStudentsTable } from "@/features/courses/components/CourseStudentsTable";
import { getAdminCourseById } from "@/features/courses/queries/get-course-by-id";
import { getCourseStudents, searchPeopleForCourse } from "@/features/courses/queries/get-course-students";
import type { CoursePageProps } from "@/features/courses/types/course-form.types";

export default async function CourseStudentsPage({ params, searchParams }: CoursePageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const queryValue = Array.isArray(queryParams.q) ? queryParams.q[0] : queryParams.q;
  const query = queryValue?.trim() ?? "";
  const [course, students, people] = await Promise.all([getAdminCourseById(id), getCourseStudents(id), searchPeopleForCourse(query)]);
  if (!course) notFound();
  return <CourseAdminTemplate course={course} section="students"><CourseStudentsTable course={course} people={people} query={query} students={students} /></CourseAdminTemplate>;
}
