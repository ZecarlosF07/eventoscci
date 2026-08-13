import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import type { CertificateTemplatesTableProps } from "@/features/certificates/components/CertificateTemplatesTable/types/certificate-templates-table.types";
import { deleteCertificateTemplateAction } from "@/features/certificates/mutations/certificate-template.actions";

export function CertificateTemplatesTable({ templates }: CertificateTemplatesTableProps) {
  if (!templates.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay plantillas configuradas.</Text></div>;
  return <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr><th className="px-5 py-4">Plantilla</th><th className="px-5 py-4">Alcance</th><th className="px-5 py-4">Firmantes</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{templates.map((template) => <tr key={template.id}><td className="px-5 py-4"><p className="font-semibold text-slate-950">{template.name}</p>{template.is_default ? <Badge variant="success">Predeterminada</Badge> : null}</td><td className="px-5 py-4">{template.scope === "activity" ? "Actividad" : "Curso"}</td><td className="px-5 py-4">{template.signers.map((signer) => signer.signer_name).join(", ")}</td><td className="px-5 py-4"><Badge variant={template.is_active ? "success" : "neutral"}>{template.is_active ? "Activa" : "Inactiva"}</Badge></td><td className="px-5 py-4"><div className="flex gap-2"><Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 font-semibold" href={`${ROUTES.adminCertificateTemplates}/${template.id}`}>Editar</Link>{!template.is_default ? <form action={deleteCertificateTemplateAction.bind(null, template.id)}><Button type="submit" variant="subtle">Retirar</Button></form> : null}</div></td></tr>)}</tbody></table></div>;
}
