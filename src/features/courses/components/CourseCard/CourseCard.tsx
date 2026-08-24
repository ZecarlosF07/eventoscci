import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import type { CourseCardProps } from "@/features/courses/components/CourseCard/types/course-card.types";
import { getCourseBannerUrl, getInstructorName } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CourseCard({ course, enrollmentStatus, href, progressPercent }: CourseCardProps) {
  const bannerUrl = getCourseBannerUrl(course.banner_path);
  const primary = course.instructors.find((item) => item.isPrimary) ?? course.instructors[0];
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-cci-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cci-200 hover:shadow-xl">
    <div className="relative aspect-[16/9] overflow-hidden bg-cci-950">
      {bannerUrl ? <Image alt="" className="object-cover transition duration-500 group-hover:scale-[1.03]" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" src={bannerUrl} /> : <div className="relative flex h-full items-center justify-center overflow-hidden font-semibold text-white"><span className="absolute -bottom-20 -left-10 size-60 rounded-full border border-cci-lime/40" /><span>Campus CCI</span></div>}
    </div>
    <div className="flex flex-1 flex-col space-y-4 p-5">
      <div className="flex flex-wrap gap-2"><Badge>Curso grabado</Badge>{enrollmentStatus === "completed" ? <Badge variant="success">Completado</Badge> : null}{course.is_free ? <Badge variant="success">Gratuito</Badge> : null}</div>
      <div><Heading level={3}>{course.title}</Heading>{primary ? <Text className="mt-1" size="sm">{getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Text> : null}</div>
      {course.short_description ? <Text size="sm">{course.short_description}</Text> : null}
      {progressPercent !== undefined ? (
        <ProgressBar label="Progreso del curso" value={progressPercent} />
      ) : null}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-cci-100 pt-4">
        <PriceDisplay generalPrice={course.general_price} isFree={course.is_free} memberPrice={course.member_price} />
        <Link className="shrink-0 text-sm font-bold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4 hover:text-cci-950" href={href ?? getPublicCourseRoute(course.slug)}>{href ? "Ingresar" : "Ver curso"}</Link>
      </div>
    </div>
  </article>;
}
