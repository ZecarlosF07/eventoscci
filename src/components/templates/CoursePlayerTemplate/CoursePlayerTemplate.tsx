import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CoursePlayerTemplateProps } from "@/components/templates/CoursePlayerTemplate/types/course-player-template.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export function CoursePlayerTemplate({ children, content, section }: CoursePlayerTemplateProps) {
  const baseRoute = getCampusCourseRoute(content.course.id);
  const links = [{ href: baseRoute, id: "overview", label: "Resumen" }, { href: `${baseRoute}/contenido`, id: "content", label: "Contenido" }, { href: `${baseRoute}/materiales`, id: "materials", label: "Materiales" }];
  return <div className="space-y-7"><header><Link className="text-sm font-semibold text-slate-600" href="/campus/cursos">← Mis cursos</Link><div className="mt-4 flex flex-wrap items-center gap-3"><Heading level={1}>{content.course.title}</Heading><Badge variant="success">Acceso activo</Badge></div><Text className="mt-2">Avanza libremente por los módulos publicados.</Text></header><nav className="flex gap-2 border-b border-slate-200 pb-3">{links.map((link) => <Link className={section === link.id ? "rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"} href={link.href} key={link.id}>{link.label}</Link>)}</nav>{children}</div>;
}
