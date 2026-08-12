import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";

export default function AdminPage() {
  return (
    <div>
      <SectionHeading
        description="Crea, publica y administra eventos y capacitaciones desde un mismo dominio."
        eyebrow="Panel interno"
        title="Gestión de actividades"
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" href={ROUTES.adminEvents}>
          <Heading level={3}>Eventos</Heading>
          <Text className="mt-2">Administra encuentros, congresos y actividades institucionales.</Text>
        </Link>
        <Link className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" href={ROUTES.adminTrainings}>
          <Heading level={3}>Capacitaciones</Heading>
          <Text className="mt-2">Administra talleres y programas de formación empresarial.</Text>
        </Link>
      </div>
    </div>
  );
}
