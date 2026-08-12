import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ROUTES } from "@/constants/routes";
import type { ActivityAdminTableProps } from "@/features/activities/components/ActivityAdminTable/types/activity-admin-table.types";
import { changeActivityStatusAction } from "@/features/activities/mutations/activity.actions";
import {
  formatActivityDate,
  getModalityLabel,
  getNextActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getAdminActivityRoute } from "@/features/activities/utils/activity-routes";

export function ActivityAdminTable({ activities }: ActivityAdminTableProps) {
  if (!activities.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Text>No hay actividades con esos criterios.</Text></div>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr><th className="px-5 py-4">Actividad</th><th className="px-5 py-4">Modalidad</th><th className="px-5 py-4">Próxima fecha</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Publicación</th><th className="px-5 py-4">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {activities.map((activity) => {
            const nextDate = getNextActivityDate(activity.dates);
            const editRoute = getAdminActivityRoute(activity.type, activity.id);
            return (
              <tr key={activity.id}>
                <td className="px-5 py-4"><Link className="font-semibold text-slate-950 hover:underline" href={editRoute}>{activity.title}</Link><Text size="sm">{activity.category?.name ?? "Sin categoría"}</Text></td>
                <td className="px-5 py-4 text-slate-700">{getModalityLabel(activity.modality)}</td>
                <td className="px-5 py-4 text-slate-700">{nextDate ? formatActivityDate(nextDate.starts_at) : "Sin fecha"}</td>
                <td className="px-5 py-4"><PriceDisplay generalPrice={activity.general_price} isFree={activity.is_free} memberPrice={activity.member_price} /></td>
                <td className="px-5 py-4"><StatusBadge status={activity.status} /></td>
                <td className="px-5 py-4 text-slate-700">{activity.published_at ? formatActivityDate(activity.published_at) : "Sin publicar"}</td>
                <td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 font-semibold text-slate-800 hover:bg-slate-50" href={editRoute}>Editar</Link><Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 font-semibold text-slate-800 hover:bg-slate-50" href={`${ROUTES.adminRegistrations}?actividad=${activity.id}`}>Inscripciones</Link>{activity.status !== "published" ? <form action={changeActivityStatusAction.bind(null, activity.id, activity.type, "published")}><Button type="submit" variant="subtle">Publicar</Button></form> : null}{activity.status !== "cancelled" ? <form action={changeActivityStatusAction.bind(null, activity.id, activity.type, "cancelled")}><Button type="submit" variant="subtle">Cancelar</Button></form> : null}</div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
