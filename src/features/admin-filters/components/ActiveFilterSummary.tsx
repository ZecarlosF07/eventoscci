"use client";

import { useSearchParams } from "next/navigation";

import type { ActiveFilterSummaryProps } from "@/features/admin-filters/types/admin-filter.types";

const NAMES: Record<string, string> = { q: "Búsqueda", estado: "Estado", tipo: "Tipo", perfil: "Perfil", visibilidad: "Visibilidad", periodo: "Periodo", pagos: "Con pagos pendientes", certificado: "Certificado", estado_certificado: "Pago de certificado", asistencia: "Asistencia", emision: "Certificación", evento: "Notificación", desde: "Desde", hasta: "Hasta", dni: "DNI", resultado: "Resultado", actividad: "Actividad" };
const VALUES: Record<string, string> = { all: "Todos", found: "Con resultados", not_found: "Sin resultados", invalid: "DNI inválido", rate_limited: "Bloqueado", professional: "Profesional", student: "Estudiante", general: "Público general", member: "Asociado CCI", listed: "Listadas", unlisted: "No listadas", pending: "Pendientes", confirmed: "Confirmadas", cancelled: "Canceladas", published: "Publicadas", draft: "Borradores", finished: "Finalizadas", sent: "Enviadas", failed: "Fallidas", processing: "Procesando", ready: "Listos para emitir", issued: "Emitidos", revoked: "Revocados", upcoming: "Próximas y en curso", past: "Anteriores", event: "Eventos", training: "Capacitaciones", individual: "Individuales", group: "Grupales", complete: "Completadas", attended: "Asistió", absent: "No asistió", payment_pending: "Pago pendiente", payment_verified: "Pago verificado", ready_to_issue: "Listos para emitir", not_requested: "Sin solicitar", "1": "Sí" };

export function ActiveFilterSummary({ defaults, remove, valueLabels = {} }: ActiveFilterSummaryProps) {
  const params = useSearchParams();
  const entries = [...params.entries()].filter(([name, value]) => NAMES[name] && value && value !== defaults[name]
    && (value !== "all" || defaults[name] && defaults[name] !== "all")
    && (!/^[\da-f-]{36}$/i.test(value) || valueLabels[value]));
  if (!entries.length) return null;
  return <div className="col-span-full flex flex-wrap gap-2" aria-label="Filtros activos">{entries.map(([name, value]) => <button className="min-h-11 max-w-full rounded-full bg-cci-50 px-4 text-left text-sm text-cci-950" key={name} onClick={() => remove(name)} type="button" aria-label={`Quitar filtro ${NAMES[name]}`}><span className="break-words">{NAMES[name]}: {valueLabels[value] ?? VALUES[value] ?? value}</span> ×</button>)}</div>;
}
