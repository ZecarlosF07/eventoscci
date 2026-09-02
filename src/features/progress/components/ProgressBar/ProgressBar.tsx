import type { ProgressBarProps } from "@/features/progress/components/ProgressBar/types/progress-bar.types";
import { classNames } from "@/utils/class-names";

export function ProgressBar({
  className,
  label = "Progreso",
  showValue = true,
  tone = "light",
  value,
}: ProgressBarProps) {
  const normalizedValue = Math.min(Math.max(Math.round(value), 0), 100);
  return (
    <div className={classNames("space-y-1.5", className)}>
      {showValue ? (
        <div className={tone === "dark" ? "flex justify-between gap-3 text-xs font-medium text-slate-300" : "flex justify-between gap-3 text-xs font-medium text-slate-600"}>
          <span>{label}</span>
          <span>{normalizedValue}%</span>
        </div>
      ) : null}
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        className={tone === "dark" ? "h-2 overflow-hidden rounded-full bg-white/15" : "h-2 overflow-hidden rounded-full bg-slate-100"}
        role="progressbar"
      >
        <div
          className={tone === "dark" ? "h-full rounded-full bg-cci-lime transition-[width] duration-300" : "h-full rounded-full bg-slate-900 transition-[width] duration-300"}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
