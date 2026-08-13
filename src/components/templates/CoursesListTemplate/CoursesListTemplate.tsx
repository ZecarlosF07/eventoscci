import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import type { CoursesListTemplateProps } from "@/components/templates/CoursesListTemplate/types/courses-list-template.types";
import { CourseCard } from "@/features/courses/components/CourseCard";

export function CoursesListTemplate({ courses, query }: CoursesListTemplateProps) {
  return <div className="py-12 sm:py-16"><header className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Campus Virtual</p><Heading className="mt-3" level={1}>Cursos grabados para seguir aprendiendo</Heading><Text className="mt-4" size="lg">Consulta la oferta académica de la Cámara de Comercio de Ica y estudia a tu ritmo.</Text></header><form className="mt-8 flex max-w-xl gap-3 rounded-2xl border border-slate-200 bg-white p-4"><FormField label="Buscar cursos" name="q"><Input defaultValue={query} id="q" name="q" /></FormField><div className="flex items-end"><Button type="submit">Buscar</Button></div></form>{courses.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed p-10 text-center"><Text>No hay cursos publicados que coincidan con tu búsqueda.</Text></div>}</div>;
}
