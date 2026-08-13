import { redirect } from "next/navigation";
import { getMaterialAccess } from "@/features/courses/queries/get-material-access";

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string; materialId: string }> }) {
  const { courseId, materialId } = await params;
  const access = await getMaterialAccess(courseId, materialId);
  if (!access) return new Response("Material no disponible", { status: 404 });
  redirect(access.url);
}
