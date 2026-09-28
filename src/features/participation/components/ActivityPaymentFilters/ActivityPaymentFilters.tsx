import type { PaymentFiltersProps } from "@/features/participation/types/payment.types";

const CONTROL = "min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3";
export function ActivityPaymentFilters({ filters }: PaymentFiltersProps) {
  return <form className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-2 xl:grid-cols-5" method="get">
    <label className="text-sm font-semibold">Buscar solicitud<input className={CONTROL} defaultValue={filters.query} maxLength={150} name="q" placeholder="Código, nombre, documento o RUC" type="search" /></label>
    <label className="text-sm font-semibold">Pago de participación<select className={CONTROL} defaultValue={filters.state} name="estado"><option value="pending">Pendientes (incluye parciales)</option><option value="complete">Sin saldo pendiente</option><option value="all">Todos los estados</option></select></label>
    <label className="text-sm font-semibold">Tipo de solicitud<select className={CONTROL} defaultValue={filters.kind} name="tipo"><option value="all">Individuales y grupales</option><option value="individual">Individuales</option><option value="group">Grupales</option></select></label>
    <label className="text-sm font-semibold">Pago de certificado<select className={CONTROL} defaultValue={filters.certificateState} name="estado_certificado"><option value="pending">Pendientes</option><option value="complete">Verificados</option><option value="all">Todos</option></select></label>
    <button className="min-h-11 self-end rounded-xl bg-cci-950 px-4 font-bold text-white" type="submit">Aplicar filtros</button>
  </form>;
}
