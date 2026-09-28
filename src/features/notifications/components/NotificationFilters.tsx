import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { NotificationFiltersProps } from "@/features/notifications/types/notification.types";
import { NOTIFICATION_EVENT_LABELS } from "@/features/notifications/utils/notification-filters";

export function NotificationFilters({ filters, total }: NotificationFiltersProps) {
  return <AutoFilterForm valueLabels={NOTIFICATION_EVENT_LABELS} className="md:grid-cols-3" total={total}>
    <label className="text-sm font-semibold">Correo destinatario<Input defaultValue={filters.query} maxLength={150} name="q" placeholder="Buscar por correo" type="search" /></label>
    <label className="text-sm font-semibold">Estado<Select defaultValue={filters.status ?? ""} name="estado"><option value="">Todos</option><option value="pending">Pendientes</option><option value="processing">Procesando</option><option value="sent">Enviadas</option><option value="failed">Fallidas</option><option value="cancelled">Canceladas</option></Select></label>
    <label className="text-sm font-semibold">Tipo de notificación<Select defaultValue={filters.eventType ?? ""} name="evento"><option value="">Todos</option>{Object.entries(NOTIFICATION_EVENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
  </AutoFilterForm>;
}
