import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CoursePlayerTemplateProps } from "@/components/templates/CoursePlayerTemplate/types/course-player-template.types";
import { CertificateGenerationStatus } from "@/features/certificates/components/CertificateGenerationStatus";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CoursePlayerTemplate({
  children,
  content,
  section,
}: CoursePlayerTemplateProps) {
  const baseRoute = getCampusCourseRoute(content.course.id);
  const completed = content.enrollment.status === "completed";
  const links = [
    { href: baseRoute, id: "overview", label: "Resumen" },
    { href: `${baseRoute}/contenido`, id: "content", label: "Contenido" },
    { href: `${baseRoute}/materiales`, id: "materials", label: "Materiales" },
  ];

  return (
    <div className="space-y-7">
      <header>
        <Link className="text-sm font-semibold text-slate-600" href="/campus/cursos">
          ← Mis cursos
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Heading level={1}>{content.course.title}</Heading>
          <Badge variant="success">{completed ? "Curso completado" : "Acceso activo"}</Badge>
        </div>
        <Text className="mt-2">{completed ? "Completaste todos los requisitos académicos." : "Avanza libremente por los módulos publicados."}</Text>
        <ProgressBar
          className="mt-4 max-w-xl"
          label="Avance general"
          value={content.enrollment.progress_percent}
        />
        {completed ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!content.courseCertificate ? (
              <Badge variant="warning">Certificado pendiente de configuración</Badge>
            ) : content.courseCertificate.status === "revoked" ? (
              <Badge variant="warning">Certificado revocado</Badge>
            ) : content.courseCertificate.fileReady ? (
              <Link className="font-semibold underline" href={`/certificados/${content.courseCertificate.accessToken}`}>Ver certificado</Link>
            ) : (
              <CertificateGenerationStatus certificateId={content.courseCertificate.id} fileReady={false} />
            )}
          </div>
        ) : null}
      </header>
      <nav className="flex gap-2 border-b border-slate-200 pb-3">
        {links.map((link) => (
          <Link
            className={section === link.id
              ? "rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"}
            href={link.href}
            key={link.id}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
