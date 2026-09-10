import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] bg-cci-950 px-6 py-9 text-white sm:px-9">
        <div className="[&_h1]:text-white [&_p]:text-white/65"><SectionHeading description="Crea, publica y administra toda la experiencia de eventos y formación desde un mismo lugar." eyebrow="Panel interno" title="Gestión CCI" /></div>
      </header>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-200 hover:shadow-lg" href={ROUTES.adminEvents}>
          <Heading level={3}>Eventos</Heading>
          <Text className="mt-2">Administra encuentros, congresos y actividades institucionales.</Text>
        </Link>
        <Link className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-200 hover:shadow-lg" href={ROUTES.adminTrainings}>
          <Heading level={3}>Capacitaciones</Heading>
          <Text className="mt-2">Administra talleres y programas de formación empresarial.</Text>
        </Link>
        <Link className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-200 hover:shadow-lg" href={ROUTES.adminRegistrations}>
          <Heading level={3}>Participación</Heading>
          <Text className="mt-2">Gestiona inscripciones y asistencia dentro del contexto de cada actividad.</Text>
        </Link>
        <Link className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-200 hover:shadow-lg" href={ROUTES.adminParticipants}>
          <Heading level={3}>Directorio</Heading>
          <Text className="mt-2">Consulta la ficha y el historial institucional de cada persona.</Text>
        </Link>
        <Link className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-200 hover:shadow-lg" href={ROUTES.adminCertificates}>
          <Heading level={3}>Certificados</Heading>
          <Text className="mt-2">Emite documentos a asistentes y administra su vigencia.</Text>
        </Link>
      </div>
    </div>
  );
}
