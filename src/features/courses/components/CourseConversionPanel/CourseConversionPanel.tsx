import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import type { CourseConversionProps } from "@/features/courses/components/CourseConversionPanel/types/course-conversion.types";
import { CourseEnrollmentCta } from "@/features/courses/components/CourseEnrollmentCta";

function getPanelTitle(status: CourseConversionProps["enrollmentStatus"]): string {
  if (status === "completed") return "Curso completado";
  if (status === "active") return "Continúa aprendiendo";
  return "Empieza tu formación";
}

export function CourseConversionPanel({ course, enrollmentStatus, isAuthenticated, nextPath }: CourseConversionProps) {
  return (
    <aside className="rounded-3xl bg-white p-6 text-cci-950 shadow-xl shadow-black/15">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Acceso al curso</p>
          <Heading className="mt-2 text-xl" level={2}>{getPanelTitle(enrollmentStatus)}</Heading>
        </div>
        {course.is_free ? <Badge variant="success">Gratis</Badge> : null}
      </div>
      {!course.is_free ? <div className="my-5 border-y border-cci-100 py-4"><PriceDisplay generalPrice={course.general_price} isFree={false} memberPrice={course.member_price} /></div> : null}
      <div className={course.is_free ? "mt-5" : undefined}><CourseEnrollmentCta courseId={course.id} courseTitle={course.title} enrollmentStatus={enrollmentStatus} isAuthenticated={isAuthenticated} isFree={course.is_free} nextPath={nextPath} /></div>
      <ul className="mt-5 space-y-2 text-sm text-slate-600">
        <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-cci-600">✓</span> Acceso desde el Campus Virtual</li>
        <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-cci-600">✓</span> Avance guardado automáticamente</li>
        <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-cci-600">✓</span> Certificado al completar los requisitos</li>
      </ul>
      {course.is_free ? <Text className="mt-4 text-center" size="sm">La inscripción gratuita no requiere pago.</Text> : null}
    </aside>
  );
}
