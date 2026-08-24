import type { InputProps } from "@/components/atoms/Input/types/input.types";
import { classNames } from "@/utils/class-names";

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={classNames(
        "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-cci-950 outline-none transition placeholder:text-slate-400 focus:border-cci-600 focus:ring-2 focus:ring-cci-100 disabled:cursor-not-allowed disabled:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}
