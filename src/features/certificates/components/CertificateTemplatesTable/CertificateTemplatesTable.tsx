import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { ROUTES } from "@/constants/routes";
import type { CertificateTemplatesTableProps } from "@/features/certificates/components/CertificateTemplatesTable/types/certificate-templates-table.types";
import { CERTIFICATE_MODEL_LABELS } from "@/features/certificates/utils/certificate-template-audience";
import { RetireCertificateModel } from "./RetireCertificateModel";

const modelGroups = ["participant", "speaker", "student", "shared"] as const;

export function CertificateTemplatesTable({ canManage, templates }: CertificateTemplatesTableProps) {
  return <div className="space-y-6">
    {modelGroups.map((group) => {
      const models = templates.filter((template) => (template.audience ?? "shared") === group);
      if (group === "shared" && !models.length) return null;
      return <section aria-labelledby={`models-${group}`} className="space-y-3" key={group}>
        <h2 className="text-lg font-semibold" id={`models-${group}`}>
          {group === "shared" ? "Modelos compartidos" : CERTIFICATE_MODEL_LABELS[group]}
        </h2>
        {group === "shared" ? <p className="text-sm text-slate-600">Disponibles para participación y ponentes.</p> : null}
        {models.length ? <ul className="divide-y divide-cci-100 rounded-2xl border border-cci-100 bg-white">
          {models.map((template) => <li className="flex flex-wrap items-start justify-between gap-4 p-4" key={template.id}>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words font-semibold text-cci-950">{template.name}</h3>
                {template.is_default ? <Badge variant="success">Predeterminado</Badge> : null}
                <Badge variant={template.is_active ? "success" : "neutral"}>{template.is_active ? "Activo" : "Inactivo"}</Badge>
              </div>
              <p className="break-words text-sm text-slate-600">{template.signers.map((signer) => signer.signer_name).join(", ") || "Sin firmantes"}</p>
            </div>
            {canManage ? <div className="flex flex-wrap gap-2">
              <Link className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 text-sm font-semibold"
                href={`${ROUTES.adminCertificateTemplates}/${template.id}`}>Editar<span className="sr-only"> {template.name}</span></Link>
              <RetireCertificateModel id={template.id} name={template.name} />
            </div> : null}
          </li>)}
        </ul> : <p className="rounded-2xl border border-dashed border-cci-200 p-4 text-sm text-slate-600">Aún no hay modelos de este tipo.</p>}
      </section>;
    })}
  </div>;
}
