import { Heading } from "@/components/atoms/Heading";
import { MaterialForm } from "@/features/courses/components/MaterialForm";
import { deleteMaterialAction } from "@/features/courses/mutations/course-material.actions";
import type { CourseMaterialsManagerProps } from "@/features/courses/types/course-content.types";

export function CourseMaterialsManager({ courseId, materials }: CourseMaterialsManagerProps) {
  return <div className="space-y-6"><div><Heading level={2}>Materiales generales</Heading><p className="mt-2 text-sm text-slate-600">Estos recursos pertenecen al curso completo y no alteran el progreso.</p></div>{materials.map((material) => <div className="space-y-2" key={material.id}><MaterialForm courseId={courseId} material={material} /><form action={deleteMaterialAction.bind(null, courseId, material.id)} className="text-right"><button className="text-sm font-semibold text-rose-700" type="submit">Eliminar material</button></form></div>)}<MaterialForm courseId={courseId} /></div>;
}
