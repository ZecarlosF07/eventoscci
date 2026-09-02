import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { CertificateGenerationStatus } from "@/features/certificates/components/CertificateGenerationStatus";
import type { StudentCourseContent } from "@/features/courses/types/course.types";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CourseLearningHeader({
  content,
  progressPercent,
}: { content: StudentCourseContent; progressPercent: number }) {
  const completed = content.enrollment.status === "completed";
  return (
    <header className="rounded-2xl border border-white/10 bg-[#111614] px-5 py-5 text-white sm:rounded-3xl sm:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link className="text-sm font-semibold text-cci-lime hover:underline" href="/campus/cursos">← Mis cursos</Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Heading className="truncate text-white" level={1}>{content.course.title}</Heading>
            <Badge variant="success">{completed ? "Completado" : "En curso"}</Badge>
          </div>
        </div>
        <div className="w-full shrink-0 lg:w-72">
          <div className="mb-2 flex justify-between text-sm"><span>Progreso general</span><strong>{Math.round(progressPercent)}%</strong></div>
          <ProgressBar label="Progreso general" showValue={false} tone="dark" value={progressPercent} />
          {completed ? <div className="mt-3 text-sm">
            {!content.courseCertificate ? <Badge variant="warning">Certificado pendiente</Badge>
              : content.courseCertificate.status === "revoked" ? <Badge variant="warning">Certificado revocado</Badge>
                : content.courseCertificate.fileReady ? <Link className="font-semibold text-cci-lime underline" href={`/certificados/${content.courseCertificate.accessToken}`}>Ver certificado</Link>
                  : <CertificateGenerationStatus certificateId={content.courseCertificate.id} fileReady={false} />}
          </div> : null}
        </div>
      </div>
    </header>
  );
}
