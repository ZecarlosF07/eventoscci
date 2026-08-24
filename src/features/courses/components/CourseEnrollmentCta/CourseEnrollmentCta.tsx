import Link from "next/link";

import { SubmitButton } from "@/components/atoms/SubmitButton";
import type { CourseEnrollmentCtaProps } from "@/features/courses/components/CourseEnrollmentCta/types/course-enrollment-cta.types";
import { enrollFreeCourseAction } from "@/features/courses/mutations/course-enrollment.actions";
import {
  getCourseAccessLabel,
  getCourseContactHref,
  getCourseLoginHref,
  getCourseRegisterHref,
} from "@/features/courses/utils/course-enrollment";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

const PRIMARY_STYLES = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cci-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950";

export function CourseEnrollmentCta({
  courseId,
  courseTitle,
  enrollmentStatus,
  isAuthenticated,
  isFree,
  nextPath,
  variant = "default",
}: CourseEnrollmentCtaProps) {
  const compact = variant === "compact";

  if (enrollmentStatus === "active" || enrollmentStatus === "completed") {
    return <Link className={PRIMARY_STYLES} href={getCampusCourseRoute(courseId)}>{getCourseAccessLabel(enrollmentStatus)} {!compact ? <span aria-hidden="true">→</span> : null}</Link>;
  }

  if (enrollmentStatus === "revoked") {
    return <p className="rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">Tu acceso fue retirado. Comunícate con la Cámara para solicitar una revisión.</p>;
  }

  if (!isFree) {
    return (
      <div>
        <a className={PRIMARY_STYLES} href={getCourseContactHref(courseTitle)}>{compact ? "Solicitar acceso" : "Solicitar inscripción"} {!compact ? <span aria-hidden="true">→</span> : null}</a>
        {!compact ? <p className="mt-3 text-center text-xs leading-5 text-slate-500">La Cámara coordinará contigo la validación y el pago. No se realiza ningún cobro en esta plataforma.</p> : null}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Link className={PRIMARY_STYLES} href={getCourseLoginHref(nextPath)}>Inscribirme gratis {!compact ? <span aria-hidden="true">→</span> : null}</Link>
        {!compact ? <p className="mt-3 text-center text-xs text-slate-500">¿Primera vez aquí? <Link className="font-bold text-cci-800 underline underline-offset-4" href={getCourseRegisterHref(nextPath)}>Crea tu cuenta</Link></p> : null}
      </div>
    );
  }

  return <form action={enrollFreeCourseAction.bind(null, courseId)}><SubmitButton className={PRIMARY_STYLES} pendingLabel="Habilitando acceso…">Inscribirme gratis {!compact ? <span aria-hidden="true">→</span> : null}</SubmitButton></form>;
}
