import type { SelectProps } from "@/components/atoms/Select/types/select.types";
import { classNames } from "@/utils/class-names";

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={classNames(
        "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}
