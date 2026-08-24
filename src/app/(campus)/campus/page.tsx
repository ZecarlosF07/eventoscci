import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { getMyCourses } from "@/features/courses/queries/get-my-courses";

export default async function CampusPage() {
  const [account, courses] = await Promise.all([requireActiveAccount(), getMyCourses()]);
  const completedCourses = courses.filter((course) => course.enrollment.status === "completed").length;
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-cci-950 px-6 py-10 text-white sm:px-10">
        <div className="relative z-10 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-cci-lime">Campus Virtual</p><Heading className="mt-3 text-white" level={1}>Bienvenido, {account.person.first_names}</Heading><Text className="mt-4 text-white/70" size="lg">Continúa tu formación, revisa tus avances y accede a tus certificados desde un solo lugar.</Text></div>
        <div aria-hidden="true" className="absolute -bottom-32 -right-20 size-96 rounded-full border border-cci-lime/25" />
      </section>
      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-3xl border border-cci-100 bg-white p-6"><Text size="sm">Cursos habilitados</Text><p className="mt-2 text-4xl font-semibold text-cci-950">{courses.length}</p></article>
        <article className="rounded-3xl border border-cci-100 bg-white p-6"><Text size="sm">Cursos completados</Text><p className="mt-2 text-4xl font-semibold text-cci-950">{completedCourses}</p></article>
        <article className="rounded-3xl border border-cci-100 bg-cci-100 p-6"><Heading level={3}>Tu formación</Heading><Text className="mt-2" size="sm">Accede a módulos, clases y materiales.</Text><Link className="mt-4 inline-flex text-sm font-bold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4" href={ROUTES.campusCourses}>Ver mis cursos →</Link></article>
      </div>
    </div>
  );
}
