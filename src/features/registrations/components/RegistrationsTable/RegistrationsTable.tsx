import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { ROUTES } from "@/constants/routes";
import { getActivityParticipationRoute } from "@/features/participation/utils/participation-routes";
import { CertificateRequestAdminStatus } from "@/features/registrations/components/CertificateRequestAdminStatus";
import { RegistrationRowActions } from "@/features/registrations/components/RegistrationRowActions";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { REGISTRATION_TYPE_LABELS } from "@/features/registrations/constants/registration.constants";
import type { RegistrationAdminItem, RegistrationsTableProps } from "@/features/registrations/types/registration.types";
import { formatRegistrationDate, formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

function ParticipantLink({ registration }: { registration: RegistrationAdminItem }) {
  return (
    <div>
      <Link className="font-bold text-cci-950 hover:underline" href={`${ROUTES.adminParticipants}/${registration.person.id}`}>
        {registration.person.first_names} {registration.person.last_names}
      </Link>
      <Text size="sm">{registration.person.document_type.toUpperCase()} {registration.person.document_number}</Text>
    </div>
  );
}

function MobileCards({ registrations, returnTo, showActivity }: RegistrationsTableProps) {
  return (
    <div className="space-y-3 md:hidden">
      {registrations.map((registration) => (
        <article className="rounded-2xl border border-cci-100 bg-white p-4 shadow-sm" key={registration.id}>
          <div className="flex items-start justify-between gap-3"><ParticipantLink registration={registration} /><RegistrationStatusBadge status={registration.status} /></div>
          {showActivity ? <Link className="mt-3 block text-sm font-semibold text-cci-800 hover:underline" href={getActivityParticipationRoute(registration.activity.id)}>{registration.activity.title}</Link> : null}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Código</dt><dd className="font-mono font-semibold">{registration.registration_code}</dd></div>
            <div><dt className="text-xs text-slate-500">Importe</dt><dd className="font-semibold">{formatRegistrationPrice(registration.price_snapshot)}</dd></div>
            <div><dt className="text-xs text-slate-500">Tipo</dt><dd>{REGISTRATION_TYPE_LABELS[registration.registration_type]}</dd></div>
            <div><dt className="text-xs text-slate-500">Registro</dt><dd>{formatRegistrationDate(registration.created_at)}</dd></div>
          </dl>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Certificado</p>
            <CertificateRequestAdminStatus registration={registration} returnTo={returnTo} />
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4"><RegistrationRowActions registration={registration} returnTo={returnTo} /></div>
        </article>
      ))}
    </div>
  );
}

export function RegistrationsTable({ registrations, returnTo, showActivity = false }: RegistrationsTableProps) {
  if (!registrations.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Text>No hay inscripciones con estos criterios.</Text></div>;
  return (
    <>
      <MobileCards registrations={registrations} returnTo={returnTo} showActivity={showActivity} />
      <ResponsiveTableFrame className="hidden rounded-3xl md:block" label="Listado de inscripciones">
        <table className="w-full min-w-[1320px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr>
            <th className="px-4 py-4">Participante</th>{showActivity ? <th className="px-4 py-4">Actividad</th> : null}<th className="px-4 py-4">Inscripción</th><th className="px-4 py-4">Contacto</th><th className="px-4 py-4">Importe</th><th className="px-4 py-4">Certificado</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Acciones</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.map((registration) => <tr className="hover:bg-cci-50/50" key={registration.id}>
              <td className="px-4 py-4 align-top"><ParticipantLink registration={registration} /></td>
              {showActivity ? <td className="max-w-64 px-4 py-4 align-top"><Link className="font-semibold text-cci-800 hover:underline" href={getActivityParticipationRoute(registration.activity.id)}>{registration.activity.title}</Link></td> : null}
              <td className="px-4 py-4 align-top"><p className="font-mono font-semibold">{registration.registration_code}</p><Text size="sm">{REGISTRATION_TYPE_LABELS[registration.registration_type]} · {formatRegistrationDate(registration.created_at)}</Text></td>
              <td className="px-4 py-4 align-top text-slate-700"><p>{registration.person.email}</p><p>{registration.person.phone}</p></td>
              <td className="px-4 py-4 align-top font-semibold">{formatRegistrationPrice(registration.price_snapshot)}</td>
              <td className="px-4 py-4 align-top"><CertificateRequestAdminStatus registration={registration} returnTo={returnTo} /></td>
              <td className="px-4 py-4 align-top"><RegistrationStatusBadge status={registration.status} /></td>
              <td className="px-4 py-4 align-top"><RegistrationRowActions registration={registration} returnTo={returnTo} /></td>
            </tr>)}
          </tbody>
        </table>
      </ResponsiveTableFrame>
    </>
  );
}
