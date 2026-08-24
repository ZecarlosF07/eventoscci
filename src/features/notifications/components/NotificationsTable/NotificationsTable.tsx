import { Badge } from "@/components/atoms/Badge";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { Text } from "@/components/atoms/Text";
import type { BadgeVariant } from "@/components/atoms/Badge/types/badge.types";
import { retryNotificationAction } from "@/features/notifications/mutations/notification.actions";
import type { NotificationsTableProps } from "@/features/notifications/components/NotificationsTable/types/notifications-table.types";
import type { NotificationStatus } from "@/features/notifications/types/notification.types";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

const LABELS: Record<NotificationStatus, string> = { cancelled: "Cancelada", failed: "Fallida", pending: "Pendiente", processing: "Procesando", sent: "Enviada" };
const VARIANTS: Record<NotificationStatus, BadgeVariant> = { cancelled: "neutral", failed: "warning", pending: "neutral", processing: "warning", sent: "success" };

export function NotificationsTable({ notifications }: NotificationsTableProps) {
  if (!notifications.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay notificaciones en la cola.</Text></div>;
  return <div className="overflow-x-auto rounded-3xl border border-cci-100 bg-white"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-4">Evento</th><th className="px-4 py-4">Destinatario</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Intentos</th><th className="px-4 py-4">Último error</th><th className="px-4 py-4">Creada / enviada</th><th className="px-4 py-4">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{notifications.map((notification) => <tr key={notification.id}><td className="px-4 py-4 font-mono text-xs">{notification.event_type}</td><td className="px-4 py-4">{notification.recipient_email}</td><td className="px-4 py-4"><Badge variant={VARIANTS[notification.status]}>{LABELS[notification.status]}</Badge></td><td className="px-4 py-4">{notification.attempts}</td><td className="max-w-72 px-4 py-4 text-slate-700">{notification.last_error ?? "—"}</td><td className="px-4 py-4"><p>{formatRegistrationDate(notification.created_at)}</p><Text size="sm">{notification.sent_at ? formatRegistrationDate(notification.sent_at) : "Sin enviar"}</Text></td><td className="px-4 py-4">{notification.status === "failed" || notification.status === "pending" ? <form action={retryNotificationAction.bind(null, notification.id)}><SubmitButton pendingLabel="Enviando…" variant="subtle">{notification.status === "failed" ? "Reintentar" : "Enviar"}</SubmitButton></form> : "—"}</td></tr>)}</tbody></table></div>;
}
