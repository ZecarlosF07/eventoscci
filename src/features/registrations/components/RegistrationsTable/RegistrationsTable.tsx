import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { Input } from "@/components/atoms/Input";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { ROUTES } from "@/constants/routes";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { REGISTRATION_TYPE_LABELS } from "@/features/registrations/constants/registration.constants";
import { cancelRegistrationAction, confirmRegistrationAction } from "@/features/registrations/mutations/registration-admin.actions";
import type { RegistrationsTableProps } from "@/features/registrations/types/registration.types";
import {
  formatRegistrationDate,
  formatRegistrationPrice,
} from "@/features/registrations/utils/registration-formatters";

export function RegistrationsTable({ registrations, returnTo }: RegistrationsTableProps) {
  if (!registrations.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <Text>No hay inscripciones con estos criterios.</Text>
      </div>
    );
  }

  return (
    <ResponsiveTableFrame className="rounded-3xl" label="Listado de inscripciones">
      <table className="w-full min-w-[1850px] text-left text-sm">
        <thead className="border-b border-cci-100 bg-cci-50 text-slate-600">
          <tr>
            <th className="px-4 py-4">Código / actividad</th>
            <th className="px-4 py-4">Participante</th>
            <th className="px-4 py-4">Contacto</th>
            <th className="px-4 py-4">Empresa</th>
            <th className="px-4 py-4">Tipo</th>
            <th className="px-4 py-4">Precio</th>
            <th className="px-4 py-4">Estado</th>
            <th className="px-4 py-4">Asistencia</th>
            <th className="px-4 py-4">Registro</th>
            <th className="px-4 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {registrations.map((registration) => (
            <tr key={registration.id}>
              <td className="px-4 py-4 align-top">
                <p className="font-mono font-semibold text-cci-950">{registration.registration_code}</p>
                <Link className="mt-1 block max-w-64 font-medium text-slate-700 hover:underline" href={getPublicActivityRoute(registration.activity.type, registration.activity.slug)}>
                  {registration.activity.title}
                </Link>
              </td>
              <td className="px-4 py-4 align-top">
                <Link className="font-semibold text-cci-950 hover:underline" href={`${ROUTES.adminParticipants}/${registration.person.id}`}>{registration.person.first_names} {registration.person.last_names}</Link>
                <Text size="sm">{registration.person.document_type.toUpperCase()} {registration.person.document_number}</Text>
                <Text size="sm">{registration.person.job_title}</Text>
              </td>
              <td className="px-4 py-4 align-top text-slate-700">
                <p>{registration.person.email}</p><p>{registration.person.phone}</p>
              </td>
              <td className="px-4 py-4 align-top text-slate-700">
                <p>{registration.company_snapshot ?? "—"}</p><p>{registration.ruc_snapshot ?? "—"}</p>
              </td>
              <td className="px-4 py-4 align-top text-slate-700">{REGISTRATION_TYPE_LABELS[registration.registration_type]}</td>
              <td className="px-4 py-4 align-top font-medium text-slate-900">{formatRegistrationPrice(registration.price_snapshot)}</td>
              <td className="px-4 py-4 align-top"><RegistrationStatusBadge status={registration.status} /></td>
              <td className="px-4 py-4 align-top"><AttendanceStatusBadge status={registration.attendance[0]?.status ?? "pending"} /></td>
              <td className="px-4 py-4 align-top text-slate-700">{formatRegistrationDate(registration.created_at)}</td>
              <td className="px-4 py-4 align-top">
                <div className="flex max-w-72 flex-col gap-2">
                  {registration.status === "pending" ? <form action={confirmRegistrationAction.bind(null, registration.id, returnTo)}><SubmitButton className="w-full" pendingLabel="Confirmando…">Confirmar</SubmitButton></form> : null}
                  {registration.status !== "cancelled" ? (
                    <form action={cancelRegistrationAction.bind(null, registration.id, returnTo)} className="flex gap-2">
                      <Input aria-label="Motivo de cancelación" className="min-w-40" maxLength={500} name="cancellation_reason" placeholder="Motivo opcional" />
                      <SubmitButton pendingLabel="Cancelando…" variant="subtle">Cancelar</SubmitButton>
                    </form>
                  ) : <Text size="sm">{registration.cancellation_reason ?? "Sin motivo registrado"}</Text>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ResponsiveTableFrame>
  );
}
