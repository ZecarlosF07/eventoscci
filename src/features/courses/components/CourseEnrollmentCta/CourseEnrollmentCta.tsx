import Link from "next/link";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { ROUTES } from "@/constants/routes";
import { enrollFreeCourseAction } from "@/features/courses/mutations/course-enrollment.actions";
import type { CourseEnrollmentCtaProps } from "@/features/courses/components/CourseEnrollmentCta/types/course-enrollment-cta.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

const LINK_STYLES = "inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white";

export function CourseEnrollmentCta({ courseId, isAuthenticated, isEnrolled, isFree, nextPath }: CourseEnrollmentCtaProps) {
  if (isEnrolled) return <Link className={LINK_STYLES} href={getCampusCourseRoute(courseId)}>Ir al curso</Link>;
  if (!isAuthenticated) return <Link className={LINK_STYLES} href={`${ROUTES.login}?next=${encodeURIComponent(nextPath)}`}>Registrarme o iniciar sesión</Link>;
  if (isFree) return <form action={enrollFreeCourseAction.bind(null, courseId)}><SubmitButton className={LINK_STYLES} pendingLabel="Inscribiendo…">Inscribirme gratis</SubmitButton></form>;
  return <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700"><strong>Solicita tu acceso a la Cámara.</strong><p className="mt-1">La validación y coordinación del pago se realizan fuera de la plataforma.</p></div>;
}
