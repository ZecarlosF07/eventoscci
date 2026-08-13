import Link from "next/link";
import { Heading } from "@/components/atoms/Heading";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { getActiveSpeakers } from "@/features/speakers/queries/get-active-speakers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewCoursePage() {
  const speakers = await getActiveSpeakers(await createServerSupabaseClient());
  return <div className="space-y-7"><header><Link className="text-sm font-semibold text-slate-600" href="/admin/cursos">← Volver a cursos</Link><Heading className="mt-4" level={1}>Nuevo curso</Heading></header><CourseForm speakers={speakers} /></div>;
}
