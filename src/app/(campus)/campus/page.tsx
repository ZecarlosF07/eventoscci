import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { getMyCourses } from "@/features/courses/queries/get-my-courses";

export default async function CampusPage() {
  const [account, courses] = await Promise.all([requireActiveAccount(), getMyCourses()]);
  return (
    <div className="space-y-8">
      <SectionHeading description="Tu cuenta ya está vinculada a la identidad institucional que conservará cursos, progreso y certificados." eyebrow="Campus Virtual" title={`Bienvenido, ${account.person.first_names}`} />
      <section className="rounded-3xl border border-slate-200 bg-white p-7"><Heading level={2}>Tu formación</Heading><Text className="mt-3">Tienes {courses.length} {courses.length === 1 ? "curso habilitado" : "cursos habilitados"}. Accede a tus módulos, clases y materiales desde Mis cursos.</Text><Link className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" href={ROUTES.campusCourses}>Ver mis cursos</Link></section>
    </div>
  );
}
