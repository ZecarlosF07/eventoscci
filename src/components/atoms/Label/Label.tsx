import type { LabelProps } from "@/components/atoms/Label/types/label.types";
import { classNames } from "@/utils/class-names";

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={classNames("text-sm font-medium text-cci-950", className)}
      {...props}
    />
  );
}
