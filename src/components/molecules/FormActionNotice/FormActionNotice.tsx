import type { FormActionNoticeProps } from "@/components/molecules/FormActionNotice/types/form-action-notice.types";

export function FormActionNotice({ compact = false, message, success = false, warning = false }: FormActionNoticeProps) {
  if (!message) return null;

  const colorClasses = warning
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : success
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";
  const spacingClasses = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <p
      aria-live={success || warning ? "polite" : "assertive"}
      className={`rounded-xl border text-sm font-medium ${colorClasses} ${spacingClasses}`}
      role={success || warning ? "status" : "alert"}
    >
      {message}
    </p>
  );
}
