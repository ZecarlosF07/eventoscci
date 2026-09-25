"use client";

import { useState, type FormEvent } from "react";

import { applyMemberRosterImportAction } from "@/features/member-roster/mutations/member-roster.actions";
import type {
  MemberRosterImportFormProps,
  MemberRosterPreview,
  MemberRosterRowError,
} from "@/features/member-roster/types/member-roster.types";

export function MemberRosterImportForm({ activeCount, version }: MemberRosterImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MemberRosterPreview | null>(null);
  const [errors, setErrors] = useState<MemberRosterRowError[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setMessage("");
    setErrors([]);
    setPreview(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/member-roster/preview", { body, method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors ?? []);
        setMessage(result.error ?? "Corrige las filas indicadas y vuelve a subir el archivo.");
      } else setPreview(result.preview);
    } catch {
      setMessage("No se pudo cargar el archivo. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  async function handleApply() {
    if (!preview || busy) return;
    setBusy(true);
    const result = await applyMemberRosterImportAction(preview.id);
    setMessage(result.message);
    if (result.success) setPreview(null);
    setBusy(false);
  }

  return (
    <section className="rounded-3xl border border-cci-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-cci-950">Reemplazar padrón</h2>
      <p className="mt-2 text-sm text-slate-600">Padrón actual: {activeCount} RUC activos · versión {version}. En la primera hoja, usa solo dos columnas: RUC y Razón social, en ese orden.</p>
      <p className="mt-2 text-sm text-slate-600">El RUC puede ser texto o número entero de 11 dígitos. Si comienza con cero, guárdalo como texto para no perderlo. La razón social debe ser texto; no se aceptan fórmulas.</p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handlePreview}>
        <label className="grid flex-1 gap-2 text-sm font-semibold text-cci-950" htmlFor="member-roster-file">Archivo .xlsx
          <input accept=".xlsx" className="min-h-11 w-full rounded-xl border border-slate-300 p-2" id="member-roster-file" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); }} required type="file" />
        </label>
        <button className="min-h-11 rounded-xl bg-cci-950 px-5 font-bold text-white disabled:opacity-50" disabled={!file || busy} type="submit">{busy ? "Procesando…" : "Ver cambios antes de reemplazar"}</button>
      </form>
      {errors.length ? <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="font-bold text-rose-900">Corrige el Excel antes de continuar</p><ul className="mt-2 list-disc pl-5 text-sm text-rose-800">{errors.map((error) => <li key={`${error.row}-${error.message}`}>Fila {error.row}: {error.message}</li>)}</ul></div> : null}
      {preview ? <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5"><h3 className="font-bold text-cci-950">Vista previa — aún no se cambió el padrón</h3><p className="mt-2 text-sm">{preview.row_count} empresas en el archivo · {preview.added_count} altas · {preview.changed_count} cambios · {preview.removed_count} bajas.</p><p className="mt-2 text-sm text-amber-900">Los RUC ausentes quedarán inactivos al confirmar.</p><button className="mt-4 min-h-11 rounded-xl bg-cci-950 px-5 font-bold text-white disabled:opacity-50" disabled={busy} onClick={handleApply} type="button">Confirmar reemplazo completo</button></div> : null}
      {message ? <p className="mt-4 text-sm font-semibold text-cci-950" role="status">{message}</p> : null}
    </section>
  );
}
