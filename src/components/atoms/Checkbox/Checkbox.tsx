import type { CheckboxProps } from "@/components/atoms/Checkbox/types/checkbox.types";
import { classNames } from "@/utils/class-names";

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={classNames(
        "size-4 rounded border-slate-300 text-cci-950 accent-cci-950 focus:ring-2 focus:ring-cci-200 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type="checkbox"
      {...props}
    />
  );
}
