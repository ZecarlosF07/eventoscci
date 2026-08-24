import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import type { ParticipantsTableProps } from "@/features/participants/components/ParticipantsTable/types/participants-table.types";

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  if (!participants.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Text>No se encontraron participantes.</Text></div>;
  }
  return (
    <div className="overflow-x-auto rounded-3xl border border-cci-100 bg-white">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="border-b border-cci-100 bg-cci-50 text-slate-600">
          <tr><th className="px-5 py-4">Documento</th><th className="px-5 py-4">Participante</th><th className="px-5 py-4">Contacto</th><th className="px-5 py-4">Cargo / empresa</th><th className="px-5 py-4">Participaciones</th><th className="px-5 py-4">Acción</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {participants.map((participant) => (
            <tr key={participant.id}>
              <td className="px-5 py-4 font-mono text-slate-800">{participant.document_type.toUpperCase()} {participant.document_number}</td>
              <td className="px-5 py-4 font-semibold text-cci-950">{participant.first_names} {participant.last_names}</td>
              <td className="px-5 py-4 text-slate-700"><p>{participant.email}</p><p>{participant.phone}</p></td>
              <td className="px-5 py-4 text-slate-700"><p>{participant.job_title}</p><p>{participant.company ?? "Sin empresa"}</p><p>{participant.ruc ?? ""}</p></td>
              <td className="px-5 py-4 text-slate-700">{participant.registrations.length}</td>
              <td className="px-5 py-4"><Link className="font-semibold text-slate-900 underline-offset-4 hover:underline" href={`${ROUTES.adminParticipants}/${participant.id}`}>Ver ficha</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
