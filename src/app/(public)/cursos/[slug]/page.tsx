import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailTemplate } from "@/components/templates/CourseDetailTemplate";
import { ROUTES } from "@/constants/routes";
import { getPublicCourseBySlug } from "@/features/courses/queries/get-course-by-id";
import { getPublicCourseCurriculum } from "@/features/courses/queries/get-public-course-curriculum";
import type { PublicCoursePageProps } from "@/features/courses/types/course-page.types";
import { getCourseBannerUrl } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { getSitemapEntries } from "@/features/seo/queries/get-sitemap-entries";
import { buildNoIndexMetadata, buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd, buildCourseJsonLd } from "@/features/seo/utils/json-ld";
import { absoluteUrl } from "@/features/seo/utils/seo-url";
import { buildSeoDescription } from "@/features/seo/utils/seo-text";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateStaticParams() {
  const entries = await getSitemapEntries();
  return entries.courses.map((course) => ({ slug: course.slug }));
}

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
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();
  const curriculum = await getPublicCourseCurriculum(course.id);
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
      <CourseDetailTemplate course={course} curriculum={curriculum} />
    </>
  );
}
