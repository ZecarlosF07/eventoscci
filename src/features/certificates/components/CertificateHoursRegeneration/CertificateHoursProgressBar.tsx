import type { CertificateHoursProgress } from "@/features/certificates/types/certificate-hours.types";

export function CertificateHoursProgressBar({ completed, percentage, total }: CertificateHoursProgress) {
  if (!total) return null;
  return <div className="space-y-2">
    <div aria-live="polite" className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-cci-950">{completed} de {total} certificados corregidos</span>
      <span className="font-semibold text-cci-700">{percentage}%</span>
    </div>
    <div aria-label="Progreso de regeneración" aria-valuemax={total} aria-valuemin={0} aria-valuenow={completed} aria-valuetext={`${completed} de ${total} certificados corregidos, ${percentage}%`} className="h-2 overflow-hidden rounded-full bg-cci-100" role="progressbar">
      <div className="h-full rounded-full bg-cci-700 transition-[width] motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
    </div>
  </div>;
}
