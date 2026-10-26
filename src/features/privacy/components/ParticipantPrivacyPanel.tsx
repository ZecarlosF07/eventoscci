import { WithdrawMarketingForm } from "@/features/privacy/components/WithdrawMarketingForm";
import type { ParticipantPrivacyPanelProps } from "@/features/privacy/types/privacy.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PURPOSE_LABELS: Record<string, string> = { activity_registration: "Inscripción", campus: "Campus", marketing: "Publicidad por correo y WhatsApp" };
const ACTION_LABELS: Record<string, string> = { accepted: "Aceptada", declined: "No seleccionada", withdrawn: "Baja registrada" };
const ACTOR_LABELS: Record<string, string> = { self: "Aceptación propia", representative: "Declaración del representante", staff: "Gestión administrativa" };

export async function ParticipantPrivacyPanel({ personId }: ParticipantPrivacyPanelProps) {
  const client = await createServerSupabaseClient();
  const [history, permission] = await Promise.all([
    client.from("privacy_consent_records").select("id,purpose,action,policy_version,recorded_at,actor_type,reason").eq("person_id", personId).order("sequence", { ascending: false }).limit(50),
    client.from("authorized_marketing_contacts").select("person_id").eq("person_id", personId).maybeSingle(),
  ]);
  if (history.error || permission.error) throw new Error("No fue posible consultar las autorizaciones de privacidad.");
  return <section className="mt-8 space-y-4 rounded-2xl border border-cci-100 bg-white p-5 sm:p-7">
    <h2 className="text-xl font-semibold text-cci-950">Privacidad y autorizaciones</h2>
    <p className="text-sm text-slate-600">Publicidad: <strong>{permission.data ? "Autorizada por correo y WhatsApp" : "Sin autorización vigente"}</strong>. Las aceptaciones no modifican el historial de inscripciones.</p>
    <WithdrawMarketingForm enabled={Boolean(permission.data)} personId={personId} />
    {history.data?.length ? <details className="rounded-xl border border-cci-100 p-4">
      <summary className="cursor-pointer font-semibold text-cci-950">Ver las últimas {history.data.length} constancias</summary>
      <ol className="mt-4 space-y-4">{history.data.map((record) => <li className="border-t border-cci-100 pt-3 text-sm" key={record.id}>
        <p className="font-semibold text-cci-950">{PURPOSE_LABELS[record.purpose]} · {ACTION_LABELS[record.action]}</p>
        <p className="mt-1 text-slate-600">{formatRegistrationDate(record.recorded_at)} · {ACTOR_LABELS[record.actor_type]} · Versión {record.policy_version}</p>
        {record.reason ? <p className="mt-1 text-slate-600">Motivo: {record.reason}</p> : null}
      </li>)}</ol>
    </details> : <p className="text-sm text-slate-600">No hay constancias registradas. Los registros anteriores no se consideran una aceptación automática.</p>}
  </section>;
}
