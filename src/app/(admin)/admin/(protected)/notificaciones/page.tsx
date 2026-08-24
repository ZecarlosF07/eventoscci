import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { NotificationsTable } from "@/features/notifications/components/NotificationsTable";
import { getNotifications } from "@/features/notifications/queries/get-notifications";
import type { NotificationsAdminPageProps } from "@/features/notifications/types/notification.types";

function first(value?: string | string[]): string | undefined { return Array.isArray(value) ? value[0] : value; }

export default async function NotificationsPage({ searchParams }: NotificationsAdminPageProps) {
  const pageValue = Number(first((await searchParams).pagina));
  const data = await getNotifications(Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1);
  return <div className="space-y-7"><SectionHeading description={`${data.total} eventos transaccionales. Cada notificación se entrega inmediatamente al webhook de n8n.`} eyebrow="Entrega directa" title="Notificaciones" /><NotificationsTable notifications={data.notifications} /><Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminNotifications} /></div>;
}
