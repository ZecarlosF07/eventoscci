import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { Pagination } from "@/components/molecules/Pagination";
import type { CoursesListTemplateProps } from "@/components/templates/CoursesListTemplate/types/courses-list-template.types";
import { CatalogHeroCarousel } from "@/features/catalog/components/CatalogHeroCarousel";
import { CatalogSectionHeader } from "@/features/catalog/components/CatalogSectionHeader/CatalogSectionHeader";
import { createCourseCarouselSlides } from "@/features/catalog/utils/catalog-carousel";
import { CourseCard } from "@/features/courses/components/CourseCard";

export function CoursesListTemplate({ courses, featuredCourses, page, pageCount, pathname, query, total }: CoursesListTemplateProps) {
  const slides = createCourseCarouselSlides(featuredCourses);

  return (
    <div>
      <CatalogHeroCarousel browseLabel="Explorar cursos" description="Aprende a tu ritmo y desarrolla habilidades que puedas aplicar en tu trabajo y en tu empresa." emptyMessage="Formación práctica para convertir el conocimiento en nuevas posibilidades para ti y tu empresa." eyebrow="Formación continua" slides={slides} title="Cursos virtuales" />
      <div className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pb-14 sm:px-8 sm:pb-20" id="catalogo">
        <form className="relative z-30 mt-3 flex max-w-2xl flex-col gap-3 rounded-2xl border border-cci-100 bg-white p-4 shadow-lg shadow-cci-950/5 sm:-mt-6 sm:ml-5 sm:flex-row">
          <div className="flex-1"><FormField label="Buscar cursos" name="q"><Input defaultValue={query} id="q" name="q" placeholder="Título o tema del curso" /></FormField></div>
          <div className="flex items-end"><Button className="w-full sm:w-auto" type="submit">Buscar</Button></div>
        </form>
        <div className="mt-6 sm:mt-8"><CatalogSectionHeader description="Formación virtual de la Cámara de Comercio de Ica. Elige un curso y aprende a tu ritmo." eyebrow={`${total} ${total === 1 ? "curso disponible" : "cursos disponibles"}`} title="Explora nuestros cursos" /></div>
        {courses.length ? (
          <section aria-label="Cursos disponibles" className="mt-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <div className={courses.length === 1 ? "md:col-span-2 lg:col-span-3" : undefined} key={course.id}><CourseCard course={course} featured={courses.length === 1} /></div>)}</div>
            {pageCount > 1 ? <div className="mt-9"><Pagination page={page} pageCount={pageCount} pathname={pathname} searchParams={{ q: query }} /></div> : null}
          </section>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-cci-200 bg-white px-6 py-8 text-center"><p className="text-lg font-bold text-cci-950">No encontramos cursos</p><Text className="mt-2">Prueba con otro título, tema o instructor.</Text></div>
        )}
      </div>
    </div>
  );
}
