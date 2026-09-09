import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getCourseEnrollmentStatus } from "@/features/courses/queries/get-my-courses";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const account = await getCurrentAccount();
  if (!account?.isActive) {
    return NextResponse.json(
      { enrollmentStatus: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const { courseId } = await params;
  const enrollmentStatus = await getCourseEnrollmentStatus(courseId, account.person.id);
  return NextResponse.json(
    { enrollmentStatus },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
