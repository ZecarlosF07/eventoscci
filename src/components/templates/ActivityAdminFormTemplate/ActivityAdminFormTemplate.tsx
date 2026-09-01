import { Badge } from "@/components/atoms/Badge";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityAdminFormTemplateProps } from "@/components/templates/ActivityAdminFormTemplate/types/activity-admin-form-template.types";
import { ActivityForm } from "@/features/activities/components/ActivityForm";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";

export function ActivityAdminFormTemplate({ activity, categories, contacts, saved, speakers, type, venues }: ActivityAdminFormTemplateProps) {
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading description="La información, fechas y expositores se guardan en una sola transacción." eyebrow={ACTIVITY_TYPE_LABELS[type]} title={activity ? `Editar ${activity.title}` : `Nueva ${ACTIVITY_TYPE_LABELS[type].toLowerCase()}`} />{saved ? <Badge variant="success">Cambios guardados</Badge> : null}</div>
      <ActivityForm activity={activity} categories={categories} contacts={contacts} speakers={speakers} type={type} venues={venues} />
    </div>
  );
}
