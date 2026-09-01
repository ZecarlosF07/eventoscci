import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseDetailTemplateProps } from "@/components/templates/CourseDetailTemplate/types/course-detail-template.types";
import { CourseConversionPanel } from "@/features/courses/components/CourseConversionPanel";
import { CourseCurriculumPreview } from "@/features/courses/components/CourseCurriculumPreview";
import { CourseEnrollmentCta } from "@/features/courses/components/CourseEnrollmentCta";
import { CourseMobileEnrollmentBar } from "@/features/courses/components/CourseMobileEnrollmentBar";
import { getCourseBannerUrl, getInstructorName } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";

export function CourseDetailTemplate({ account, course, enrollmentStatus }: CourseDetailTemplateProps) {
  const bannerUrl = getCourseBannerUrl(course.banner_path);
  const primary = course.instructors.find((item) => item.isPrimary) ?? course.instructors[0];
  const nextPath = getPublicCourseRoute(course.slug);
  const conversionProps = { course, enrollmentStatus, isAuthenticated: Boolean(account), nextPath };

  return (
    <article className="mx-auto w-full max-w-7xl px-4 pb-28 pt-7 sm:px-6 sm:pt-12 lg:px-8 lg:pb-16">
      <Link className="text-sm font-bold text-cci-700 hover:text-cci-950" href="/cursos">← Volver a cursos</Link>

      <header className="mt-5 grid gap-7 rounded-2xl bg-cci-950 px-5 py-7 text-white sm:mt-6 sm:rounded-[2rem] sm:px-7 sm:py-8 lg:grid-cols-[1fr_22rem] lg:items-center lg:px-10 lg:py-10">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>Curso grabado</Badge>{course.is_free ? <Badge variant="success">Gratuito</Badge> : null}</div>
          <Heading className="mt-5 max-w-3xl text-white" level={1}>{course.title}</Heading>
          {course.short_description ? <Text className="mt-4 max-w-2xl text-white/72" size="lg">{course.short_description}</Text> : null}
          {primary ? <Text className="mt-5 text-white/70"><strong className="text-white">Con {getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</strong>{primary.speaker.organization ? ` · ${primary.speaker.organization}` : ""}</Text> : null}
          <dl className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/8 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-cci-lime">Modalidad</dt><dd className="mt-1 font-semibold">A tu ritmo</dd></div>
            <div className="rounded-2xl bg-white/8 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-cci-lime">Duración</dt><dd className="mt-1 font-semibold">{course.duration_text || "Flexible"}</dd></div>
            <div className="rounded-2xl bg-white/8 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-cci-lime">Certificación</dt><dd className="mt-1 font-semibold">Al completar</dd></div>
          </dl>
        </div>
        <CourseConversionPanel {...conversionProps} />
      </header>

      {bannerUrl ? <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl bg-cci-100 sm:mt-8 sm:aspect-[16/7] sm:rounded-3xl"><Image alt={`Portada de ${course.title}`} className="object-cover" fill preload sizes="(min-width: 1280px) 1216px, 100vw" src={bannerUrl} /></div> : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.48fr] lg:items-start">
        <div className="space-y-8 rounded-2xl bg-white p-5 sm:rounded-3xl sm:p-8">
          <section><Heading level={2}>Lo que encontrarás en este curso</Heading><Text className="mt-3 whitespace-pre-line leading-7">{course.description}</Text></section>
          {course.objectives ? <section className="border-t border-cci-100 pt-7"><Heading level={2}>Qué lograrás</Heading><Text className="mt-3 whitespace-pre-line leading-7">{course.objectives}</Text></section> : null}
          {course.contents_overview ? <section className="border-t border-cci-100 pt-7"><Heading level={2}>Contenido general</Heading><Text className="mt-3 whitespace-pre-line leading-7">{course.contents_overview}</Text></section> : null}
        </div>

        <div className="space-y-6">
          <CourseCurriculumPreview modules={course.modules} />
          {primary ? (
            <section className="rounded-3xl border border-cci-100 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Instructor</p>
              <div className="mt-4 flex items-center gap-4">{getSpeakerImageUrl(primary.speaker.photo_path) ? <Image alt={`Fotografía de ${getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}`} className="size-20 rounded-2xl object-cover" height={80} src={getSpeakerImageUrl(primary.speaker.photo_path)!} width={80} /> : <span aria-hidden="true" className="grid size-20 place-items-center rounded-2xl bg-cci-950 text-2xl font-bold text-cci-lime">{primary.speaker.first_names.charAt(0)}{primary.speaker.last_names.charAt(0)}</span>}<Heading level={2}>{getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Heading></div>
              {primary.speaker.professional_title ? <Text className="mt-2 font-semibold text-cci-800" size="sm">{primary.speaker.professional_title}</Text> : null}
              {primary.speaker.organization ? <Text className="mt-1" size="sm">{primary.speaker.organization}</Text> : null}
              {primary.speaker.bio ? <Text className="mt-4 line-clamp-5" size="sm">{primary.speaker.bio}</Text> : null}
            </section>
          ) : null}
        </div>
      </div>

      <section className="mt-10 hidden items-center justify-between gap-10 rounded-3xl bg-cci-lime px-8 py-7 lg:flex">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-cci-700">Tu siguiente paso</p><Heading className="mt-2" level={2}>{enrollmentStatus ? "Retoma tu aprendizaje cuando quieras" : "Empieza a aprender hoy"}</Heading></div>
        <div className="w-72 shrink-0"><CourseEnrollmentCta courseId={course.id} courseTitle={course.title} enrollmentStatus={enrollmentStatus} isAuthenticated={Boolean(account)} isFree={course.is_free} nextPath={nextPath} /></div>
      </section>

      <CourseMobileEnrollmentBar {...conversionProps} />
    </article>
  );
}
