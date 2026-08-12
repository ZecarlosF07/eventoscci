import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { RegistrationResultProps } from "@/features/registrations/types/registration.types";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";

export function RegistrationResult({ result }: RegistrationResultProps) {
  const confirmed = result.status === "confirmed";
  return (
    <article className="mx-auto max-w-2xl py-14 sm:py-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <Badge variant={confirmed ? "success" : "warning"}>
          {confirmed ? "Inscripción confirmada" : "Preinscripción registrada"}
        </Badge>
        <Heading className="mt-5" level={1}>
          {confirmed ? "Tu inscripción ha sido confirmada" : "Recibimos tu preinscripción"}
        </Heading>
        <Text className="mt-4" size="lg">{result.activity_title}</Text>
        <div className="mt-7 rounded-2xl bg-slate-100 p-5">
          <Text size="sm">Código de inscripción</Text>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-slate-950">
            {result.registration_code}
          </p>
        </div>
        {!confirmed ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <Text>
              Tu participación todavía no está confirmada. Comunícate con la Cámara de Comercio de Ica para coordinar la validación correspondiente.
            </Text>
            {result.contact_name ? <Text className="mt-3" size="sm"><strong>Contacto:</strong> {result.contact_name}</Text> : null}
            {result.contact_phone ? <Text size="sm">{result.contact_phone}</Text> : null}
            {result.contact_email ? <Text size="sm">{result.contact_email}</Text> : null}
          </div>
        ) : null}
        <Link
          className="mt-7 inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          href={getPublicActivityRoute(result.activity_type, result.activity_slug)}
        >
          Volver a la actividad
        </Link>
      </div>
    </article>
  );
}
