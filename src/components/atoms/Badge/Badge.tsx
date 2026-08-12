import type { BadgeProps } from "@/components/atoms/Badge/types/badge.types";
import { classNames } from "@/utils/class-names";

const VARIANT_STYLES = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    />
  );
}
