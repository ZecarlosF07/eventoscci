import type { SpinnerProps } from "@/components/atoms/Spinner/types/spinner.types";
import { classNames } from "@/utils/class-names";

export function Spinner({
  className,
  label = "Cargando",
}: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span
        aria-hidden="true"
        className={classNames(
          "size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900",
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
