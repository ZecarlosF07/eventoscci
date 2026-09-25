import type { MemberAttendeeInput } from "@/features/member-groups/types/member-group.types";

interface MemberGroupSummaryProps {
  attendees: MemberAttendeeInput[];
  certificateMode: string;
  companyName: string;
  complimentaryCount: number;
  isFree: boolean;
  memberPrice: number;
  ruc: string;
  total: number;
}

export function MemberGroupSummary({ attendees, certificateMode, companyName, complimentaryCount, isFree, memberPrice, ruc, total }: MemberGroupSummaryProps) {
  return <section className="space-y-3 rounded-2xl border border-cci-200 bg-cci-50 p-5" aria-label="Resumen de la solicitud">
    <h2 className="text-lg font-bold text-cci-950">Revisa tu solicitud</h2>
    <p><strong>Empresa:</strong> {companyName} · RUC {ruc}</p>
    <p><strong>Asistentes:</strong> {attendees.length}</p>
    <ul className="divide-y divide-cci-100 rounded-xl border border-cci-100 bg-white text-sm">
      {attendees.map((person, index) => {
        const complimentary = isFree || index < complimentaryCount;
        return <li className="flex flex-wrap justify-between gap-2 p-3" key={`${person.document_type}-${person.document_number}-${index}`}>
          <span>{person.first_names} {person.last_names}</span>
          <strong>{complimentary ? isFree ? "Actividad gratuita" : "Pase gratuito" : `S/ ${memberPrice.toFixed(2)}`}</strong>
        </li>;
      })}
    </ul>
    <p className="text-xl font-bold text-cci-950">Total por pagar: S/ {total.toFixed(2)}</p>
    <p className="text-sm text-slate-700">{total === 0
      ? "Todas estas plazas quedarán confirmadas al enviar."
      : complimentaryCount > 0
        ? "Las plazas con pase gratuito se confirmarán al enviar. Las demás quedarán reservadas hasta que la CCI valide el pago."
        : "Las plazas quedarán reservadas hasta que la CCI valide el pago."}
      {certificateMode === "optional_paid" ? " El certificado opcional se coordina y paga por separado." : ""}</p>
  </section>;
}
