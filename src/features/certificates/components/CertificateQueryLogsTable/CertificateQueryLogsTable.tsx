import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { CertificateQueryLogsTableProps } from "@/features/certificates/components/CertificateQueryLogsTable/types/certificate-query-logs-table.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

const OUTCOME_LABELS = {
  found: "Con resultados",
  invalid: "DNI inválido",
  not_found: "Sin resultados",
  rate_limited: "Bloqueado",
} as const;

export function CertificateQueryLogsTable({ items }: CertificateQueryLogsTableProps) {
  if (!items.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Text>No se encontraron consultas con estos filtros.</Text></div>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">DNI</th><th className="px-4 py-3">Resultado</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Navegador</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-4 py-4">{formatRegistrationDate(item.createdAt)}</td><td className="px-4 py-4 font-mono font-semibold">{item.documentNumber || "—"}</td><td className="px-4 py-4"><Badge variant={item.outcome === "found" ? "success" : item.outcome === "rate_limited" ? "warning" : "neutral"}>{OUTCOME_LABELS[item.outcome]}</Badge><p className="mt-1 text-xs text-slate-500">{item.resultCount} certificados</p></td><td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{item.ipAddress ?? "No disponible"}</td><td className="px-4 py-4">{item.actorLabel ?? "Anónimo"}</td><td className="max-w-xs px-4 py-4"><span className="block truncate" title={item.userAgent ?? undefined}>{item.userAgent ?? "No disponible"}</span></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
