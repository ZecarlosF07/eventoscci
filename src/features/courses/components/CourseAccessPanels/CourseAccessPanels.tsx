"use client";

import { useEffect, useState } from "react";

import type { CourseAccessPanelsProps } from "@/features/courses/components/CourseAccessPanels/types/course-access-panels.types";
import { CourseConversionPanel } from "@/features/courses/components/CourseConversionPanel";
import { CourseMobileEnrollmentBar } from "@/features/courses/components/CourseMobileEnrollmentBar";
import type { CourseEnrollmentStatus } from "@/features/courses/types/course.types";
import { usePublicAccount } from "@/features/auth/components/PublicAccountProvider";

export function CourseAccessPanels({ course, nextPath }: CourseAccessPanelsProps) {
  const { account, isLoading: isAccountLoading } = usePublicAccount();
  const [access, setAccess] = useState<{
    accountEmail: string;
    enrollmentStatus: CourseEnrollmentStatus | null;
  } | null>(null);

  useEffect(() => {
    if (!account?.isActive) {
      return;
    }
    const controller = new AbortController();
    void fetch(`/api/courses/${course.id}/access`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : { enrollmentStatus: null })
      .then((payload: { enrollmentStatus: CourseEnrollmentStatus | null }) => {
        setAccess({ accountEmail: account.email, enrollmentStatus: payload.enrollmentStatus });
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess({ accountEmail: account.email, enrollmentStatus: null });
      });
    return () => controller.abort();
  }, [account, course.id]);

  const isStatusLoading = Boolean(account?.isActive && access?.accountEmail !== account.email);
  if (isAccountLoading || isStatusLoading) {
    return <div aria-label="Consultando acceso al curso" className="h-72 animate-pulse rounded-3xl bg-white shadow-xl shadow-black/10 motion-reduce:animate-none" />;
  }

  const props = {
    course,
    enrollmentStatus: account?.isActive ? access?.enrollmentStatus ?? null : null,
    isAuthenticated: Boolean(account?.isActive),
    nextPath,
  };
  return <><CourseConversionPanel {...props} /><CourseMobileEnrollmentBar {...props} /></>;
}
