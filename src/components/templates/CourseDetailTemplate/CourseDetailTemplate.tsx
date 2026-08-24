import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import type { CourseDetailTemplateProps } from "@/components/templates/CourseDetailTemplate/types/course-detail-template.types";
import { CourseEnrollmentCta } from "@/features/courses/components/CourseEnrollmentCta";
import { getCourseBannerUrl, getInstructorName } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";

export function CourseDetailTemplate({ account, course, isEnrolled }: CourseDetailTemplateProps) {
  const bannerUrl = getCourseBannerUrl(course.banner_path);
  const primary = course.instructors.find((item) => item.isPrimary) ?? course.instructors[0];
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link className="text-sm font-bold text-cci-700 hover:text-cci-950" href="/cursos">← Volver a cursos</Link>
      <header className="mt-6 grid gap-8 rounded-[2rem] bg-cci-950 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>Curso grabado</Badge>{course.is_free ? <Badge variant="success">Gratuito</Badge> : null}</div>
          <Heading className="mt-5 text-white" level={1}>{course.title}</Heading>
          {course.short_description ? <Text className="mt-4 text-white/70" size="lg">{course.short_description}</Text> : null}
          {primary ? <Text className="mt-4 text-white/70"><strong className="text-white">Instructor:</strong> {getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Text> : null}
        </div>
        <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
          <PriceDisplay generalPrice={course.general_price} isFree={course.is_free} memberPrice={course.member_price} />
          {course.duration_text ? <Text size="sm"><strong>Duración:</strong> {course.duration_text}</Text> : null}
          {course.academic_hours !== null ? <Text size="sm"><strong>Horas académicas:</strong> {course.academic_hours}</Text> : null}
          <CourseEnrollmentCta courseId={course.id} isAuthenticated={Boolean(account)} isEnrolled={isEnrolled} isFree={course.is_free} nextPath={getPublicCourseRoute(course.slug)} />
        </aside>
      </header>
      {bannerUrl ? <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-3xl bg-cci-100"><Image alt={`Portada de ${course.title}`} className="object-cover" fill preload sizes="(min-width: 1280px) 1216px, 100vw" src={bannerUrl} /></div> : null}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-8 rounded-3xl bg-white p-6 sm:p-8">
          <section><Heading level={2}>Acerca del curso</Heading><Text className="mt-3 whitespace-pre-line">{course.description}</Text></section>
          {course.objectives ? <section><Heading level={2}>Objetivos</Heading><Text className="mt-3 whitespace-pre-line">{course.objectives}</Text></section> : null}
          {course.contents_overview ? <section><Heading level={2}>Contenido general</Heading><Text className="mt-3 whitespace-pre-line">{course.contents_overview}</Text></section> : null}
        </div>
        <aside className="rounded-3xl border border-cci-100 bg-cci-100 p-6">
          <Heading level={2}>Módulos</Heading>
          {course.modules.length ? <ol className="mt-4 space-y-3">{course.modules.map((module, index) => <li className="rounded-xl border border-cci-100 bg-white p-4" key={module.id}><span className="text-xs font-bold uppercase text-cci-600">Módulo {index + 1}</span><p className="mt-1 font-semibold">{module.title}</p></li>)}</ol> : <Text className="mt-3">El contenido se publicará próximamente.</Text>}
        </aside>
      </div>
    </article>
  );
}
