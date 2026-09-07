import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { CertificateAccessLogsTableProps } from "@/features/certificates/components/CertificateAccessLogsTable/types/certificate-access-logs-table.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

const SOURCE_LABELS = {
  direct: "Enlace directo",
  email: "Correo",
  public_search: "Consulta por DNI",
} as const;

export function CertificateAccessLogsTable({ items }: CertificateAccessLogsTableProps) {
  if (!items.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Text>Todavía no se registraron aperturas ni descargas.</Text></div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Participante</th><th className="px-4 py-3">Certificado</th><th className="px-4 py-3">Acción</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Navegador</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap px-4 py-4">{formatRegistrationDate(item.createdAt)}</td>
              <td className="px-4 py-4"><p className="font-semibold text-cci-950">{item.participantName}</p><p className="mt-1 font-mono text-xs text-slate-500">DNI {item.documentNumber ?? "no disponible"}</p></td>
              <td className="max-w-xs px-4 py-4"><p className="font-medium text-slate-800">{item.certificateTitle}</p><p className="mt-1 font-mono text-xs text-slate-500">{item.certificateCode}</p></td>
              <td className="whitespace-nowrap px-4 py-4"><Badge variant={item.action === "certificate.public_download" ? "success" : "neutral"}>{item.action === "certificate.public_download" ? "Descargó PDF" : "Abrió el enlace"}</Badge><p className="mt-1 text-xs text-slate-500">{SOURCE_LABELS[item.source]}</p></td>
              <td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{item.ipAddress ?? "No disponible"}</td>
              <td className="max-w-xs px-4 py-4"><span className="block truncate" title={item.userAgent ?? undefined}>{item.userAgent ?? "No disponible"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
