import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoursesListTemplate } from "@/components/templates/CoursesListTemplate";
import { ROUTES } from "@/constants/routes";
import { getFeaturedPublishedCourses, getPublishedCoursePage } from "@/features/courses/queries/get-public-courses";
import type { CourseCatalogPageProps } from "@/features/courses/types/course-page.types";
import { parseCoursePublicFilters } from "@/features/courses/types/course-page.types";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd, buildCourseListJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateMetadata({ searchParams }: CourseCatalogPageProps): Promise<Metadata> {
  const filters = parseCoursePublicFilters(await searchParams);
  return buildPageMetadata({
    description: "Cursos virtuales para empresas y profesionales, disponibles desde Ica para todo el Perú en el Campus CCI.",
    follow: true,
    index: !filters.query,
    path: !filters.query && filters.page > 1 ? `${ROUTES.courses}?pagina=${filters.page}` : ROUTES.courses,
    title: filters.page > 1 ? `Cursos virtuales — página ${filters.page}` : "Cursos virtuales para empresas y profesionales",
  });
}

export default async function CoursesPage({ searchParams }: CourseCatalogPageProps) {
  const filters = parseCoursePublicFilters(await searchParams);
  const [result, featuredCourses] = await Promise.all([
    getPublishedCoursePage(filters),
    getFeaturedPublishedCourses(),
  ]);
  if (result.page > result.pageCount) notFound();
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
      <CoursesListTemplate courses={result.courses} featuredCourses={featuredCourses} page={result.page} pageCount={result.pageCount} pathname={ROUTES.courses} query={filters.query} total={result.total} />
    </>
  );
}
