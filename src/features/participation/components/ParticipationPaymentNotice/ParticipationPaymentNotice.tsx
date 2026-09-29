import Link from "next/link";

import type { ParticipationPaymentNoticeProps } from "@/features/participation/types/participation.types";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export function ParticipationPaymentNotice({ activity }: ParticipationPaymentNoticeProps) {
  const participationPending = activity.paymentPendingRequests > 0;
  const certificatePending = activity.certificatePendingCount > 0;
  const hasPending = participationPending || certificatePending;

  return (
    <Link
      className={`mt-3 flex min-h-11 items-center gap-3 rounded-xl border border-l-4 px-3 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-700 ${hasPending
        ? "border-amber-200 border-l-amber-500 bg-amber-50 text-amber-950 hover:bg-amber-100"
        : "border-cci-100 bg-cci-50 text-slate-600 hover:bg-cci-100"}`}
      href={getActivityPaymentsRoute(activity.activityId)}
    >
      {hasPending ? (
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className={`block leading-6 ${participationPending ? "font-semibold" : "text-xs text-slate-600"}`}>
          <strong className={participationPending ? "rounded-md bg-amber-200 px-1.5 py-0.5 font-bold tabular-nums" : "font-medium tabular-nums"}>{activity.paymentPendingRequests}</strong>{" "}
          {activity.paymentPendingRequests === 1 ? "solicitud con pago pendiente" : "solicitudes con pago pendiente"}
          <span className="font-medium"> · {activity.paymentPendingSeats} {activity.paymentPendingSeats === 1 ? "plaza pendiente" : "plazas pendientes"}</span>
        </span>
        {certificatePending ? (
          <span className={`block font-semibold leading-6 ${participationPending ? "mt-1 border-t border-amber-200 pt-1" : ""}`}>
            <strong className="rounded-md bg-amber-200 px-1.5 py-0.5 font-bold tabular-nums">{activity.certificatePendingCount}</strong>{" "}
            {activity.certificatePendingCount === 1 ? "certificado con pago pendiente" : "certificados con pago pendiente"}
            <span className="ml-1 inline-block text-xs font-normal">(cobro separado)</span>
          </span>
        ) : null}
      </span>
      <span aria-hidden="true" className="shrink-0 text-lg">→</span>
      <span className="sr-only">Ver pagos de esta actividad</span>
    </Link>
  );
}
