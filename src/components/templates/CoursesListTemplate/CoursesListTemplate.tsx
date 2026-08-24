import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import type { CoursesListTemplateProps } from "@/components/templates/CoursesListTemplate/types/courses-list-template.types";
import { CourseCard } from "@/features/courses/components/CourseCard";

export function CoursesListTemplate({ courses, query }: CoursesListTemplateProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="overflow-hidden rounded-[2rem] bg-cci-950 px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cci-lime">Campus Virtual</p>
        <Heading className="mt-3 max-w-3xl text-white" level={1}>Cursos grabados para seguir aprendiendo</Heading>
        <Text className="mt-4 max-w-2xl text-white/70" size="lg">Consulta la oferta académica de la Cámara de Comercio de Ica y estudia a tu ritmo.</Text>
      </header>
      <form className="relative -mt-4 flex max-w-2xl flex-col gap-3 rounded-2xl border border-cci-100 bg-white p-4 shadow-lg shadow-cci-950/5 sm:ml-5 sm:flex-row">
        <div className="flex-1"><FormField label="Buscar cursos" name="q"><Input defaultValue={query} id="q" name="q" placeholder="Título o tema del curso" /></FormField></div>
        <div className="flex items-end"><Button className="w-full sm:w-auto" type="submit">Buscar</Button></div>
      </form>
      {courses.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white p-12 text-center"><Heading level={3}>Nuevos cursos próximamente</Heading><Text className="mt-2">No hay cursos publicados que coincidan con tu búsqueda.</Text></div>
      )}
    </div>
  );
}
