import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { FilterResults } from "@/features/admin-filters/components/FilterWorkspace";
import { NotificationFilters } from "@/features/notifications/components/NotificationFilters";
import { NotificationsTable } from "@/features/notifications/components/NotificationsTable";
import { getNotifications } from "@/features/notifications/queries/get-notifications";
import type { NotificationsAdminPageProps } from "@/features/notifications/types/notification.types";
import { parseNotificationFilters } from "@/features/notifications/utils/notification-filters";

export default async function NotificationsPage({ searchParams }: NotificationsAdminPageProps) {
  const filters = parseNotificationFilters(await searchParams);
  const data = await getNotifications(filters);
  return <div className="space-y-7"><SectionHeading description={`${data.total} eventos transaccionales. Cada notificación se entrega inmediatamente al webhook de n8n.`} eyebrow="Entrega directa" title="Notificaciones" /><NotificationFilters filters={filters} total={data.total} /><FilterResults><NotificationsTable notifications={data.notifications} /></FilterResults><Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminNotifications} searchParams={{ q: filters.query, estado: filters.status, evento: filters.eventType }} /></div>;
}
