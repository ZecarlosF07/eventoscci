import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { CourseMaterialsListProps } from "@/features/courses/components/CourseMaterialsList/types/course-materials-list.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export function CourseMaterialsList({ courseId, materials }: CourseMaterialsListProps) {
  if (!materials.length) return <div className="rounded-2xl border border-dashed p-8 text-center"><Text>Este curso todavía no tiene materiales.</Text></div>;
  return <ul className="divide-y divide-slate-100 rounded-2xl border border-cci-100 bg-white">{materials.map((material) => <li className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" key={material.id}><div className="min-w-0"><p className="break-words font-semibold">{material.title}</p>{material.description ? <Text className="mt-1" size="sm">{material.description}</Text> : null}</div><div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start"><Badge>{material.material_type === "file" ? "Archivo" : "Enlace"}</Badge><a className="font-semibold hover:underline" href={`${getCampusCourseRoute(courseId)}/materiales/${material.id}`}>Abrir</a></div></li>)}</ul>;
}
