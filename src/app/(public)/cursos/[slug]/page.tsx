import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailTemplate } from "@/components/templates/CourseDetailTemplate";
import { ROUTES } from "@/constants/routes";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getPublicCourseBySlug } from "@/features/courses/queries/get-course-by-id";
import { getCourseEnrollmentStatus } from "@/features/courses/queries/get-my-courses";
import { getPublicCourseCurriculum } from "@/features/courses/queries/get-public-course-curriculum";
import type { PublicCoursePageProps } from "@/features/courses/types/course-page.types";
import { getCourseBannerUrl } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildNoIndexMetadata, buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd, buildCourseJsonLd } from "@/features/seo/utils/json-ld";
import { absoluteUrl } from "@/features/seo/utils/seo-url";
import { buildSeoDescription } from "@/features/seo/utils/seo-text";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateMetadata({ params }: PublicCoursePageProps): Promise<Metadata> {
  const course = await getPublicCourseBySlug((await params).slug);
  if (!course) return buildNoIndexMetadata("Curso no encontrado");
  return buildPageMetadata({
    description: buildSeoDescription(course.short_description, course.description),
    image: getCourseBannerUrl(course.banner_path),
    path: getPublicCourseRoute(course.slug),
    title: course.title,
  });
}

export default async function PublicCoursePage({ params }: PublicCoursePageProps) {
  const { slug } = await params;
  const [course, account] = await Promise.all([getPublicCourseBySlug(slug), getCurrentAccount()]);
  if (!course) notFound();
  const [curriculum, enrollmentStatus] = await Promise.all([
    getPublicCourseCurriculum(course.id),
    account ? getCourseEnrollmentStatus(course.id, account.person.id) : null,
  ]);
  const siteUrl = getSiteUrl();
  const path = getPublicCourseRoute(course.slug);
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: "Inicio", path: ROUTES.home },
      { name: "Cursos", path: ROUTES.courses },
      { name: course.title, path },
    ], siteUrl),
    buildCourseJsonLd({
      course,
      image: getCourseBannerUrl(course.banner_path),
      pageUrl: absoluteUrl(path, siteUrl),
    }),
  ];
  return (
    <>
      <JsonLd data={structuredData} />
      <CourseDetailTemplate account={account} course={course} curriculum={curriculum} enrollmentStatus={enrollmentStatus} />
    </>
  );
}
