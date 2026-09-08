"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import type {
  CertificateAdminNavigationProps,
  CertificateNavigationItem,
} from "@/features/certificates/components/CertificateAdminNavigation/types/certificate-admin-navigation.types";
import { classNames } from "@/utils/class-names";

const PRIMARY_ITEMS: CertificateNavigationItem[] = [
  {
    description: "Selecciona un evento o capacitación y gestiona sus certificados.",
    href: ROUTES.adminCertificatesActivities,
    title: "Emitir por actividad",
  },
  {
    description: "Configura diseños institucionales, firmas y autoridades.",
    href: ROUTES.adminCertificateTemplates,
    title: "Plantillas y firmantes",
  },
];

const AUDIT_ITEMS: CertificateNavigationItem[] = [
  {
    description: "Revisa aperturas y descargas de documentos públicos.",
    href: ROUTES.adminCertificateAccess,
    title: "Accesos públicos",
  },
  {
    description: "Consulta las búsquedas realizadas desde el portal por DNI.",
    href: ROUTES.adminCertificateQueries,
    title: "Consultas por DNI",
  },
];

export function CertificateAdminNavigation({ canViewAudit }: CertificateAdminNavigationProps) {
  const pathname = usePathname();
  const items = canViewAudit ? [...PRIMARY_ITEMS, ...AUDIT_ITEMS] : PRIMARY_ITEMS;

  return (
    <nav aria-label="Secciones de certificados" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={classNames(
              "group flex min-h-36 flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cci-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800",
              active ? "border-cci-700 ring-1 ring-cci-700" : "border-cci-100",
            )}
            href={item.href}
            key={item.href}
          >
            <span>
              <span className="font-semibold text-cci-950">{item.title}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{item.description}</span>
            </span>
            <span aria-hidden="true" className="self-end text-xl text-cci-700 transition group-hover:translate-x-1">→</span>
          </Link>
        );
      })}
    </nav>
  );
}
