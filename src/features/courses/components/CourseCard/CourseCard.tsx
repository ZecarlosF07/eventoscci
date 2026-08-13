import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import type { CourseCardProps } from "@/features/courses/components/CourseCard/types/course-card.types";
import { getCourseBannerUrl, getInstructorName } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";

export function CourseCard({ course, href, progressPercent }: CourseCardProps) {
  const bannerUrl = getCourseBannerUrl(course.banner_path);
  const primary = course.instructors.find((item) => item.isPrimary) ?? course.instructors[0];
  return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="relative aspect-[16/8] bg-slate-100">
      {bannerUrl ? <Image alt="" className="object-cover" fill sizes="(min-width: 768px) 33vw, 100vw" src={bannerUrl} /> : <div className="flex h-full items-center justify-center font-semibold text-slate-400">Campus CCI</div>}
    </div>
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap gap-2"><Badge>Curso grabado</Badge>{course.is_free ? <Badge variant="success">Gratuito</Badge> : null}</div>
      <div><Heading level={3}>{course.title}</Heading>{primary ? <Text className="mt-1" size="sm">{getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Text> : null}</div>
      {course.short_description ? <Text size="sm">{course.short_description}</Text> : null}
      {progressPercent !== undefined ? <div><div className="mb-1 flex justify-between text-xs font-medium text-slate-600"><span>Progreso</span><span>{progressPercent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-800" style={{ width: `${progressPercent}%` }} /></div></div> : null}
      <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <PriceDisplay generalPrice={course.general_price} isFree={course.is_free} memberPrice={course.member_price} />
        <Link className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline" href={href ?? getPublicCourseRoute(course.slug)}>{href ? "Ingresar" : "Ver curso"}</Link>
      </div>
    </div>
  </article>;
}
