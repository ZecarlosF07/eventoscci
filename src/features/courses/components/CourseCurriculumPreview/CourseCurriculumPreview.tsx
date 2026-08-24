import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseCurriculumPreviewProps } from "@/features/courses/components/CourseCurriculumPreview/types/course-curriculum-preview.types";

export function CourseCurriculumPreview({ modules }: CourseCurriculumPreviewProps) {
  return (
    <section className="rounded-3xl border border-cci-100 bg-cci-100 p-6" aria-labelledby="course-modules-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Plan de formación</p>
      <Heading className="mt-2" id="course-modules-title" level={2}>Contenido del curso</Heading>
      {modules.length ? (
        <ol className="mt-5 space-y-3">
          {modules.map((module, index) => (
            <li className="rounded-2xl border border-cci-100 bg-white p-4" key={module.id}>
              <span className="text-xs font-bold uppercase text-cci-600">Módulo {index + 1}</span>
              <p className="mt-1 font-semibold text-cci-950">{module.title}</p>
              {module.description ? <Text className="mt-1" size="sm">{module.description}</Text> : null}
            </li>
          ))}
        </ol>
      ) : <Text className="mt-4">El contenido se publicará próximamente.</Text>}
      <Text className="mt-4" size="sm">Las clases y los materiales completos estarán disponibles dentro del Campus después de obtener acceso.</Text>
    </section>
  );
}
