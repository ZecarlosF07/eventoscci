import type { Metadata } from "next";

import { CoursesListTemplate } from "@/components/templates/CoursesListTemplate";
import { ROUTES } from "@/constants/routes";
import { getPublishedCourses } from "@/features/courses/queries/get-admin-courses";
import type { CourseCatalogPageProps } from "@/features/courses/types/course-page.types";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd, buildCourseListJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export const metadata: Metadata = buildPageMetadata({
  description: "Cursos virtuales para empresas y profesionales, disponibles desde Ica para todo el Perú en el Campus CCI.",
  path: ROUTES.courses,
  title: "Cursos virtuales para empresas y profesionales",
});

export default async function CoursesPage({ searchParams }: CourseCatalogPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim() || undefined;
  const coursesPromise = getPublishedCourses(query);
  const featuredPromise = query ? getPublishedCourses() : coursesPromise;
  const [courses, featuredCourses] = await Promise.all([coursesPromise, featuredPromise]);
  const siteUrl = getSiteUrl();
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: "Inicio", path: ROUTES.home },
      { name: "Cursos", path: ROUTES.courses },
    ], siteUrl),
    buildCourseListJsonLd({ courses: featuredCourses, siteUrl }),
  ].filter((item) => item !== null);

  return (
    <>
      <JsonLd data={structuredData} />
      <CoursesListTemplate courses={courses} featuredCourses={featuredCourses} query={query} />
    </>
  );
}
