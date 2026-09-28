import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { BillingToolbarProps } from "@/features/billing/types/billing.types";

export function BillingToolbar({ filters, total }: BillingToolbarProps) {
  return <AutoFilterForm className="md:grid-cols-[minmax(220px,1fr)_220px_200px]" defaults={{ q: "", comprobante: "all", estado: "all" }}
    resetPages={{ "": ["pagina", "pagina_solicitudes"], q: ["pagina", "pagina_solicitudes"], comprobante: ["pagina", "pagina_solicitudes"], estado: ["pagina", "pagina_solicitudes"] }}
    valueLabels={{ missing: "Sin datos de comprobante", not_required: "No requiere comprobante", partial: "Pago parcial", complete: "Sin saldo pendiente", boleta: "Boleta", factura: "Factura" }} total={total}>
    <input name="q" aria-label="Buscar datos para comprobantes" defaultValue={filters.query} placeholder="Código, nombre, DNI o RUC" maxLength={150} className="min-h-11 rounded-xl border border-slate-300 px-3" />
    <select name="comprobante" aria-label="Tipo de comprobante" defaultValue={filters.type} className="min-h-11 rounded-xl border border-slate-300 px-3">
      <option value="all">Todos los comprobantes</option><option value="boleta">Boleta</option><option value="factura">Factura</option><option value="missing">Sin datos de comprobante</option><option value="not_required">No requiere comprobante</option>
    </select>
    <select name="estado" aria-label="Situación del pago" defaultValue={filters.state} className="min-h-11 rounded-xl border border-slate-300 px-3">
      <option value="all">Todas las situaciones</option><option value="pending">Pendiente</option><option value="partial">Pago parcial</option><option value="complete">Sin saldo pendiente</option><option value="cancelled">Cancelada</option>
    </select>
  </AutoFilterForm>;
}
