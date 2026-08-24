import type { CourseConversionProps } from "@/features/courses/components/CourseConversionPanel";
import { CourseEnrollmentCta } from "@/features/courses/components/CourseEnrollmentCta";

export function CourseMobileEnrollmentBar({ course, enrollmentStatus, isAuthenticated, nextPath }: CourseConversionProps) {
  if (enrollmentStatus === "revoked") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cci-100 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(12,33,28,0.12)] backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-cci-950">{course.title}</p>
          <p className="mt-0.5 text-xs font-semibold text-cci-600">{course.is_free ? "Acceso gratuito" : "Inscripción coordinada"}</p>
        </div>
        <div className="w-44 shrink-0">
          <CourseEnrollmentCta courseId={course.id} courseTitle={course.title} enrollmentStatus={enrollmentStatus} isAuthenticated={isAuthenticated} isFree={course.is_free} nextPath={nextPath} variant="compact" />
        </div>
      </div>
    </div>
  );
}
