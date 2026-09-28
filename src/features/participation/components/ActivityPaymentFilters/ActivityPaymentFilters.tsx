import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { PaymentFiltersProps } from "@/features/participation/types/payment.types";

const CONTROL = "min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3";
export function ActivityPaymentFilters({ filters }: PaymentFiltersProps) {
  return <AutoFilterForm className="items-end md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_220px_200px_220px]" defaults={{ estado: "pending", tipo: "all", estado_certificado: "pending" }} resetPages={{ "": ["pagina", "pagina_certificados"], q: ["pagina", "pagina_certificados"], estado_certificado: ["pagina_certificados"] }}>
    <label className="text-sm font-semibold">Buscar solicitud<input className={CONTROL} defaultValue={filters.query} maxLength={150} name="q" placeholder="Código, nombre, documento o RUC" type="search" /></label>
    <label className="text-sm font-semibold">Pago de participación<select className={CONTROL} defaultValue={filters.state} name="estado"><option value="pending">Pendientes (incluye parciales)</option><option value="complete">Completadas (sin saldo)</option><option value="all">Todos los estados</option></select></label>
    <label className="text-sm font-semibold">Tipo de solicitud<select className={CONTROL} defaultValue={filters.kind} name="tipo"><option value="all">Individuales y grupales</option><option value="individual">Individuales</option><option value="group">Grupales</option></select></label>
    <div className="border-t border-cci-100 pt-2 md:border-t-0 md:border-l md:pl-3 md:pt-0"><label className="block text-sm font-semibold">Certificados opcionales · pago<select className={CONTROL} defaultValue={filters.certificateState} name="estado_certificado"><option value="pending">Pendientes</option><option value="complete">Verificados</option><option value="all">Todos</option></select></label></div>
  </AutoFilterForm>;
}
