import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { CourseMaterialsListProps } from "@/features/courses/components/CourseMaterialsList/types/course-materials-list.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export function CourseMaterialsList({ courseId, materials }: CourseMaterialsListProps) {
  if (!materials.length) return <div className="rounded-2xl border border-dashed p-8 text-center"><Text>Este curso todavía no tiene materiales.</Text></div>;
  return <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{materials.map((material) => <li className="flex items-center justify-between gap-4 p-5" key={material.id}><div><p className="font-semibold">{material.title}</p>{material.description ? <Text className="mt-1" size="sm">{material.description}</Text> : null}</div><div className="flex items-center gap-3"><Badge>{material.material_type === "file" ? "Archivo" : "Enlace"}</Badge><a className="font-semibold hover:underline" href={`${getCampusCourseRoute(courseId)}/materiales/${material.id}`}>Abrir</a></div></li>)}</ul>;
}
