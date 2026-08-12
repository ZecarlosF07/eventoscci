import type { CheckboxProps } from "@/components/atoms/Checkbox/types/checkbox.types";
import { classNames } from "@/utils/class-names";

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={classNames(
        "size-4 rounded border-slate-300 text-slate-950 accent-slate-950 focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type="checkbox"
      {...props}
    />
  );
}
