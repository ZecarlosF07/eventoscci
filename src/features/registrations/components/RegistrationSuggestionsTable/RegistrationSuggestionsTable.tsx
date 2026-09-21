import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { ROUTES } from "@/constants/routes";
import type { RegistrationSuggestionsTableProps } from "@/features/registrations/components/RegistrationSuggestionsTable/types/registration-suggestions-table.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

function profileLabel(item: RegistrationSuggestionsTableProps["items"][number]): string {
  if (item.registration_type === "member") return "Asociado CCI";
  return item.participant_profile === "student" ? "Estudiante" : "Profesional o independiente";
}

function contextLabel(item: RegistrationSuggestionsTableProps["items"][number]): string {
  if (item.participant_profile === "student") return [item.academic_institution_snapshot, item.career_snapshot].filter(Boolean).join(" · ");
  return [item.job_title_snapshot, item.company_snapshot].filter(Boolean).join(" · ");
}

export function RegistrationSuggestionsTable({ items }: RegistrationSuggestionsTableProps) {
  if (!items.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Text>No hay sugerencias con estos criterios.</Text></div>;
  return (
    <ResponsiveTableFrame className="rounded-3xl" label="Sugerencias de próximos temas">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-5 py-4">Sugerencia</th><th className="px-5 py-4">Actividad</th><th className="px-5 py-4">Participante</th><th className="px-5 py-4">Perfil</th><th className="px-5 py-4">Fecha</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => <tr key={item.id}>
            <td className="max-w-xl whitespace-normal px-5 py-4 font-medium text-cci-950">{item.future_topics_suggestion}</td>
            <td className="max-w-72 px-5 py-4"><p className="font-semibold">{item.activity.title}</p><Text size="sm">{item.activity.type === "event" ? "Evento" : "Capacitación"}</Text></td>
            <td className="px-5 py-4"><Link className="font-semibold text-cci-800 hover:underline" href={`${ROUTES.adminParticipants}?q=${encodeURIComponent(item.person.document_number)}`}>{item.person.first_names} {item.person.last_names}</Link><Text size="sm">{item.person.document_number}</Text></td>
            <td className="px-5 py-4"><p>{profileLabel(item)}</p><Text size="sm">{contextLabel(item)}</Text></td>
            <td className="px-5 py-4 text-slate-700">{formatRegistrationDate(item.created_at)}</td>
          </tr>)}
        </tbody>
      </table>
    </ResponsiveTableFrame>
  );
}
