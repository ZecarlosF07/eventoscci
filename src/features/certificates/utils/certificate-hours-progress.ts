import type { CertificateHoursProgress } from "@/features/certificates/types/certificate-hours.types";

export function certificateHoursProgress(completed: number, total: number): CertificateHoursProgress {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeCompleted = Math.min(safeTotal, Math.max(0, Math.floor(completed)));
  return {
    completed: safeCompleted,
    total: safeTotal,
    percentage: safeTotal ? Math.floor(safeCompleted * 100 / safeTotal) : 100,
  };
}
