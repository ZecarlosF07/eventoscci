import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { CatalogCard } from "@/features/catalog/components/CatalogCard/CatalogCard";
import type { CourseCardProps } from "@/features/courses/components/CourseCard/types/course-card.types";
import { getCourseBannerUrl, getInstructorName } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CourseCard({ course, enrollmentStatus, href, progressPercent, featured = false }: CourseCardProps) {
  const bannerUrl = getCourseBannerUrl(course.banner_path);
  const primary = course.instructors.find((item) => item.isPrimary) ?? course.instructors[0];
  return (
    <CatalogCard
      action={href ? "Ingresar" : "Ver curso"}
      bannerUrl={bannerUrl}
      featured={featured}
      href={href ?? getPublicCourseRoute(course.slug)}
      id={`course-${course.id}`}
      labels={<><Badge>Curso virtual</Badge>{enrollmentStatus === "completed" ? <Badge variant="success">Completado</Badge> : null}</>}
      metadata={<Text className="font-semibold text-cci-800" size="sm">{course.duration_text || "Aprende a tu ritmo"}</Text>}
      price={<PriceDisplay generalPrice={course.general_price} isFree={course.is_free} memberPrice={course.member_price} />}
      title={course.title}
    >
      {primary ? <Text size="sm">{getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Text> : null}
      {href && course.short_description ? <Text size="sm">{course.short_description}</Text> : null}
      {progressPercent !== undefined ? <ProgressBar label="Progreso del curso" value={progressPercent} /> : null}
    </CatalogCard>
  );
}
