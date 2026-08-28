import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import type { CoursesListTemplateProps } from "@/components/templates/CoursesListTemplate/types/courses-list-template.types";
import { CatalogHeroCarousel } from "@/features/catalog/components/CatalogHeroCarousel";
import { createCourseCarouselSlides } from "@/features/catalog/utils/catalog-carousel";
import { CourseCard } from "@/features/courses/components/CourseCard";

export function CoursesListTemplate({ courses, featuredCourses, query }: CoursesListTemplateProps) {
  const slides = createCourseCarouselSlides(featuredCourses);

  return (
    <div>
      <CatalogHeroCarousel description="Formación práctica de la Cámara de Comercio de Ica para avanzar a tu ritmo y convertir conocimiento en oportunidades." emptyMessage="Estamos preparando nuevas experiencias de formación para ti." eyebrow="Formación continua" slides={slides} title="Cursos" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
        <form className="relative z-30 -mt-4 flex max-w-2xl flex-col gap-3 rounded-2xl border border-cci-100 bg-white p-4 shadow-lg shadow-cci-950/5 sm:ml-5 sm:flex-row">
          <div className="flex-1"><FormField label="Buscar cursos" name="q"><Input defaultValue={query} id="q" name="q" placeholder="Título o tema del curso" /></FormField></div>
          <div className="flex items-end"><Button className="w-full sm:w-auto" type="submit">Buscar</Button></div>
        </form>
        {courses.length ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Aprende a tu ritmo</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-cci-950 sm:text-3xl">Explora nuestros cursos</h2></div><Text size="sm">{courses.length} {courses.length === 1 ? "curso disponible" : "cursos disponibles"}</Text></div>
            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
          </section>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white p-12 text-center"><p className="text-lg font-bold text-cci-950">No encontramos cursos</p><Text className="mt-2">Prueba con otro título, tema o instructor.</Text></div>
        )}
      </div>
    </div>
  );
}
