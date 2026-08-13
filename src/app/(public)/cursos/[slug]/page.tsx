import { notFound } from "next/navigation";
import { CourseDetailTemplate } from "@/components/templates/CourseDetailTemplate";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getPublicCourseBySlug } from "@/features/courses/queries/get-course-by-id";
import { hasCourseEnrollment } from "@/features/courses/queries/get-my-courses";
import type { PublicCoursePageProps } from "@/features/courses/types/course-page.types";

export default async function PublicCoursePage({ params }: PublicCoursePageProps) {
  const { slug } = await params;
  const [course, account] = await Promise.all([getPublicCourseBySlug(slug), getCurrentAccount()]);
  if (!course) notFound();
  const isEnrolled = account ? await hasCourseEnrollment(course.id, account.person.id) : false;
  return <CourseDetailTemplate account={account} course={course} isEnrolled={isEnrolled} />;
}
