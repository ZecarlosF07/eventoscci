"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { MemberAttendeeFields } from "@/features/member-groups/components/MemberAttendeeFields/MemberAttendeeFields";
import { MemberBillingFields } from "@/features/member-groups/components/MemberBillingFields/MemberBillingFields";
import { PaymentInstructions } from "@/features/registrations/components/PaymentInstructions";
import { lookupMemberCompany, registerMemberGroup } from "@/features/member-groups/mutations/member-group.actions";
import { memberGroupInputSchema } from "@/features/member-groups/schemas/member-group.schema";
import type { MemberAttendeeInput, MemberBillingInput, MemberGroupRegistrationFormProps } from "@/features/member-groups/types/member-group.types";

const emptyAttendee = (): MemberAttendeeInput => ({ document_type: "dni", document_number: "", first_names: "", last_names: "", email: "", phone: "", job_title: "", request_certificate: false });

export function MemberGroupRegistrationForm({ activity }: MemberGroupRegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [ruc, setRuc] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [attendees, setAttendees] = useState<MemberAttendeeInput[]>([emptyAttendee()]);
  const [billing, setBilling] = useState<MemberBillingInput>({ type: "boleta", document: "", name: "" });
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [authorized, setAuthorized] = useState(false);
  const idempotencyKey = useRef<string>("");
  const total = activity.isFree ? 0 : activity.memberPrice * attendees.length;

  function updateAttendee(index: number, attendee: MemberAttendeeInput) {
    setAttendees((current) => current.map((item, position) => position === index ? attendee : item));
    setMessage("");
    setFieldErrors({});
  }

  async function verifyCompany() {
    setCompanyName("");
    setMessage("");
    setBusy(true);
    try {
      const result = await lookupMemberCompany(ruc);
      if (!result.legalName) setMessage(result.message ?? "No se pudo verificar el RUC.");
      else {
        setCompanyName(result.legalName);
        setBilling((current) => current.type === "factura" ? { ...current, document: ruc, name: result.legalName! } : current);
      }
    } catch { setMessage("No se pudo verificar el RUC. Inténtalo nuevamente."); }
    finally { setBusy(false); }
  }

  function proceed() {
    const candidate = memberGroupInputSchema.safeParse({ ruc, attendees, billing: activity.isFree ? null : { type: "factura", document: ruc, name: companyName, address: "Pendiente" }, future_topics_suggestion: suggestion });
    if (!companyName) { setMessage("Verifica primero el RUC de la empresa asociada."); return; }
    if (!candidate.success) {
      const issue = candidate.error.issues[0];
      setFieldErrors(Object.fromEntries(candidate.error.issues.map((item) => [item.path.join("."), item.message])));
      setMessage(issue.path[0] === "attendees" ? `Revisa los datos del asistente ${Number(issue.path[1]) + 1}. ${issue.message}` : issue.message);
      document.getElementById(`attendee-${Number(issue.path[1] ?? 0)}-${String(issue.path[2] ?? "document-number").replaceAll("_", "-")}`)?.focus();
      return;
    }
    setFieldErrors({});
    setMessage("");
    if (billing.type === "boleta" && !billing.document && attendees[0].document_type === "dni") {
      setBilling({ type: "boleta", document: attendees[0].document_number, name: `${attendees[0].first_names} ${attendees[0].last_names}` });
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!authorized) { setMessage("Confirma que cuentas con autorización para registrar a las personas indicadas."); return; }
    const input = { ruc, attendees, billing: activity.isFree ? null : billing, future_topics_suggestion: suggestion };
    const parsed = memberGroupInputSchema.safeParse(input);
    if (!parsed.success) {
      setFieldErrors(Object.fromEntries(parsed.error.issues.map((item) => [item.path.join("."), item.message])));
      const issue = parsed.error.issues[0];
      document.getElementById(`billing-${String(issue.path[1] ?? "document")}`)?.focus();
      setMessage("Revisa los datos del comprobante y de los asistentes.");
      return;
    }
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    setBusy(true);
    setMessage("");
    try {
      const result = await registerMemberGroup(activity.id, parsed.data, idempotencyKey.current);
      if (!result.success || !result.data) { setMessage(result.message ?? "No se pudo enviar la solicitud."); return; }
      const query = new URLSearchParams({ grupo: result.data.group.request_code, acceso: result.data.access_token });
      router.push(`/eventos/${activity.slug}/inscripcion/resultado?${query.toString()}`);
    } catch { setMessage("No se pudo conectar. Puedes volver a intentar sin duplicar la solicitud."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-7">
      <div className="rounded-xl bg-cci-50 p-4 text-sm text-cci-950" aria-live="polite">
        <strong>Paso {step} de 2:</strong> {step === 1 ? "Empresa y asistentes" : activity.isFree ? "Revisa y confirma" : "Comprobante y resumen"}
      </div>
      {step === 1 ? <form className="space-y-7" onSubmit={(event) => { event.preventDefault(); proceed(); }}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-cci-950">1. Empresa asociada</h2>
          <p className="text-sm text-slate-600">Ingresa el RUC de una empresa asociada activa. La razón social aparecerá automáticamente.</p>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <FormField label="RUC de la empresa" name="member-ruc" required>
              <Input id="member-ruc" inputMode="numeric" maxLength={11} value={ruc} onChange={(event) => { setRuc(event.target.value.replace(/\D/g, "")); setCompanyName(""); }} />
            </FormField>
            <Button type="button" disabled={busy || ruc.length !== 11} onClick={verifyCompany}>Verificar RUC</Button>
          </div>
          {companyName ? <p className="rounded-xl border border-cci-200 bg-cci-50 p-4 font-semibold text-cci-950" role="status">Empresa validada: {companyName}</p> : null}
        </div>
        <div className="space-y-5">
          <div><h2 className="text-xl font-bold text-cci-950">2. Personas que asistirán</h2><p className="mt-1 text-sm text-slate-600">Cada persona tendrá su propia plaza, asistencia y certificado. Puedes añadir más asistentes.</p></div>
          {attendees.map((attendee, index) => <MemberAttendeeFields key={index} attendee={attendee} index={index} errors={Object.fromEntries(Object.entries(fieldErrors).filter(([key]) => key.startsWith(`attendees.${index}.`)).map(([key, value]) => [key.split(".")[2], value]))} certificateMode={activity.certificateMode} certificatePrice={activity.certificateMemberPrice} onChange={(next) => updateAttendee(index, next)} onRemove={index ? () => { if (window.confirm(`¿Quitar al asistente ${index + 1}?`)) setAttendees((current) => current.filter((_, position) => position !== index)); } : undefined} />)}
          <Button type="button" variant="secondary" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Agregar otra persona</Button>
        </div>
        <FormField label="¿Sobre qué temas te gustaría aprender en próximos eventos o capacitaciones? (opcional)" name="future-topics-suggestion">
          <textarea id="future-topics-suggestion" className="min-h-24 w-full rounded-xl border border-cci-200 p-3 text-sm" maxLength={500} value={suggestion} onChange={(event) => setSuggestion(event.target.value)} />
        </FormField>
        <Button type="submit" disabled={busy}>Siguiente: {activity.isFree ? "revisar solicitud" : "comprobante"} →</Button>
      </form> : <>
        {!activity.isFree && activity.paymentNote ? <PaymentInstructions note={activity.paymentNote} /> : null}
        {!activity.isFree ? <MemberBillingFields billing={billing} companyName={companyName} companyRuc={ruc} errors={Object.fromEntries(Object.entries(fieldErrors).filter(([key]) => key.startsWith("billing.")).map(([key, value]) => [key.split(".")[1], value]))} onChange={(next) => { setBilling(next); setFieldErrors({}); }} /> : null}
        <section className="space-y-3 rounded-2xl border border-cci-200 bg-cci-50 p-5" aria-label="Resumen de la solicitud">
          <h2 className="text-lg font-bold text-cci-950">Revisa tu solicitud</h2>
          <p><strong>Empresa:</strong> {companyName} · RUC {ruc}</p>
          <p><strong>Asistentes:</strong> {attendees.length}</p>
          <ul className="list-inside list-disc text-sm text-slate-700">{attendees.map((person, index) => <li key={index}>{person.first_names} {person.last_names}</li>)}</ul>
          <p className="text-xl font-bold text-cci-950">{activity.isFree ? "Gratuito" : `Total de la actividad: S/ ${total.toFixed(2)}`}</p>
          {!activity.isFree ? <p className="text-sm text-slate-600">Tras enviar, las plazas quedarán reservadas. El personal validará el pago manualmente antes de confirmarlas. El certificado opcional se paga por separado.</p> : <p className="text-sm text-slate-600">Las plazas se confirmarán al enviar la solicitud.</p>}
        </section>
        <label className="flex min-h-11 items-start gap-3 text-sm text-cci-950"><input className="mt-1" type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} />Confirmo que cuento con autorización para registrar los datos de las demás personas.</label>
        <div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" disabled={busy} onClick={() => setStep(1)}>← Volver y editar</Button><Button type="button" disabled={busy} onClick={submit}>{busy ? "Enviando…" : activity.isFree ? "Confirmar plazas" : "Enviar solicitud"}</Button></div>
      </>}
      {message ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert">{message}</p> : null}
    </div>
  );
}
